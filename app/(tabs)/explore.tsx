import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { DefeatOverlay, VictoryOverlay } from '@/src/components/Animations';
import { ConnectionQR } from '@/src/components/ConnectionQR';
import { Dice } from '@/src/components/Dice';
import { TurnLog } from '@/src/components/TurnLog';
import { TurnIndicator, TurnTimer } from '@/src/components/TurnTimer';
import { useThemeColors } from '@/src/contexts/ThemeContext';
import { useGameStore } from '@/src/stores/gameStore';
import { useStatsStore } from '@/src/stores/statsStore';
import { APP_CONFIG, Player } from '@/src/types/game';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Animated,
  FlatList,
  LayoutAnimation,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Player Card Component with death state
const PlayerCard = React.memo(function PlayerCard({
  player,
  isLocal,
  isCurrentTurn = false
}: {
  player: Player;
  isLocal: boolean;
  isCurrentTurn?: boolean;
}) {
  const combatStrength = player.level + player.gearBonus;
  const isDead = player.isDead;

  return (
    <View style={[
      styles.playerCard,
      isLocal && styles.localPlayerCard,
      isCurrentTurn && styles.currentTurnCard,
      isDead && styles.deadPlayerCard
    ]}>
      {isDead && (
        <View style={styles.deadOverlay}>
          <Text style={styles.deadSkull}>💀</Text>
          <Text style={styles.deadText}>MUERTO</Text>
        </View>
      )}

      <View style={[styles.playerHeader, isDead && styles.dimmed]}>
        <Text style={styles.playerName}>
          {player.name} {player.isHost ? '👑' : ''}
        </Text>
        {isLocal && <Text style={styles.youBadge}>TÚ</Text>}
      </View>

      <View style={[styles.statsRow, isDead && styles.dimmed]}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Nivel</Text>
          <Text style={[styles.statValue, { color: getLevelColor(player.level) }]}>
            {player.level}
          </Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Equipo</Text>
          <Text style={styles.statValue}>+{player.gearBonus}</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Fuerza</Text>
          <Text style={[styles.statValue, styles.strengthValue]}>
            {combatStrength}
          </Text>
        </View>
      </View>

      <View style={[styles.traitsRow, isDead && styles.dimmed]}>
        <View style={[styles.trait, player.race && styles.traitActive]}>
          <Text style={styles.traitLabel}>
            {player.race?.nameEs || 'Humano'}
          </Text>
        </View>
        <View style={[styles.trait, player.gameClass && styles.traitActive]}>
          <Text style={styles.traitLabel}>
            {player.gameClass?.nameEs || 'Sin Clase'}
          </Text>
        </View>
      </View>
    </View>
  );
});

function getLevelColor(level: number): string {
  if (level <= 3) return MunchkinColors.level1;
  if (level <= 6) return MunchkinColors.level5;
  return MunchkinColors.level10;
}

