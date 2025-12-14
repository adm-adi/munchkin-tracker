import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { MunchkinColors, MunchkinColorsLight } from '@/constants/theme';
import { ErrorBoundary } from '@/src/components/ErrorBoundary';
import { ThemeProvider } from '@/src/contexts/ThemeContext';
import { useThemeStore } from '@/src/stores/themeStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Custom themes for Munchkin
const MunchkinDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: MunchkinColors.backgroundDark,
    card: MunchkinColors.backgroundMedium,
    primary: MunchkinColors.primary,
    text: MunchkinColors.textPrimary,
  },
};

const MunchkinLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: MunchkinColorsLight.backgroundDark,
    card: MunchkinColorsLight.backgroundCard,
    primary: MunchkinColorsLight.primary,
    text: MunchkinColorsLight.textPrimary,
  },
};

function RootLayoutNav() {
  const { isDarkMode } = useThemeStore();
  const navigationTheme = isDarkMode ? MunchkinDarkTheme : MunchkinLightTheme;

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lobby" options={{ headerShown: false }} />
        <Stack.Screen name="join" options={{ headerShown: false }} />
        <Stack.Screen name="combat" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="select-race" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="select-class" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="scan-card" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="stats" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <RootLayoutNav />
      </ThemeProvider>
    </ErrorBoundary>
  );
}


