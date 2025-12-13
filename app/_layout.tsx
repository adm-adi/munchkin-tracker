import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { MunchkinColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Custom dark theme for Munchkin
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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={MunchkinDarkTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="lobby" options={{ headerShown: false }} />
        <Stack.Screen name="join" options={{ headerShown: false }} />
        <Stack.Screen name="combat" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="select-race" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="select-class" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="scan-card" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
