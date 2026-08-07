import { aesEncrypt } from "./crypto.js";
import { FixtureStore } from "./fixtures.js";
import { postJson } from "./http.js";
import type { ApassRecord, CvResult, GenerateApassInput, RuleV2, UpdateStatusInput, VerifyResult } from "./types.js";
import { ApassState, OK, VerifyCode } from "./types.js";

export interface CooperateConfig {
  /** e.g. https://uatapi.cleanverse.com/api/cooperate */
  base: string;
  /** App ID — sent as the `api-id` header. */
  apiId?: string;
  /** App Key — base64 AES key used LOCALLY to encrypt write bodies. Never transmitted. */
  appKey?: string;
  /** When credentials are absent, replay stateful fixtures (tagged source:"fixture"). */
  allowFixtures?: boolean;
}

const ok = <T>(data: T, source: "live" | "fixture"): CvResult<T> => ({ code: OK, message: "success", data, source });
const err = <T>(message: string, source: "live" | "fixture"): CvResult<T> => ({ code: "0002", message, data: undefined as T, source });

/**
 * Cleanverse Cooperate API v5.6 client.
 * - Reads: plain JSON, retried on transient sandbox errors.
 * - Writes: body AES-encrypted (`{data: ciphertext}`), never retried.
 * - Without credentials (hackathon keys pending), calls resolve against a faithful
 *   mutable FixtureStore and every response is tagged `source:"fixture"` so the UI
 *   can badge the panel SIMULATED. No silent fakery.
 */
export class CooperateClient {
  readonly fixtures = new FixtureStore();

  constructor(private readonly cfg: CooperateConfig) {}

  get live(): boolean {
    return Boolean(this.cfg.apiId && this.cfg.appKey);
  }

  private headers(): Record<string, string> {
    return { "api-id": this.cfg.apiId ?? "" };
  }

  private read<T>(path: string, body: unknown): Promise<CvResult<T>> {
    return postJson<T>(`${this.cfg.base}/${path}`, body, { headers: this.headers(), retry: true });
  }

  private write<T>(path: string, body: unknown): Promise<CvResult<T>> {
    const payload = { data: aesEncrypt(JSON.stringify(body), this.cfg.appKey ?? "") };
    return postJson<T>(`${this.cfg.base}/${path}`, payload, { headers: this.headers(), retry: false });
  }

  private requireFixtures(): void {
    if (!this.cfg.allowFixtures) {
      throw new Error("Cleanverse credentials missing and fixtures disabled (set MERIDIAN_ALLOW_FIXTURES=1)");
    }
  }

  // ---- CVI: A-Pass lifecycle ------------------------------------------------

  async generateApass(input: GenerateApassInput): Promise<CvResult<ApassRecord>> {
    if (this.live) return this.write("generate_apass", input);
    this.requireFixtures();
    return ok(this.fixtures.generateApass(input), "fixture");
  }

  async queryApass(p: { chain: string; address: string }): Promise<CvResult<ApassRecord>> {
    if (this.live) return this.read("query_apass", p);
    this.requireFixtures();
    const rec = this.fixtures.getApass(p.chain, p.address);
    return rec ? ok(rec, "fixture") : err("A-Pass not found", "fixture");
  }

  async queryApassList(): Promise<CvResult<ApassRecord[]>> {
    if (this.live) return this.read("query_apass_list", {});
    this.requireFixtures();
    return ok(this.fixtures.listApass(), "fixture");
  }

  /** The pre-transaction gate. Result code 4 = valid A-Pass + transfer allowed. */
  async verifyApass(p: { chain: string; atoken: string; address: string }): Promise<CvResult<VerifyResult>> {
    if (this.live) {
      const res = await this.read<VerifyResult>("verify_apass", p);
      return res;
    }
    this.requireFixtures();
    const rec = this.fixtures.getApass(p.chain, p.address);
    const now = Math.floor(Date.now() / 1000);
    let code: VerifyCode;
    if (!rec) code = VerifyCode.NoApass;
    else if (rec.state !== ApassState.Active || rec.expirationTime < now) code = VerifyCode.ApassBlocked;
    else code = VerifyCode.Valid;
    return ok(
      {
        code,
        message:
          code === VerifyCode.Valid ? "valid, transfer allowed" : code === VerifyCode.ApassBlocked ? "A-Pass exists but cannot transfer (expired or frozen)" : "no A-Pass",
        ...(code === VerifyCode.ApassBlocked || code === VerifyCode.NoApass
          ? { magickLink: "https://uat.cleanverse.com/register?src=meridian" }
          : {}),
        chain: p.chain,
        atoken: p.atoken,
        address: p.address,
      },
      "fixture",
    );
  }

