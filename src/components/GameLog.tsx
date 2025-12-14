import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import React, { useEffect, useRef } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { GameLogEntry, GameLogType } from '../types/stats';

interface GameLogProps {
    entries: GameLogEntry[];
    maxHeight?: number;
}

const LOG_ICONS: Record<GameLogType, string> = {
    game_start: '🎮',
    game_end: '🏁',
    turn_start: '➡️',
    turn_end: '⏹️',
    level_up: '⬆️',
    level_down: '⬇️',
    gear_change: '⚔️',
    combat_start: '⚔️',
    combat_win: '🏆',
    combat_lose: '💀',
    combat_flee: '🏃',
    race_change: '🎭',
    class_change: '📚',
    player_join: '➕',
    player_leave: '➖',
};

const LOG_COLORS: Record<GameLogType, string> = {
    game_start: MunchkinColors.primary,
    game_end: MunchkinColors.primary,
    turn_start: MunchkinColors.textMuted,
    turn_end: MunchkinColors.textMuted,
    level_up: MunchkinColors.success,
    level_down: MunchkinColors.danger,
    gear_change: MunchkinColors.accent,
    combat_start: MunchkinColors.warning,
    combat_win: MunchkinColors.success,
    combat_lose: MunchkinColors.danger,
    combat_flee: MunchkinColors.warning,
    race_change: MunchkinColors.raceElf,
    class_change: MunchkinColors.classWizard,
    player_join: MunchkinColors.success,
    player_leave: MunchkinColors.danger,
};

function formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function GameLog({ entries, maxHeight = 200 }: GameLogProps) {
    const listRef = useRef<FlatList>(null);

    useEffect(() => {
        if (entries.length > 0) {
            listRef.current?.scrollToEnd({ animated: true });
        }
    }, [entries.length]);

    if (entries.length === 0) {
        return (
            <View style={[styles.container, { maxHeight }]}>
                <Text style={styles.emptyText}>No hay eventos aún</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { maxHeight }]}>
            <Text style={styles.title}>📜 Registro</Text>
            <FlatList<GameLogEntry>
                ref={listRef}
                data={entries}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.entry}>
                        <Text style={styles.entryIcon}>
                            {LOG_ICONS[item.type]}
                        </Text>
                        <View style={styles.entryContent}>
                            <Text
                                style={[
                                    styles.entryMessage,
                                    { color: LOG_COLORS[item.type] },
                                ]}
                            >
                                {item.playerName && (
                                    <Text style={styles.playerName}>
                                        {item.playerName}:{' '}
                                    </Text>
                                )}
                                {item.message}
                            </Text>
                            <Text style={styles.entryTime}>
                                {formatTime(item.timestamp)}
                            </Text>
                        </View>
                    </View>
                )}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}

// Compact inline log for showing recent events
export function RecentLog({ entries }: { entries: GameLogEntry[] }) {
    const recent = entries.slice(-3);

    return (
        <View style={styles.recentContainer}>
            {recent.map((entry) => (
                <Text key={entry.id} style={styles.recentEntry} numberOfLines={1}>
                    {LOG_ICONS[entry.type]} {entry.message}
                </Text>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: MunchkinColors.textSecondary,
        marginBottom: Spacing.sm,
    },
    emptyText: {
        color: MunchkinColors.textMuted,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    entry: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: Spacing.xs,
        gap: Spacing.sm,
    },
    entryIcon: {
        fontSize: 14,
    },
    entryContent: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    entryMessage: {
        flex: 1,
        fontSize: 12,
        color: MunchkinColors.textPrimary,
    },
    playerName: {
        fontWeight: '600',
    },
    entryTime: {
        fontSize: 10,
        color: MunchkinColors.textMuted,
        marginLeft: Spacing.sm,
    },
    recentContainer: {
        gap: 2,
    },
    recentEntry: {
        fontSize: 11,
        color: MunchkinColors.textMuted,
    },
});
