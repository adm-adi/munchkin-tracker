/**
 * Munchkin Tracker Theme Colors
 * Fantasy/dungeon themed color palette
 */

import { Platform } from 'react-native';

// Munchkin themed colors
export const MunchkinColors = {
  // Primary colors - Fantasy gold/brown theme
  primary: '#D4AF37',      // Gold
  primaryDark: '#B8860B',  // Dark Gold
  secondary: '#8B4513',    // Saddle Brown
  secondaryLight: '#A0522D', // Sienna

  // Background colors
  backgroundDark: '#1a1a2e',      // Dark purple
  backgroundMedium: '#16213e',    // Dark blue
  backgroundLight: '#0f3460',     // Medium blue
  backgroundCard: '#1f2937',      // Card background

  // Accent colors
  accent: '#e94560',        // Red accent
  success: '#00d26a',       // Green for victory
  danger: '#ff4757',        // Red for defeat
  warning: '#ffa502',       // Orange for warnings
  info: '#3742fa',          // Blue for info

  // Text colors
  textPrimary: '#f5f5f5',
  textSecondary: '#a0a0a0',
  textMuted: '#6b7280',

  // Combat colors
  playerStrength: '#00d26a',
  monsterStrength: '#e94560',
  helperStrength: '#3498db',

  // Level colors
  level1: '#4ade80',
  level5: '#fbbf24',
  level10: '#ef4444',

  // Race/Class colors
  raceElf: '#22c55e',
  raceDwarf: '#a16207',
  raceHalfling: '#84cc16',
  raceOrc: '#16a34a',
  raceGnome: '#7c3aed',
  classWarrior: '#dc2626',
  classWizard: '#2563eb',
  classCleric: '#f59e0b',
  classThief: '#6b7280',
  classBard: '#ec4899',
  classRanger: '#10b981',
};

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: MunchkinColors.primary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: MunchkinColors.primary,
  },
  dark: {
    text: MunchkinColors.textPrimary,
    background: MunchkinColors.backgroundDark,
    tint: MunchkinColors.primary,
    icon: MunchkinColors.textSecondary,
    tabIconDefault: MunchkinColors.textSecondary,
    tabIconSelected: MunchkinColors.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

// Spacing scale
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius scale
export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
