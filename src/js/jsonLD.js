import siteData from "../data/siteData.json"
import { slugify } from "./utils";

// Prevents a literal "</script>" (or "<!--") inside interpolated content from
// prematurely closing the surrounding <script> tag and splicing the rest of
// the JSON-LD string into the page as raw HTML.
function escapeForScriptTag(json) {
  return json.replace(/</g, "\\u003c");
}

export default function jsonLDGenerator({ type, post, url }) {
  if (type === 'post') {
    const data = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": url,
      },
      "headline": post.title,
      "description": post.description,
      "image": post.image.src,
      "author": {
        "@type": "Person",
        "name": post.author,
        "url": `/author/${slugify(post.author)}`,
      },
      "datePublished": post.date,
    };
    return `<script type="application/ld+json">${escapeForScriptTag(JSON.stringify(data))}</script>`;
  }
  const data = {
    "@context": "https://schema.org/",
    "@type": "WebSite",
    "name": siteData.title,
    "url": import.meta.env.SITE,
  };
  return `<script type="application/ld+json">${escapeForScriptTag(JSON.stringify(data))}</script>`;
}
