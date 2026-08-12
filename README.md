# Legacy Builds Group — Website

A multi-page marketing site for Legacy Builds Group, a Metro Detroit design-build
firm, built from the client's *Website Development & Redesign Guide* (42-page
PDF spec covering sitemap, brand system, section-by-section copy, and launch
checklist). Plain HTML/CSS/JS — no build step required to run it.

## Structure

```
index.html                                   Home
about.html                                   About (story, mission/vision, values, team)
services.html                                Services overview (alternating rows)
services/architecture.html                   Architecture service detail
services/engineering.html                    Engineering service detail
services/mep-systems.html                    MEP Systems service detail
services/construction.html                   Construction service detail (timeline)
projects.html                                Filterable project grid
projects/custom-luxury-home.html             Sample individual project page (reusable template)
insights.html                                Blog / Insights index (10 topics from the guide)
insights/what-is-a-design-build-contractor.html   Sample full article
contact.html                                 Full project-inquiry form
privacy.html, terms.html, accessibility.html Placeholder legal pages (linked from footer)
404.html                                     Error page

css/styles.css   Design system: deep navy / warm gold / Playfair Display + Manrope
js/main.js       Sticky header, mobile nav, before/after slider, filters, form
```

Header and footer are duplicated per page (not templated at runtime) — this
was generated once from a Python script for consistency; see "Regenerating
pages" below if you need to change the header/footer/nav across every page
at once.

## Running locally

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`. (Pages use root-relative links like
`/about.html`, so they must be served from the repo root — opening the HTML
files directly via `file://` will break internal navigation.)

## Design system (from the guide's Brand Design System section)

- **Colors:** deep navy `#071522` (background), secondary navy `#0B2134`,
  charcoal `#101820`, off-white `#F5F3EF`, warm gray `#ECECEA`, warm gold
  accent `#B88A4A`, secondary text `#6B737A`.
- **Type:** Playfair Display for headings, Manrope for body/UI, loaded from
  Google Fonts with system-font fallbacks.
- Gold is used only as an accent (small labels, borders, icons, buttons) —
  never as a background fill, per the guide's visual rule.

## What's placeholder and needs your input before launch

The guide is explicit that unverified stats and unapproved testimonials
must not ship, so these are clearly marked rather than invented:

- **All photography** is a styled gradient placeholder (hero, about, services,
  projects, before/after, team, article images). Swap in real photos by
  replacing the relevant `background` gradients in `css/styles.css` (search
  for `-media`, `-photo`, `-thumb` classes) or adding `<img>` tags.
- **Testimonial** on the homepage is marked "Sample review — pending client
  approval" — replace with an approved client quote before launch.
- **Team profiles** on `about.html` use role titles instead of invented
  names/bios — add your actual partners' names, portraits, and bios.
- **Phone/email/social links** use placeholder values ((313) 555-LEGACY,
  info@legacybuildsgroup.com, `#` social links) — update to real ones.
- **Contact form** (`contact.html`) is front-end only: it shows a confirmation
  message but doesn't send anywhere yet. Wire it to your CRM/email backend
  and add spam protection (reCAPTCHA/Turnstile) per the guide.
- **Insights articles**: only the first topic has a full article; the other
  9 topics from the guide are listed as "Coming Soon" cards on `insights.html`.
- **Legal pages** (`privacy.html`, `terms.html`, `accessibility.html`) are
  stubs — replace with attorney-reviewed policy language.
- **Schema markup** on the homepage (`<head>`) has placeholder address/phone
  — verify before launch.

## Regenerating pages

The site was generated from `generate_site.py` + `pages.py` (a one-time dev
script, not part of the runtime site). If you want to change the header,
footer, or nav consistently across all pages, the cleanest path is to ask
for a regeneration rather than hand-editing 16 files — the header/footer
markup is otherwise just duplicated static HTML in each page.
