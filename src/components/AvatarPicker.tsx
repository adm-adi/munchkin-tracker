import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import React from 'react';
import {
    FlatList,
    Image,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AVATARS, Avatar, getAvatarById } from '../data/avatars';

interface AvatarPickerProps {
    visible: boolean;
    selectedId?: string;
    onSelect: (avatar: Avatar) => void;
    onClose: () => void;
}

export function AvatarPicker({
    visible,
    selectedId,
    onSelect,
    onClose,
}: AvatarPickerProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Elige tu avatar</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.closeButton}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={AVATARS}
                        numColumns={3}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.grid}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.avatarItem,
                                    selectedId === item.id && styles.avatarItemSelected,
                                ]}
                                onPress={() => {
                                    onSelect(item);
                                    onClose();
                                }}
                            >
                                <Image
                                    source={item.image}
                                    style={styles.avatarImage}
                                    resizeMode="cover"
                                />
                                <Text style={styles.avatarName} numberOfLines={1}>
                                    {item.nameEs}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );
}

// Display component for showing an avatar
interface AvatarDisplayProps {
    avatarId?: string;
    size?: number;
    showBorder?: boolean;
}

export function AvatarDisplay({
    avatarId,
    size = 50,
    showBorder = true,
}: AvatarDisplayProps) {
    const avatar = avatarId ? getAvatarById(avatarId) : null;

    if (!avatar) {
        return (
            <View
                style={[
                    styles.avatarPlaceholder,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    },
                    showBorder && styles.avatarBorder,
                ]}
            >
                <Text style={[styles.placeholderText, { fontSize: size * 0.4 }]}>
                    🎭
                </Text>
            </View>
        );
    }

    return (
        <Image
            source={avatar.image}
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                showBorder && styles.avatarBorder,
            ]}
            resizeMode="cover"
        />
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: MunchkinColors.backgroundDark,
        borderTopLeftRadius: Radius.xl,
        borderTopRightRadius: Radius.xl,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: MunchkinColors.border,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: MunchkinColors.textPrimary,
    },
    closeButton: {
        fontSize: 24,
        color: MunchkinColors.textMuted,
        padding: Spacing.sm,
    },
    grid: {
        padding: Spacing.md,
    },
    avatarItem: {
        flex: 1,
        alignItems: 'center',
        padding: Spacing.sm,
        margin: Spacing.xs,
        backgroundColor: MunchkinColors.backgroundCard,
        borderRadius: Radius.lg,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarItemSelected: {
        borderColor: MunchkinColors.primary,
        backgroundColor: MunchkinColors.primary + '20',
    },
    avatarImage: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: MunchkinColors.backgroundMedium,
    },
    avatarName: {
        fontSize: 11,
        color: MunchkinColors.textSecondary,
        marginTop: Spacing.xs,
        textAlign: 'center',
    },
    avatarPlaceholder: {
        backgroundColor: MunchkinColors.backgroundCard,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarBorder: {
        borderWidth: 2,
        borderColor: MunchkinColors.border,
    },
    placeholderText: {
        color: MunchkinColors.textMuted,
    },
});
