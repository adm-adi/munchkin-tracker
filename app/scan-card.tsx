import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { CLASSES } from '@/src/data/classes';
import { RACES } from '@/src/data/races';
import { useGameStore } from '@/src/stores/gameStore';
import { Monster, MonsterBonus } from '@/src/types/game';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Bonus target options
const BONUS_TARGETS = [
    { id: 'none', name: 'Ninguno' },
    ...RACES.map(r => ({ id: r.id, name: r.nameEs })),
    ...CLASSES.map(c => ({ id: c.id, name: c.nameEs })),
    { id: 'male', name: 'Hombres' },
    { id: 'female', name: 'Mujeres' },
    { id: 'noClass', name: 'Sin Clase' },
    { id: 'noRace', name: 'Humanos' },
];

export default function ScanCardScreen() {
    const router = useRouter();
    const [permission, requestPermission] = useCameraPermissions();
    const [isScanning, setIsScanning] = useState(false);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [scannedText, setScannedText] = useState('');

    // Manual entry form
    const [monsterName, setMonsterName] = useState('');
    const [monsterLevel, setMonsterLevel] = useState('1');
    const [monsterBadStuff, setMonsterBadStuff] = useState('');
    const [monsterTreasures, setMonsterTreasures] = useState('1');
    const [monsterLevelsGranted, setMonsterLevelsGranted] = useState('1');
    const [monsterBonuses, setMonsterBonuses] = useState<MonsterBonus[]>([]);

    const { addCustomMonster } = useGameStore();

    const handleManualAdd = () => {
        if (!monsterName.trim()) {
            Alert.alert('Error', 'Introduce un nombre para el monstruo');
            return;
        }

        const level = parseInt(monsterLevel) || 1;
        const treasures = parseInt(monsterTreasures) || 1;
        const levelsGranted = parseInt(monsterLevelsGranted) || 1;

        const newMonster: Monster = {
            id: `custom_${Date.now()}`,
            name: monsterName.trim(),
            level,
            expansion: 'custom',
            bonuses: monsterBonuses,
            badStuff: monsterBadStuff.trim() || 'Sin descripción',
            treasures,
            levelsGranted,
        };

        addCustomMonster(newMonster);
        Alert.alert(
            '¡Monstruo añadido!',
            `${newMonster.name} (Nivel ${newMonster.level}) se ha añadido a tu base de datos.`,
            [{ text: 'Genial', onPress: () => router.back() }]
        );
    };

    const handleTakePhoto = async () => {
        setIsScanning(true);

        // Simulate OCR processing
        // In a real implementation, you would:
        // 1. Take a photo with cameraRef.current.takePictureAsync()
        // 2. Send to OCR service (Google Vision, Tesseract, etc.)
        // 3. Parse the result to extract monster data

        setTimeout(() => {
            setIsScanning(false);
            // Show manual entry since OCR is simulated
            Alert.alert(
                'Función OCR',
                'El escáner de cartas requiere un servicio de OCR externo. Por ahora, puedes añadir monstruos manualmente.',
                [
                    { text: 'Cancelar', style: 'cancel' },
                    { text: 'Añadir manualmente', onPress: () => setShowManualEntry(true) },
                ]
            );
        }, 1500);
    };

    // Camera permissions not granted
    if (!permission) {
        return <View style={styles.container} />;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.permissionContainer}>
                    <Text style={styles.permissionIcon}>📷</Text>
                    <Text style={styles.permissionTitle}>Permisos de cámara</Text>
                    <Text style={styles.permissionText}>
                        Necesitamos acceso a la cámara para escanear cartas de monstruos.
                    </Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                        <Text style={styles.permissionButtonText}>Dar permisos</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.manualButton}
                        onPress={() => setShowManualEntry(true)}
                    >
                        <Text style={styles.manualButtonText}>Añadir manualmente</Text>
                    </TouchableOpacity>
                </View>

                <ManualEntryModal
                    visible={showManualEntry}
                    onClose={() => setShowManualEntry(false)}
                    monsterName={monsterName}
                    setMonsterName={setMonsterName}
                    monsterLevel={monsterLevel}
                    setMonsterLevel={setMonsterLevel}
                    monsterBadStuff={monsterBadStuff}
                    setMonsterBadStuff={setMonsterBadStuff}
                    monsterTreasures={monsterTreasures}
                    setMonsterTreasures={setMonsterTreasures}
                    monsterLevelsGranted={monsterLevelsGranted}
                    setMonsterLevelsGranted={setMonsterLevelsGranted}
                    monsterBonuses={monsterBonuses}
                    setMonsterBonuses={setMonsterBonuses}
                    onSubmit={handleManualAdd}
                />
            </SafeAreaView>
        );
    }

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
                <Text style={styles.title}>Escanear Carta</Text>
            </View>

            {/* Camera View */}
            <View style={styles.cameraContainer}>
                <CameraView style={styles.camera}>
                    {/* Overlay frame */}
                    <View style={styles.overlay}>
                        <View style={styles.scanFrame}>
                            <View style={[styles.corner, styles.topLeft]} />
                            <View style={[styles.corner, styles.topRight]} />
                            <View style={[styles.corner, styles.bottomLeft]} />
                            <View style={[styles.corner, styles.bottomRight]} />
                        </View>
                        <Text style={styles.scanHint}>
                            Coloca la carta de monstruo dentro del marco
                        </Text>
                    </View>

                    {/* Scanning overlay */}
                    {isScanning && (
                        <View style={styles.scanningOverlay}>
                            <ActivityIndicator size="large" color={MunchkinColors.primary} />
                            <Text style={styles.scanningText}>Escaneando...</Text>
                        </View>
                    )}
                </CameraView>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.captureButton}
                    onPress={handleTakePhoto}
                    disabled={isScanning}
                >
                    <View style={styles.captureButtonInner} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.manualEntryButton}
                    onPress={() => setShowManualEntry(true)}
                >
                    <Text style={styles.manualEntryIcon}>✏️</Text>
                    <Text style={styles.manualEntryText}>Añadir manualmente</Text>
                </TouchableOpacity>
            </View>

            {/* Manual Entry Modal */}
            <ManualEntryModal
                visible={showManualEntry}
                onClose={() => setShowManualEntry(false)}
                monsterName={monsterName}
                setMonsterName={setMonsterName}
                monsterLevel={monsterLevel}
                setMonsterLevel={setMonsterLevel}
                monsterBadStuff={monsterBadStuff}
                setMonsterBadStuff={setMonsterBadStuff}
                monsterTreasures={monsterTreasures}
                setMonsterTreasures={setMonsterTreasures}
                monsterLevelsGranted={monsterLevelsGranted}
                setMonsterLevelsGranted={setMonsterLevelsGranted}
                monsterBonuses={monsterBonuses}
                setMonsterBonuses={setMonsterBonuses}
                onSubmit={handleManualAdd}
            />
        </SafeAreaView>
    );
}

