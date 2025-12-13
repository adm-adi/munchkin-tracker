import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Player } from '../store/gameStore';
import { ChevronUp, ChevronDown, Sword, Shield } from 'lucide-react-native';

interface PlayerCardProps {
    player: Player;
    isMe: boolean;
    onLevelUp?: () => void;
    onLevelDown?: () => void;
    onGearUp?: () => void;
    onGearDown?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
    player, isMe, onLevelUp, onLevelDown, onGearUp, onGearDown
}) => {
    const totalPower = player.level + player.gear;

    return (
        <View style={[styles.card, isMe && styles.myCard]}>
            <View style={styles.header}>
                <Text style={styles.name}>{player.name}</Text>
                <Text style={styles.totalPower}>Power: {totalPower}</Text>
            </View>

            <View style={styles.statsRow}>
                {/* LEVEL */}
                <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>Level</Text>
                    <Text style={styles.statValue}>{player.level}</Text>
                    {isMe && (
                        <View style={styles.controls}>
                            <TouchableOpacity onPress={onLevelUp} style={styles.btn}><ChevronUp color="#fff" /></TouchableOpacity>
                            <TouchableOpacity onPress={onLevelDown} style={styles.btn}><ChevronDown color="#fff" /></TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* GEAR */}
                <View style={styles.statBlock}>
                    <Text style={styles.statLabel}>Gear</Text>
                    <Text style={styles.statValue}>{player.gear}</Text>
                    {isMe && (
                        <View style={styles.controls}>
                            <TouchableOpacity onPress={onGearUp} style={styles.btn}><ChevronUp color="#fff" /></TouchableOpacity>
                            <TouchableOpacity onPress={onGearDown} style={styles.btn}><ChevronDown color="#fff" /></TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#2b2b2b',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#444',
    },
    myCard: {
        borderColor: '#ffaa00',
        backgroundColor: '#3a3a3a',
        borderWidth: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    name: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    totalPower: {
        color: '#ffaa00',
        fontSize: 20,
        fontWeight: 'bold',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statBlock: {
        alignItems: 'center',
        width: 100,
    },
    statLabel: {
        color: '#aaa',
        fontSize: 14,
    },
    statValue: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginVertical: 4,
    },
    controls: {
        flexDirection: 'row',
        gap: 16,
    },
    btn: {
        backgroundColor: '#555',
        padding: 8,
        borderRadius: 8,
    }
});
