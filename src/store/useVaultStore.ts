import { create } from 'zustand';
import {
  deriveKey,
  deriveAuthHash,
  encryptData,
  decryptData,
  generateRandomBytes,
  bytesToBase64,
  base64ToBytes,
  uuid,
} from '../utils/crypto';
import {
  getMeta,
  setMeta,
  getData,
  setData,
  clearAll,
  isVaultInitialized,
  META_KEY,
  DATA_KEY,
} from '../utils/storage';
import type {
  Category,
  PasswordEntry,
  VaultData,
  EncryptionMeta,
  EncryptedData,
  ToastMessage,
  ToastType,
  VaultMeta,
} from '../types';

const DEFAULT_CATEGORIES: Category[] = [
  { id: uuid(), name: '社交', color: '#3B82F6' },
  { id: uuid(), name: '金融', color: '#EF4444' },
  { id: uuid(), name: '工作', color: '#F59E0B' },
  { id: uuid(), name: '购物', color: '#8B5CF6' },
  { id: uuid(), name: '其他', color: '#64748B' },
];

const RANDOM_COLORS = [
  '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6',
  '#10B981', '#EC4899', '#06B6D4', '#F97316',
  '#6366F1', '#14B8A6', '#84CC16', '#D946EF',
  '#64748B', '#0EA5E9', '#22C55E', '#F43F5E',
];

function randomColor(): string {
  return RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
}

type DebouncedPersist = () => void;

function createDebouncedPersist(
  getState: () => VaultStore,
  delay: number
): DebouncedPersist {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return () => {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(async () => {
      const state = getState();
      if (!state.isUnlocked || !state.key) return;

      try {
        const vaultData: VaultData = {
          entries: state.entries,
          categories: state.categories,
        };
        const plaintext = JSON.stringify(vaultData);
        const encrypted = await encryptData(state.key, plaintext);
        setData(encrypted);
      } catch (e) {
        console.error('持久化加密数据失败:', e);
      }
    }, delay);
  };
}

interface VaultStore {
  isUnlocked: boolean;
  isInitialized: boolean;
  key: CryptoKey | null;
  masterPasswordHash: string | null;
  entries: PasswordEntry[];
  categories: Category[];
  toasts: ToastMessage[];

  unlock: (password: string) => Promise<boolean>;
  lock: () => void;
  initializeVault: (password: string) => Promise<boolean>;
  changeMasterPassword: (oldPwd: string, newPwd: string) => Promise<boolean>;

  persistDebounced: DebouncedPersist;

  addEntry: (entry: Omit<PasswordEntry, 'id' | 'createdAt' | 'updatedAt' | 'favorite'>) => void;
  updateEntry: (id: string, entry: Partial<PasswordEntry>) => void;
  deleteEntry: (id: string) => void;
  toggleFavorite: (id: string) => void;

  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  addToast: (type: ToastType, message: string, duration?: number) => string;
  removeToast: (id: string) => void;
  showToast: (type: ToastType, message: string, duration?: number) => string;

  exportPlainJSON: () => string;
  importPlainJSON: (json: string) => boolean;
}

const initialMeta = getMeta();

