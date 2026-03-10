import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Uint8Array {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) {
    throw new Error("ENCRYPTION_SECRET environment variable is not set");
  }
  // If the secret is already 64 hex characters (32 bytes), use it directly
  if (secret.length === 64 && /^[0-9a-fA-F]+$/.test(secret)) {
    return new Uint8Array(Buffer.from(secret, "hex"));
  }
  // Otherwise, derive a key using SHA-256
  return new Uint8Array(crypto.createHash("sha256").update(secret).digest());
}

/**
 * Encrypts a string using AES-256-GCM
 * @param text - The plaintext to encrypt
 * @returns Base64-encoded encrypted string containing IV + auth tag + ciphertext
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = new Uint8Array(crypto.randomBytes(IV_LENGTH));
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const part1 = cipher.update(text, "utf8");
  const part2 = cipher.final();
  const encrypted = new Uint8Array(part1.length + part2.length);
  encrypted.set(new Uint8Array(part1), 0);
  encrypted.set(new Uint8Array(part2), part1.length);

  const authTag = new Uint8Array(cipher.getAuthTag());

  // Combine IV + authTag + encrypted data
  const combined = new Uint8Array(
    iv.length + authTag.length + encrypted.length,
  );
  combined.set(iv, 0);
  combined.set(authTag, iv.length);
  combined.set(encrypted, iv.length + authTag.length);

  return Buffer.from(combined).toString("base64");
}

/**
 * Decrypts a string that was encrypted with the encrypt function
 * @param encryptedText - Base64-encoded encrypted string
 * @returns The original plaintext
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const data = new Uint8Array(Buffer.from(encryptedText, "base64"));

  // Extract IV, auth tag, and encrypted content
  const iv = data.slice(0, IV_LENGTH);
  const authTag = data.slice(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encrypted = data.slice(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const part1 = decipher.update(encrypted);
  const part2 = decipher.final();
  const decrypted = new Uint8Array(part1.length + part2.length);
  decrypted.set(new Uint8Array(part1), 0);
  decrypted.set(new Uint8Array(part2), part1.length);

  return Buffer.from(decrypted).toString("utf8");
}

/**
 * Generates a random 32-byte hex string suitable for ENCRYPTION_SECRET
 * @returns A 64-character hex string
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex");
}
