import { keccak256, toBytes, type Hex } from "viem";

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([left], [right]) => left.localeCompare(right));
  return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`).join(",")}}`;
}

/** Keccak content address for JSON data using recursively sorted object keys. */
export function hashProofPayload(value: unknown): Hex {
  return keccak256(toBytes(canonicalJson(value)));
}