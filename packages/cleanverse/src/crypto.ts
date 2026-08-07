import { createCipheriv, createDecipheriv } from "node:crypto";

/**
 * Cleanverse Cooperate API body encryption: AES/CBC/PKCS5Padding, fixed zero IV,
 * key = base64-decoded App Key. The App Key is a LOCAL secret — it is never
 * transmitted; only the ciphertext travels, as `{ "data": "<base64>" }`.
 */
const IV = Buffer.alloc(16, 0);

function keyFrom(appKeyB64: string): Buffer {
  const key = Buffer.from(appKeyB64, "base64");
  if (![16, 24, 32].includes(key.length)) {
    throw new Error(`App Key must decode to 16/24/32 bytes, got ${key.length}`);
  }
  return key;
}

export function aesEncrypt(plaintext: string, appKeyB64: string): string {
  const key = keyFrom(appKeyB64);
  const cipher = createCipheriv(`aes-${key.length * 8}-cbc`, key, IV);
  return Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]).toString("base64");
}

export function aesDecrypt(ciphertextB64: string, appKeyB64: string): string {
  const key = keyFrom(appKeyB64);
  const decipher = createDecipheriv(`aes-${key.length * 8}-cbc`, key, IV);
  return Buffer.concat([decipher.update(Buffer.from(ciphertextB64, "base64")), decipher.final()]).toString("utf8");
}