export default function GameScreen() {
  const router = useRouter();
  const { session, localPlayer, nextTurn, rollDice, respawnPlayer } = useGameStore();
  const { recordDiceRoll, processGameEnd, initializePlayer, addLogEntry } = useStatsStore();
  const colors = useThemeColors();
  const [showVictory, setShowVictory] = useState(false);
  const [showDefeat, setShowDefeat] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);
  const [showRespawn, setShowRespawn] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const isHost = localPlayer?.isHost || false;

  // Initialize player stats when game starts
  useEffect(() => {
    if (localPlayer) {
      initializePlayer(localPlayer.id, localPlayer.name, localPlayer.avatar);
    }
  }, [localPlayer, initializePlayer]);

  // Auto-respawn dead player when their turn starts
  useEffect(() => {
    if (session && localPlayer && localPlayer.isDead) {
      if (session.currentTurnPlayerId === localPlayer.id) {
        // It's the dead player's turn - respawn them!
        setShowRespawn(true);
        setTimeout(() => {
          respawnPlayer(localPlayer.id);
          setShowRespawn(false);
        }, 2000);
      }
    }
  }, [session?.currentTurnPlayerId, localPlayer, respawnPlayer]);

  // Check for winner and process game end
  useEffect(() => {
    if (session?.winnerId) {
      // Process game end stats
      processGameEnd(session, session.winnerId);

      if (session.winnerId === localPlayer?.id) {
        setShowVictory(true);
      } else {
        setShowDefeat(true);
      }
    }
  }, [session?.winnerId, localPlayer?.id, session, processGameEnd]);

  // Move conditional check mainly for rendering control, but keep hooks at top level
  // We can use empty objects/arrays as fallbacks for useMemo to prevent crashes if session is null

  const otherPlayers = useMemo(
    () => session?.players.filter(p => p.id !== localPlayer?.id) || [],
    [session?.players, localPlayer?.id]
  );

  const isMyTurn = useMemo(
    () => session?.currentTurnPlayerId === localPlayer?.id,
    [session?.currentTurnPlayerId, localPlayer?.id]
  );

  const currentTurnPlayer = useMemo(
    () => session?.players.find(p => p.id === session?.currentTurnPlayerId),
    [session?.players, session?.currentTurnPlayerId]
  );

  const handleDiceRoll = useCallback((value: number) => {
    setLastDiceRoll(value);
    rollDice('manual');
    if (localPlayer) {
      recordDiceRoll(localPlayer.id, value);
      addLogEntry({
        type: 'turn_start',
        playerId: localPlayer.id,
        playerName: localPlayer.name,
        message: `${localPlayer.name} sacó un ${value} en el dado 🎲`,
      });
    }
  }, [localPlayer, rollDice, recordDiceRoll, addLogEntry]);

  const handleTimeUp = useCallback(() => {
    if (session?.currentTurnPlayerId === localPlayer?.id) {
      nextTurn();
    }
  }, [session?.currentTurnPlayerId, localPlayer?.id, nextTurn]);

  const winnerName = useMemo(
    () => session?.players.find(p => p.id === session?.winnerId)?.name || '',
    [session?.players, session?.winnerId]
  );

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [session?.players.length]);

  if (!session || !localPlayer) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No hay partida activa</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.replace('/')}
          >
            <Text style={styles.backButtonText}>Volver al inicio</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Partida en Curso</Text>
            <TouchableOpacity onPress={() => router.push('/stats' as any)}>
              <Text style={styles.statsLink}>🏆</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.headerSubtitle}>
            {session.players.length} jugadores
          </Text>
          {isHost && (
            <TouchableOpacity style={styles.qrButton} onPress={() => setShowQRModal(true)}>
              <Text style={styles.qrButtonText}>📲 QR</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Turn Indicator */}
        {session.status === 'in_progress' && session.currentTurnPlayerId && (
          <TurnIndicator
            currentPlayerName={currentTurnPlayer?.name || null}
            isMyTurn={isMyTurn}
            turnNumber={session.turnNumber}
          />
        )}

        {/* Turn Timer */}
        {session.timerEnabled && session.status === 'in_progress' && (
          <TurnTimer
            duration={session.timerDuration}
            startedAt={session.turnStartedAt}
            isActive={isMyTurn}
            onTimeUp={handleTimeUp}
          />
        )}

        {/* Combat Banner */}
        {session.currentCombat && (
          <TouchableOpacity
            style={styles.combatBanner}
            onPress={() => router.push('/combat')}
          >
            <Text style={styles.combatBannerIcon}>⚔️</Text>
            <View style={styles.combatBannerContent}>
              <Text style={styles.combatBannerTitle}>¡Combate en curso!</Text>
              <Text style={styles.combatBannerText}>
                {session.players.find(p => p.id === session.currentCombat!.mainPlayerId)?.name}
                {' '}vs {session.currentCombat.monsters.length} monstruo(s)
              </Text>
            </View>
            <Text style={styles.combatBannerArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Turn Log */}
        <TurnLog maxHeight={180} />

        {/* Local Player (Editable) */}
        <View style={styles.localSection}>
          <Text style={styles.sectionTitle}>Tu Personaje</Text>
          <LocalPlayerControls player={localPlayer} />
        </View>

        {/* Dice Roller */}
        <View style={styles.diceSection}>
          <Dice onRoll={handleDiceRoll} size={70} />
          {lastDiceRoll && (
            <Text style={styles.lastRollText}>
              Última tirada: {lastDiceRoll}
            </Text>
          )}
        </View>

        {/* Other Players */}
        {otherPlayers.length > 0 && (
          <View style={styles.othersSection}>
            <Text style={styles.sectionTitle}>Otros Jugadores</Text>
            <FlatList
              data={otherPlayers}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PlayerCard player={item} isLocal={false} isCurrentTurn={item.id === session.currentTurnPlayerId} />
              )}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.playersList}
            />
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {isMyTurn && session.status === 'in_progress' && (
          <TouchableOpacity
            style={styles.passTurnButton}
            onPress={() => {
              // Log turn change before passing
              const nextIndex = (session.players.findIndex(p => p.id === localPlayer.id) + 1) % session.players.length;
              const nextPlayer = session.players[nextIndex];
              addLogEntry({
                type: 'turn_end',
                playerId: localPlayer.id,
                playerName: localPlayer.name,
                message: `Turno de ${nextPlayer.name} ▶️`,
              });
              nextTurn();
            }}
          >
            <Text style={styles.passTurnText}>Pasar Turno ➡️</Text>
          </TouchableOpacity>
        )}
        {!session.currentCombat && (
          <TouchableOpacity
            style={styles.combatButton}
            onPress={() => router.push('/combat')}
          >
            <Text style={styles.combatButtonIcon}>⚔️</Text>
            <Text style={styles.combatButtonText}>Iniciar Combate</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Victory/Defeat Overlays */}
      <VictoryOverlay
        visible={showVictory}
        winnerName={winnerName}
        onClose={() => {
          setShowVictory(false);
          router.replace('/');
        }}
      />
      <DefeatOverlay
        visible={showDefeat}
        winnerName={winnerName}
        onClose={() => {
          setShowDefeat(false);
          router.replace('/');
        }}
      />

      {/* QR Modal for in-game sharing */}
      <Modal visible={showQRModal} transparent animationType="fade">
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={{ color: MunchkinColors.textPrimary, fontSize: 18, marginBottom: 10 }}>
              Escanea para unirte
            </Text>
            <ConnectionQR port={APP_CONFIG.WS_PORT} />
            <TouchableOpacity style={styles.qrModalClose} onPress={() => setShowQRModal(false)}>
              <Text style={styles.qrModalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Local Player Controls (editable) - with animated counters and logging
function LocalPlayerControls({ player }: { player: Player }) {
  const { setPlayerLevel, setPlayerGear } = useGameStore();
  const { addLogEntry } = useStatsStore();
  const router = useRouter();
  const combatStrength = player.level + player.gearBonus;

  const handleLevelChange = (newLevel: number) => {
    const oldLevel = player.level;
    setPlayerLevel(newLevel);
    if (newLevel > oldLevel) {
      addLogEntry({
        type: 'level_up',
        playerId: player.id,
        playerName: player.name,
        message: `${player.name} subió a nivel ${newLevel} ⬆️`,
      });
    } else {
      addLogEntry({
        type: 'level_down',
        playerId: player.id,
        playerName: player.name,
        message: `${player.name} bajó a nivel ${newLevel} ⬇️`,
      });
    }
  };

  const handleGearChange = (newGear: number) => {
    setPlayerGear(newGear);
    addLogEntry({
      type: 'gear_change',
      playerId: player.id,
      playerName: player.name,
      message: `${player.name} cambió su equipo a +${newGear} 🛡️`,
    });
  };

  return (
    <View style={styles.localPlayerCard}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>
          {player.name} {player.isHost ? '👑' : ''}
        </Text>
      </View>

      {/* Editable Stats with Animated Counters */}
      <View style={styles.editableStats}>
        {/* Level Control */}
        <View style={styles.statControl}>
          <Text style={styles.statControlLabel}>Nivel</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleLevelChange(player.level - 1)}
              disabled={player.level <= 1}
            >
              <Text style={styles.counterButtonText}>−</Text>
            </TouchableOpacity>
            <Animated.Text style={[styles.counterValue, { color: getLevelColor(player.level) }]}>
              {player.level}
            </Animated.Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleLevelChange(player.level + 1)}
              disabled={player.level >= 10}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Gear Control */}
        <View style={styles.statControl}>
          <Text style={styles.statControlLabel}>Equipo</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleGearChange(player.gearBonus - 1)}
              disabled={player.gearBonus <= 0}
            >
              <Text style={styles.counterButtonText}>−</Text>
            </TouchableOpacity>
            <Animated.Text style={styles.counterValue}>+{player.gearBonus}</Animated.Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => handleGearChange(player.gearBonus + 1)}
            >
              <Text style={styles.counterButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Combat Strength (computed) */}
        <View style={styles.statControl}>
          <Text style={styles.statControlLabel}>Fuerza</Text>
          <Text style={styles.strengthDisplay}>{combatStrength}</Text>
        </View>
      </View>

      {/* Race/Class Selection */}
      <View style={styles.traitsSection}>
        <TouchableOpacity
          style={styles.traitButton}
          onPress={() => router.push('/select-race')}
        >
          <Text style={styles.traitButtonLabel}>Raza</Text>
          <Text style={styles.traitButtonValue}>
            {player.race?.nameEs || 'Humano'} →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.traitButton}
          onPress={() => router.push('/select-class')}
        >
          <Text style={styles.traitButtonLabel}>Clase</Text>
          <Text style={styles.traitButtonValue}>
            {player.gameClass?.nameEs || 'Sin Clase'} →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MunchkinColors.backgroundDark,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: MunchkinColors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: MunchkinColors.textSecondary,
    marginTop: Spacing.xs,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    color: MunchkinColors.textSecondary,
    marginBottom: Spacing.lg,
  },
  backButton: {
    backgroundColor: MunchkinColors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.lg,
  },
  backButtonText: {
    color: MunchkinColors.backgroundDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
  combatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MunchkinColors.danger,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  combatBannerIcon: {
    fontSize: 24,
  },
  combatBannerContent: {
    flex: 1,
  },
  combatBannerTitle: {
    color: MunchkinColors.textPrimary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  combatBannerText: {
    color: MunchkinColors.textPrimary,
    fontSize: 12,
    opacity: 0.9,
  },
  combatBannerArrow: {
    color: MunchkinColors.textPrimary,
    fontSize: 20,
  },
  localSection: {
    padding: Spacing.lg,
  },
  othersSection: {
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: MunchkinColors.textSecondary,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  playerCard: {
    backgroundColor: MunchkinColors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginRight: Spacing.md,
    width: 180,
  },
  localPlayerCard: {
    backgroundColor: MunchkinColors.backgroundMedium,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: MunchkinColors.primary,
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MunchkinColors.textPrimary,
  },
  youBadge: {
    backgroundColor: MunchkinColors.primary,
    color: MunchkinColors.backgroundDark,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: MunchkinColors.textMuted,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MunchkinColors.textPrimary,
  },
  strengthValue: {
    color: MunchkinColors.playerStrength,
  },
  traitsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  trait: {
    flex: 1,
    backgroundColor: MunchkinColors.backgroundDark,
    borderRadius: Radius.sm,
    padding: Spacing.xs,
    alignItems: 'center',
  },
  traitActive: {
    backgroundColor: MunchkinColors.primary + '30',
  },
  traitLabel: {
    fontSize: 10,
    color: MunchkinColors.textSecondary,
  },
  playersList: {
    paddingHorizontal: Spacing.lg,
  },
  editableStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.lg,
  },
  statControl: {
    alignItems: 'center',
  },
  statControlLabel: {
    fontSize: 12,
    color: MunchkinColors.textMuted,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  counterButton: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: MunchkinColors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: MunchkinColors.primary,
  },
  counterButtonText: {
    fontSize: 24,
    color: MunchkinColors.primary,
    fontWeight: 'bold',
  },
  counterValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MunchkinColors.textPrimary,
    minWidth: 50,
    textAlign: 'center',
  },
  strengthDisplay: {
    fontSize: 32,
    fontWeight: 'bold',
    color: MunchkinColors.playerStrength,
  },
  traitsSection: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  traitButton: {
    flex: 1,
    backgroundColor: MunchkinColors.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  traitButtonLabel: {
    fontSize: 10,
    color: MunchkinColors.textMuted,
    textTransform: 'uppercase',
  },
  traitButtonValue: {
    fontSize: 14,
    color: MunchkinColors.primary,
    fontWeight: '600',
    marginTop: Spacing.xs,
  },
  actions: {
    padding: Spacing.lg,
    marginTop: 'auto',
  },
  combatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MunchkinColors.accent,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  combatButtonIcon: {
    fontSize: 24,
  },
  combatButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: MunchkinColors.textPrimary,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsLink: {
    fontSize: 28,
  },
  diceSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    backgroundColor: MunchkinColors.backgroundCard,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  lastRollText: {
    color: MunchkinColors.textSecondary,
    fontSize: 13,
    marginTop: Spacing.sm,
  },
  currentTurnCard: {
    borderWidth: 2,
    borderColor: MunchkinColors.success,
  },
  passTurnButton: {
    backgroundColor: MunchkinColors.success,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  passTurnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: MunchkinColors.backgroundDark,
  },
  // Dead player styles
  deadPlayerCard: {
    opacity: 0.7,
    borderColor: MunchkinColors.danger,
    borderWidth: 2,
    position: 'relative',
  },
  deadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  deadSkull: {
    fontSize: 40,
  },
  deadText: {
    color: MunchkinColors.danger,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: Spacing.xs,
  },
  dimmed: {
    opacity: 0.4,
  },
  qrButton: {
    backgroundColor: MunchkinColors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    marginTop: Spacing.xs,
  },
  qrButtonText: {
    color: MunchkinColors.backgroundDark,
    fontWeight: 'bold',
    fontSize: 14,
  },
  qrModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrModalContent: {
    backgroundColor: MunchkinColors.backgroundCard,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    alignItems: 'center',
  },
  qrModalClose: {
    marginTop: Spacing.lg,
    backgroundColor: MunchkinColors.danger,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
  },
  qrModalCloseText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
