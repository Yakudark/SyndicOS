import { create } from 'zustand';
import { Themes } from '../theme/colors';

type ThemeVariant = keyof typeof Themes;

interface SettingsState {
    displayName: string;
    monthlyQuotaMinutes: number;
    themeVariant: ThemeVariant;
    setDisplayName: (name: string) => void;
    setMonthlyQuota: (quota: number) => void;
    setThemeVariant: (variant: ThemeVariant) => void;
    loadSettings: (settings: { displayName: string, monthlyQuotaMinutes: number, themeVariant: ThemeVariant }) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    displayName: 'Agent',
    monthlyQuotaMinutes: 2100,
    themeVariant: 'cyan',
    setDisplayName: (displayName) => set({ displayName }),
    setMonthlyQuota: (monthlyQuotaMinutes) => set({ monthlyQuotaMinutes }),
    setThemeVariant: (themeVariant) => set({ themeVariant }),
    loadSettings: (settings) => set({ ...settings }),
}));
