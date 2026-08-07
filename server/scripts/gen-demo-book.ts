/** Emits the deterministic seeded book as JSON for the web app's standalone demo engine. */
import { mkdirSync, writeFileSync } from "node:fs";
import { CooperateClient } from "@meridian/cleanverse";
import { BookStore } from "../src/book/store.js";
import { seedBook } from "../src/book/seed.js";

const book = new BookStore();
await seedBook(book, new CooperateClient({ base: "https://example.invalid", allowFixtures: true }));

const out = {
  assetId: book.assetId,
  generatedAt: Date.now(),
  holders: book.list().map((h) => ({ ...h, position: h.position.toString() })),
  policies: book.policies,
  distributions: book.distributions.map((d) => ({
    ...d,
    legs: d.legs.map((l) => ({ ...l, amount: l.amount.toString() })),
  })),
};

mkdirSync(new URL("../../web/lib/", import.meta.url), { recursive: true });
writeFileSync(new URL("../../web/lib/demo-book.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(`demo book → web/lib/demo-book.json (${out.holders.length} holders)`);
