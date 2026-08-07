/**
 * Live smoke against the public Cleanverse Skills API (no credentials required).
 * Proves the live surface works and captures real chain config for the app.
 *   pnpm tsx packages/cleanverse/scripts/smoke-skills.ts
 */
import { writeFileSync } from "node:fs";
import { SkillsClient } from "../src/skills.js";

const skills = new SkillsClient({ base: process.env.CLEANVERSE_SKILLS_BASE ?? "https://uatapi.cleanverse.com/api/skills" });

const cfg = await skills.queryChainConfig();
console.log(`query_chain_config → code=${cfg.code} source=${cfg.source}`);
if (cfg.code !== "0000") throw new Error(`unexpected: ${cfg.message}`);
for (const c of cfg.data.chains) {
  console.log(
    `  ${c.chain.padEnd(10)} id=${String(c.chain_id).padEnd(8)} evm=${String(c.is_evm).padEnd(5)} apass=${c.apass_address.slice(0, 14)}… tokens=[${c.tokens.map((t) => t.a_symbol).join(",")}]`,
  );
}
writeFileSync(new URL("../src/recorded/chain-config.json", import.meta.url), JSON.stringify(cfg.data, null, 2));
console.log("recorded → packages/cleanverse/src/recorded/chain-config.json");

const ml = await skills.getMagiclink();
console.log(`get_magiclink → code=${ml.code} url=${ml.data?.register_url ?? "(none)"}`);

const inst = await skills.queryDepositInstitutions({ chain: "monad", symbol: "usdc" });
console.log(`query_deposit_institutions(monad,usdc) → code=${inst.code} pairs=${inst.data?.token_whitelist?.length ?? 0}`);
if (inst.data?.token_whitelist?.length) {
  for (const w of inst.data.token_whitelist) {
    console.log(`  ${w.origin_symbol}→${w.atoken_symbol} @ ${w.atoken_address} institutions=${w.whitelist.map((i) => i.service_name).join(", ")}`);
  }
  writeFileSync(new URL("../src/recorded/institutions-monad-usdc.json", import.meta.url), JSON.stringify(inst.data, null, 2));
}
