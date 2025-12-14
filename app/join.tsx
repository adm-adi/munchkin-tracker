import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { DiscoveredGame, useGameClient } from '@/src/hooks/useGameClient';
import { t } from '@/src/i18n';
import { useGameStore } from '@/src/stores/gameStore';
import { APP_CONFIG } from '@/src/types/game';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function JoinScreen() {
    const router = useRouter();

    const { localPlayer } = useGameStore();
    const {
        state,
        searchForGames,
        connectToGame
    } = useGameClient();

    useEffect(() => {
        if (!localPlayer) {
            router.replace('/');
            return;
        }
        searchForGames();
    }, [localPlayer]);

    // Navigate to lobby when connected
    useEffect(() => {
        if (state.isConnected) {
            router.replace('/lobby');
        }
    }, [state.isConnected]);

    const handleConnect = async (game: DiscoveredGame) => {
        try {
            await connectToGame(game.id);
        } catch (error) {
            Alert.alert('Error', 'No se pudo conectar a la partida');
        }
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
                <Text style={styles.title}>{t('join_game')}</Text>
            </View>

            {/* Auto Discovery */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Partidas Disponibles</Text>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={searchForGames}
                        disabled={state.isSearching}
                    >
                        <Text style={styles.refreshButtonText}>🔄 Buscar</Text>
                    </TouchableOpacity>
                </View>

                {state.isSearching ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator color={MunchkinColors.primary} size="large" />
                        <Text style={styles.loadingText}>{t('searching_games')}</Text>
                    </View>
                ) : state.discoveredGames.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>🔍</Text>
                        <Text style={styles.emptyText}>{t('no_games_found')}</Text>
                        <Text style={styles.emptyHint}>
                            Asegúrate de que el host ha creado la partida y estáis en la misma red WiFi
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={state.discoveredGames}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.gameItem}
                                onPress={() => handleConnect(item)}
                                disabled={state.isConnecting}
                            >
                                <View style={styles.gameInfo}>
                                    <Text style={styles.gameHost}>🏰 {item.hostName}</Text>
                                    <Text style={styles.gameAddress}>
                                        Toca para unirte
                                    </Text>
                                </View>
                                <View style={styles.gamePlayerCount}>
                                    {state.isConnecting ? (
                                        <ActivityIndicator color={MunchkinColors.primary} size="small" />
                                    ) : (
                                        <>
                                            <Text style={styles.gamePlayerCountText}>
                                                {item.playerCount}/{APP_CONFIG.MAX_PLAYERS}
                                            </Text>
                                            <Text style={styles.gamePlayerCountLabel}>jugadores</Text>
                                        </>
                                    )}
                                </View>
                            </TouchableOpacity>
                        )}
                        contentContainerStyle={styles.gamesList}
                    />
                )}
            </View>

            {/* Error Message */}
            {state.error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{state.error}</Text>
                </View>
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
    section: {
        padding: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: MunchkinColors.textSecondary,
        marginBottom: Spacing.sm,
    },
    manualConnect: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    addressInput: {
        flex: 1,
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
        fontSize: 16,
        color: MunchkinColors.textPrimary,
    },
    separator: {
        color: MunchkinColors.textSecondary,
        fontSize: 18,
    },
    portInput: {
        width: 70,
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
        fontSize: 16,
        color: MunchkinColors.textPrimary,
        textAlign: 'center',
    },
    connectButton: {
        backgroundColor: MunchkinColors.primary,
        borderRadius: Radius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        minWidth: 80,
        alignItems: 'center',
    },
    connectButtonText: {
        color: MunchkinColors.backgroundDark,
        fontWeight: 'bold',
        fontSize: 14,
    },
    refreshButton: {
        padding: Spacing.sm,
    },
    refreshButtonText: {
        color: MunchkinColors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: Spacing.xl,
    },
    loadingText: {
        color: MunchkinColors.textSecondary,
        marginTop: Spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    emptyText: {
        color: MunchkinColors.textPrimary,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    emptyHint: {
        color: MunchkinColors.textMuted,
        fontSize: 14,
        textAlign: 'center',
    },
    gamesList: {
        gap: Spacing.sm,
    },
    gameItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: MunchkinColors.success,
    },
    gameInfo: {
        flex: 1,
    },
    gameHost: {
        fontSize: 16,
        fontWeight: '600',
        color: MunchkinColors.textPrimary,
    },
    gameAddress: {
        fontSize: 12,
        color: MunchkinColors.textMuted,
        marginTop: 2,
    },
    gamePlayerCount: {
        alignItems: 'center',
    },
    gamePlayerCountText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: MunchkinColors.primary,
    },
    gamePlayerCountLabel: {
        fontSize: 10,
        color: MunchkinColors.textMuted,
    },
    errorContainer: {
        margin: Spacing.lg,
        padding: Spacing.md,
        backgroundColor: MunchkinColors.danger + '30',
        borderRadius: Radius.md,
    },
    errorText: {
        color: MunchkinColors.danger,
        textAlign: 'center',
    },
});
