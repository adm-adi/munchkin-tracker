import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useGameStore, Player } from '../store/gameStore';
import { networkManager } from '../utils/NetworkManager';
import { PlayerCard } from '../src/components/PlayerCard'; // Verify path: app/game.tsx -> app/../src -> components. Correct.
import { Sword } from 'lucide-react-native';

export default function GameScreen() {
    const { players, myId, incrementLevel, decrementLevel, incrementGear, decrementGear } = useGameStore();

    const handleUpdate = () => {
        const updatedMe = useGameStore.getState().players.find(p => p.id === myId);
        if (updatedMe) {
            networkManager.broadcastPlayerUpdate(updatedMe);
        }
    };

    const onLevelUp = () => { incrementLevel(); handleUpdate(); };
    const onLevelDown = () => { decrementLevel(); handleUpdate(); };
    const onGearUp = () => { incrementGear(); handleUpdate(); };
    const onGearDown = () => { decrementGear(); handleUpdate(); };

    // Sort: Me first, then by level? Or just stable order?
    // Stable ID order is best to prevent jumping.
    const sortedPlayers = [...players].sort((a, b) => a.id.localeCompare(b.id));

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Munchkin Game</Text>
                <TouchableOpacity style={styles.combatBtn}>
                    <Sword color="#fff" size={24} />
                    {/* Open Combat Modal (TODO) */}
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                {sortedPlayers.map(p => (
                    <PlayerCard
                        key={p.id}
                        player={p}
                        isMe={p.id === myId}
                        onLevelUp={p.id === myId ? onLevelUp : undefined}
                        onLevelDown={p.id === myId ? onLevelDown : undefined}
                        onGearUp={p.id === myId ? onGearUp : undefined}
                        onGearDown={p.id === myId ? onGearDown : undefined}
                    />
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 10,
    },
    title: {
        color: '#ffaa00',
        fontSize: 24,
        fontWeight: 'bold',
    },
    combatBtn: {
        backgroundColor: '#d63031',
        padding: 10,
        borderRadius: 8,
    },
    scroll: {
        padding: 20,
        paddingBottom: 100,
    },
});
