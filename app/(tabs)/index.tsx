import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { t } from '@/src/i18n';
import { useGameStore } from '@/src/stores/gameStore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();
  const [showNameModal, setShowNameModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const { localPlayer, createPlayer, createSession } = useGameStore();

  // Check for existing player
  useEffect(() => {
    if (localPlayer) {
      setPlayerName(localPlayer.name);
    }
  }, [localPlayer]);

  const handleCreateGame = async () => {
    if (!localPlayer) {
      setIsJoining(false);
      setShowNameModal(true);
      return;
    }

    try {
      createSession();
      router.push('/lobby');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la partida');
    }
  };

  const handleJoinGame = () => {
    if (!localPlayer) {
      setIsJoining(true);
      setShowNameModal(true);
      return;
    }

    router.push('/join');
  };

  const handleConfirmName = () => {
    if (playerName.trim().length < 2) {
      Alert.alert('Error', 'El nombre debe tener al menos 2 caracteres');
      return;
    }

    createPlayer(playerName.trim());
    setShowNameModal(false);

    if (isJoining) {
      router.push('/join');
    } else {
      createSession();
      router.push('/lobby');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.title}>🗡️ Munchkin</Text>
          <Text style={styles.subtitle}>Tracker</Text>
          <Text style={styles.version}>v1.0.0</Text>
        </View>

        {/* Player Info */}
        {localPlayer && (
          <View style={styles.playerInfo}>
            <Text style={styles.playerLabel}>Jugador:</Text>
            <TouchableOpacity
              style={styles.playerNameButton}
              onPress={() => setShowNameModal(true)}
            >
              <Text style={styles.playerName}>{localPlayer.name}</Text>
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleCreateGame}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[MunchkinColors.primary, MunchkinColors.primaryDark]}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonIcon}>🏰</Text>
              <Text style={styles.buttonText}>{t('create_game')}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleJoinGame}
            activeOpacity={0.8}
          >
            <View style={styles.secondaryButtonInner}>
              <Text style={styles.buttonIcon}>🚪</Text>
              <Text style={styles.secondaryButtonText}>{t('join_game')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Settings Link */}
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
          <Text style={styles.settingsText}>{t('settings')}</Text>
        </TouchableOpacity>
      </View>

      {/* Name Modal */}
      <Modal
        visible={showNameModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNameModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('enter_name')}</Text>

            <TextInput
              style={styles.nameInput}
              value={playerName}
              onChangeText={setPlayerName}
              placeholder={t('player_name')}
              placeholderTextColor={MunchkinColors.textMuted}
              maxLength={20}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowNameModal(false)}
              >
                <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirmName}
              >
                <Text style={styles.confirmButtonText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: MunchkinColors.backgroundDark,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: MunchkinColors.primary,
    textShadowColor: 'rgba(212, 175, 55, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '300',
    color: MunchkinColors.textPrimary,
    marginTop: -8,
  },
  version: {
    fontSize: 14,
    color: MunchkinColors.textMuted,
    marginTop: Spacing.sm,
  },
  playerInfo: {
    backgroundColor: MunchkinColors.backgroundCard,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  playerLabel: {
    color: MunchkinColors.textSecondary,
    fontSize: 14,
  },
  playerNameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  playerName: {
    color: MunchkinColors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  editIcon: {
    fontSize: 14,
  },
  buttons: {
    width: '100%',
    maxWidth: 300,
    gap: Spacing.md,
  },
  primaryButton: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: MunchkinColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  buttonIcon: {
    fontSize: 24,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: MunchkinColors.backgroundDark,
  },
  secondaryButton: {
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: MunchkinColors.primary,
    overflow: 'hidden',
  },
  secondaryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  secondaryButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: MunchkinColors.primary,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xxl,
    padding: Spacing.md,
  },
  settingsIcon: {
    fontSize: 20,
  },
  settingsText: {
    color: MunchkinColors.textSecondary,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: MunchkinColors.backgroundMedium,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: MunchkinColors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  nameInput: {
    backgroundColor: MunchkinColors.backgroundCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 18,
    color: MunchkinColors.textPrimary,
    borderWidth: 1,
    borderColor: MunchkinColors.primary,
    marginBottom: Spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: MunchkinColors.backgroundCard,
  },
  cancelButtonText: {
    color: MunchkinColors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: MunchkinColors.primary,
  },
  confirmButtonText: {
    color: MunchkinColors.backgroundDark,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
