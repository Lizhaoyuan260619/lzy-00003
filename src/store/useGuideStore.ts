import { create } from 'zustand';

const GUIDE_KEY = 'pm_vault_guide_settings';

interface GuideSettings {
  showUnlockIntro: boolean;
  showVaultEmptyGuide: boolean;
  showSettingsBackupInfo: boolean;
}

interface GuideStore {
  settings: GuideSettings;
  setShowUnlockIntro: (show: boolean) => void;
  setShowVaultEmptyGuide: (show: boolean) => void;
  setShowSettingsBackupInfo: (show: boolean) => void;
  resetAll: () => void;
}

const DEFAULT_SETTINGS: GuideSettings = {
  showUnlockIntro: true,
  showVaultEmptyGuide: true,
  showSettingsBackupInfo: true,
};

function loadSettings(): GuideSettings {
  try {
    const raw = localStorage.getItem(GUIDE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: GuideSettings) {
  try {
    localStorage.setItem(GUIDE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export const useGuideStore = create<GuideStore>((set, get) => ({
  settings: loadSettings(),

  setShowUnlockIntro: (show: boolean) => {
    const next = { ...get().settings, showUnlockIntro: show };
    saveSettings(next);
    set({ settings: next });
  },

  setShowVaultEmptyGuide: (show: boolean) => {
    const next = { ...get().settings, showVaultEmptyGuide: show };
    saveSettings(next);
    set({ settings: next });
  },

  setShowSettingsBackupInfo: (show: boolean) => {
    const next = { ...get().settings, showSettingsBackupInfo: show };
    saveSettings(next);
    set({ settings: next });
  },

  resetAll: () => {
    saveSettings(DEFAULT_SETTINGS);
    set({ settings: { ...DEFAULT_SETTINGS } });
  },
}));
