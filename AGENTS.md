# Fragrance Finder — repository instructions

## Read first

Before significant work, read `AGENTS.md`, `PROJECT.md`, `README.md` and inspect the data files before changing recommendation behaviour.

## Product boundary

Fragrance Finder is a curated, **affiliate-funded fragrance discovery** product. The user approved affiliate funding on 17 October 2026; that decision supersedes earlier notes calling the business model unresolved. The current unanswered questions are **which** compliant affiliate partners/feeds to use, data/link rights, disclosures and launch priority, not whether affiliate funding is intended.

Do not add large new features until affiliate links/feeds and the core journey have been verified. Do not imply that an affiliate relationship, tracked commission or live price feed exists without evidence.

## Data integrity

- Do not invent fragrances, retailer availability, concentrations or prices.
- Keep recommendation/match scores described as heuristic guidance, not scientific predictions or dupe guarantees.
- Preserve separation between the core fragrance dataset and retailer/product adapters.
- Respect retailer/affiliate/data-source terms before public commercial use.
- Clearly disclose affiliate links and sponsored placements; never rank scent similarity primarily by commission or make unverified commercial claims.

## Engineering

The current app is deliberately simple/static. Avoid introducing a complex framework unless a real product requirement justifies it.

## Documentation is part of done

Update `PROJECT.md` when the business model, affiliate/feed strategy, dataset scope, deployment state or current milestone changes.

## Handoff

Read `PROJECT.md` first; update it last.
