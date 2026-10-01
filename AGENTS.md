# Fragrance Finder — repository instructions

## Read first

Before significant work, read `AGENTS.md`, `PROJECT.md`, `README.md` and inspect the data files before changing recommendation behaviour.

## Product boundary

Fragrance Finder is a curated fragrance discovery prototype. The current unresolved question is its commercial/product direction, not missing UI breadth.

Do not add large new features until the product/affiliate model is deliberately chosen.

## Data integrity

- Do not invent fragrances, retailer availability, concentrations or prices.
- Keep recommendation/match scores described as heuristic guidance, not scientific predictions or dupe guarantees.
- Preserve separation between the core fragrance dataset and retailer/product adapters.
- Respect retailer/affiliate/data-source terms before public commercial use.

## Engineering

The current app is deliberately simple/static. Avoid introducing a complex framework unless a real product requirement justifies it.

## Documentation is part of done

Update `PROJECT.md` when the business model, affiliate/feed strategy, dataset scope, deployment state or current milestone changes.

## Handoff

Read `PROJECT.md` first; update it last.
