import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { useStatsStore } from '@/src/stores/statsStore';
import { GameLogEntry, GameLogType } from '@/src/types/stats';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TurnLogProps {
    maxHeight?: number;
}

const LOG_ICONS: Record<GameLogType, string> = {
    game_start: '🎮',
    game_end: '🏁',
    turn_start: '▶️',
    turn_end: '⏸️',
    level_up: '⬆️',
    level_down: '⬇️',
    gear_change: '🛡️',
    combat_start: '⚔️',
    combat_win: '🎉',
    combat_lose: '💀',
    combat_flee: '🏃',
    race_change: '🧬',
    class_change: '⚔️',
    player_join: '👋',
    player_leave: '👋',
};

export function TurnLog({ maxHeight = 200 }: TurnLogProps) {
    const { currentGameLog } = useStatsStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const flatListRef = useRef<FlatList>(null);
    const heightAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(heightAnim, {
            toValue: isExpanded ? 1 : 0,
            useNativeDriver: false,
            friction: 10,
        }).start();
    }, [isExpanded]);

    useEffect(() => {
        // Auto-scroll to bottom when new entries added
        if (flatListRef.current && currentGameLog.length > 0 && isExpanded) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [currentGameLog.length, isExpanded]);

    const formatTime = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    const renderLogEntry = ({ item }: { item: GameLogEntry }) => (
        <View style={styles.logEntry}>
            <Text style={styles.logIcon}>{LOG_ICONS[item.type] || '📝'}</Text>
            <View style={styles.logContent}>
                <Text style={styles.logMessage}>{item.message}</Text>
                <Text style={styles.logTime}>{formatTime(item.timestamp)}</Text>
            </View>
        </View>
    );

    const animatedHeight = heightAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [48, maxHeight],
    });

    return (
        <Animated.View style={[styles.container, { height: animatedHeight }]}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setIsExpanded(!isExpanded)}
                activeOpacity={0.8}
            >
                <Text style={styles.headerIcon}>📜</Text>
                <Text style={styles.headerTitle}>Registro de Turno</Text>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>{currentGameLog.length}</Text>
                </View>
                <Text style={styles.expandIcon}>{isExpanded ? '▼' : '▲'}</Text>
            </TouchableOpacity>

            {isExpanded && (
                <FlatList
                    ref={flatListRef}
                    data={currentGameLog}
                    keyExtractor={(item) => item.id}
                    renderItem={renderLogEntry}
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={true}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>Sin eventos aún...</Text>
                    }
                />
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    headerIcon: {
        fontSize: 18,
    },
    headerTitle: {
        flex: 1,
        color: MunchkinColors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    badge: {
        backgroundColor: MunchkinColors.primary,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        minWidth: 24,
        alignItems: 'center',
    },
    badgeText: {
        color: MunchkinColors.backgroundDark,
        fontSize: 12,
        fontWeight: 'bold',
    },
    expandIcon: {
        color: MunchkinColors.textMuted,
        fontSize: 12,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.md,
    },
    logEntry: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: Spacing.xs,
        gap: Spacing.sm,
    },
    logIcon: {
        fontSize: 14,
        marginTop: 2,
    },
    logContent: {
        flex: 1,
    },
    logMessage: {
        color: MunchkinColors.textSecondary,
        fontSize: 13,
        lineHeight: 18,
    },
    logTime: {
        color: MunchkinColors.textMuted,
        fontSize: 10,
        marginTop: 2,
    },
    emptyText: {
        color: MunchkinColors.textMuted,
        fontSize: 13,
        textAlign: 'center',
        padding: Spacing.md,
    },
});
