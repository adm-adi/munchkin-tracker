/**
 * Haptic feedback hook for tactile responses
 */

import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';

export type HapticType =
    | 'light'
    | 'medium'
    | 'heavy'
    | 'success'
    | 'warning'
    | 'error'
    | 'selection';

export function useHaptics() {
    // In the future, we might add a setting to disable haptics
    const enabled = true;

    const trigger = useCallback(async (type: HapticType) => {
        if (!enabled) return;

        try {
            switch (type) {
                case 'light':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
                case 'medium':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case 'heavy':
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
                case 'success':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    break;
                case 'warning':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    break;
                case 'error':
                    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                    break;
                case 'selection':
                    await Haptics.selectionAsync();
                    break;
            }
        } catch (e) {
            // Haptics not available (web, simulator)
        }
    }, [enabled]);

    // Preset haptic patterns for common actions
    const onButtonPress = useCallback(() => trigger('light'), [trigger]);
    const onDiceRoll = useCallback(() => trigger('medium'), [trigger]);
    const onLevelUp = useCallback(() => trigger('success'), [trigger]);
    const onLevelDown = useCallback(() => trigger('warning'), [trigger]);
    const onCombatWin = useCallback(() => trigger('success'), [trigger]);
    const onCombatLose = useCallback(() => trigger('error'), [trigger]);
    const onTurnChange = useCallback(() => trigger('selection'), [trigger]);

    return {
        trigger,
        onButtonPress,
        onDiceRoll,
        onLevelUp,
        onLevelDown,
        onCombatWin,
        onCombatLose,
        onTurnChange,
    };
}
