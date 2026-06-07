/**
 * Secure TOTP (Time-based One-Time Password) generation and validation module.
 * Fully compliant with RFC 6238 and compatible with Google & Microsoft Authenticator.
 * Leverages native Web Cryptography API (SubtleCrypto) for high-performance security.
 */

/**
 * Decodes a Base32 string into a binary Uint8Array.
 */
export function decodeBase32(encoded: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const cleaned = encoded.replace(/=+$/, '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  const len = cleaned.length;
  const result = new Uint8Array(Math.floor((len * 5) / 8));
  let bits = 0;
  let value = 0;
  let index = 0;

  for (let i = 0; i < len; i++) {
    const val = alphabet.indexOf(cleaned[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      result[index++] = (value >>> (bits - 8)) & 0xff;
      bits -= 8;
    }
  }
  return result;
}

/**
 * Encodes a Uint8Array into a Base32 string.
 */
export function encodeBase32(bytes: Uint8Array): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let val = 0;
  let bits = 0;

  for (let i = 0; i < bytes.length; i++) {
    val = (val << 8) | bytes[i];
    bits += 8;
    while (bits >= 5) {
      result += alphabet[(val >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    result += alphabet[(val << (5 - bits)) & 31];
  }
  return result;
}

/**
 * Generates an 8-byte big-endian representation of a given counter number.
 */
function getCounterBytes(counter: number): Uint8Array {
  const buffer = new Uint8Array(8);
  let temp = counter;
  for (let i = 7; i >= 0; i--) {
    buffer[i] = temp & 0xff;
    temp = Math.floor(temp / 256);
  }
  return buffer;
}

/**
 * Generates a 6-digit TOTP code for a secret key at the current moment or a specific time.
 */
export async function generateTOTP(secret: string, offsetSteps: number = 0, timeStepSeconds: number = 30): Promise<string> {
  const counter = Math.floor(Date.now() / 1000 / timeStepSeconds) + offsetSteps;
  try {
    const keyBytes = decodeBase32(secret);
    const counterBytes = getCounterBytes(counter);

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyBytes,
      { name: 'HMAC', hash: { name: 'SHA-1' } },
      false,
      ['sign']
    );

    const hmacBuffer = await window.crypto.subtle.sign('HMAC', cryptoKey, counterBytes);
    const hmac = new Uint8Array(hmacBuffer);

    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const otp = (code % 1000000).toString();
    return otp.padStart(6, '0');
  } catch (err) {
    console.error('TOTP generation error:', err);
    return '000000';
  }
}

/**
 * Generates a mock standard Base 32 secret key of 16 characters.
 */
export function generateRandomSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Validates a user-provided TOTP pin code against a secret key.
 * Allows a clock drift window of +/- 1 timestep (30 seconds) for robust user UX.
 */
export async function verifyTOTP(providedCode: string, secret: string): Promise<boolean> {
  const codeCleaned = providedCode.replace(/\s/g, '');
  if (codeCleaned.length !== 6 || isNaN(Number(codeCleaned))) {
    return false;
  }

  // Check current, previous, and next timesteps to account for standard transmission delays & clock drift
  for (let offset = -1; offset <= 1; offset++) {
    const expected = await generateTOTP(secret, offset);
    if (codeCleaned === expected) {
      return true;
    }
  }
  return false;
}