  /** Freeze (2) / activate (1) a credential — an enactable policy lever. */
  async updateStatus(input: UpdateStatusInput): Promise<CvResult<{ txHash?: string }>> {
    if (this.live) {
      return this.write("update_status", {
        customerId: input.customerId,
        cvRecordId: input.cvRecordId,
        status: String(input.status),
        blacklistReason: input.blacklistReason,
        wallet: input.wallet,
      });
    }
    this.requireFixtures();
    const rec = this.fixtures.setStatus(input.wallet.chain, input.wallet.address, input.status);
    return rec ? ok({ txHash: `0xfixture${rec.cvRecordId}` }, "fixture") : err("A-Pass not found", "fixture");
  }

  // ---- CVA: A-Token rule administration --------------------------------------

  async atokenRules(p: { chain: string; atoken: string }): Promise<CvResult<RuleV2[]>> {
    if (this.live) return this.read("atoken/rules", p);
    this.requireFixtures();
    return ok(this.fixtures.getRules(p.atoken), "fixture");
  }

  /** ENACT: replace the rule set on an A-Token. Serialized by callers — one write at a time. */
  async atokenSetRule(p: { chain: string; atoken: string; rules: RuleV2[] }): Promise<CvResult<{ txHash?: string }>> {
    if (this.live) return this.write("atoken/set_rule", p);
    this.requireFixtures();
    this.fixtures.setRules(p.atoken, p.rules);
    return ok({ txHash: `0xfixture_rule_${Date.now()}` }, "fixture");
  }

  async atokenAddRule(p: { chain: string; atoken: string; rule: RuleV2 }): Promise<CvResult<{ txHash?: string }>> {
    if (this.live) return this.write("atoken/add_rule", p);
    this.requireFixtures();
    this.fixtures.addRule(p.atoken, p.rule);
    return ok({ txHash: `0xfixture_rule_${Date.now()}` }, "fixture");
  }

  async atokenSetPaused(p: { chain: string; atoken: string; paused: boolean }): Promise<CvResult<unknown>> {
    if (this.live) return this.write("atoken/set_paused", p);
    this.requireFixtures();
    this.fixtures.setPaused(p.atoken, p.paused);
    return ok({}, "fixture");
  }

  async queryDepositAtokenList(): Promise<CvResult<unknown>> {
    if (this.live) return this.read("query_deposit_atoken_list", {});
    this.requireFixtures();
    return ok([], "fixture");
  }

  // ---- CCP: validator pool registration --------------------------------------

  /**
   * Register a contract as a compliance pool with its own RuleV2.
   * `ownerSignature` = EIP-191 signature over `chain + contract_address` (lowercase, concatenated).
   */
  async validatorRegister(p: {
    chain: string;
    contractAddress: string;
    rule: RuleV2;
    ownerSignature: string;
  }): Promise<CvResult<{ txHash?: string }>> {
    if (this.live) return this.write("validator/register", p);
    this.requireFixtures();
    this.fixtures.setRules(p.contractAddress, [p.rule]);
    return ok({ txHash: `0xfixture_pool_${Date.now()}` }, "fixture");
  }

  async validatorIsRegister(p: { chain: string; contractAddress: string }): Promise<CvResult<{ registered: boolean }>> {
    if (this.live) return this.read("validator/is_register", p);
    this.requireFixtures();
    return ok({ registered: this.fixtures.getRules(p.contractAddress).length > 0 }, "fixture");
  }

  async validatorRules(p: { chain: string; contractAddress: string }): Promise<CvResult<RuleV2[]>> {
    if (this.live) return this.read("validator/rules", p);
    this.requireFixtures();
    return ok(this.fixtures.getRules(p.contractAddress), "fixture");
  }

  // ---- Travel Rule & reporting ------------------------------------------------

  async downloadTravelRule(p: {
    txHash: string;
    wallet: { chain: string; address: string };
    customerId?: string;
    cvRecordId?: string;
  }): Promise<CvResult<{ url?: string }>> {
    if (this.live) return this.read("download_travel_rule", p);
    this.requireFixtures();
    return ok({ url: `fixture://travel-rule/${p.txHash}` }, "fixture");
  }

  async queryTxs(p: Record<string, unknown>): Promise<CvResult<unknown>> {
    if (this.live) return this.read("query_txs", p);
    this.requireFixtures();
    return ok([], "fixture");
  }
}
