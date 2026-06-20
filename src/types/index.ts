// 分类类型
export interface Category {
  id: string;
  name: string;
  color: string;
}

// 密码条目类型
export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  categoryId: string;
  notes: string;
  favorite: boolean;
  createdAt: number;
  updatedAt: number;
}

// 保险库数据
export interface VaultData {
  categories: Category[];
  entries: PasswordEntry[];
}

// 密码生成器选项
export interface GeneratorOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

// 密码强度等级
export type PasswordStrength = 'weak' | 'medium' | 'strong';

// 提示消息类型
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

// 加密元数据：保存盐、迭代次数、认证hash等
export interface EncryptionMeta {
  version: number;
  salt: string;
  iterations: number;
  authHash: string;
  createdAt: number;
}

// 加密后的数据结构
export interface EncryptedData {
  iv: string;
  ciphertext: string;
}

// 完整的保险库元数据（localStorage中存储的meta）
export type VaultMeta = EncryptionMeta;
