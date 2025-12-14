import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { useCloudBackup } from '@/src/hooks/useCloudBackup';
import { useSounds } from '@/src/hooks/useSounds';
import { t } from '@/src/i18n';
import { useGameStore } from '@/src/stores/gameStore';
import { useThemeStore } from '@/src/stores/themeStore';
import { APP_CONFIG } from '@/src/types/game';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function SettingsScreen() {
    const router = useRouter();
    const { reset, getAllMonsters, customMonsters } = useGameStore();
    const { isDarkMode, toggleTheme } = useThemeStore();
    const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSounds();
    const {
        isAuthenticated,
        userEmail,
        isLoading,
        lastBackupTime,
        signIn,
        signOut,
        backup,
        restore,
    } = useCloudBackup();

    const appVersion = Constants.expoConfig?.version || '1.0.0';

    const handleBackup = async () => {
        if (!isAuthenticated) {
            const success = await signIn();
            if (!success) {
                Alert.alert('Error', 'No se pudo iniciar sesión');
                return;
            }
        }

        const success = await backup();
        if (success) {
            Alert.alert('Éxito', 'Copia de seguridad guardada correctamente');
        } else {
            Alert.alert('Error', 'No se pudo guardar la copia de seguridad');
        }
    };

    const handleRestore = async () => {
        Alert.alert(
            'Restaurar datos',
            '¿Estás seguro? Esto reemplazará todos tus datos actuales.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Restaurar',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await restore();
                        if (success) {
                            Alert.alert('Éxito', 'Datos restaurados. Reinicia la app para ver los cambios.');
                        } else {
                            Alert.alert('Error', 'No se pudo restaurar los datos');
                        }
                    },
                },
            ]
        );
    };

    const handleSignOut = async () => {
        await signOut();
        Alert.alert('Sesión cerrada', 'Has cerrado sesión correctamente');
    };

    const handleCheckUpdates = async () => {
        try {
            const response = await fetch(
                `https://api.github.com/repos/${APP_CONFIG.GITHUB_OWNER}/${APP_CONFIG.GITHUB_REPO}/releases/latest`
            );

            if (!response.ok) {
                throw new Error('No se pudo comprobar actualizaciones');
            }

            const release = await response.json();
            const latestVersion = release.tag_name.replace('v', '');

            if (latestVersion > appVersion) {
                Alert.alert(
                    t('update_available'),
                    `Nueva versión: ${latestVersion}\n\n${release.body}`,
                    [
                        { text: t('update_later'), style: 'cancel' },
                        {
                            text: t('update_now'),
                            onPress: () => {
                                // Find APK asset
                                const apkAsset = release.assets.find(
                                    (a: any) => a.name.endsWith('.apk')
                                );
                                if (apkAsset) {
                                    Linking.openURL(apkAsset.browser_download_url);
                                }
                            }
                        },
                    ]
                );
            } else {
                Alert.alert('Sin actualizaciones', 'Ya tienes la última versión');
            }
        } catch (error) {
            Alert.alert('Error', 'No se pudo comprobar actualizaciones');
        }
    };

    const handleResetData = () => {
        Alert.alert(
            'Reiniciar datos',
            '¿Estás seguro? Esto eliminará todos los monstruos personalizados y configuraciones.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Reiniciar',
                    style: 'destructive',
                    onPress: () => {
                        reset();
                        Alert.alert('Hecho', 'Se han reiniciado todos los datos');
                    }
                },
            ]
        );
    };

    const handleGitHub = () => {
        Linking.openURL(`https://github.com/${APP_CONFIG.GITHUB_OWNER}/${APP_CONFIG.GITHUB_REPO}`);
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
                <Text style={styles.title}>{t('settings_title')}</Text>
            </View>

            <ScrollView style={styles.content}>
                {/* App Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Aplicación</Text>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Versión</Text>
                        <Text style={styles.infoValue}>{appVersion}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Monstruos base</Text>
                        <Text style={styles.infoValue}>{getAllMonsters().length - customMonsters.length}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Monstruos personalizados</Text>
                        <Text style={styles.infoValue}>{customMonsters.length}</Text>
                    </View>
                </View>

                {/* Appearance & Sound */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Apariencia y Sonido</Text>

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.menuIcon}>🌙</Text>
                            <Text style={styles.menuText}>Modo oscuro</Text>
                        </View>
                        <Switch
                            value={isDarkMode}
                            onValueChange={toggleTheme}
                            trackColor={{ false: '#767577', true: MunchkinColors.primary }}
                            thumbColor={isDarkMode ? MunchkinColors.primaryDark : '#f4f3f4'}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <View style={styles.toggleInfo}>
                            <Text style={styles.menuIcon}>🔊</Text>
                            <Text style={styles.menuText}>Sonidos y vibración</Text>
                        </View>
                        <Switch
                            value={soundEnabled}
                            onValueChange={setSoundEnabled}
                            trackColor={{ false: '#767577', true: MunchkinColors.primary }}
                            thumbColor={soundEnabled ? MunchkinColors.primaryDark : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Updates */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Actualizaciones</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={handleCheckUpdates}>
                        <Text style={styles.menuIcon}>🔄</Text>
                        <Text style={styles.menuText}>{t('check_updates')}</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Data Management */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Datos</Text>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/history' as any)}
                    >
                        <Text style={styles.menuIcon}>📜</Text>
                        <Text style={styles.menuText}>Historial de partidas</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => router.push('/scan-card')}
                    >
                        <Text style={styles.menuIcon}>👹</Text>
                        <Text style={styles.menuText}>{t('manage_monsters')}</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.menuItem, styles.dangerItem]}
                        onPress={handleResetData}
                    >
                        <Text style={styles.menuIcon}>🗑️</Text>
                        <Text style={[styles.menuText, styles.dangerText]}>Reiniciar datos</Text>
                    </TouchableOpacity>
                </View>

                {/* About */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Acerca de</Text>

                    <TouchableOpacity style={styles.menuItem} onPress={handleGitHub}>
                        <Text style={styles.menuIcon}>💻</Text>
                        <Text style={styles.menuText}>GitHub</Text>
                        <Text style={styles.menuArrow}>→</Text>
                    </TouchableOpacity>

                    <View style={styles.aboutText}>
                        <Text style={styles.aboutParagraph}>
                            Munchkin Tracker es una aplicación gratuita para llevar
                            la puntuación de tus partidas de Munchkin de forma colaborativa.
                        </Text>
                        <Text style={styles.aboutParagraph}>
                            Munchkin® es una marca registrada de Steve Jackson Games.
                            Esta aplicación no está afiliada con Steve Jackson Games.
                        </Text>
                    </View>
                </View>
            </ScrollView>
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
    content: {
        flex: 1,
    },
    section: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: MunchkinColors.textMuted,
        textTransform: 'uppercase',
        marginBottom: Spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: MunchkinColors.backgroundCard,
    },
    infoLabel: {
        fontSize: 16,
        color: MunchkinColors.textSecondary,
    },
    infoValue: {
        fontSize: 16,
        color: MunchkinColors.textPrimary,
        fontWeight: '600',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        gap: Spacing.md,
    },
    menuIcon: {
        fontSize: 20,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: MunchkinColors.textPrimary,
    },
    menuArrow: {
        fontSize: 18,
        color: MunchkinColors.textMuted,
    },
    dangerItem: {
        backgroundColor: MunchkinColors.danger + '20',
    },
    dangerText: {
        color: MunchkinColors.danger,
    },
    aboutText: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
    },
    aboutParagraph: {
        fontSize: 14,
        color: MunchkinColors.textSecondary,
        lineHeight: 20,
        marginBottom: Spacing.sm,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    toggleInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
});
