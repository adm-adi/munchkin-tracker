import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    Text,
    Vibration,
    View
} from 'react-native';

interface TurnTimerProps {
    duration: number; // Total duration in seconds
    startedAt: number | null; // Timestamp when turn started
    isActive: boolean;
    onTimeUp?: () => void;
}

export function TurnTimer({
    duration,
    startedAt,
    isActive,
    onTimeUp,
}: TurnTimerProps) {
    const [remaining, setRemaining] = useState(duration);
    const [hasAlerted, setHasAlerted] = useState(false);

    useEffect(() => {
        if (!isActive || !startedAt) {
            setRemaining(duration);
            setHasAlerted(false);
            return;
        }

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startedAt) / 1000);
            const timeLeft = Math.max(0, duration - elapsed);
            setRemaining(timeLeft);

            // Alerts at specific times
            if (timeLeft === 10 && !hasAlerted) {
                Vibration.vibrate(100);
            } else if (timeLeft === 5 && !hasAlerted) {
                Vibration.vibrate([0, 100, 100, 100]);
            } else if (timeLeft === 0) {
                Vibration.vibrate([0, 200, 100, 200, 100, 200]);
                onTimeUp?.();
                setHasAlerted(true);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, startedAt, duration, hasAlerted, onTimeUp]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = remaining / duration;
    const isLow = remaining <= 10;
    const isCritical = remaining <= 5;

    if (!isActive) return null;

    return (
        <View style={styles.container}>
            <View style={styles.timerBox}>
                <Text
                    style={[
                        styles.timerText,
                        isLow && styles.timerLow,
                        isCritical && styles.timerCritical,
                    ]}
                >
                    ⏱️ {formatTime(remaining)}
                </Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${progress * 100}%`,
                                backgroundColor: isCritical
                                    ? MunchkinColors.danger
                                    : isLow
                                        ? MunchkinColors.warning
                                        : MunchkinColors.primary,
                            },
                        ]}
                    />
                </View>
            </View>
        </View>
    );
}

interface TurnIndicatorProps {
    currentPlayerName: string | null;
    isMyTurn: boolean;
    turnNumber: number;
    onPassTurn?: () => void;
}

export function TurnIndicator({
    currentPlayerName,
    isMyTurn,
    turnNumber,
}: TurnIndicatorProps) {
    return (
        <View style={[styles.turnIndicator, isMyTurn && styles.turnIndicatorMyTurn]}>
            <Text style={styles.turnNumber}>Turno {turnNumber}</Text>
            <Text style={[styles.turnPlayer, isMyTurn && styles.turnPlayerMyTurn]}>
                {isMyTurn ? '🎯 ¡Es tu turno!' : `🎮 Turno de ${currentPlayerName}`}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: Spacing.md,
    },
    timerBox: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.sm,
        alignItems: 'center',
    },
    timerText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    timerLow: {
        color: MunchkinColors.warning,
    },
    timerCritical: {
        color: MunchkinColors.danger,
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: MunchkinColors.backgroundMedium,
        borderRadius: 2,
        marginTop: Spacing.xs,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 2,
    },
    turnIndicator: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginBottom: Spacing.md,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    turnIndicatorMyTurn: {
        borderColor: MunchkinColors.primary,
        backgroundColor: MunchkinColors.primary + '20',
    },
    turnNumber: {
        fontSize: 12,
        color: MunchkinColors.textMuted,
    },
    turnPlayer: {
        fontSize: 16,
        fontWeight: '600',
        color: MunchkinColors.textPrimary,
        marginTop: 2,
    },
    turnPlayerMyTurn: {
        color: MunchkinColors.primary,
    },
});
