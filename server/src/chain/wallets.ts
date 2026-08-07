import { privateKeyToAccount } from "viem/accounts";

/**
 * Deterministic demo wallets — index → private key → address.
 * Testnet-only theatre: lets the keeper sign as any book holder for proof
 * transfers. Never used for real value.
 */
export function demoKey(i: number): `0x${string}` {
  return `0x${(BigInt(i) + 0x0c1ea0001n).toString(16).padStart(64, "0")}` as `0x${string}`;
}

export function demoAccount(i: number) {
  return privateKeyToAccount(demoKey(i));
}

export function demoWallet(i: number): string {
  return demoAccount(i).address;
}
