/** Standard Cleanverse response envelope. code "0000" = success. */
export interface CvEnvelope<T = unknown> {
  code: string;
  message: string;
  data: T;
}

/** Provenance of a response — the honesty layer surfaced in every UI panel. */
export type Provenance = "live" | "fixture";

export interface CvResult<T = unknown> extends CvEnvelope<T> {
  source: Provenance;
}

export const OK = "0000";

/** A-Pass credential state. */
export const ApassState = { Active: 1, Frozen: 2 } as const;

/** verify_apass result codes — 4 is the only clear-to-settle value. */
export enum VerifyCode {
  AtokenNotFound = 1,
  NoApass = 2,
  /** A-Pass exists but cannot transfer: expired / frozen / compliance block. */
  ApassBlocked = 3,
  Valid = 4,
}

export interface ApassRecord {
  cvRecordId: string;
  tier: string;
  subTier: number;
  group: string;
  subGroup: string;
  /** 1 = active, 2 = frozen */
  state: number;
  /** unix seconds */
  expirationTime: number;
  currentKycHash: string;
  countries?: string[];
}

export interface VerifyResult {
  code: VerifyCode;
  message: string;
  /** Registration/remediation link returned on a block. */
  magickLink?: string;
  chain: string;
  atoken: string;
  address: string;
}

export interface ChainToken {
  chain: string;
  symbol: string;
  a_symbol: string;
  token_address: string;
  name: string;
  decimals: number;
  icon: string;
  token_category: string;
  access_core: string;
  deposit_gateway: string;
}

export interface ChainConfig {
  chain: string;
  chain_id: number;
  chain_name: string;
  explorer: string;
  is_evm: boolean;
  rpc_url: string;
  operator_address: string;
  fee_pay_address: string;
  fee_receive_address: string;
  rent_payer_address: string;
  apass_address: string;
  wallet_core: string;
  tokens: ChainToken[];
}

export interface DepositInstitution {
  service_name: string;
  entity_name: string;
  category: string;
  icon: string;
}

export interface TokenWhitelist {
  origin_symbol: string;
  origin_token_address: string;
  atoken_symbol: string;
  atoken_address: string;
  whitelist: DepositInstitution[];
}

export interface IdentityData {
  idType: "NID" | "PASSPORT" | "DRIVER_LICENSE" | "HK_MACAO_TAIWAN_PASS" | "OTHER" | (string & {});
  fullName: string;
  issuingCountryISO2: string;
  idNumber?: string;
  /** yyyy-MM-dd */
  validUntil?: string;
}

export interface GenerateApassInput {
  /** unique, min 12 chars, institution-assigned */
  customerId: string;
  /** 1–99 */
  subTier: number;
  /** exactly 2 letters, case-sensitive */
  subGroup: string;
  /** unix seconds */
  expirationTime: number;
  wallet: { address: string; chain: string };
  identityDataList: IdentityData[];
  kycSource?: string;
  kycId?: string;
  override?: boolean;
}

export interface UpdateStatusInput {
  wallet: { chain: string; address: string };
  /** 1 = activate/unfreeze, 2 = freeze */
  status: 1 | 2;
  customerId?: string;
  cvRecordId?: string;
  blacklistReason?: string;
}

/**
 * RuleV2 — the five-dimensional compliance rule attached to A-Tokens / validator pools.
 * 0 / empty = no restriction on that dimension.
 */
export interface RuleV2 {
  /** allowed group, 1–2 chars ("" = any) */
  group: string;
  /** allowed sub-group, 2 chars ("" = any) */
  subGroup: string;
  /** 0–99 (0 = no minimum) */
  minTier: number;
  /** 0–99 (0 = no minimum) */
  minSubTier: number;
  /** ISO2 country codes; interpretation depends on isBlackList */
  countries: string[];
  /** true → countries are denied; false → countries are the allow list (empty = any) */
  isBlackList: boolean;
}
