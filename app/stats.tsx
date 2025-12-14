import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { AvatarDisplay } from '@/src/components/AvatarPicker';
import { useStatsStore } from '@/src/stores/statsStore';
import { LeaderboardCategory } from '@/src/types/stats';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const LEADERBOARD_CATEGORIES: { key: LeaderboardCategory; label: string; emoji: string }[] = [
    { key: 'wins', label: 'Victorias', emoji: '👑' },
    { key: 'losses', label: 'Derrotas', emoji: '💀' },
    { key: 'monstersDefeated', label: 'Monstruos', emoji: '👹' },
    { key: 'highestLevel', label: 'Nivel Máximo', emoji: '⬆️' },
    { key: 'gamesPlayed', label: 'Partidas', emoji: '🎮' },
];

export default function StatsScreen() {
    const router = useRouter();
    const { getLeaderboard, getLuckiestPlayer, getRecentGames, playerStats } = useStatsStore();

    const luckiest = getLuckiestPlayer();
    const recentGames = getRecentGames(5);
    const allPlayers = Object.values(playerStats);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={styles.backButton}>← Volver</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>🏆 Estadísticas</Text>
                </View>

                {/* Luckiest Player */}
                {luckiest && (
                    <View style={styles.luckCard}>
                        <Text style={styles.sectionTitle}>🍀 Jugador con más suerte</Text>
                        <View style={styles.luckContent}>
                            <AvatarDisplay avatarId={luckiest.avatar} size={60} />
                            <View style={styles.luckInfo}>
                                <Text style={styles.luckName}>{luckiest.playerName}</Text>
                                <Text style={styles.luckValue}>
                                    Media: {luckiest.value.toFixed(2)} 🎲
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Leaderboards */}
                {LEADERBOARD_CATEGORIES.map(category => {
                    const leaders = getLeaderboard(category.key, 3);
                    if (leaders.length === 0) return null;

                    return (
                        <View key={category.key} style={styles.leaderboardCard}>
                            <Text style={styles.sectionTitle}>
                                {category.emoji} {category.label}
                            </Text>
                            {leaders.map((entry, index) => (
                                <View key={entry.playerId} style={styles.leaderRow}>
                                    <Text style={styles.leaderPosition}>
                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                                    </Text>
                                    <AvatarDisplay avatarId={entry.avatar} size={36} />
                                    <Text style={styles.leaderName}>{entry.playerName}</Text>
                                    <Text style={styles.leaderValue}>{entry.value}</Text>
                                </View>
                            ))}
                        </View>
                    );
                })}

                {/* Recent Games */}
                {recentGames.length > 0 && (
                    <View style={styles.recentCard}>
                        <Text style={styles.sectionTitle}>📜 Partidas Recientes</Text>
                        {recentGames.map(game => (
                            <View key={game.id} style={styles.gameRow}>
                                <View style={styles.gameInfo}>
                                    <Text style={styles.gameWinner}>
                                        👑 {game.winnerName}
                                    </Text>
                                    <Text style={styles.gameDate}>
                                        {new Date(game.date).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={styles.gamePlayers}>
                                    {game.players.length} jugadores
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Empty state */}
                {allPlayers.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>📊</Text>
                        <Text style={styles.emptyText}>
                            ¡Aún no hay estadísticas!
                        </Text>
                        <Text style={styles.emptySubtext}>
                            Juega algunas partidas para ver tus rankings aquí.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MunchkinColors.backgroundDark,
    },
    content: {
        padding: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xl,
        gap: Spacing.md,
    },
    backButton: {
        color: MunchkinColors.primary,
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: MunchkinColors.textPrimary,
        marginBottom: Spacing.md,
    },
    luckCard: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: MunchkinColors.success,
    },
    luckContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    luckInfo: {
        flex: 1,
    },
    luckName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    luckValue: {
        fontSize: 14,
        color: MunchkinColors.success,
        marginTop: 4,
    },
    leaderboardCard: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
    },
    leaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: MunchkinColors.border,
    },
    leaderPosition: {
        fontSize: 20,
        width: 30,
    },
    leaderName: {
        flex: 1,
        fontSize: 14,
        color: MunchkinColors.textPrimary,
    },
    leaderValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: MunchkinColors.primary,
    },
    recentCard: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        marginTop: Spacing.md,
    },
    gameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: MunchkinColors.border,
    },
    gameInfo: {
        flex: 1,
    },
    gameWinner: {
        fontSize: 14,
        color: MunchkinColors.textPrimary,
    },
    gameDate: {
        fontSize: 12,
        color: MunchkinColors.textMuted,
    },
    gamePlayers: {
        fontSize: 12,
        color: MunchkinColors.textSecondary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyEmoji: {
        fontSize: 60,
        marginBottom: Spacing.md,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: MunchkinColors.textPrimary,
    },
    emptySubtext: {
        fontSize: 14,
        color: MunchkinColors.textMuted,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
});
