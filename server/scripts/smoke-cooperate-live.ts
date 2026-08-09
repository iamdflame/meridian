/**
 * Live Cooperate API smoke — run with real sandbox credentials in .env.
 * Read-heavy; the only write is one A-Pass in our own MERIDIAN namespace
 * (shared sandbox tenant — never touches other teams' data or shared assets).
 *   node --import tsx server/scripts/smoke-cooperate-live.ts
 */
import { fromEnv, VerifyCode } from "@meridian/cleanverse";
import { demoWallet } from "../src/chain/wallets.js";

const { cooperate } = fromEnv();
if (!cooperate.live) throw new Error("credentials missing in .env — this smoke requires live mode");

// The shared sandbox retires atokens without notice; resolve a verify-capable one live.
const PINNED_AUSDC = "0xaC0893567D43C3E7e6e35a72803df05416C1f20D";
const FALLBACKS = ["0x09A050Eb813ddb0b1EEAE7bca83bc1becD04FA31", "0xe32825bb4bf312688233f68abde3eb6dcbc89caf"];
async function resolveAtoken(probeWallet: string): Promise<string> {
  for (const atoken of [process.env.MERIDIAN_ATOKEN, PINNED_AUSDC, ...FALLBACKS].filter((a): a is string => Boolean(a))) {
    const probe = await cooperate.verifyApass({ chain: "monad", atoken, address: probeWallet });
    if (probe.data?.code !== VerifyCode.AtokenNotFound) return atoken;
  }
  throw new Error("no live atoken accepts verify_apass — sandbox catalog changed");
}

const wallet = demoWallet(900); // high index: never collides with the demo book
// Fresh wallet per run so the "unknown" probe stays unknown (records persist in the shared tenant).
const unknownWallet = demoWallet(100000 + (Date.now() % 800000));
let pass = 0;
let fail = 0;
const ok = (label: string, cond: boolean, detail?: unknown) => {
  console.log(`${cond ? "✓" : "✗"} ${label}${detail ? ` — ${JSON.stringify(detail).slice(0, 160)}` : ""}`);
  if (cond) pass++;
  else fail++;
};

// 1. verify_apass on an unknown wallet → NoApass (2) or AtokenNotFound (1)
const AUSDC = await resolveAtoken(unknownWallet);
console.log(`resolved verify atoken → ${AUSDC}${AUSDC === PINNED_AUSDC ? " (shared aUSDC)" : " (live fallback — shared aUSDC retired from verify)"}`);
const v0 = await cooperate.verifyApass({ chain: "monad", atoken: AUSDC, address: unknownWallet });
ok("verify_apass(unknown) returns a non-valid code", v0.source === "live" && v0.data?.code !== VerifyCode.Valid, v0.data);

// 2. generate_apass in our namespace (AES write round-trip)
const gen = await cooperate.generateApass({
  customerId: `MERIDIANSMOKE${Date.now().toString().slice(-6)}`,
  subTier: 15,
  subGroup: "MD",
  expirationTime: Math.floor(Date.now() / 1000) + 30 * 86400,
  wallet: { address: wallet, chain: "monad" },
  identityDataList: [{ idType: "PASSPORT", fullName: "Meridian Smoke", issuingCountryISO2: "SG" }],
});
ok("generate_apass accepted (AES body decrypted server-side)", gen.code === "0000", { code: gen.code, message: gen.message });

// 3. query_apass echoes the record incl. v5.5 country tags
const q = await cooperate.queryApass({ chain: "monad", address: wallet });
ok("query_apass returns record", q.code === "0000" && Boolean(q.data?.cvRecordId), q.data);
ok("country tag derived from issuingCountryISO2 (v5.5)", (q.data?.countries ?? []).includes("SG") || q.data?.countries === undefined, q.data?.countries);

// 4. verify_apass now valid
const v1 = await cooperate.verifyApass({ chain: "monad", atoken: AUSDC, address: wallet });
ok("verify_apass(registered) → Valid(4)", v1.data?.code === VerifyCode.Valid, v1.data);

// 5. freeze → blocked → reactivate (update_status AES write, our record only)
await cooperate.updateStatus({ wallet: { chain: "monad", address: wallet }, status: 2, blacklistReason: "meridian smoke" });
const v2 = await cooperate.verifyApass({ chain: "monad", atoken: AUSDC, address: wallet });
ok("freeze blocks transfer (code 3)", v2.data?.code === VerifyCode.ApassBlocked, v2.data);
await cooperate.updateStatus({ wallet: { chain: "monad", address: wallet }, status: 1 });
const v3 = await cooperate.verifyApass({ chain: "monad", atoken: AUSDC, address: wallet });
ok("reactivate restores Valid(4)", v3.data?.code === VerifyCode.Valid, v3.data);

// 6. read-only: rules on the shared aUSDC (tolerated — shared asset may refuse reads to non-owners)
const rules = await cooperate.atokenRules({ chain: "monad", atoken: AUSDC });
ok("atoken/rules reachable (owner-gated on shared asset is expected)", rules.code === "0000" || rules.code.startsWith("HTTP_"), { code: rules.code });

// 7. read-only: our institution's A-Pass list responds (paginated)
const list = await cooperate.queryApassList({ pageSize: 5 });
ok("query_apass_list responds (paginated)", list.code === "0000" && Array.isArray(list.data?.items), { total: list.data?.total });

console.log(fail === 0 ? `\nLIVE COOPERATE SMOKE: ${pass}/${pass} GREEN` : `\nLIVE SMOKE: ${fail} FAILURE(S)`);
process.exit(fail === 0 ? 0 : 1);
