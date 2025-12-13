import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { CLASSES } from '@/src/data/classes';
import { useGameStore } from '@/src/stores/gameStore';
import { GameClass } from '@/src/types/game';
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

export default function SelectClassScreen() {
    const router = useRouter();
    const { localPlayer, setPlayerClass } = useGameStore();

    const handleSelectClass = (gameClass: GameClass | null) => {
        setPlayerClass(gameClass);
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
                <Text style={styles.title}>Seleccionar Clase</Text>
            </View>

            <FlatList
                data={[null, ...CLASSES]}
                keyExtractor={(item) => item?.id || 'none'}
                renderItem={({ item }) => {
                    const isSelected = item?.id === localPlayer?.gameClass?.id ||
                        (item === null && !localPlayer?.gameClass);

                    return (
                        <TouchableOpacity
                            style={[styles.classItem, isSelected && styles.classItemSelected]}
                            onPress={() => handleSelectClass(item)}
                        >
                            <View style={styles.classInfo}>
                                <Text style={styles.className}>
                                    {item?.nameEs || 'Sin Clase'}
                                </Text>
                                <Text style={styles.classAbility}>
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
    classItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        padding: Spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    classItemSelected: {
        borderColor: MunchkinColors.primary,
        backgroundColor: MunchkinColors.primary + '20',
    },
    classInfo: {
        flex: 1,
    },
    className: {
        fontSize: 18,
        fontWeight: '600',
        color: MunchkinColors.textPrimary,
    },
    classAbility: {
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
