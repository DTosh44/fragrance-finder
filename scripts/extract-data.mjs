import fs from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

const projectRoot = path.resolve(import.meta.dirname, "../..");
const sourcePath = path.join(projectRoot, "build_fragrance_finding.mjs");
const outputDir = path.resolve(import.meta.dirname, "../data");

const source = await fs.readFile(sourcePath, "utf8");
const start = source.indexOf("const retailWomen");
const end = source.indexOf("const wb = Workbook.create();");

if (start === -1 || end === -1) {
  throw new Error("Could not locate dataset definitions in build_fragrance_finding.mjs");
}

const datasetSource = `${source.slice(start, end)}\nJSON.stringify({ all, recommendationMap })`;
const payload = JSON.parse(vm.runInNewContext(datasetSource, {}, { timeout: 10_000 }));

const fragrances = payload.all.map((item) => ({
  id: item.id,
  slug: `${item.id.slice(0, 3).toLowerCase()}-${item.brand}-${item.name}`
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""),
  popularityRank: item.rank,
  audience: item.audience,
  brand: item.brand,
  name: item.name,
  concentration: item.concentration,
  family: item.family,
  accords: item.accords,
  moods: item.moods,
  seasons: item.seasons,
  intensity: item.intensity,
  bestFor: item.bestFor,
  popularityBasis: "UK fragrance retailer bestseller and popularity lists, reviewed August 2026",
  retailSource: item.retailUrl,
}));

const recommendations = payload.recommendationMap.map((entry) => ({
  sourceId: entry.source.id,
  recommendationId: entry.rec.id,
  rank: entry.recRank,
  baseScore: entry.score,
  confidence: entry.confidence,
  direction: entry.direction,
  why: entry.why,
  sharedAccords: entry.shared ? entry.shared.split(", ").filter(Boolean) : [],
  caveat: entry.caveat,
  evidenceMethod: entry.evidence,
  communityCheckQuery: entry.query,
}));

await fs.mkdir(outputDir, { recursive: true });
await Promise.all([
  fs.writeFile(path.join(outputDir, "fragrances.json"), `${JSON.stringify(fragrances, null, 2)}\n`),
  fs.writeFile(path.join(outputDir, "recommendations.json"), `${JSON.stringify(recommendations, null, 2)}\n`),
]);

console.log(`Exported ${fragrances.length} fragrances and ${recommendations.length} recommendations.`);
