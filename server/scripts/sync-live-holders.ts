/**
 * One-time: create REAL A-Passes on the sandbox for the demo book's first 12 holders
 * (MERIDIAN-namespaced customerIds — shared tenant, our records only).
 * The server then overlays this live state on boot; verify_apass hits these rows live.
 *   node --import tsx server/scripts/sync-live-holders.ts
 */
import { fromEnv } from "@meridian/cleanverse";
import { CooperateClient } from "@meridian/cleanverse";
import { BookStore } from "../src/book/store.js";
import { seedBook } from "../src/book/seed.js";

const { cooperate } = fromEnv();
if (!cooperate.live) throw new Error("credentials missing in .env");

const book = new BookStore();
await seedBook(book, new CooperateClient({ base: "local://seed", allowFixtures: true }));

let created = 0;
let existing = 0;
for (const h of book.list().slice(0, 12)) {
  const q = await cooperate.queryApass({ chain: "monad", address: h.wallet });
  if (q.code === "0000" && q.data?.cvRecordId) {
    existing++;
    continue;
  }
  const res = await cooperate.generateApass({
    customerId: h.customerId,
    subTier: h.subTier,
    subGroup: "MD",
    expirationTime: h.expiry,
    wallet: { address: h.wallet, chain: "monad" },
    identityDataList: [{ idType: "PASSPORT", fullName: h.name, issuingCountryISO2: h.country }],
  });
  console.log(`${res.code === "0000" ? "✓" : "✗"} ${h.name} (${h.country}, subTier ${h.subTier}) → ${res.code} ${res.message}`);
  if (res.code === "0000") created++;
}
console.log(`\nlive holders: ${created} created, ${existing} already existed — server will overlay these on boot`);
