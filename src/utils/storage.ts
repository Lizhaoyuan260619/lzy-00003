import type { VaultMeta, EncryptedData } from '../types';

// localStorage 键名常量
export const META_KEY = 'pm_vault_meta';
export const DATA_KEY = 'pm_vault_data';

// 读取保险库元数据，不存在则返回 null
export function getMeta(): VaultMeta | null {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VaultMeta;
  } catch (e) {
    console.error('读取元数据失败:', e);
    return null;
  }
}

// 写入保险库元数据
export function setMeta(meta: VaultMeta): void {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta));
  } catch (e) {
    console.error('写入元数据失败:', e);
    throw e;
  }
}

// 读取加密数据，不存在则返回 null
export function getData(): EncryptedData | null {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as EncryptedData;
  } catch (e) {
    console.error('读取加密数据失败:', e);
    return null;
  }
}

// 写入加密数据
export function setData(data: EncryptedData): void {
  try {
    localStorage.setItem(DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('写入加密数据失败:', e);
    throw e;
  }
}

// 清除全部保险库数据（meta + data）
export function clearAll(): void {
  try {
    localStorage.removeItem(META_KEY);
    localStorage.removeItem(DATA_KEY);
  } catch (e) {
    console.error('清除数据失败:', e);
    throw e;
  }
}

// 判断保险库是否已初始化（meta 是否存在）
export function isVaultInitialized(): boolean {
  return getMeta() !== null;
}
