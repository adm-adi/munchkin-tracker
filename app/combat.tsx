import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { DeathOverlay, FleeRollUI } from '@/src/components/CombatDeath';
import { searchMonsters } from '@/src/data/monsters';
import { calculateMonsterStrength, calculatePlayerStrength, useGameStore } from '@/src/stores/gameStore';
import { CombatMonster, Monster, Player } from '@/src/types/game';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CombatScreen() {
    const router = useRouter();
    const {
        session,
        localPlayer,
        startCombat,
        addMonsterToCombat,
        removeMonsterFromCombat,
        addHelperToCombat,
        removeHelperFromCombat,
        resolveCombat,
        cancelCombat,
        getAllMonsters,
        killPlayer,
    } = useGameStore();

    const [showMonsterModal, setShowMonsterModal] = useState(false);
    const [showHelperModal, setShowHelperModal] = useState(false);
    const [showFleeUI, setShowFleeUI] = useState(false);
    const [showDeathOverlay, setShowDeathOverlay] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Start combat if not already started
    useEffect(() => {
        if (session && !session.currentCombat && localPlayer) {
            startCombat();
        }
    }, [session, localPlayer]);

    if (!session || !localPlayer) {
        return (
            <SafeAreaView style={styles.container}>
                <Text style={styles.errorText}>No hay partida activa</Text>
            </SafeAreaView>
        );
    }

    const combat = session.currentCombat;
    const mainPlayer = session.players.find(p => p.id === combat?.mainPlayerId) || localPlayer;
    const helpers = combat?.helperIds.map(id => session.players.find(p => p.id === id)).filter(Boolean) as Player[] || [];
    const combatants = [mainPlayer, ...helpers];

    const playerStrength = combat ? calculatePlayerStrength(mainPlayer, helpers, combat) : mainPlayer.level + mainPlayer.gearBonus;
    const monsterStrength = combat ? calculateMonsterStrength(combat.monsters, combatants, combat) : 0;

    const isWinning = playerStrength > monsterStrength;
    const monsters = getAllMonsters();
    const filteredMonsters = searchQuery ? searchMonsters(searchQuery) : monsters;

    const handleAddMonster = (monster: Monster) => {
        addMonsterToCombat(monster);
        setShowMonsterModal(false);
        setSearchQuery('');
    };

    const handleAddHelper = (player: Player) => {
        addHelperToCombat(player.id);
        setShowHelperModal(false);
    };

    const handleVictory = () => {
        Alert.alert(
            '¡Victoria!',
            `Has derrotado a ${combat?.monsters.length || 0} monstruo(s).\n+${combat?.monsters.reduce((sum, m) => sum + m.monster.levelsGranted, 0) || 0} nivel(es)`,
            [{
                text: 'Genial!', onPress: () => {
                    resolveCombat(true);
                    router.back();
                }
            }]
        );
    };

    const handleDefeat = () => {
        const badStuff = combat?.monsters.map(m => m.monster.badStuff).join('\n• ') || '';
        Alert.alert(
            'Derrota',
            `Mal Rollo:\n• ${badStuff}`,
            [{
                text: 'Entendido', onPress: () => {
                    resolveCombat(false);
                    router.back();
                }
            }]
        );
    };

    const handleCancel = () => {
        cancelCombat();
        router.back();
    };

    // Check if any monster's bad stuff is death
    const isBadStuffDeath = combat?.monsters.some(
        m => m.monster.badStuff?.toLowerCase().includes('muerte') ||
            m.monster.badStuff?.toLowerCase().includes('mueres') ||
            m.monster.badStuff?.toLowerCase().includes('morirás')
    ) || false;

    const combinedBadStuff = combat?.monsters.map(m => m.monster.badStuff).filter(Boolean).join('\n• ') || '';

    const handleFleeAttempt = () => {
        setShowFleeUI(true);
    };

    const handleFleeSuccess = () => {
        resolveCombat(false); // Fled = not victory but no bad stuff
        router.back();
    };

    const handleFleeFail = () => {
        if (isBadStuffDeath && localPlayer) {
            // Kill the main player and any helpers
            killPlayer(mainPlayer.id);
            helpers.forEach(h => killPlayer(h.id));
            setShowDeathOverlay(true);
        } else {
            // Just show bad stuff
            Alert.alert(
                'Huida Fallida',
                `No has podido huir.\n\nMal Rollo:\n• ${combinedBadStuff}`,
                [{
                    text: 'Entendido',
                    onPress: () => {
                        resolveCombat(false);
                        router.back();
                    }
                }]
            );
        }
    };

    const handleDeathDismiss = () => {
        setShowDeathOverlay(false);
        resolveCombat(false);
        router.back();
    };

    const availableHelpers = session.players.filter(
        p => p.id !== mainPlayer.id && !helpers.find(h => h.id === p.id)
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.closeButton} onPress={handleCancel}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.title}>⚔️ Combate</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Combat Arena */}
                <View style={styles.arena}>
                    {/* Player Side */}
                    <View style={styles.side}>
                        <Text style={styles.sideLabel}>JUGADORES</Text>
                        <View style={[styles.strengthBox, isWinning && styles.winningBox]}>
                            <Text style={styles.strengthValue}>{playerStrength}</Text>
                        </View>

                        {/* Combatants */}
                        <View style={styles.combatants}>
                            <CombatantCard player={mainPlayer} isMain />
                            {helpers.map(helper => (
                                <CombatantCard
                                    key={helper.id}
                                    player={helper}
                                    onRemove={() => removeHelperFromCombat(helper.id)}
                                />
                            ))}

                            {availableHelpers.length > 0 && (
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => setShowHelperModal(true)}
                                >
                                    <Text style={styles.addButtonText}>+ Ayudante</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    {/* VS Divider */}
                    <View style={styles.vsDivider}>
                        <Text style={styles.vsText}>VS</Text>
                    </View>

                    {/* Monster Side */}
                    <View style={styles.side}>
                        <Text style={styles.sideLabel}>MONSTRUOS</Text>
                        <View style={[styles.strengthBox, !isWinning && combat?.monsters.length ? styles.winningBox : styles.losingBox]}>
                            <Text style={styles.strengthValue}>{monsterStrength}</Text>
                        </View>

                        {/* Monsters */}
                        <View style={styles.monsters}>
                            {combat?.monsters.map((cm, index) => (
                                <MonsterCombatCard
                                    key={`${cm.monster.id}-${index}`}
                                    combatMonster={cm}
                                    onRemove={() => removeMonsterFromCombat(index)}
                                />
                            ))}

                            <TouchableOpacity
                                style={styles.addButton}
                                onPress={() => setShowMonsterModal(true)}
                            >
                                <Text style={styles.addButtonText}>+ Monstruo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Result Preview */}
                {combat?.monsters.length ? (
                    <View style={[styles.resultPreview, isWinning ? styles.resultWin : styles.resultLose]}>
                        <Text style={styles.resultIcon}>{isWinning ? '✓' : '✗'}</Text>
                        <Text style={styles.resultText}>
                            {isWinning
                                ? `¡Ganando por ${playerStrength - monsterStrength}!`
                                : `Perdiendo por ${monsterStrength - playerStrength}`
                            }
                        </Text>
                    </View>
                ) : null}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.fleeButton]}
                    onPress={handleFleeAttempt}
                    disabled={!combat?.monsters.length}
                >
                    <Text style={styles.actionButtonText}>🏃 Huir</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.defeatButton]}
                    onPress={handleDefeat}
                    disabled={!combat?.monsters.length}
                >
                    <Text style={styles.actionButtonText}>💀 Derrota</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionButton, styles.victoryButton, !isWinning && styles.actionButtonDisabled]}
                    onPress={handleVictory}
                    disabled={!isWinning || !combat?.monsters.length}
                >
                    <Text style={styles.actionButtonText}>🏆 Victoria</Text>
                </TouchableOpacity>
            </View>

            {/* Flee Roll UI */}
            <FleeRollUI
                visible={showFleeUI}
                onFleeSuccess={handleFleeSuccess}
                onFleeFail={handleFleeFail}
                onClose={() => setShowFleeUI(false)}
                monsterBadStuff={combinedBadStuff}
                isBadStuffDeath={isBadStuffDeath}
            />

            {/* Death Overlay */}
            <DeathOverlay
                visible={showDeathOverlay}
                onDismiss={handleDeathDismiss}
                playerName={localPlayer?.name || ''}
            />

            {/* Monster Selection Modal */}
            <Modal
                visible={showMonsterModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowMonsterModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seleccionar Monstruo</Text>
                            <TouchableOpacity onPress={() => setShowMonsterModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar monstruo..."
                            placeholderTextColor={MunchkinColors.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />

                        <FlatList
                            data={filteredMonsters}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.monsterItem}
                                    onPress={() => handleAddMonster(item)}
                                >
                                    <View style={styles.monsterItemMain}>
                                        <Text style={styles.monsterName}>{item.name}</Text>
                                        <Text style={styles.monsterLevel}>Nivel {item.level}</Text>
                                    </View>
                                    {item.bonuses.length > 0 && (
                                        <Text style={styles.monsterBonuses}>
                                            {item.bonuses.map(b => `+${b.value} vs ${b.target}`).join(', ')}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}
                            style={styles.monsterList}
                        />
                    </View>
                </View>
            </Modal>

            {/* Helper Selection Modal */}
            <Modal
                visible={showHelperModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowHelperModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Añadir Ayudante</Text>
                            <TouchableOpacity onPress={() => setShowHelperModal(false)}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={availableHelpers}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.helperItem}
                                    onPress={() => handleAddHelper(item)}
                                >
                                    <Text style={styles.helperName}>{item.name}</Text>
                                    <Text style={styles.helperStrength}>
                                        Fuerza: {item.level + item.gearBonus}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No hay jugadores disponibles</Text>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

function CombatantCard({
    player,
    isMain,
    onRemove
}: {
    player: Player;
    isMain?: boolean;
    onRemove?: () => void;
}) {
    const strength = player.level + player.gearBonus;

    return (
        <View style={[styles.combatantCard, isMain && styles.mainCombatant]}>
            <View style={styles.combatantInfo}>
                <Text style={styles.combatantName} numberOfLines={1}>
                    {player.name} {isMain ? '⚔️' : '🛡️'}
                </Text>
                <Text style={styles.combatantStrength}>+{strength}</Text>
            </View>
            {!isMain && onRemove && (
                <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                    <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

function MonsterCombatCard({
    combatMonster,
    onRemove
}: {
    combatMonster: CombatMonster;
    onRemove: () => void;
}) {
    const totalLevel = combatMonster.monster.level + combatMonster.enhancers;

    return (
        <View style={styles.monsterCard}>
            <View style={styles.monsterInfo}>
                <Text style={styles.monsterCardName} numberOfLines={1}>
                    {combatMonster.monster.name}
                </Text>
                <Text style={styles.monsterCardLevel}>Nv. {totalLevel}</Text>
            </View>
            <TouchableOpacity style={styles.removeButton} onPress={onRemove}>
                <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: MunchkinColors.backgroundDark,
    },
    errorText: {
        color: MunchkinColors.textSecondary,
        textAlign: 'center',
        marginTop: Spacing.xl,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
    },
    closeButton: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        backgroundColor: MunchkinColors.backgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 20,
        color: MunchkinColors.textSecondary,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    content: {
        flex: 1,
        padding: Spacing.md,
    },
    arena: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    side: {
        flex: 1,
        alignItems: 'center',
    },
    sideLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: MunchkinColors.textMuted,
        marginBottom: Spacing.xs,
    },
    strengthBox: {
        width: 80,
        height: 80,
        borderRadius: Radius.lg,
        backgroundColor: MunchkinColors.backgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 3,
        borderColor: MunchkinColors.textMuted,
    },
    winningBox: {
        borderColor: MunchkinColors.success,
        backgroundColor: MunchkinColors.success + '20',
    },
    losingBox: {
        borderColor: MunchkinColors.danger,
        backgroundColor: MunchkinColors.danger + '20',
    },
    strengthValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    vsDivider: {
        justifyContent: 'center',
        paddingVertical: Spacing.xl,
    },
    vsText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.accent,
    },
    combatants: {
        width: '100%',
        gap: Spacing.xs,
    },
    monsters: {
        width: '100%',
        gap: Spacing.xs,
    },
    combatantCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: MunchkinColors.playerStrength,
    },
    mainCombatant: {
        borderLeftColor: MunchkinColors.primary,
    },
    combatantInfo: {
        flex: 1,
    },
    combatantName: {
        fontSize: 12,
        color: MunchkinColors.textPrimary,
        fontWeight: '600',
    },
    combatantStrength: {
        fontSize: 14,
        color: MunchkinColors.playerStrength,
        fontWeight: 'bold',
    },
    monsterCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.sm,
        borderLeftWidth: 3,
        borderLeftColor: MunchkinColors.monsterStrength,
    },
    monsterInfo: {
        flex: 1,
    },
    monsterCardName: {
        fontSize: 12,
        color: MunchkinColors.textPrimary,
        fontWeight: '600',
    },
    monsterCardLevel: {
        fontSize: 14,
        color: MunchkinColors.monsterStrength,
        fontWeight: 'bold',
    },
    addButton: {
        backgroundColor: MunchkinColors.backgroundMedium,
        borderRadius: Radius.md,
        padding: Spacing.sm,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: MunchkinColors.textMuted,
    },
    addButtonText: {
        color: MunchkinColors.textSecondary,
        textAlign: 'center',
        fontSize: 12,
    },
    removeButton: {
        padding: Spacing.xs,
    },
    removeButtonText: {
        color: MunchkinColors.danger,
        fontSize: 16,
    },
    resultPreview: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.md,
        borderRadius: Radius.lg,
        marginTop: Spacing.lg,
        gap: Spacing.sm,
    },
    resultWin: {
        backgroundColor: MunchkinColors.success + '30',
    },
    resultLose: {
        backgroundColor: MunchkinColors.danger + '30',
    },
    resultIcon: {
        fontSize: 24,
        color: MunchkinColors.textPrimary,
    },
    resultText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    actions: {
        flexDirection: 'row',
        padding: Spacing.md,
        gap: Spacing.md,
    },
    actionButton: {
        flex: 1,
        paddingVertical: Spacing.lg,
        borderRadius: Radius.lg,
        alignItems: 'center',
    },
    actionButtonDisabled: {
        opacity: 0.5,
    },
    defeatButton: {
        backgroundColor: MunchkinColors.danger,
    },
    victoryButton: {
        backgroundColor: MunchkinColors.success,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: MunchkinColors.backgroundMedium,
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        maxHeight: '80%',
        padding: Spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    modalClose: {
        fontSize: 24,
        color: MunchkinColors.textSecondary,
        padding: Spacing.sm,
    },
    searchInput: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
        fontSize: 16,
        color: MunchkinColors.textPrimary,
        marginBottom: Spacing.md,
    },
    monsterList: {
        maxHeight: 400,
    },
    monsterItem: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
    },
    monsterItemMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    monsterName: {
        fontSize: 16,
        color: MunchkinColors.textPrimary,
        fontWeight: '600',
        flex: 1,
    },
    monsterLevel: {
        fontSize: 16,
        color: MunchkinColors.monsterStrength,
        fontWeight: 'bold',
    },
    monsterBonuses: {
        fontSize: 12,
        color: MunchkinColors.warning,
        marginTop: Spacing.xs,
    },
    helperItem: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    helperName: {
        fontSize: 16,
        color: MunchkinColors.textPrimary,
        fontWeight: '600',
    },
    helperStrength: {
        fontSize: 14,
        color: MunchkinColors.playerStrength,
        fontWeight: 'bold',
    },
    emptyText: {
        color: MunchkinColors.textMuted,
        textAlign: 'center',
        padding: Spacing.lg,
    },
    fleeButton: {
        backgroundColor: MunchkinColors.warning,
    },
});
