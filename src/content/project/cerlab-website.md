---
title: "CERLAB Lab Website"
date: "2026-01"
status: "completed"
image: "/images/project/cerlab-website/home.jpg"
description: "The public website for Carnegie Mellon's Computational Engineering and Robotics Lab, built on Astro with a markdown content model and a written guide so lab members can keep research, publications and people up to date without a developer."
tags: ["Astro", "Tailwind CSS", "DaisyUI", "Python", "web development"]
demo: "https://cerlab.cmu.edu"
---

## A Lab Website People Can Maintain

The Computational Engineering and Robotics Lab (CERLAB) at Carnegie Mellon, led by Prof. Kenji Shimada, works across engineering simulation, medical technology and robotics. The lab has a long publication record and a large alumni network, and that kind of content goes stale fast when only one person knows how to update the site. I designed and built the new site at [cerlab.cmu.edu](https://cerlab.cmu.edu) with one goal: anyone in the lab should be able to add a project, a paper or a new member by editing a markdown file.

![CERLAB home page](@images/project/cerlab-website/home.jpg)

## Content Model

The site is built on Astro content collections. Research projects, publications, members and courses each live in their own collection as markdown files with a typed frontmatter schema, so a missing field fails the build instead of quietly rendering a broken card. Project images sit in a folder named after each project's codename, which keeps media next to the content it belongs to. Alumni live in a single JSON file grouped by role, since they rarely change and don't need a page each.

![Research areas on the CERLAB home page](@images/project/cerlab-website/research-areas.jpg)

## Research and Publications

The research page lists the lab's 42 active projects grouped by domain, with a search box and tag filters so visitors can find work by topic, team or keyword. The publications page does the same for the lab's 88 papers, with filters for year, type and topic. Each publication has a citation dialog that formats the entry in APA, MLA, Chicago or BibTeX in the browser, ready to copy.

![Searching and filtering research projects](@images/project/cerlab-website/research.jpg)

## Getting the Publications In

Most of the work was the content itself. The lab's papers existed as PDFs, not as structured data, so I wrote Python scripts to pull titles, authors and venues out of the PDFs and into publication files, and a separate script that scans the publication thumbnails and flags blank or near-empty images so they could be replaced. Member pages are generated from a member spreadsheet by a script, rather than typed in by hand.

## Handoff

A website a lab can't update isn't finished. I wrote a slide-based content guide that walks through adding projects, members, publications and courses step by step: where each file goes, which fields are required, how to name images, and how to fix the common build errors. It ships with the repository as HTML, PDF and PowerPoint, so a new student can pick it up without reading the code.

## Stack

- Astro 5 with content collections and the sitemap integration
- Tailwind CSS 4 and DaisyUI 5, themed in CMU red
- Python scripts for PDF metadata extraction and image checks
- Deployed on Vercel

---
