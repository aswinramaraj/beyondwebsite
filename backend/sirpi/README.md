# Sirpi backend — the Stupid Problem Prize

Small Node server for the monthly contest on `/studio`: **Google sign-in**, posting problems and voting.
Data lives in **Firebase Firestore**. Node ≥ 22.13 (tested on 24); one dependency, `firebase-admin`.

```
cd backend/sirpi
npm install
cp .env.example .env          # fill in GOOGLE_CLIENT_ID, SESSION_SECRET (and PRIZE if you have one)
                              # + put the Firestore key in secrets/ (see "Firestore" below)
npm run check                 # can we reach Firestore? are the indexes there? (reads only)
npm start                     # http://127.0.0.1:8787   (npm run dev = restart on change)
npm test                      # API tests (Firestore store on an in-memory test double, locally signed tokens) — no Google needed
```
The website reaches it at **`/sirpi-api/*`**, which `next.config.mjs` proxies to `SIRPI_API_URL` (default `http://127.0.0.1:8787`) + `/api/*`.
Because the browser only ever talks to the website's own domain, the login cookie is first-party. In production run this server next to
the website (or anywhere reachable from it) and set `SIRPI_API_URL` when building/starting the site. Keep it bound to 127.0.0.1 / a private
network — it trusts `X-Forwarded-For` from the proxy for rate limiting.

## Google sign-in setup (once)
1. Google Cloud Console → **APIs & Services → OAuth consent screen**: set it up (External, app name "Beyondlogik", your support email).
2. **Credentials → Create credentials → OAuth client ID → Web application.**
   *Authorized JavaScript origins*: your site (e.g. `https://beyondlogik.com`) and `http://localhost:3100` for development. No redirect URI is needed.
3. Put the client ID in `.env` as `GOOGLE_CLIENT_ID` and restart. Until it is set, the site shows the contest **read-only** (no sign-in, posting or voting).
   When testing on localhost, add **both** `http://localhost` and `http://localhost:3100` as origins (Google requires both); new origins can take a while to apply.

How it works: the page shows Google's own "Sign in with Google" button (Google Identity Services). Google hands the page a signed ID token;
the page posts it to `/api/auth/google`; this server verifies it (RS256 signature against Google's published keys, issuer, audience =
your client ID, expiry, verified email) and sets an HttpOnly, SameSite=Lax session cookie (30 days, `Secure` in production).
Only the person's name (shown as "First L.") and photo are ever returned to the site; emails stay in the database.

## Rules enforced here
* posting and voting need a signed-in Google account;
* one vote per person per problem (voting again takes it back); no voting for your own problem;
* up to `MAX_PROBLEMS_PER_MONTH` (default 3) problems per person per month; the same problem twice in a month is refused (→ vote for it);
* text 8–160 characters, place ≤ 40; ~30 writes a minute per IP;
* POSTs must be JSON with the header `X-Sirpi: 1` (with the SameSite cookie this stops other sites posting on a visitor's behalf).

Each problem belongs to the contest month it was posted in (`CONTEST_TZ`, default Asia/Kolkata); the site counts down to the end of that month
(`closesAt` from `/api/config`). Choosing the winner is up to you: the top of `GET /api/problems?sort=top` at the end of the month.

## API
| | |
|---|---|
| `GET /api/config` | `{ googleClientId, prize, month, monthLabel, closesAt, maxPerMonth }` |
| `GET /api/me` | `{ user }` or `{ user: null }` |
| `POST /api/auth/google` `{ credential }` | sign in with a Google ID token → `{ user }` + cookie |
| `POST /api/auth/logout` | clears the cookie |
| `GET /api/problems?sort=top\|new&q=&limit=&offset=` | this month's problems → `{ items, more, stats: { problems, votes } }` |
| `POST /api/problems` `{ text, place }` | post a problem (signed in) → `{ item }` |
| `POST /api/problems/:id/vote` | toggle your vote (signed in) → `{ id, votes, voted }` |


## Firestore (the database)
1. **Create the database** — Firebase console → your project → *Build → Firestore Database → Create database* (production mode; pick a
   location near your users, e.g. `asia-south1`). Skip this if the project already has Firestore.
2. **Key for the backend** — *Project settings → Service accounts → Generate new private key*. Save the file as
   `backend/sirpi/secrets/firebase-service-account.json` (the `secrets/` folder and key files are git-ignored — never commit it).
   On Google Cloud (Cloud Run etc.) you can skip the file and use the service's own identity (Application Default Credentials).
3. **Indexes** — the leaderboard queries need two composite indexes on the `sirpi_problems` collection. These commands only *add* them
   (they do not touch any other app's indexes):
   ```
   gcloud firestore indexes composite create --project=YOUR_PROJECT_ID --collection-group=sirpi_problems \
     --field-config=field-path=month,order=ascending --field-config=field-path=votes,order=descending --field-config=field-path=createdAt,order=ascending
   gcloud firestore indexes composite create --project=YOUR_PROJECT_ID --collection-group=sirpi_problems \
     --field-config=field-path=month,order=ascending --field-config=field-path=createdAt,order=descending
   ```
   No gcloud? Run `npm run check`: Firestore prints a link that creates the missing index in the console with one click.
   Building takes a few minutes; `npm run check` says "All good" when they are ready.
4. **Security rules** — the backend uses the Admin SDK, which ignores rules, and browsers never talk to Firestore directly. Make sure
   your project's rules do **not** let browsers read or write the `sirpi_*` collections. If the project also serves an app that uses
   Firestore from the browser, its rules must not contain a catch-all like `match /{document=**} { allow read, write: if true; }`
   (rules are OR-ed, so that would expose these collections). Nothing here deploys rules — review them yourself in the console.

Collections (prefix `FIRESTORE_PREFIX`, default `sirpi_`, so they never mix with other apps in the same Firebase project):
`sirpi_users` (Google id → name, email, photo) · `sirpi_problems` (month, text, place, author, running vote count) ·
`sirpi_votes` (one document per person per problem) · `sirpi_keys` (blocks duplicates) · `sirpi_quota` (posts per person per month) ·
`sirpi_tallies` (the month's totals). Posting and voting run in Firestore transactions, so counts stay right when many people vote at once.
Search scans the month's newest 1,000 problems (Firestore has no substring search) — plenty for a monthly contest.
Picking the winner: the first problem of "Most votes" when the month ends (or query `sirpi_problems` where `month == "YYYY-MM"`, ordered by `votes`).

## Cookie notice
Signing in sets one strictly necessary session cookie (`sirpi_session`), and the Google button loads Google's script — update the site's
cookie text if needed.
