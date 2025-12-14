import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AnimatedCounterProps {
    value: number;
    label: string;
    icon?: string;
    color?: string;
    onIncrement?: () => void;
    onDecrement?: () => void;
    min?: number;
    max?: number;
}

export function AnimatedCounter({
    value,
    label,
    icon,
    color = MunchkinColors.primary,
    onIncrement,
    onDecrement,
    min = 0,
    max = 99,
}: AnimatedCounterProps) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const bgColorAnim = useRef(new Animated.Value(0)).current;

    // Animate on value change
    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1.2,
                    friction: 3,
                    tension: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(bgColorAnim, {
                    toValue: 1,
                    duration: 100,
                    useNativeDriver: false,
                }),
            ]),
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.timing(bgColorAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: false,
                }),
            ]),
        ]).start();
    }, [value]);

    const animatedBgColor = bgColorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [MunchkinColors.backgroundCard, color + '40'],
    });

    const handleIncrement = () => {
        if (value < max && onIncrement) {
            onIncrement();
        }
    };

    const handleDecrement = () => {
        if (value > min && onDecrement) {
            onDecrement();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{icon} {label}</Text>
            <View style={styles.counterRow}>
                <TouchableOpacity
                    style={[styles.button, value <= min && styles.buttonDisabled]}
                    onPress={handleDecrement}
                    disabled={value <= min}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.buttonText, value <= min && styles.buttonTextDisabled]}>−</Text>
                </TouchableOpacity>

                <Animated.View
                    style={[
                        styles.valueContainer,
                        {
                            transform: [{ scale: scaleAnim }],
                            backgroundColor: animatedBgColor,
                            borderColor: color,
                        },
                    ]}
                >
                    <Text style={[styles.valueText, { color }]}>{value}</Text>
                </Animated.View>

                <TouchableOpacity
                    style={[styles.button, styles.buttonIncrement, value >= max && styles.buttonDisabled]}
                    onPress={handleIncrement}
                    disabled={value >= max}
                    activeOpacity={0.7}
                >
                    <Text style={[styles.buttonText, styles.buttonTextIncrement, value >= max && styles.buttonTextDisabled]}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: Spacing.xs,
    },
    label: {
        color: MunchkinColors.textSecondary,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    counterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    button: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        backgroundColor: MunchkinColors.backgroundMedium,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonIncrement: {
        backgroundColor: MunchkinColors.primary + '30',
    },
    buttonDisabled: {
        opacity: 0.3,
    },
    buttonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.textSecondary,
    },
    buttonTextIncrement: {
        color: MunchkinColors.primary,
    },
    buttonTextDisabled: {
        color: MunchkinColors.textMuted,
    },
    valueContainer: {
        minWidth: 56,
        height: 56,
        borderRadius: Radius.lg,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    valueText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
});
