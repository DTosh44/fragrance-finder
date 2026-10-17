# Fragrance Finder

A premium, responsive fragrance discovery website built around a curated UK launch dataset of 50 perfumes, 50 men's fragrances and five comparable recommendations for each scent.

## Product intent, visual direction and next decision

**Purpose:** help UK users discover a fragrance they may enjoy by starting from a scent they already know or from their preferences, then seeing five explainable, comparable suggestions. This is curated fragrance discovery, **not** a scientifically accurate skin-performance forecast, a dupe guarantee, or a live price-comparison engine.

**Current visual language** (implemented in `styles.css`, not a newly approved rebrand): editorial and premium rather than a crowded ecommerce catalogue. Ivory `#f3efe7` and paper `#fbf8f2` foundations, ink `#161513`, oxblood `#6f2030` accents, celadon `#98a79a`; Instrument Serif headlines paired with Manrope UI type. Prioritise fragrance imagery, readable comparison details, restrained surfaces and responsive mobile layouts. Preserve this system unless a new direction is deliberately approved.

**Current product:** a carefully structured 100-fragrance launch dataset (50 perfumes, 50 men's fragrances), with five comparison links per scent. Retailer images/links live in an interchangeable adapter so a future permitted product feed does not alter fragrance identity or matching logic.

**Next decision:** whether to commercialise as an affiliate-led discovery site or retain it as a free consumer discovery tool. The affiliate/retailer-feed model, licensing, launch catalogue breadth and commercial objective are **unresolved**; do not treat them as approved. If revived, settle those decisions before scaling the catalogue, changing the design, adding accounts or launching commerce. See [PROJECT.md](PROJECT.md) for current state and [AGENTS.md](AGENTS.md) for handoff rules.

## Preview locally

This is a zero-build static app. From the repository directory, run:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deploy on Vercel

1. Import this GitHub repository at [vercel.com/new](https://vercel.com/new).
2. Set **Framework preset** to `Other`.
3. Leave the build command and output directory blank.
4. Deploy.

Every push to the default branch will create a new live preview. Pull requests receive their own preview links.

## Deploy on GitHub Pages

The repository includes an automatic Pages workflow. In GitHub, open **Settings → Pages**, set **Source** to `GitHub Actions`, then push to `main`. The public site will be available at `https://YOUR-USERNAME.github.io/fragrance-finder/`.

## Data

- `data/fragrances.json`: 100 launch fragrances and their structured profiles.
- `data/recommendations.json`: 500 precomputed comparison relationships.
- `data/retailer-products.json`: temporary, concentration-matched product imagery and product links sourced only from The Fragrance Shop. Unmapped fragrances use the site's abstract fallback artwork. This separate adapter can be replaced by a future affiliate product feed without changing the core fragrance dataset.
- `scripts/extract-data.mjs`: regenerates both files from the project workbook builder in the parent workspace.

The match score is a transparent guide based on structured fragrance profile overlap and chooser preferences. It is not a scientific prediction, a dupe claim or a guarantee of how a fragrance will perform on skin.
