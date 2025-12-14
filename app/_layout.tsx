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
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          animationDuration: 250,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="lobby" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="join" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen
          name="combat"
          options={{
            headerShown: false,
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="settings" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen
          name="select-race"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="select-class"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="scan-card"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen name="stats" options={{ headerShown: false, animation: 'fade_from_bottom' }} />
        <Stack.Screen name="history" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal', animation: 'fade' }} />
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


