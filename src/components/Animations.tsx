import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

interface GameEndOverlayProps {
    visible: boolean;
    isWinner: boolean;
    winnerName: string;
    onClose: () => void;
}

// Confetti particle
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
    const translateY = useRef(new Animated.Value(-50)).current;
    const translateX = useRef(new Animated.Value(Math.random() * width)).current;
    const rotate = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const duration = 3000 + Math.random() * 2000;
        const startX = Math.random() * width;
        translateX.setValue(startX);

        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: height + 50,
                        duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(translateX, {
                        toValue: startX + (Math.random() - 0.5) * 200,
                        duration,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotate, {
                        toValue: 10,
                        duration,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(translateY, {
                    toValue: -50,
                    duration: 0,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const rotation = rotate.interpolate({
        inputRange: [0, 10],
        outputRange: ['0deg', '3600deg'],
    });

    return (
        <Animated.View
            style={[
                styles.confetti,
                {
                    backgroundColor: color,
                    transform: [
                        { translateY },
                        { translateX },
                        { rotate: rotation },
                    ],
                    opacity,
                },
            ]}
        />
    );
}

// Victory overlay with confetti
export function VictoryOverlay({
    visible,
    winnerName,
    onClose,
}: {
    visible: boolean;
    winnerName: string;
    onClose: () => void;
}) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const crownBounce = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.sequence([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    tension: 50,
                    useNativeDriver: true,
                }),
            ]).start();

            // Crown bounce
            Animated.loop(
                Animated.sequence([
                    Animated.timing(crownBounce, {
                        toValue: -20,
                        duration: 500,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(crownBounce, {
                        toValue: 0,
                        duration: 500,
                        easing: Easing.in(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            scaleAnim.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    const confettiColors = [
        MunchkinColors.primary,
        MunchkinColors.accent,
        MunchkinColors.success,
        MunchkinColors.raceElf,
        MunchkinColors.classWizard,
        '#FF69B4',
        '#00CED1',
    ];

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                {/* Confetti */}
                {Array.from({ length: 50 }).map((_, i) => (
                    <ConfettiParticle
                        key={i}
                        delay={i * 100}
                        color={confettiColors[i % confettiColors.length]}
                    />
                ))}

                <Animated.View
                    style={[
                        styles.victoryCard,
                        { transform: [{ scale: scaleAnim }] },
                    ]}
                >
                    <Animated.Text
                        style={[
                            styles.crown,
                            { transform: [{ translateY: crownBounce }] },
                        ]}
                    >
                        👑
                    </Animated.Text>
                    <Text style={styles.victoryTitle}>¡VICTORIA!</Text>
                    <Text style={styles.winnerName}>{winnerName}</Text>
                    <Text style={styles.victorySubtitle}>
                        ¡Ha alcanzado el nivel 10!
                    </Text>

                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeButtonText}>🎉 Continuar</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </Modal>
    );
}

// Defeat overlay
export function DefeatOverlay({
    visible,
    winnerName,
    onClose,
}: {
    visible: boolean;
    winnerName: string;
    onClose: () => void;
}) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const skullScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(skullScale, {
                    toValue: 1,
                    friction: 5,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            skullScale.setValue(0);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <Animated.View style={[styles.overlay, styles.defeatOverlay, { opacity: fadeAnim }]}>
                <Animated.View
                    style={[
                        styles.defeatCard,
                        { transform: [{ scale: skullScale }] },
                    ]}
                >
                    <Text style={styles.defeatIcon}>💀</Text>
                    <Text style={styles.defeatTitle}>DERROTA</Text>
                    <Text style={styles.defeatSubtitle}>
                        {winnerName} ha ganado la partida
                    </Text>
                    <Text style={styles.defeatMessage}>
                        Mejor suerte la próxima vez...
                    </Text>

                    <TouchableOpacity style={styles.closeButtonDefeat} onPress={onClose}>
                        <Text style={styles.closeButtonText}>😢 Continuar</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

// Level up animation (small, inline)
export function LevelUpEffect({ onComplete }: { onComplete?: () => void }) {
    const scale = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scale, {
                toValue: 1.5,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.parallel([
                Animated.timing(scale, {
                    toValue: 2,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]),
        ]).start(onComplete);
    }, []);

    return (
        <Animated.View
            style={[
                styles.levelUpEffect,
                {
                    transform: [{ scale }],
                    opacity,
                },
            ]}
        >
            <Text style={styles.levelUpText}>⬆️ +1</Text>
        </Animated.View>
    );
}

// Combat result animation
export function CombatResultEffect({
    isVictory,
    onComplete,
}: {
    isVictory: boolean;
    onComplete?: () => void;
}) {
    const scale = useRef(new Animated.Value(0)).current;
    const rotate = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.spring(scale, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
                Animated.timing(rotate, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
            Animated.delay(1000),
            Animated.timing(scale, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(onComplete);
    }, []);

    const rotation = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['-10deg', '0deg'],
    });

    return (
        <Animated.View
            style={[
                styles.combatResultEffect,
                {
                    transform: [{ scale }, { rotate: rotation }],
                },
            ]}
        >
            <Text style={styles.combatResultEmoji}>
                {isVictory ? '🏆' : '💀'}
            </Text>
            <Text
                style={[
                    styles.combatResultText,
                    { color: isVictory ? MunchkinColors.success : MunchkinColors.danger },
                ]}
            >
                {isVictory ? '¡VICTORIA!' : 'DERROTA'}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    defeatOverlay: {
        backgroundColor: 'rgba(50, 0, 0, 0.9)',
    },
    confetti: {
        position: 'absolute',
        width: 10,
        height: 20,
        borderRadius: 2,
    },
    victoryCard: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.xl,
        padding: Spacing.xxl,
        alignItems: 'center',
        borderWidth: 4,
        borderColor: MunchkinColors.primary,
        shadowColor: MunchkinColors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        elevation: 20,
    },
    crown: {
        fontSize: 80,
        marginBottom: Spacing.md,
    },
    victoryTitle: {
        fontSize: 40,
        fontWeight: 'bold',
        color: MunchkinColors.primary,
        textShadowColor: 'rgba(212, 175, 55, 0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
    },
    winnerName: {
        fontSize: 28,
        fontWeight: '600',
        color: MunchkinColors.textPrimary,
        marginTop: Spacing.md,
    },
    victorySubtitle: {
        fontSize: 16,
        color: MunchkinColors.textSecondary,
        marginTop: Spacing.sm,
    },
    closeButton: {
        backgroundColor: MunchkinColors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.lg,
        marginTop: Spacing.xl,
    },
    closeButtonDefeat: {
        backgroundColor: MunchkinColors.danger,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.lg,
        marginTop: Spacing.xl,
    },
    closeButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    defeatCard: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.xl,
        padding: Spacing.xxl,
        alignItems: 'center',
        borderWidth: 4,
        borderColor: MunchkinColors.danger,
    },
    defeatIcon: {
        fontSize: 80,
        marginBottom: Spacing.md,
    },
    defeatTitle: {
        fontSize: 36,
        fontWeight: 'bold',
        color: MunchkinColors.danger,
    },
    defeatSubtitle: {
        fontSize: 20,
        color: MunchkinColors.textPrimary,
        marginTop: Spacing.md,
    },
    defeatMessage: {
        fontSize: 14,
        color: MunchkinColors.textMuted,
        marginTop: Spacing.sm,
        fontStyle: 'italic',
    },
    levelUpEffect: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelUpText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.success,
    },
    combatResultEffect: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: MunchkinColors.backgroundCard + 'E0',
        padding: Spacing.xl,
        borderRadius: Radius.xl,
    },
    combatResultEmoji: {
        fontSize: 60,
    },
    combatResultText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: Spacing.sm,
    },
});
