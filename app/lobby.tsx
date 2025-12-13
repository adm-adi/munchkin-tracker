import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Share } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore, Player } from '../store/gameStore'; // Verify path
import { networkManager } from '../utils/NetworkManager'; // Verify path: ../utils -> from app/lobby.tsx -> app/../utils -> root/utils. Correct.

export default function LobbyScreen() {
    const router = useRouter();
    const { players, isHost, hostIp, myId, gameState } = useGameStore();

    useEffect(() => {
        if (gameState === 'GAME') {
            router.replace('/game');
        }
    }, [gameState]);

    const handleStart = () => {
        networkManager.startGame();
    };

    const renderItem = ({ item }: { item: Player }) => (
        <View style={styles.playerRow}>
            <Text style={[styles.playerName, item.id === myId && styles.me]}>
                {item.name} {item.id === myId ? '(You)' : ''}
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Lobby</Text>

            {isHost && (
                <View style={styles.hostInfo}>
                    <Text style={styles.infoLabel}>HOST IP:</Text>
                    <Text style={styles.ipText}>{hostIp}</Text>
                    <Text style={styles.hint}>Tell your friends to join using this IP</Text>
                </View>
            )}

            <Text style={styles.subtitle}>Players ({players.length})</Text>
            <FlatList
                data={players}
                keyExtractor={p => p.id}
                renderItem={renderItem}
                style={styles.list}
            />

            {isHost ? (
                <TouchableOpacity style={styles.btnStart} onPress={handleStart}>
                    <Text style={styles.btnText}>START GAME</Text>
                </TouchableOpacity>
            ) : (
                <Text style={styles.waiting}>Waiting for Host to start...</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        padding: 20,
        paddingTop: 60,
    },
    title: {
        color: '#fff',
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    hostInfo: {
        backgroundColor: '#d63031',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 30,
    },
    infoLabel: {
        color: '#fff',
        fontSize: 16,
        opacity: 0.8,
    },
    ipText: {
        color: '#fff',
        fontSize: 36,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    hint: {
        color: '#ffdddd',
        marginTop: 10,
    },
    subtitle: {
        color: '#ffaa00',
        fontSize: 20,
        marginBottom: 10,
    },
    list: {
        flex: 1,
    },
    playerRow: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    playerName: {
        color: '#fff',
        fontSize: 18,
    },
    me: {
        color: '#0984e3',
        fontWeight: 'bold',
    },
    btnStart: {
        backgroundColor: '#27ae60',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        marginVertical: 20,
    },
    btnText: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    waiting: {
        color: '#aaa',
        textAlign: 'center',
        fontSize: 18,
        marginVertical: 20,
        fontStyle: 'italic',
    }
});
