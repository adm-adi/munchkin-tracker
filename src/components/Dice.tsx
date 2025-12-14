import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import React, { useCallback, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';

interface DiceProps {
    onRoll?: (value: number) => void;
    size?: number;
    disabled?: boolean;
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export function Dice({ onRoll, size = 80, disabled = false }: DiceProps) {
    const [value, setValue] = useState<number>(1);
    const [isRolling, setIsRolling] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const rollDice = useCallback(() => {
        if (isRolling || disabled) return;

        setIsRolling(true);
        Vibration.vibrate(50);

        // Reset animations
        rotateAnim.setValue(0);
        scaleAnim.setValue(1);

        // Animate the dice rolling
        const rollingNumbers: number[] = [];
        for (let i = 0; i < 10; i++) {
            rollingNumbers.push(Math.floor(Math.random() * 6) + 1);
        }

        // Show random numbers quickly
        let index = 0;
        const interval = setInterval(() => {
            setValue(rollingNumbers[index]);
            index++;
            if (index >= rollingNumbers.length) {
                clearInterval(interval);
            }
        }, 50);

        // Spin animation
        Animated.parallel([
            Animated.timing(rotateAnim, {
                toValue: 4, // 4 full rotations
                duration: 600,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.3,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.bounce,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(() => {
            // Final result
            const finalValue = Math.floor(Math.random() * 6) + 1;
            setValue(finalValue);
            setIsRolling(false);
            Vibration.vibrate([0, 50, 50, 100]);
            onRoll?.(finalValue);
        });
    }, [isRolling, disabled, rotateAnim, scaleAnim, onRoll]);

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 4],
        outputRange: ['0deg', '1440deg'],
    });

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={rollDice}
                disabled={disabled || isRolling}
                activeOpacity={0.8}
            >
                <Animated.View
                    style={[
                        styles.dice,
                        {
                            width: size,
                            height: size,
                            transform: [
                                { rotate: rotation },
                                { scale: scaleAnim },
                            ],
                        },
                        isRolling && styles.diceRolling,
                    ]}
                >
                    <Text style={[styles.diceFace, { fontSize: size * 0.7 }]}>
                        {DICE_FACES[value - 1]}
                    </Text>
                </Animated.View>
            </TouchableOpacity>
            <Text style={styles.hint}>
                {isRolling ? '🎲 Tirando...' : 'Toca para tirar'}
            </Text>
        </View>
    );
}

// Full screen dice modal component
interface DiceModalProps {
    visible: boolean;
    onClose: () => void;
    onRoll: (value: number) => void;
    playerName?: string;
    reason?: string;
}

export function DiceResult({
    value,
    size = 60,
}: {
    value: number;
    size?: number;
}) {
    return (
        <View style={[styles.resultDice, { width: size, height: size }]}>
            <Text style={[styles.diceFace, { fontSize: size * 0.7 }]}>
                {DICE_FACES[value - 1]}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: Spacing.sm,
    },
    dice: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: MunchkinColors.primary,
        shadowColor: MunchkinColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    diceRolling: {
        borderColor: MunchkinColors.accent,
        shadowColor: MunchkinColors.accent,
    },
    diceFace: {
        color: MunchkinColors.textPrimary,
    },
    hint: {
        color: MunchkinColors.textMuted,
        fontSize: 12,
    },
    resultDice: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: MunchkinColors.border,
    },
});
