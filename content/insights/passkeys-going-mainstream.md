---
title: Passkeys are winning. Here's what's still in the way.
subtitle: Billions of passkeys are now in use and most people know what they are. Why they are safer than passwords, and how to add them to your own product.
date: 2026-11-14
topic: Security
cover: /img/insight-passkeys.webp
coverAlt: A sign-in card with a struck-out password field and a button to sign in with a passkey, next to a fingerprint
---

For decades the password has been the weakest part of almost every system. People reuse them, phishing sites steal them, and data breaches leak them by the million. One-time codes helped, but they can be phished too.

Passkeys were designed to fix this, and 2026 is the year they stopped being a niche feature.

## Where adoption stands

The FIDO Alliance, the industry group behind the standard, published its *State of Passkeys 2026* report in May. Its headline findings:

- About **5 billion passkeys** were in use by May 2026. The Alliance has since reported passing **7 billion**.
- **90% of consumers** say they are familiar with passkeys, and **75%** have turned them on for at least one account.
- In FIDO's *Passkey Index*, which tracks sign-ins at participating services, **more than a third of successful sign-ins now use a passkey**.

That last number matters most. Awareness is easy. Changing how people actually sign in every day is the hard part, and it is clearly happening.

## How a passkey works

A passkey replaces a shared secret (your password) with a pair of cryptographic keys.

1. When you create a passkey for a site, your device generates a **private key** and a **public key**.
2. The site stores only the **public key**. Your private key stays on your device or in your password manager, protected by your fingerprint, face or device PIN.
3. When you sign in, the site sends a random challenge. Your device signs it with the private key, after you unlock it with biometrics or a PIN.
4. The site checks the signature with the public key. No secret ever crosses the network.

Two properties make this a big step up:

- **Nothing useful to steal from the server.** A breach exposes public keys, which can't be used to sign in.
- **Phishing resistance.** A passkey is bound to the real website's domain. A look-alike site simply can't ask for it, so there is nothing for the user to be tricked into typing.

Your fingerprint or face never leaves your device. It only unlocks the key locally.

## Synced or device-bound?

There are two main kinds of passkey:

- **Synced passkeys** live in a password manager or platform account and are available on all your devices. They are convenient and recover easily if you lose a phone. They suit most consumer services.
- **Device-bound passkeys** live on one piece of hardware, such as a security key, and can't be copied. They suit high-security roles like administrators and finance teams.

Many organisations use both: synced passkeys for most staff and customers, hardware keys for the accounts that matter most.

## What's still in the way

Passkeys aren't finished. The common friction points are:

- **Account recovery.** If someone loses every device, how do they get back in? A weak recovery flow (say, an email link) can undo the security gains.
- **Mixed estates.** Shared computers, older devices and some enterprise systems still need fallback methods.
- **Moving between ecosystems.** Moving passkeys between different platforms and password managers is improving but isn't yet effortless for everyone.
- **Confusing prompts.** Users meet slightly different dialogs on every browser and operating system, and some still hesitate when they see an unfamiliar one.

## Adding passkeys to your product

If you run a website or app, a sensible path looks like this:

1. **Use a maintained WebAuthn library** for your stack rather than writing the cryptography yourself.
2. **Offer passkeys alongside passwords at first.** Prompt users to create one right after a successful sign-in, when they are already authenticated.
3. **Use autofill-style sign-in.** Modern browsers can suggest passkeys directly in the username field, so signing in becomes a single tap.
4. **Design recovery carefully.** Encourage more than one passkey per account and make recovery at least as strong as sign-in.
5. **Measure it.** Track how many users create passkeys, how many sign-ins use them and where people drop off.
6. **Plan the end state.** Once most active users have a passkey, consider making passwords optional, or removing them for new accounts.

## The takeaway

Passkeys are one of the rare security upgrades that also make life easier: faster sign-in, nothing to remember, and protection against phishing. The technology is ready and users are ready. The remaining work is in product design, especially recovery, and that is work every team can start now.

## Sources

- [The State of Passkeys 2026](https://fidoalliance.org/the-state-of-passkeys-2026/) – FIDO Alliance
- [Passkey Index 2026](https://fidoalliance.org/passkey-index-2026/) – FIDO Alliance
- [7 billion passkeys and counting: the next chapter of passwordless authentication](https://fidoalliance.org/7-billion-passkeys-and-counting-the-next-chapter-of-passwordless-authentication/) – FIDO Alliance
