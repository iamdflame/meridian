import { postJson } from "./http.js";
import type { ApassRecord, ChainConfig, CvResult, TokenWhitelist } from "./types.js";

export interface SkillsConfig {
  /** e.g. https://uatapi.cleanverse.com/api/skills */
  base: string;
}

/**
 * Cleanverse Skills API — the Agent Skill Framework surface.
 * Public, unauthenticated, safe to call live at all times.
 * Reference: official cleanverseorg/clevrpay skill package.
 */
export class SkillsClient {
  constructor(private readonly cfg: SkillsConfig) {}

  private call<T>(path: string, body: unknown = {}): Promise<CvResult<T>> {
    return postJson<T>(`${this.cfg.base}/${path}`, body, { retry: true });
  }

  /** A-Pass registration (magic link) URL. */
  getMagiclink(): Promise<CvResult<{ register_url: string }>> {
    return this.call("get_magiclink");
  }

  /** A-Pass record for a wallet: tier, expiry, state, group data, KYC hash. */
  queryApass(p: { chain: string; address: string; symbol?: string }): Promise<CvResult<ApassRecord>> {
    return this.call("query_apass", p);
  }

  /** Live chain/token/A-Pass/access-core configuration — the ecosystem source of truth. */
  queryChainConfig(): Promise<CvResult<{ chains: ChainConfig[] }>> {
    return this.call("query_chain_config");
  }

  /** Whitelisted deposit institutions per origin/A-Token pair. */
  queryDepositInstitutions(p: { chain: string; symbol: string }): Promise<CvResult<{ chain: string; token_whitelist: TokenWhitelist[] }>> {
    return this.call("query_deposit_institutions", p);
  }

  /** Deposit wallet mapping for a user address. */
  queryDepositAddress(p: { chain: string; address: string; symbol?: string }): Promise<CvResult<Record<string, unknown>>> {
    return this.call("query_deposit_address", p);
  }

  /** Registration status for a (chain, symbol, address) mapping. */
  queryUser(p: { chain: string; symbol: string; address: string }): Promise<CvResult<Record<string, unknown>>> {
    return this.call("query_user", p);
  }

  /** Register a wallet for deposits; returns user→deposit mapping. */
  registerData(p: { chain: string; symbol: string; address: string }): Promise<CvResult<Record<string, unknown>>> {
    return this.call("register_data", p);
  }
}
