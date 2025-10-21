import crypto from 'crypto';

export function hashBufferSHA256(buf: Buffer): string {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export function bytesFromMB(n: number): number {
  return Math.floor(n * 1024 * 1024);
}