// Manual Entry Modal Component
function ManualEntryModal({
    visible,
    onClose,
    monsterName,
    setMonsterName,
    monsterLevel,
    setMonsterLevel,
    monsterBadStuff,
    setMonsterBadStuff,
    monsterTreasures,
    setMonsterTreasures,
    monsterLevelsGranted,
    setMonsterLevelsGranted,
    monsterBonuses,
    setMonsterBonuses,
    onSubmit,
}: {
    visible: boolean;
    onClose: () => void;
    monsterName: string;
    setMonsterName: (v: string) => void;
    monsterLevel: string;
    setMonsterLevel: (v: string) => void;
    monsterBadStuff: string;
    setMonsterBadStuff: (v: string) => void;
    monsterTreasures: string;
    setMonsterTreasures: (v: string) => void;
    monsterLevelsGranted: string;
    setMonsterLevelsGranted: (v: string) => void;
    monsterBonuses: MonsterBonus[];
    setMonsterBonuses: (v: MonsterBonus[]) => void;
    onSubmit: () => void;
}) {
    const [showBonusPicker, setShowBonusPicker] = useState(false);
    const [newBonusValue, setNewBonusValue] = useState('3');

    const addBonus = (targetId: string) => {
        if (targetId === 'none') return;
        const target = BONUS_TARGETS.find(t => t.id === targetId);
        if (!target) return;

        const bonus: MonsterBonus = {
            target: targetId as any,
            value: parseInt(newBonusValue) || 3,
        };
        setMonsterBonuses([...monsterBonuses, bonus]);
        setShowBonusPicker(false);
    };

    const removeBonus = (index: number) => {
        setMonsterBonuses(monsterBonuses.filter((_, i) => i !== index));
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Añadir Monstruo</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={styles.modalClose}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Nombre del Monstruo *</Text>
                            <TextInput
                                style={styles.input}
                                value={monsterName}
                                onChangeText={setMonsterName}
                                placeholder="Ej: Dragón Colosal"
                                placeholderTextColor={MunchkinColors.textMuted}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Nivel</Text>
                                <TextInput
                                    style={styles.input}
                                    value={monsterLevel}
                                    onChangeText={setMonsterLevel}
                                    keyboardType="numeric"
                                    placeholder="1"
                                    placeholderTextColor={MunchkinColors.textMuted}
                                />
                            </View>

                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Tesoros</Text>
                                <TextInput
                                    style={styles.input}
                                    value={monsterTreasures}
                                    onChangeText={setMonsterTreasures}
                                    keyboardType="numeric"
                                    placeholder="1"
                                    placeholderTextColor={MunchkinColors.textMuted}
                                />
                            </View>

                            <View style={[styles.formGroup, { flex: 1 }]}>
                                <Text style={styles.label}>Niveles</Text>
                                <TextInput
                                    style={styles.input}
                                    value={monsterLevelsGranted}
                                    onChangeText={setMonsterLevelsGranted}
                                    keyboardType="numeric"
                                    placeholder="1"
                                    placeholderTextColor={MunchkinColors.textMuted}
                                />
                            </View>
                        </View>

                        {/* Bonuses Section */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Bonificaciones (ej: +3 vs Elfos)</Text>
                            {monsterBonuses.map((bonus, index) => (
                                <View key={index} style={styles.bonusRow}>
                                    <Text style={styles.bonusText}>
                                        +{bonus.value} vs {BONUS_TARGETS.find(t => t.id === bonus.target)?.name || bonus.target}
                                    </Text>
                                    <TouchableOpacity onPress={() => removeBonus(index)}>
                                        <Text style={styles.bonusRemove}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}

                            {showBonusPicker ? (
                                <View style={styles.bonusPickerContainer}>
                                    <View style={styles.bonusValueRow}>
                                        <Text style={styles.bonusValueLabel}>+</Text>
                                        <TextInput
                                            style={styles.bonusValueInput}
                                            value={newBonusValue}
                                            onChangeText={setNewBonusValue}
                                            keyboardType="numeric"
                                            placeholder="3"
                                        />
                                        <Text style={styles.bonusValueLabel}>vs</Text>
                                    </View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                        <View style={styles.bonusTargets}>
                                            {BONUS_TARGETS.filter(t => t.id !== 'none').map(target => (
                                                <TouchableOpacity
                                                    key={target.id}
                                                    style={styles.bonusTarget}
                                                    onPress={() => addBonus(target.id)}
                                                >
                                                    <Text style={styles.bonusTargetText}>{target.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={styles.addBonusButton}
                                    onPress={() => setShowBonusPicker(true)}
                                >
                                    <Text style={styles.addBonusText}>+ Añadir bonificación</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.label}>Mal Rollo</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={monsterBadStuff}
                                onChangeText={setMonsterBadStuff}
                                placeholder="Describe qué pasa si pierdes..."
                                placeholderTextColor={MunchkinColors.textMuted}
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                            <Text style={styles.submitButtonText}>Añadir Monstruo</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
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
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    permissionIcon: {
        fontSize: 64,
        marginBottom: Spacing.lg,
    },
    permissionTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
        marginBottom: Spacing.sm,
    },
    permissionText: {
        fontSize: 16,
        color: MunchkinColors.textSecondary,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    permissionButton: {
        backgroundColor: MunchkinColors.primary,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: Radius.lg,
        marginBottom: Spacing.md,
    },
    permissionButtonText: {
        color: MunchkinColors.backgroundDark,
        fontSize: 16,
        fontWeight: 'bold',
    },
    manualButton: {
        padding: Spacing.md,
    },
    manualButtonText: {
        color: MunchkinColors.primary,
        fontSize: 14,
    },
    cameraContainer: {
        flex: 1,
        margin: Spacing.lg,
        borderRadius: Radius.xl,
        overflow: 'hidden',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 280,
        height: 400,
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: MunchkinColors.primary,
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 3,
        borderLeftWidth: 3,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 3,
        borderRightWidth: 3,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 3,
        borderRightWidth: 3,
    },
    scanHint: {
        color: MunchkinColors.textPrimary,
        marginTop: Spacing.lg,
        fontSize: 14,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: Radius.md,
    },
    scanningOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanningText: {
        color: MunchkinColors.textPrimary,
        marginTop: Spacing.md,
        fontSize: 16,
    },
    actions: {
        padding: Spacing.lg,
        alignItems: 'center',
    },
    captureButton: {
        width: 72,
        height: 72,
        borderRadius: Radius.full,
        backgroundColor: MunchkinColors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: Radius.full,
        backgroundColor: MunchkinColors.textPrimary,
        borderWidth: 4,
        borderColor: MunchkinColors.primary,
    },
    manualEntryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        padding: Spacing.md,
    },
    manualEntryIcon: {
        fontSize: 18,
    },
    manualEntryText: {
        color: MunchkinColors.primary,
        fontSize: 14,
        fontWeight: '600',
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
        maxHeight: '85%',
        padding: Spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    modalClose: {
        fontSize: 24,
        color: MunchkinColors.textSecondary,
        padding: Spacing.sm,
    },
    formGroup: {
        marginBottom: Spacing.md,
    },
    formRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    label: {
        fontSize: 14,
        color: MunchkinColors.textSecondary,
        marginBottom: Spacing.xs,
    },
    input: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.md,
        fontSize: 16,
        color: MunchkinColors.textPrimary,
        borderWidth: 1,
        borderColor: MunchkinColors.backgroundCard,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    submitButton: {
        backgroundColor: MunchkinColors.primary,
        borderRadius: Radius.lg,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        marginTop: Spacing.md,
    },
    submitButtonText: {
        color: MunchkinColors.backgroundDark,
        fontSize: 18,
        fontWeight: 'bold',
    },
    bonusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.sm,
        marginTop: Spacing.xs,
    },
    bonusText: {
        color: MunchkinColors.success,
        fontSize: 14,
        fontWeight: '600',
    },
    bonusRemove: {
        color: MunchkinColors.danger,
        fontSize: 18,
        paddingHorizontal: Spacing.sm,
    },
    bonusPickerContainer: {
        marginTop: Spacing.sm,
    },
    bonusValueRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    bonusValueLabel: {
        color: MunchkinColors.textPrimary,
        fontSize: 18,
        fontWeight: 'bold',
    },
    bonusValueInput: {
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.md,
        padding: Spacing.sm,
        width: 50,
        color: MunchkinColors.textPrimary,
        fontSize: 16,
        textAlign: 'center',
    },
    bonusTargets: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    bonusTarget: {
        backgroundColor: MunchkinColors.primary,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    bonusTargetText: {
        color: MunchkinColors.backgroundDark,
        fontSize: 12,
        fontWeight: '600',
    },
    addBonusButton: {
        marginTop: Spacing.sm,
        padding: Spacing.sm,
    },
    addBonusText: {
        color: MunchkinColors.primary,
        fontSize: 14,
    },
});
