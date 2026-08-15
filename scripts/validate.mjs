import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

const listeners = new Map();
const appNode = { innerHTML: "" };
const nullClassList = { add() {}, remove() {}, toggle() { return false; } };

globalThis.document = {
  title: "",
  body: { classList: nullClassList },
  querySelector(selector) {
    return selector === "#app" ? appNode : null;
  },
  querySelectorAll() {
    return [];
  },
};

globalThis.window = {
  location: { hash: "" },
  addEventListener(type, callback) {
    listeners.set(type, callback);
  },
  scrollTo() {},
};

const memory = new Map();
globalThis.sessionStorage = {
  getItem(key) { return memory.get(key) || null; },
  setItem(key, value) { memory.set(key, String(value)); },
};

globalThis.fetch = async (url) => ({
  async json() {
    return JSON.parse(await fs.readFile(fileURLToPath(url), "utf8"));
  },
});

const site = await import("../app.js");
const retailerProducts = JSON.parse(await fs.readFile(new URL("../data/retailer-products.json", import.meta.url), "utf8"));

assert.ok(retailerProducts.length > 0);
assert.equal(new Set(retailerProducts.map((item) => item.id)).size, retailerProducts.length);
assert.ok(retailerProducts.every((item) => item.retailer === "The Fragrance Shop"));
assert.ok(retailerProducts.every((item) => item.productUrl.startsWith("https://www.thefragranceshop.co.uk/")));
assert.ok(retailerProducts.every((item) => item.imageUrl.startsWith("https://images.thefragranceshop.co.uk/products/")));

assert.match(appNode.innerHTML, /Find the fragrance/);
assert.match(appNode.innerHTML, /Popular starting points/);

site.setQuizForTest({
  forWhom: "Me",
  favouriteId: "M01-dior-sauvage",
  lovedTraits: ["Bergamot", "Woody"],
  direction: "Keep it familiar",
  occasion: "Everyday",
  intensity: "Balanced",
  adventure: "Balanced",
});

const matches = site.calculateMatches();
assert.equal(matches.length, 3);
assert.ok(matches.every((match) => match.finalScore >= 50 && match.finalScore <= 99));
assert.deepEqual([...matches].sort((a, b) => b.finalScore - a.finalScore).map((match) => match.finalScore), matches.map((match) => match.finalScore));

window.location.hash = "#/your-fragrance-edit";
site.renderApp();
assert.equal((appNode.innerHTML.match(/class="result-card"/g) || []).length, 3);
assert.match(appNode.innerHTML, /Compare your edit/);

site.setExploreForTest({ search: "Libre", audience: "All", family: "All", season: "All", intensity: "All", sort: "rank" });
const filtered = site.filteredExploreResults();
assert.ok(filtered.length >= 2);
assert.ok(filtered.every((item) => `${item.brand} ${item.name} ${item.family} ${item.accords.join(" ")} ${item.moods.join(" ")}`.toLowerCase().includes("libre")));

window.location.hash = `#/fragrance/${filtered[0].slug}`;
site.renderApp();
assert.match(appNode.innerHTML, /Five directions from this favourite/);

console.log(JSON.stringify({
  homeRendered: true,
  matchCount: matches.length,
  matchScores: matches.map((match) => match.finalScore),
  filteredExploreCount: filtered.length,
  detailRendered: true,
  temporaryRetailerImages: retailerProducts.length,
}, null, 2));
