import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { RACES } from '@/src/data/races';
import { useGameStore } from '@/src/stores/gameStore';
import { Race } from '@/src/types/game';
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

export default function SelectRaceScreen() {
    const router = useRouter();
    const { localPlayer, setPlayerRace } = useGameStore();

    const handleSelectRace = (race: Race | null) => {
        setPlayerRace(race);
        router.back();
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
                <Text style={styles.title}>Seleccionar Raza</Text>
            </View>

            <FlatList
                data={[null, ...RACES.filter(r => r.id !== 'human')]}
                keyExtractor={(item) => item?.id || 'human'}
                renderItem={({ item }) => {
                    const isSelected = item?.id === localPlayer?.race?.id ||
                        (item === null && !localPlayer?.race);

                    return (
                        <TouchableOpacity
                            style={[styles.raceItem, isSelected && styles.raceItemSelected]}
                            onPress={() => handleSelectRace(item)}
                        >
                            <View style={styles.raceInfo}>
                                <Text style={styles.raceName}>
                                    {item?.nameEs || 'Humano'}
                                </Text>
                                <Text style={styles.raceAbility}>
                                    {item?.abilityEs || 'Sin habilidad especial'}
                                </Text>
                            </View>
                            {isSelected && (
                                <Text style={styles.checkmark}>✓</Text>
                            )}
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={styles.list}
            />
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
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    list: {
        padding: Spacing.lg,
        gap: Spacing.sm,
    },
    raceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    raceItemSelected: {
        borderColor: MunchkinColors.primary,
        backgroundColor: MunchkinColors.primary + '20',
    },
    raceInfo: {
        flex: 1,
    },
    raceName: {
        fontSize: 18,
        fontWeight: '600',
        color: MunchkinColors.textPrimary,
    },
    raceAbility: {
        fontSize: 14,
        color: MunchkinColors.textSecondary,
        marginTop: Spacing.xs,
    },
    checkmark: {
        fontSize: 24,
        color: MunchkinColors.primary,
        fontWeight: 'bold',
    },
});
