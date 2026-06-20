import type { EncryptedData } from '../types';

// 生成指定长度的随机字节数组
export function generateRandomBytes(len: number): Uint8Array {
  const array = new Uint8Array(len);
  crypto.getRandomValues(array);
  return array;
}

// Uint8Array 转 Base64 字符串
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Base64 字符串转 Uint8Array
export function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// 字符串转 Uint8Array（UTF-8编码）
function stringToBytes(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Uint8Array 转字符串（UTF-8解码）
function bytesToString(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

// 使用 PBKDF2-HMAC-SHA256 从密码派生 AES-GCM 密钥
export async function deriveKey(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> {
  // 将密码编码为字节数组
  const passwordBytes = stringToBytes(password);

  // 先导入原始密码作为 PBKDF2 的基础密钥
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  // 使用 PBKDF2 派生 AES-GCM 密钥
  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );

  return aesKey;
}

// 派生用于密码校验的认证 hash（Base64 编码）
export async function deriveAuthHash(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<string> {
  // 将密码编码为字节数组
  const passwordBytes = stringToBytes(password);

  // 导入密码作为 PBKDF2 密钥
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // 派生 256 位（32字节）用于认证
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );

  return bytesToBase64(new Uint8Array(bits));
}

// AES-GCM 加密，返回 Base64 编码的 iv 和密文
export async function encryptData(
  key: CryptoKey,
  plaintext: string
): Promise<EncryptedData> {
  // 生成 12 字节随机 IV（AES-GCM 推荐长度）
  const iv = generateRandomBytes(12);

  // 加密明文
  const encoded = stringToBytes(plaintext);
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encoded
  );

  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertextBuffer)),
  };
}

// AES-GCM 解密
export async function decryptData(
  key: CryptoKey,
  ivB64: string,
  ciphertextB64: string
): Promise<string> {
  const iv = base64ToBytes(ivB64);
  const ciphertext = base64ToBytes(ciphertextB64);

  const plaintextBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    ciphertext
  );

  return bytesToString(new Uint8Array(plaintextBuffer));
}

// 生成 UUID v4
export function uuid(): string {
  const bytes = generateRandomBytes(16);

  // 设置版本号为 4（第7字节高4位）
  bytes[6] = (bytes[6] & 0x0f) | 0x40;

  // 设置变异位为 RFC 4122（第9字节高2位为10）
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  // 转换为十六进制字符串并格式化为 UUID
  const hex: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    hex.push(bytes[i].toString(16).padStart(2, '0'));
  }

  return `${hex[0]}${hex[1]}${hex[2]}${hex[3]}-${hex[4]}${hex[5]}-${hex[6]}${hex[7]}-${hex[8]}${hex[9]}-${hex[10]}${hex[11]}${hex[12]}${hex[13]}${hex[14]}${hex[15]}`;
}
