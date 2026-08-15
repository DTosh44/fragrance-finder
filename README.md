# Fragrance Finder

A premium, responsive fragrance discovery website built around a curated UK launch dataset of 50 perfumes, 50 men's fragrances and five comparable recommendations for each scent.

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
- `scripts/extract-data.mjs`: regenerates both files from the project workbook builder in the parent workspace.

The match score is a transparent guide based on structured fragrance profile overlap and chooser preferences. It is not a scientific prediction, a dupe claim or a guarantee of how a fragrance will perform on skin.
