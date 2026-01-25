/**
 * PAT 加密/解密工具
 * 使用 CryptoJS (AES) - 兼容 HTTP 环境
 */

import CryptoJS from 'crypto-js';

// 加密 PAT（用于生成硬编码数据）
export function encryptPAT(pat: string, password: string): string {
  return CryptoJS.AES.encrypt(pat, password).toString();
}

// 解密 PAT
export function decryptPAT(encryptedData: string, password: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error('Decryption failed');
    }
    return decrypted;
  } catch {
    throw new Error('Decryption failed - incorrect password');
  }
}

// ========================================
// 加密后的 PAT 数据（硬编码）
// 使用控制台运行 encryptPAT(yourPAT, yourPassword) 生成
// ========================================
export const ENCRYPTED_PAT = 'U2FsdGVkX19ZEO7cjO7TVKeb3z/d7N8MOz1WbmQB54zJtimTRoObB+6LESR+rnl+sCE5V78JgN5PKZLKQRKab2Sr6rza5GA0Eua68OPzFNZiPEUL66W1yFHKzdkAiZPFNwjiB1/clZM2A1VCqRTtdQ==';
