import siteData from "../data/siteData.json";

// Astro fills this in from the `site` in astro.config.mjs, but only inside its
// own build pipeline: anything importing this module outside it (a script, a
// test) sees undefined. Callers that have Astro.site pass it explicitly so the
// generator never depends on the ambient value being there.
const CONFIGURED_SITE = import.meta.env.SITE;

// Prevents a literal "</script>" (or "<!--") inside interpolated content from
// prematurely closing the surrounding <script> tag and splicing the rest of
// the JSON-LD string into the page as raw HTML.
function escapeForScriptTag(json) {
  return json.replace(/</g, "\\u003c");
}

function siteOrigin(site) {
  const base = site ? String(site) : CONFIGURED_SITE;
  // Reduced to a bare origin because callers hand in a URL object, a string
  // with a trailing slash, or nothing. Every @id below is built from this, and
  // two spellings of the same entity id is the one thing a graph cannot have.
  return base ? new URL(base).origin : undefined;
}

// Content frontmatter stores images with the "@images/" Vite alias, which is a
// build-time path and not something a crawler can fetch. ProjectImage.astro
// rewrites the same prefix for the browser; the two must agree or the OG image
// and the JSON-LD image point at different files.
function normalisePath(value) {
  if (!value) return undefined;
  const path = String(value).trim();
  if (!path) return undefined;
  return path.startsWith("@images/") ? path.replace("@images/", "/images/") : path;
}

// Structured data is read by crawlers that have no page context, so a relative
// path resolves against nothing useful. Everything published here is absolute.
export function toAbsoluteUrl(value, site) {
  const path = normalisePath(value);
  if (!path) return undefined;
  const origin = siteOrigin(site);
  if (!origin) return path;
  try {
    return new URL(path, origin).href;
  } catch {
    return undefined;
  }
}

// Frontmatter dates are usually "YYYY-MM" and sometimes "YYYY-MM-DD". Both
// forms are read by new Date() as UTC midnight, so anything that formats them
// back through a local-timezone getter (or through toISOString() from a
// west-of-UTC machine) lands on the previous day. Reading the parts straight
// out of the string sidesteps the timezone entirely and yields a date-only
// ISO 8601 value, which is what schema.org wants for a publication date.
export function toIsoDate(value) {
  if (!value) return undefined;
  const raw = String(value).trim();

  const parts = raw.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?$/);
  if (parts) {
    const [, year, month, day] = parts;
    return `${year}-${month}-${day || "01"}`;
  }

  // Anything else (a full timestamp, "March 2, 2024") is handed to the parser,
  // which treats those forms as local time, so local getters are correct here.
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return undefined;
  const pad = (n) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
}

function personId(site) {
  const origin = siteOrigin(site);
  return origin ? `${origin}/#person` : undefined;
}

function websiteId(site) {
  const origin = siteOrigin(site);
  return origin ? `${origin}/#website` : undefined;
}

// One Person node, reused by @id from every article so the same entity is not
// re-described (and re-disambiguated) on every page.
function personEntity(site) {
  const origin = siteOrigin(site);
  const author = siteData.author;
  const person = {
    "@type": "Person",
    "@id": personId(site),
    name: author.name,
    // The site itself is his page. The generator used to publish
    // "/author/<slug>" instead, a route that has never existed.
    url: origin ? `${origin}/` : undefined,
    jobTitle: author.jobTitle,
    sameAs: author.sameAs,
  };
  if (author.worksFor) {
    person.worksFor = {
      "@type": "Organization",
      name: author.worksFor.name,
      url: author.worksFor.url,
    };
  }
  return person;
}

function websiteEntity(site) {
  const origin = siteOrigin(site);
  return {
    "@type": "WebSite",
    "@id": websiteId(site),
    name: siteData.title,
    url: origin ? `${origin}/` : undefined,
    description: siteData.description,
    publisher: { "@id": personId(site) },
  };
}

// Only the blog is a blog. Projects, research and experience entries are
// standalone articles, and calling them BlogPosting tells a crawler they
// belong to a feed that does not list them.
function articleTypeFor({ type, post, pathname }) {
  const declared = String(
    post?.collection || post?.type || (type === "post" ? "" : type || "")
  ).toLowerCase();
  if (declared === "blog" || declared === "post" || declared === "blogposting") {
    return "BlogPosting";
  }
  if (declared) return "Article";

  // Templates that pass frontmatter without naming their collection still tell
  // us which one it is through the route they were built into.
  return pathname.startsWith("/blog/") ? "BlogPosting" : "Article";
}

// Undefined values would serialise as missing keys anyway, but stripping them
// first keeps the emitted JSON readable and avoids empty arrays.
function prune(value) {
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((item) => item !== undefined);
    return items.length ? items : undefined;
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, item]) => [key, prune(item)])
      .filter(([, item]) => item !== undefined);
    return entries.length ? Object.fromEntries(entries) : undefined;
  }
  if (typeof value === "string" && !value.trim()) return undefined;
  return value;
}

function render(data) {
  const pruned = prune(data);
  if (!pruned) return "";
  return `<script type="application/ld+json">${escapeForScriptTag(
    JSON.stringify(pruned)
  )}</script>`;
}

export default function jsonLDGenerator({ type, post, url, site }) {
  const resolvedSite = site || CONFIGURED_SITE;
  const pageUrl = url ? toAbsoluteUrl(String(url), resolvedSite) : siteOrigin(resolvedSite);
  let pathname = "";
  try {
    pathname = pageUrl ? new URL(pageUrl).pathname : "";
  } catch {
    pathname = "";
  }

  if (post) {
    const published = toIsoDate(post.date);
    const modified = toIsoDate(post.updated || post.dateModified || post.date);
    const image =
      toAbsoluteUrl(post.image?.src || post.image, resolvedSite) ||
      toAbsoluteUrl(siteData.image.src, resolvedSite);

    return render({
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": articleTypeFor({ type, post, pathname }),
          "@id": pageUrl ? `${pageUrl}#article` : undefined,
          mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
          url: pageUrl,
          headline: post.title,
          name: post.title,
          description: post.description,
          image,
          keywords: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags,
          // Both dates are required for a rich result. Nothing in the content
          // collections records an edit date, so a post that has never been
          // revised reports its publication date for both, which is accurate.
          datePublished: published,
          dateModified: modified,
          // Every entry in the collections is currently his, so the byline
          // resolves to the same Person node the home page describes. A guest
          // byline would get its own bare Person rather than silently claiming
          // his GitHub and LinkedIn as its sameAs links.
          author:
            !post.author || post.author === siteData.author.name
              ? { "@id": personId(resolvedSite) }
              : { "@type": "Person", name: post.author },
          publisher: { "@id": personId(resolvedSite) },
          isPartOf: { "@id": websiteId(resolvedSite) },
        },
        personEntity(resolvedSite),
        websiteEntity(resolvedSite),
      ],
    });
  }

  // The Person belongs on the home page, where the sameAs links are a claim
  // about who the site is rather than a repeated byline.
  const origin = siteOrigin(resolvedSite);
  const isHomePage = pathname === "" || pathname === "/";

  if (isHomePage) {
    return render({
      "@context": "https://schema.org",
      "@graph": [websiteEntity(resolvedSite), personEntity(resolvedSite)],
    });
  }

  return render({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId(resolvedSite),
    name: siteData.title,
    url: origin ? `${origin}/` : undefined,
    description: siteData.description,
  });
}
