/** Writes the shared differential vectors to contracts/test/vectors.json. */
import { writeFileSync } from "node:fs";
import { generateVectors } from "@meridian/sim";

const vectors = generateVectors(500);
const out = new URL("../../contracts/test/vectors.json", import.meta.url);
writeFileSync(out, JSON.stringify(vectors));
const dist = new Map<number, number>();
for (const v of vectors) dist.set(v.expected, (dist.get(v.expected) ?? 0) + 1);
console.log(`wrote ${vectors.length} vectors → contracts/test/vectors.json`);
console.log("expected-reason distribution:", Object.fromEntries([...dist.entries()].sort((a, b) => a[0] - b[0])));
