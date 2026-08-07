import { describe, expect, it } from "vitest";
import { aesDecrypt, aesEncrypt } from "../src/crypto.js";

const KEY_16 = Buffer.from("0123456789abcdef").toString("base64");
const KEY_32 = Buffer.from("0123456789abcdef0123456789abcdef").toString("base64");

describe("cooperate AES body encryption (CBC, PKCS5, zero IV)", () => {
  it("round-trips utf8 payloads with a 128-bit key", () => {
    const body = JSON.stringify({ customerId: "MERIDIAN0001", wallet: { chain: "monad", address: "0xabc" } });
    expect(aesDecrypt(aesEncrypt(body, KEY_16), KEY_16)).toBe(body);
  });

  it("round-trips with a 256-bit key", () => {
    const body = "0".repeat(1000);
    expect(aesDecrypt(aesEncrypt(body, KEY_32), KEY_32)).toBe(body);
  });

  it("is deterministic (fixed zero IV) — matches the documented sandbox scheme", () => {
    expect(aesEncrypt("hello", KEY_16)).toBe(aesEncrypt("hello", KEY_16));
  });

  it("rejects malformed keys", () => {
    expect(() => aesEncrypt("x", Buffer.from("short").toString("base64"))).toThrow(/16\/24\/32/);
  });
});
