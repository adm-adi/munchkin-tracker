import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { AvatarDisplay } from '@/src/components/AvatarPicker';
import { useGameServer } from '@/src/hooks/useGameServer';
import { t } from '@/src/i18n';
import { useGameStore } from '@/src/stores/gameStore';
import { APP_CONFIG, Player } from '@/src/types/game';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    FlatList,
    Platform,
    SafeAreaView,
    Share,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function LobbyScreen() {
    const router = useRouter();
    const { session, localPlayer, leaveSession, setTimerConfig, startGame } = useGameStore();
    const { state: serverState, startServer, stopServer } = useGameServer();
    const [timerEnabled, setTimerEnabled] = useState(false);
    const [timerDuration, setTimerDuration] = useState(60);

    // Start server if we're the host
    useEffect(() => {
        if (localPlayer?.isHost && !serverState.isRunning) {
            startServer();
        }
    }, [localPlayer, serverState.isRunning, startServer]);

    // Redirect if no session
    useEffect(() => {
        if (!session) {
            router.replace('/');
        }
    }, [session, router]);

    if (!session || !localPlayer) {
        return null;
    }

    const isHost = localPlayer.isHost;
    const canStart = session.players.length >= 1; // Allow single player for testing

    const handleStartGame = () => {
        // Save timer config and start the game
        setTimerConfig(timerEnabled, timerDuration);
        startGame();
        router.replace('/(tabs)/explore');
    };

    const handleLeaveGame = () => {
        if (isHost) {
            stopServer();
        }
        leaveSession();
        router.replace('/');
    };

    const handleShareCode = async () => {
        try {
            await Share.share({
                message: `Únete a mi partida de Munchkin!\n\nAbre la app y selecciona "Unirse a Partida"`,
                title: 'Munchkin Tracker - Invitación',
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleLeaveGame}
                >
                    <Text style={styles.backIcon}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.title}>{t('lobby_title')}</Text>
                    <Text style={styles.subtitle}>
                        {t('player_count', { count: session.players.length, max: APP_CONFIG.MAX_PLAYERS })}
                    </Text>
                </View>
            </View>

            {/* Host Badge */}
            {isHost && (
                <View style={styles.hostBadge}>
                    <Text style={styles.hostBadgeIcon}>👑</Text>
                    <Text style={styles.hostBadgeText}>{t('you_are_host')}</Text>
                </View>
            )}

            {/* Connection Info */}
            {isHost && serverState.isRunning && (
                <View style={styles.connectionInfo}>
                    <Text style={styles.connectionLabel}>Estado:</Text>
                    <View style={styles.connectionCode}>
                        <Text style={styles.connectionCodeText}>
                            🟢 Partida visible - esperando jugadores
                        </Text>
                        <TouchableOpacity
                            style={styles.shareButton}
                            onPress={handleShareCode}
                        >
                            <Text style={styles.shareButtonText}>📤</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.connectionHint}>
                        Los jugadores en la misma red WiFi pueden ver tu partida
                    </Text>
                </View>
            )}

            {/* Players List */}
            <View style={styles.playersSection}>
                <Text style={styles.sectionTitle}>Jugadores</Text>
                <FlatList
                    data={session.players}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item, index }) => (
                        <PlayerListItem
                            player={item}
                            index={index}
                            isLocal={item.id === localPlayer.id}
                        />
                    )}
                    contentContainerStyle={styles.playersList}
                />

                {/* Empty Slots */}
                {Array.from({ length: APP_CONFIG.MAX_PLAYERS - session.players.length }).map((_, i) => (
                    <View key={`empty-${i}`} style={styles.emptySlot}>
                        <Text style={styles.emptySlotText}>Esperando jugador...</Text>
                    </View>
                ))}
            </View>

            {/* Timer Config (Host only) */}
            {isHost && (
                <View style={styles.timerConfig}>
                    <View style={styles.timerRow}>
                        <Text style={styles.timerLabel}>⏱️ Timer de turno</Text>
                        <Switch
                            value={timerEnabled}
                            onValueChange={setTimerEnabled}
                            trackColor={{ false: MunchkinColors.backgroundMedium, true: MunchkinColors.primary }}
                            thumbColor={timerEnabled ? MunchkinColors.textPrimary : MunchkinColors.textMuted}
                        />
                    </View>
                    {timerEnabled && (
                        <View style={styles.timerDurations}>
                            {[30, 60, 120, 300].map((duration) => (
                                <TouchableOpacity
                                    key={duration}
                                    style={[
                                        styles.timerOption,
                                        timerDuration === duration && styles.timerOptionActive,
                                    ]}
                                    onPress={() => setTimerDuration(duration)}
                                >
                                    <Text style={[
                                        styles.timerOptionText,
                                        timerDuration === duration && styles.timerOptionTextActive,
                                    ]}>
                                        {duration < 60 ? `${duration}s` : `${duration / 60}min`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* Actions */}
            <View style={styles.actions}>
                {isHost ? (
                    <TouchableOpacity
                        style={[styles.startButton, !canStart && styles.startButtonDisabled]}
                        onPress={handleStartGame}
                        disabled={!canStart}
                    >
                        <Text style={styles.startButtonText}>
                            {canStart ? t('start_game') : 'Esperando jugadores...'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.waitingBox}>
                        <Text style={styles.waitingIcon}>⏳</Text>
                        <Text style={styles.waitingText}>Esperando a que el host inicie la partida...</Text>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

function PlayerListItem({ player, index, isLocal }: { player: Player; index: number; isLocal: boolean }) {
    const colors = [
        MunchkinColors.raceElf,
        MunchkinColors.classWizard,
        MunchkinColors.classBard,
        MunchkinColors.raceOrc,
        MunchkinColors.classWarrior,
        MunchkinColors.raceGnome,
    ];

    return (
        <View style={[styles.playerItem, { borderLeftColor: colors[index % colors.length] }]}>
            <AvatarDisplay avatarId={player.avatar} size={44} />
            <View style={styles.playerInfo}>
                <Text style={styles.playerName}>
                    {player.name}
                    {player.isHost && ' 👑'}
                </Text>
                <Text style={styles.playerStatus}>
                    {player.isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
                </Text>
            </View>
            {isLocal && (
                <View style={styles.youTag}>
                    <Text style={styles.youTagText}>TÚ</Text>
                </View>
            )}
        </View>
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
    headerContent: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    subtitle: {
        fontSize: 14,
        color: MunchkinColors.textSecondary,
    },
    hostBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MunchkinColors.primary + '20',
        marginHorizontal: Spacing.lg,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    hostBadgeIcon: {
        fontSize: 20,
    },
    hostBadgeText: {
        color: MunchkinColors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    connectionInfo: {
        backgroundColor: MunchkinColors.backgroundCard,
        marginHorizontal: Spacing.lg,
        marginTop: Spacing.md,
        borderRadius: Radius.lg,
        padding: Spacing.md,
    },
    connectionLabel: {
        fontSize: 12,
        color: MunchkinColors.textMuted,
        marginBottom: Spacing.xs,
    },
    connectionCode: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    connectionCodeText: {
        fontSize: 18,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        color: MunchkinColors.primary,
        fontWeight: 'bold',
    },
    shareButton: {
        padding: Spacing.sm,
    },
    shareButtonText: {
        fontSize: 20,
    },
    connectionHint: {
        fontSize: 12,
        color: MunchkinColors.textMuted,
        marginTop: Spacing.xs,
    },
    playersSection: {
        flex: 1,
        padding: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: MunchkinColors.textSecondary,
        marginBottom: Spacing.md,
    },
    playersList: {
        gap: Spacing.sm,
    },
    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
        borderLeftWidth: 4,
        gap: Spacing.md,
    },
    playerAvatar: {
        width: 40,
        height: 40,
        borderRadius: Radius.full,
        backgroundColor: MunchkinColors.backgroundMedium,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playerAvatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MunchkinColors.primary,
    },
    playerInfo: {
        flex: 1,
    },
    playerName: {
        fontSize: 16,
        fontWeight: '600',
        color: MunchkinColors.textPrimary,
    },
    playerStatus: {
        fontSize: 12,
        color: MunchkinColors.textSecondary,
        marginTop: 2,
    },
    youTag: {
        backgroundColor: MunchkinColors.primary,
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: Radius.sm,
    },
    youTagText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: MunchkinColors.backgroundDark,
    },
    emptySlot: {
        backgroundColor: MunchkinColors.backgroundCard + '50',
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginTop: Spacing.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: MunchkinColors.textMuted,
    },
    emptySlotText: {
        color: MunchkinColors.textMuted,
        textAlign: 'center',
        fontSize: 14,
    },
    actions: {
        padding: Spacing.lg,
    },
    startButton: {
        backgroundColor: MunchkinColors.success,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
    },
    startButtonDisabled: {
        backgroundColor: MunchkinColors.backgroundCard,
    },
    startButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    waitingBox: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        padding: Spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    waitingIcon: {
        fontSize: 20,
    },
    waitingText: {
        color: MunchkinColors.textSecondary,
        fontSize: 14,
    },
    timerConfig: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    timerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timerLabel: {
        color: MunchkinColors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
    },
    timerDurations: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: Spacing.md,
        gap: Spacing.sm,
    },
    timerOption: {
        flex: 1,
        padding: Spacing.sm,
        borderRadius: Radius.md,
        backgroundColor: MunchkinColors.backgroundMedium,
        alignItems: 'center',
    },
    timerOptionActive: {
        backgroundColor: MunchkinColors.primary,
    },
    timerOptionText: {
        color: MunchkinColors.textSecondary,
        fontSize: 14,
        fontWeight: '600',
    },
    timerOptionTextActive: {
        color: MunchkinColors.backgroundDark,
    },
});