export const useVaultStore = create<VaultStore>((set, get) => {
  const persistDebounced = createDebouncedPersist(get, 100);

  return {
    isUnlocked: false,
    isInitialized: isVaultInitialized(),
    key: null,
    masterPasswordHash: initialMeta?.authHash ?? null,
    entries: [],
    categories: [],
    toasts: [],

    unlock: async (password: string): Promise<boolean> => {
      try {
        if (!isVaultInitialized()) {
          return false;
        }

        const meta = getMeta();
        if (!meta) {
          return false;
        }

        const salt = base64ToBytes(meta.salt);
        const authHash = await deriveAuthHash(password, salt, meta.iterations);

        if (authHash !== meta.authHash) {
          return false;
        }

        const key = await deriveKey(password, salt, meta.iterations);

        const encryptedData = getData();
        if (!encryptedData) {
          set({
            isUnlocked: true,
            key,
            masterPasswordHash: authHash,
            entries: [],
            categories: DEFAULT_CATEGORIES.map(c => ({ ...c })),
          });
          return true;
        }

        const plaintext = await decryptData(
          key,
          encryptedData.iv,
          encryptedData.ciphertext
        );
        const vaultData: VaultData = JSON.parse(plaintext);

        set({
          isUnlocked: true,
          key,
          masterPasswordHash: authHash,
          entries: vaultData.entries ?? [],
          categories: vaultData.categories ?? [],
        });

        return true;
      } catch (e) {
        console.error('解锁失败:', e);
        return false;
      }
    },

    lock: (): void => {
      set({
        isUnlocked: false,
        key: null,
        entries: [],
        categories: [],
      });
    },

    initializeVault: async (password: string): Promise<boolean> => {
      try {
        const saltBytes = generateRandomBytes(16);
        const iterations = 100000;
        const salt = bytesToBase64(saltBytes);

        const authHash = await deriveAuthHash(password, saltBytes, iterations);
        const key = await deriveKey(password, saltBytes, iterations);

        const meta: VaultMeta = {
          version: 1,
          salt,
          iterations,
          authHash,
          createdAt: Date.now(),
        };
        setMeta(meta);

        const initialVaultData: VaultData = {
          categories: DEFAULT_CATEGORIES.map(c => ({ ...c })),
          entries: [],
        };
        const plaintext = JSON.stringify(initialVaultData);
        const encrypted = await encryptData(key, plaintext);
        setData(encrypted);

        set({
          isUnlocked: true,
          isInitialized: true,
          key,
          masterPasswordHash: authHash,
          entries: [],
          categories: initialVaultData.categories,
        });

        return true;
      } catch (e) {
        console.error('初始化保险库失败:', e);
        return false;
      }
    },

    changeMasterPassword: async (oldPwd: string, newPwd: string): Promise<boolean> => {
      try {
        const meta = getMeta();
        if (!meta) {
          return false;
        }

        const oldSalt = base64ToBytes(meta.salt);
        const oldAuthHash = await deriveAuthHash(oldPwd, oldSalt, meta.iterations);

        if (oldAuthHash !== meta.authHash) {
          return false;
        }

        const { entries, categories } = get();

        const newSaltBytes = generateRandomBytes(16);
        const newIterations = 100000;
        const newSalt = bytesToBase64(newSaltBytes);

        const newAuthHash = await deriveAuthHash(newPwd, newSaltBytes, newIterations);
        const newKey = await deriveKey(newPwd, newSaltBytes, newIterations);

        const newMeta: VaultMeta = {
          version: meta.version,
          salt: newSalt,
          iterations: newIterations,
          authHash: newAuthHash,
          createdAt: meta.createdAt,
        };
        setMeta(newMeta);

        const vaultData: VaultData = { entries, categories };
        const plaintext = JSON.stringify(vaultData);
        const encrypted = await encryptData(newKey, plaintext);
        setData(encrypted);

        set({
          key: newKey,
          masterPasswordHash: newAuthHash,
        });

        return true;
      } catch (e) {
        console.error('修改主密码失败:', e);
        return false;
      }
    },

    persistDebounced,

    addEntry: (entry) => {
      const state = get();
      const now = Date.now();
      const newEntry: PasswordEntry = {
        ...entry,
        id: uuid(),
        favorite: false,
        createdAt: now,
        updatedAt: now,
      };
      set({ entries: [...state.entries, newEntry] });
      get().persistDebounced();
    },

    updateEntry: (id, entry) => {
      const state = get();
      const entries = state.entries.map((e) =>
        e.id === id ? { ...e, ...entry, updatedAt: Date.now() } : e
      );
      set({ entries });
      get().persistDebounced();
    },

    deleteEntry: (id) => {
      const state = get();
      const entries = state.entries.filter((e) => e.id !== id);
      set({ entries });
      get().persistDebounced();
    },

    toggleFavorite: (id) => {
      const state = get();
      const entries = state.entries.map((e) =>
        e.id === id ? { ...e, favorite: !e.favorite, updatedAt: Date.now() } : e
      );
      set({ entries });
      get().persistDebounced();
    },

    addCategory: (category) => {
      const state = get();
      const newCategory: Category = {
        ...category,
        id: uuid(),
        color: category.color || randomColor(),
      };
      set({ categories: [...state.categories, newCategory] });
      get().persistDebounced();
    },

    updateCategory: (id, category) => {
      const state = get();
      const categories = state.categories.map((c) =>
        c.id === id ? { ...c, ...category } : c
      );
      set({ categories });
      get().persistDebounced();
    },

    deleteCategory: (id) => {
      const state = get();
      const categories = state.categories.filter((c) => c.id !== id);
      const entries = state.entries.map((e) =>
        e.categoryId === id ? { ...e, categoryId: '' } : e
      );
      set({ categories, entries });
      get().persistDebounced();
    },

    addToast: (type, message, duration = 2500) => {
      const id = uuid();
      const toast: ToastMessage = { id, type, message };
      set({ toasts: [...get().toasts, toast] });
      if (duration > 0) {
        setTimeout(() => {
          get().removeToast(id);
        }, duration);
      }
      return id;
    },

    removeToast: (id) => {
      set({ toasts: get().toasts.filter((t) => t.id !== id) });
    },

    showToast: (type, message, duration = 2500) => {
      return get().addToast(type, message, duration);
    },

    exportPlainJSON: (): string => {
      const state = get();
      if (!state.isUnlocked) {
        throw new Error('保险库未解锁');
      }
      const data: VaultData = {
        entries: state.entries,
        categories: state.categories,
      };
      return JSON.stringify(data, null, 2);
    },

    importPlainJSON: (json: string): boolean => {
      const state = get();
      if (!state.isUnlocked) {
        return false;
      }
      try {
        const data = JSON.parse(json) as VaultData;
        if (!Array.isArray(data.entries) || !Array.isArray(data.categories)) {
          return false;
        }
        set({
          entries: data.entries,
          categories: data.categories,
        });
        get().persistDebounced();
        return true;
      } catch (e) {
        console.error('导入JSON失败:', e);
        return false;
      }
    },
  };
});
