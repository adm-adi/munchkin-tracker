import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface ThemeState {
    isDarkMode: boolean;
    toggleTheme: () => void;
    setDarkMode: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set, get) => ({
            isDarkMode: true, // Default to dark mode

            toggleTheme: () => {
                set({ isDarkMode: !get().isDarkMode });
            },

            setDarkMode: (isDark: boolean) => {
                set({ isDarkMode: isDark });
            },
        }),
        {
            name: 'munchkin-theme-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
