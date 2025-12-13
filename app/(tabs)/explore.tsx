import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { useGameStore } from '@/src/stores/gameStore';
import { Player } from '@/src/types/game';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Player Card Component
function PlayerCard({ player, isLocal }: { player: Player; isLocal: boolean }) {
  const combatStrength = player.level + player.gearBonus;

  return (
    <View style={[styles.playerCard, isLocal && styles.localPlayerCard]}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>
          {player.name} {player.isHost ? '👑' : ''}
        </Text>
        {isLocal && <Text style={styles.youBadge}>TÚ</Text>}
      </View>

      <View style={styles.statsRow}>
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

      <View style={styles.traitsRow}>
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
}

function getLevelColor(level: number): string {
  if (level <= 3) return MunchkinColors.level1;
  if (level <= 6) return MunchkinColors.level5;
  return MunchkinColors.level10;
}

export default function GameScreen() {
  const router = useRouter();
  const { session, localPlayer } = useGameStore();

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

  const otherPlayers = session.players.filter(p => p.id !== localPlayer.id);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Partida en Curso</Text>
        <Text style={styles.headerSubtitle}>
          {session.players.length} jugadores
        </Text>
      </View>

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

      {/* Local Player (Editable) */}
      <View style={styles.localSection}>
        <Text style={styles.sectionTitle}>Tu Personaje</Text>
        <LocalPlayerControls player={localPlayer} />
      </View>

      {/* Other Players */}
      {otherPlayers.length > 0 && (
        <View style={styles.othersSection}>
          <Text style={styles.sectionTitle}>Otros Jugadores</Text>
          <FlatList
            data={otherPlayers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PlayerCard player={item} isLocal={false} />
            )}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.playersList}
          />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
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
    </SafeAreaView>
  );
}

// Local Player Controls (editable)
function LocalPlayerControls({ player }: { player: Player }) {
  const { setPlayerLevel, setPlayerGear } = useGameStore();
  const router = useRouter();
  const combatStrength = player.level + player.gearBonus;

  return (
    <View style={styles.localPlayerCard}>
      <View style={styles.playerHeader}>
        <Text style={styles.playerName}>
          {player.name} {player.isHost ? '👑' : ''}
        </Text>
      </View>

      {/* Editable Stats */}
      <View style={styles.editableStats}>
        {/* Level Control */}
        <View style={styles.statControl}>
          <Text style={styles.statControlLabel}>Nivel</Text>
          <View style={styles.counterRow}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setPlayerLevel(player.level - 1)}
              disabled={player.level <= 1}
            >
              <Text style={styles.counterButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.counterValue, { color: getLevelColor(player.level) }]}>
              {player.level}
            </Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setPlayerLevel(player.level + 1)}
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
              onPress={() => setPlayerGear(player.gearBonus - 1)}
              disabled={player.gearBonus <= 0}
            >
              <Text style={styles.counterButtonText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.counterValue}>+{player.gearBonus}</Text>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={() => setPlayerGear(player.gearBonus + 1)}
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
});
