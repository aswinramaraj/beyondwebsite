/**
 * Insights (the blog). Every post is a Markdown file in content/insights/<slug>.md with a small front-matter block:
 *
 *   ---
 *   title: …            subtitle: …          date: 2026-11-24 (newest first everywhere; the home page shows the newest three)
 *   topic: AI | Security | Web | Tech & society | Frontier tech
 *   cover: /img/insight-<name>.webp           coverAlt: what the cover shows (alt text)
 *   ---
 *
 * The body supports ## / ### headings, paragraphs, - and 1. lists, > quotes, | tables |, **bold**, *italic*, `code` and [links](url).
 * A "## Sources" section is styled as the source list. Server-only (reads the files at build time); pass `PostMeta` to client components.
 */
import fs from 'node:fs';
import path from 'node:path';

export const TOPICS = ['AI', 'Security', 'Web', 'Tech & society', 'Frontier tech'] as const;
export type Topic = (typeof TOPICS)[number];

export interface PostMeta {
  slug: string;
  title: string;
  subtitle: string;
  date: string; // YYYY-MM-DD
  topic: Topic;
  cover: string;
  coverAlt: string;
  minutes: number;
}
export interface Post extends PostMeta {
  html: string;
}

export const AUTHOR = { name: 'Beyondlogik Team', avatar: '/img/logo-mark-168.webp', bio: 'We build practical technology and hands-on learning experiences. Insights are our notes on the technology shaping how people learn, build and work.' };
/** posts shown under "Editor's picks" on /insights (slugs; missing ones are skipped) */
export const PICKS = ['post-quantum-cryptography-deadline', 'passkeys-going-mainstream', 'eu-ai-act-new-timeline'];

const DIR = path.join(process.cwd(), 'content', 'insights');
const WPM = 230;

function parse(file: string): Post {
  const slug = path.basename(file, '.md');
  const raw = fs.readFileSync(path.join(DIR, file), 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error(`insights/${file}: missing front matter`);
  const fm: Record<string, string> = {};
  for (const line of m[1].split('\n')) {
    const i = line.indexOf(':');
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  for (const k of ['title', 'subtitle', 'date', 'topic', 'cover']) if (!fm[k]) throw new Error(`insights/${file}: "${k}" is missing`);
  if (!(TOPICS as readonly string[]).includes(fm.topic)) throw new Error(`insights/${file}: unknown topic "${fm.topic}" (use one of ${TOPICS.join(', ')})`);
  const body = m[2].trim();
  const words = body.replace(/[#>*`|_\-[\]()]/g, ' ').split(/\s+/).filter(Boolean).length;
  return {
    slug,
    title: fm.title,
    subtitle: fm.subtitle,
    date: fm.date,
    topic: fm.topic as Topic,
    cover: fm.cover,
    coverAlt: fm.coverAlt || '',
    minutes: Math.max(1, Math.round(words / WPM)),
    html: renderMarkdown(body),
  };
}

let cache: Post[] | null = null;
/** all posts, newest first */
export function getPosts(): Post[] {
  if (cache && process.env.NODE_ENV === 'production') return cache;
  cache = fs.readdirSync(DIR).filter((f) => f.endsWith('.md')).map(parse).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
  return cache;
}
export const getPost = (slug: string) => getPosts().find((p) => p.slug === slug);
export const toMeta = ({ html: _html, ...meta }: Post): PostMeta => meta;
export const postHref = (slug: string) => `/insights/${slug}`;

export { formatDate, topicKey } from './insights-format';

/** related reading: same topic first, then the newest others */
export function morePosts(slug: string, n = 4): PostMeta[] {
  const all = getPosts().filter((p) => p.slug !== slug);
  const cur = getPost(slug);
  const same = all.filter((p) => p.topic === cur?.topic);
  return [...same, ...all.filter((p) => p.topic !== cur?.topic)].slice(0, n).map(toMeta);
}

// ───────────────────────────── a small Markdown renderer (the posts are our own files; everything is still escaped) ─────────────────────────────

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const slugify = (s: string) => s.toLowerCase().replace(/<[^>]+>/g, '').replace(/&[a-z]+;/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function inline(src: string): string {
  // split out `code` first so nothing inside it is formatted
  return src.split(/(`[^`]+`)/).map((part) => {
    if (/^`[^`]+`$/.test(part)) return `<code>${esc(part.slice(1, -1))}</code>`;
    let s = esc(part);
    s = s.replace(/\[([^\]]+)\]\(((?:[^()\s]|\([^()\s]*\))+)\)/g, (_m, text: string, url: string) => {
      const ext = /^https?:\/\//.test(url);
      return `<a href="${url}"${ext ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?![*\w])/g, '$1<em>$2</em>');
    return s;
  }).join('');
}

export function renderMarkdown(md: string): string {
  const lines = md.split('\n');
  const out: string[] = [];
  let i = 0;
  const isBlockStart = (l: string) => /^(#{2,4} |[-*] |\d+\. |> |\|)/.test(l);
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const h = line.match(/^(#{2,4}) (.+)$/);
    if (h) {
      const lvl = h[1].length, text = inline(h[2]);
      out.push(`<h${lvl} id="${slugify(h[2])}">${text}</h${lvl}>`);
      i++;
      continue;
    }
    if (/^[-*] /.test(line) || /^\d+\. /.test(line)) {
      const ordered = /^\d+\. /.test(line);
      const re = ordered ? /^\d+\. (.*)$/ : /^[-*] (.*)$/;
      const items: string[] = [];
      while (i < lines.length && re.test(lines[i])) { items.push(`<li>${inline(lines[i].match(re)![1])}</li>`); i++; }
      out.push(`<${ordered ? 'ol' : 'ul'}>${items.join('')}</${ordered ? 'ol' : 'ul'}>`);
      continue;
    }
    if (/^> /.test(line)) {
      const q: string[] = [];
      while (i < lines.length && /^> ?/.test(lines[i])) { q.push(lines[i].replace(/^> ?/, '')); i++; }
      out.push(`<blockquote><p>${inline(q.join(' '))}</p></blockquote>`);
      continue;
    }
    if (/^\|/.test(line)) {
      const rows: string[][] = [];
      while (i < lines.length && /^\|/.test(lines[i])) {
        if (!/^\|[\s:|-]+\|?\s*$/.test(lines[i])) rows.push(lines[i].replace(/^\||\|\s*$/g, '').split('|').map((c) => c.trim()));
        i++;
      }
      const [head, ...body] = rows;
      out.push(`<div class="bl-table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) { para.push(lines[i]); i++; }
    out.push(`<p>${inline(para.join(' '))}</p>`);
  }
  return out.join('\n');
}
