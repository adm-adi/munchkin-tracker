import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useRef, useState } from 'react';

// Sound types
export type SoundType =
    | 'levelUp'
    | 'combatWin'
    | 'combatLose'
    | 'diceRoll'
    | 'timerTick'
    | 'timerEnd'
    | 'victory'
    | 'defeat'
    | 'buttonPress';

// Sound effects using system sounds or generated tones
// In production, these would be actual audio files
const SOUND_FREQUENCIES: Record<SoundType, { frequency: number; duration: number }> = {
    levelUp: { frequency: 880, duration: 200 },
    combatWin: { frequency: 1047, duration: 300 },
    combatLose: { frequency: 220, duration: 400 },
    diceRoll: { frequency: 440, duration: 100 },
    timerTick: { frequency: 660, duration: 50 },
    timerEnd: { frequency: 880, duration: 500 },
    victory: { frequency: 1320, duration: 500 },
    defeat: { frequency: 165, duration: 600 },
    buttonPress: { frequency: 550, duration: 50 },
};

interface SoundsState {
    enabled: boolean;
    volume: number; // 0-1
}

export function useSounds() {
    const [state, setState] = useState<SoundsState>({
        enabled: true,
        volume: 0.7,
    });
    const soundsLoaded = useRef(false);

    // Load settings from storage
    useEffect(() => {
        AsyncStorage.getItem('munchkin-sounds').then((data) => {
            if (data) {
                try {
                    setState(JSON.parse(data));
                } catch (e) {
                    console.error('Failed to parse sound settings:', e);
                }
            }
        });
    }, []);

    // Save settings to storage
    const saveSettings = useCallback(async (newState: SoundsState) => {
        setState(newState);
        await AsyncStorage.setItem('munchkin-sounds', JSON.stringify(newState));
    }, []);

    const setEnabled = useCallback((enabled: boolean) => {
        saveSettings({ ...state, enabled });
    }, [state, saveSettings]);

    const setVolume = useCallback((volume: number) => {
        saveSettings({ ...state, volume: Math.max(0, Math.min(1, volume)) });
    }, [state, saveSettings]);

    // Play a sound
    const playSound = useCallback(async (type: SoundType) => {
        if (!state.enabled) return;

        try {
            // For now, we use Vibration as a fallback since we don't have audio files
            // In production, this would load and play actual audio files
            const { Vibration } = await import('react-native');

            const patterns: Record<SoundType, number[]> = {
                levelUp: [0, 50, 50, 100],
                combatWin: [0, 100, 50, 100, 50, 100],
                combatLose: [0, 200, 100, 200],
                diceRoll: [0, 30, 30, 30, 30, 30],
                timerTick: [0, 20],
                timerEnd: [0, 100, 50, 100, 50, 100, 50, 200],
                victory: [0, 100, 50, 100, 50, 100, 50, 100, 50, 200],
                defeat: [0, 300, 100, 300],
                buttonPress: [0, 10],
            };

            Vibration.vibrate(patterns[type]);
        } catch (error) {
            console.error('Failed to play sound:', error);
        }
    }, [state.enabled]);

    // Play victory fanfare
    const playVictory = useCallback(() => playSound('victory'), [playSound]);
    const playDefeat = useCallback(() => playSound('defeat'), [playSound]);
    const playLevelUp = useCallback(() => playSound('levelUp'), [playSound]);
    const playCombatWin = useCallback(() => playSound('combatWin'), [playSound]);
    const playCombatLose = useCallback(() => playSound('combatLose'), [playSound]);
    const playDiceRoll = useCallback(() => playSound('diceRoll'), [playSound]);

    return {
        enabled: state.enabled,
        volume: state.volume,
        setEnabled,
        setVolume,
        playSound,
        playVictory,
        playDefeat,
        playLevelUp,
        playCombatWin,
        playCombatLose,
        playDiceRoll,
    };
}
