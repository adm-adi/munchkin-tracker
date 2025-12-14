import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { AvatarDisplay } from '@/src/components/AvatarPicker';
import { useStatsStore } from '@/src/stores/statsStore';
import { GameRecord } from '@/src/types/stats';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function HistoryScreen() {
    const router = useRouter();
    const { gameRecords } = useStatsStore();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins >= 60) {
            const hours = Math.floor(mins / 60);
            return `${hours}h ${mins % 60}min`;
        }
        return `${mins}min ${secs}s`;
    };

    const renderGameCard = ({ item }: { item: GameRecord }) => {
        const isExpanded = expandedId === item.id;
        const winner = item.players.find(p => p.id === item.winnerId);

        return (
            <TouchableOpacity
                style={styles.gameCard}
                onPress={() => setExpandedId(isExpanded ? null : item.id)}
                activeOpacity={0.8}
            >
                {/* Header */}
                <View style={styles.cardHeader}>
                    <View style={styles.dateContainer}>
                        <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                        <Text style={styles.durationText}>⏱️ {formatDuration(item.duration)}</Text>
                    </View>
                    <View style={styles.playerCount}>
                        <Text style={styles.playerCountText}>👥 {item.players.length}</Text>
                    </View>
                </View>

                {/* Winner */}
                <View style={styles.winnerRow}>
                    {winner && (
                        <>
                            <AvatarDisplay avatarId={winner.avatar} size={36} />
                            <View style={styles.winnerInfo}>
                                <Text style={styles.winnerLabel}>🏆 Ganador</Text>
                                <Text style={styles.winnerName}>{winner.name}</Text>
                            </View>
                            <Text style={styles.winnerLevel}>Lvl {winner.finalLevel}</Text>
                        </>
                    )}
                </View>

                {/* Expanded Details */}
                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <Text style={styles.sectionLabel}>Jugadores</Text>
                        {item.players.map(player => (
                            <View key={player.id} style={styles.playerRow}>
                                <AvatarDisplay avatarId={player.avatar} size={28} />
                                <Text style={styles.playerName}>{player.name}</Text>
                                <Text style={styles.playerStats}>
                                    Lvl {player.finalLevel} | +{player.finalGear}
                                </Text>
                                {player.id === item.winnerId && (
                                    <Text style={styles.crownIcon}>👑</Text>
                                )}
                            </View>
                        ))}

                        {/* Log Preview */}
                        {item.log.length > 0 && (
                            <View style={styles.logPreview}>
                                <Text style={styles.sectionLabel}>
                                    Últimos eventos ({item.log.length})
                                </Text>
                                {item.log.slice(-5).map(entry => (
                                    <Text key={entry.id} style={styles.logEntry}>
                                        • {entry.message}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                )}

                <Text style={styles.expandHint}>
                    {isExpanded ? '▲ Ocultar' : '▼ Ver detalles'}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Historial</Text>
            </View>

            {gameRecords.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📜</Text>
                    <Text style={styles.emptyTitle}>Sin partidas guardadas</Text>
                    <Text style={styles.emptySubtitle}>
                        Las partidas completadas aparecerán aquí
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={gameRecords}
                    keyExtractor={(item) => item.id}
                    renderItem={renderGameCard}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MunchkinColors.backgroundDark,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        gap: Spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        backgroundColor: MunchkinColors.backgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        fontSize: 24,
        color: MunchkinColors.textPrimary,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    listContent: {
        padding: Spacing.lg,
        paddingTop: 0,
        gap: Spacing.md,
    },
    gameCard: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.sm,
    },
    dateContainer: {
        flex: 1,
    },
    dateText: {
        color: MunchkinColors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    durationText: {
        color: MunchkinColors.textMuted,
        fontSize: 13,
        marginTop: 2,
    },
    playerCount: {
        backgroundColor: MunchkinColors.backgroundMedium,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.sm,
    },
    playerCountText: {
        color: MunchkinColors.textSecondary,
        fontSize: 13,
    },
    winnerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MunchkinColors.primary + '20',
        padding: Spacing.sm,
        borderRadius: Radius.md,
        gap: Spacing.sm,
    },
    winnerInfo: {
        flex: 1,
    },
    winnerLabel: {
        color: MunchkinColors.primary,
        fontSize: 11,
        fontWeight: '600',
    },
    winnerName: {
        color: MunchkinColors.textPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    winnerLevel: {
        color: MunchkinColors.primary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    expandedContent: {
        marginTop: Spacing.md,
        paddingTop: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: MunchkinColors.backgroundMedium,
    },
    sectionLabel: {
        color: MunchkinColors.textMuted,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: Spacing.sm,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.xs,
        gap: Spacing.sm,
    },
    playerName: {
        flex: 1,
        color: MunchkinColors.textPrimary,
        fontSize: 14,
    },
    playerStats: {
        color: MunchkinColors.textSecondary,
        fontSize: 13,
    },
    crownIcon: {
        fontSize: 14,
    },
    logPreview: {
        marginTop: Spacing.md,
    },
    logEntry: {
        color: MunchkinColors.textMuted,
        fontSize: 12,
        paddingVertical: 2,
    },
    expandHint: {
        color: MunchkinColors.textMuted,
        fontSize: 12,
        textAlign: 'center',
        marginTop: Spacing.sm,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyIcon: {
        fontSize: 60,
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        color: MunchkinColors.textPrimary,
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        color: MunchkinColors.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
});
