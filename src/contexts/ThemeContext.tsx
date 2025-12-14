import { MunchkinColors, MunchkinColorsLight, ThemeColors } from '@/constants/theme';
import React, { createContext, ReactNode, useContext } from 'react';
import { useThemeStore } from '../stores/themeStore';

interface ThemeContextType {
    colors: ThemeColors;
    isDarkMode: boolean;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const { isDarkMode, toggleTheme } = useThemeStore();

    const colors = isDarkMode ? MunchkinColors : MunchkinColorsLight;

    return (
        <ThemeContext.Provider value={{ colors, isDarkMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        // Fallback to dark mode if used outside provider
        return {
            colors: MunchkinColors,
            isDarkMode: true,
            toggleTheme: () => { },
        };
    }
    return context;
}

// Hook that returns just the colors for simpler usage
export function useThemeColors(): ThemeColors {
    return useTheme().colors;
}
