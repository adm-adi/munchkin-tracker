import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View
} from 'react-native';
import { Dice } from './Dice';

interface DeathOverlayProps {
    visible: boolean;
    onDismiss: () => void;
    playerName: string;
}

export function DeathOverlay({ visible, onDismiss, playerName }: DeathOverlayProps) {
    const scaleAnim = useRef(new Animated.Value(0)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Vibration.vibrate([0, 200, 100, 200, 100, 400]);

            // Reset animations
            scaleAnim.setValue(0);
            rotateAnim.setValue(0);
            fadeAnim.setValue(0);

            // Dramatic entrance
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 3,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.timing(rotateAnim, {
                        toValue: 0.1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: -0.1,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        }
    }, [visible, scaleAnim, rotateAnim, fadeAnim]);

    const rotation = rotateAnim.interpolate({
        inputRange: [-0.1, 0, 0.1],
        outputRange: ['-10deg', '0deg', '10deg'],
    });

    return (
        <Modal visible={visible} transparent animationType="none">
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            transform: [
                                { scale: scaleAnim },
                                { rotate: rotation },
                            ],
                        },
                    ]}
                >
                    <Text style={styles.skull}>💀</Text>
                    <Text style={styles.title}>¡HAS MUERTO!</Text>
                    <Text style={styles.subtitle}>{playerName}</Text>
                    <Text style={styles.message}>
                        Pierdes todo tu equipo.{'\n'}
                        Renacerás en tu próximo turno.
                    </Text>
                    <TouchableOpacity style={styles.button} onPress={onDismiss}>
                        <Text style={styles.buttonText}>Aceptar destino</Text>
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
        </Modal>
    );
}

interface FleeRollUIProps {
    visible: boolean;
    onFleeSuccess: () => void;
    onFleeFail: () => void;
    onClose: () => void;
    monsterBadStuff?: string;
    isBadStuffDeath?: boolean;
}

export function FleeRollUI({
    visible,
    onFleeSuccess,
    onFleeFail,
    onClose,
    monsterBadStuff,
    isBadStuffDeath = false,
}: FleeRollUIProps) {
    const [diceResult, setDiceResult] = useState<number | null>(null);
    const [isRolling, setIsRolling] = useState(false);

    const handleDiceRoll = (value: number) => {
        setDiceResult(value);
        setIsRolling(false);
    };

    const handleFleeSuccess = () => {
        setDiceResult(null);
        onFleeSuccess();
        onClose();
    };

    const handleFleeFail = () => {
        setDiceResult(null);
        onFleeFail();
        onClose();
    };

    const handleStartRoll = () => {
        setIsRolling(true);
        setDiceResult(null);
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.fleeOverlay}>
                <View style={styles.fleeContent}>
                    <Text style={styles.fleeTitle}>🏃 ¡Intentar Huir!</Text>

                    {monsterBadStuff && (
                        <View style={styles.badStuffBox}>
                            <Text style={styles.badStuffLabel}>Mal Rollo:</Text>
                            <Text style={styles.badStuffText}>{monsterBadStuff}</Text>
                            {isBadStuffDeath && (
                                <Text style={styles.deathWarning}>⚠️ ¡MUERTE!</Text>
                            )}
                        </View>
                    )}

                    <View style={styles.diceArea}>
                        <Dice onRoll={handleDiceRoll} size={100} />
                    </View>

                    {diceResult !== null && (
                        <View style={styles.resultArea}>
                            <Text style={styles.resultText}>
                                Resultado: {diceResult}
                            </Text>
                            <Text style={styles.resultHint}>
                                (Necesitas 5 o más para huir, o menos con bonus)
                            </Text>

                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={[styles.resultButton, styles.successButton]}
                                    onPress={handleFleeSuccess}
                                >
                                    <Text style={styles.resultButtonText}>✓ Huida</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.resultButton, styles.failButton]}
                                    onPress={handleFleeFail}
                                >
                                    <Text style={styles.resultButtonText}>✗ Fallo</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                        <Text style={styles.cancelText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

interface RespawnAnimationProps {
    visible: boolean;
    playerName: string;
    onComplete: () => void;
}

export function RespawnAnimation({ visible, playerName, onComplete }: RespawnAnimationProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        if (visible) {
            Vibration.vibrate([0, 100, 50, 100]);

            Animated.sequence([
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                    Animated.spring(scaleAnim, {
                        toValue: 1.2,
                        tension: 50,
                        friction: 5,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.delay(1500),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                onComplete();
            });
        }
    }, [visible, fadeAnim, scaleAnim, onComplete]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.respawnOverlay,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <Text style={styles.respawnEmoji}>✨</Text>
            <Text style={styles.respawnText}>¡{playerName} ha renacido!</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    // Death Overlay
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        borderWidth: 3,
        borderColor: MunchkinColors.danger,
        maxWidth: '85%',
    },
    skull: {
        fontSize: 80,
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: MunchkinColors.danger,
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: 18,
        color: MunchkinColors.textSecondary,
        marginBottom: Spacing.lg,
    },
    message: {
        fontSize: 14,
        color: MunchkinColors.textMuted,
        textAlign: 'center',
        marginBottom: Spacing.xl,
        lineHeight: 22,
    },
    button: {
        backgroundColor: MunchkinColors.danger,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: Radius.lg,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },

    // Flee Roll UI
    fleeOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fleeContent: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        alignItems: 'center',
        width: '90%',
        maxWidth: 350,
    },
    fleeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.warning,
        marginBottom: Spacing.lg,
    },
    badStuffBox: {
        backgroundColor: MunchkinColors.danger + '20',
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginBottom: Spacing.lg,
        width: '100%',
        borderWidth: 1,
        borderColor: MunchkinColors.danger,
    },
    badStuffLabel: {
        fontSize: 12,
        color: MunchkinColors.danger,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    badStuffText: {
        fontSize: 14,
        color: MunchkinColors.textPrimary,
    },
    deathWarning: {
        fontSize: 16,
        color: MunchkinColors.danger,
        fontWeight: 'bold',
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    diceArea: {
        marginVertical: Spacing.lg,
    },
    resultArea: {
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    resultText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
        marginBottom: Spacing.sm,
    },
    resultHint: {
        fontSize: 12,
        color: MunchkinColors.textMuted,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    resultButton: {
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: Radius.lg,
        minWidth: 120,
        alignItems: 'center',
    },
    successButton: {
        backgroundColor: MunchkinColors.success,
    },
    failButton: {
        backgroundColor: MunchkinColors.danger,
    },
    resultButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButton: {
        marginTop: Spacing.lg,
        padding: Spacing.md,
    },
    cancelText: {
        color: MunchkinColors.textMuted,
        fontSize: 14,
    },

    // Respawn Animation
    respawnOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 215, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    respawnEmoji: {
        fontSize: 60,
        marginBottom: Spacing.md,
    },
    respawnText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: MunchkinColors.warning,
        textAlign: 'center',
    },
});
