import type { ApassRecord, GenerateApassInput, RuleV2 } from "./types.js";
import { ApassState } from "./types.js";

/**
 * Mutable fixture store — a faithful, stateful stand-in for the Cooperate API
 * used when sandbox credentials are absent. Every response produced from here
 * is tagged `source: "fixture"` and surfaced in the UI as SIMULATED.
 * Shapes mirror recorded sandbox responses exactly.
 */
export class FixtureStore {
  private apass = new Map<string, ApassRecord>(); // key: chain:address (lowercase)
  private rules = new Map<string, RuleV2[]>(); // key: atoken address (lowercase)
  private paused = new Map<string, boolean>();
  private seq = 2018305464961933312n;

  key(chain: string, address: string): string {
    return `${chain.toLowerCase()}:${address.toLowerCase()}`;
  }

  generateApass(input: GenerateApassInput): ApassRecord {
    const rec: ApassRecord = {
      cvRecordId: String(this.seq++),
      // Sandbox precedent: member tier is derived from subTier by the platform.
      tier: String(Math.max(1, Math.min(99, Math.round(input.subTier * 2)))),
      subTier: input.subTier,
      group: input.subGroup, // sandbox echoes group from subGroup for institution scope
      subGroup: input.subGroup,
      state: ApassState.Active,
      expirationTime: input.expirationTime,
      currentKycHash: sha256Hex(`${input.customerId}:${input.wallet.address.toLowerCase()}`),
      countries: input.identityDataList.map((d) => d.issuingCountryISO2.toUpperCase()),
    };
    this.apass.set(this.key(input.wallet.chain, input.wallet.address), rec);
    return rec;
  }

  getApass(chain: string, address: string): ApassRecord | undefined {
    return this.apass.get(this.key(chain, address));
  }

  listApass(): ApassRecord[] {
    return [...this.apass.values()];
  }

  setStatus(chain: string, address: string, state: 1 | 2): ApassRecord | undefined {
    const rec = this.apass.get(this.key(chain, address));
    if (rec) rec.state = state;
    return rec;
  }

  getRules(atoken: string): RuleV2[] {
    return this.rules.get(atoken.toLowerCase()) ?? [];
  }

  setRules(atoken: string, rules: RuleV2[]): void {
    this.rules.set(atoken.toLowerCase(), rules);
  }

  addRule(atoken: string, rule: RuleV2): void {
    const list = this.rules.get(atoken.toLowerCase()) ?? [];
    list.push(rule);
    this.rules.set(atoken.toLowerCase(), list);
  }

  setPaused(atoken: string, paused: boolean): void {
    this.paused.set(atoken.toLowerCase(), paused);
  }

  isPaused(atoken: string): boolean {
    return this.paused.get(atoken.toLowerCase()) ?? false;
  }
}

import { createHash } from "node:crypto";
function sha256Hex(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
