import { getCollection } from "astro:content";

// Hand-rolled rather than @astrojs/rss, which is not a dependency here. The
// feed is ~40 lines of string building and adding a package to render one
// static file was not worth the install.

// Nothing here reads request state, so the feed is written once at build time
// and served from the edge like every other route on this site.
export const prerender = true;

const FEED_TITLE = "Rohan Singh: Writing";
const FEED_DESCRIPTION =
  "Essays and notes on robotics, computer vision, startups and the path from mechanical engineering into software.";

// A post shorter than this is a placeholder, not an essay. The real floor in
// the collection is ~780 words, so anything under 150 is unambiguously a stub
// and would embarrass us in a reader that shows the whole body.
const STUB_WORD_FLOOR = 150;

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Frontmatter dates are partial ("2026-09") or full ("2024-03-02"). Handing
// either to `new Date()` yields UTC midnight, which renders as the previous
// day for every reader west of Greenwich, so a post dated the 1st shows up as
// the 31st of the month before. Building the instant at UTC noon puts it far
// enough from both midnights that no real-world offset can push it across a
// date boundary.
export function toPubDate(raw) {
  const match = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(String(raw ?? "").trim());
  if (!match) return null;
  const [, year, month, day] = match;
  return new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day ?? "1"), 12, 0, 0)
  );
}

// Two independent tests, because a feed is the one surface a reader keeps a
// copy of: an unfinished post that leaks into it cannot be taken back by
// editing the page. The status check catches a post marked not ready, and the
// word count catches one whose status was never set but which is still a
// placeholder body.
export function isPublished(entry) {
  const status = String(entry.data.status ?? "").trim().toLowerCase();
  if (status === "coming soon" || status === "draft") return false;

  const words = String(entry.body ?? "")
    .split(/\s+/)
    .filter(Boolean).length;
  return words >= STUB_WORD_FLOOR;
}

export async function GET(context) {
  // `context.site` is the `site` value from astro.config.mjs. Every URL in a
  // feed has to be absolute, so a missing site would produce a feed no reader
  // can follow; fail loudly at build time instead of shipping one.
  const site = context.site;
  if (!site) {
    throw new Error(
      "rss.xml.js needs `site` set in astro.config.mjs to emit absolute URLs."
    );
  }

  const posts = (await getCollection("blog"))
    .filter(isPublished)
    .map((entry) => ({ entry, pubDate: toPubDate(entry.data.date) }))
    .filter(({ pubDate }) => pubDate !== null)
    .sort((a, b) => b.pubDate - a.pubDate);

  const feedUrl = new URL("/rss.xml", site).href;

  const items = posts
    .map(({ entry, pubDate }) => {
      const link = new URL(`/blog/${entry.slug}/`, site).href;
      return [
        "    <item>",
        `      <title>${escapeXml(entry.data.title)}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${pubDate.toUTCString()}</pubDate>`,
        `      <description>${escapeXml(entry.data.description)}</description>`,
        ...(entry.data.tags ?? []).map(
          (tag) => `      <category>${escapeXml(tag)}</category>`
        ),
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(new URL("/blog/", site).href)}</link>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <language>en-us</language>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
