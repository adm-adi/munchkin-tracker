import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { networkManager } from '../src/utils/NetworkManager';
import { checkForUpdates } from '../src/utils/UpdateManager';

export default function HomeScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [ip, setIp] = useState('');

    const handleHost = async () => {
        if (!name) return Alert.alert("Enter Name", "Please enter your name");
        try {
            await networkManager.startHosting(name);
            router.push('/lobby');
        } catch (e) {
            Alert.alert("Error", "Could not start hosting: " + e);
        }
    };

    const handleJoin = () => {
        if (!name) return Alert.alert("Enter Name", "Please enter your name");
        if (!ip) return Alert.alert("Enter IP", "Please enter Host IP");
        try {
            networkManager.joinGame(ip, name);
            router.push('/lobby');
        } catch (e) {
            Alert.alert("Error", "Could not join: " + e);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Munchkin Tracker</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Your Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter name"
                    placeholderTextColor="#666"
                />
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.btnHost} onPress={handleHost}>
                <Text style={styles.btnText}>HOST GAME</Text>
            </TouchableOpacity>

            <Text style={styles.orText}>- OR -</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Host IP Address</Text>
                <TextInput
                    style={styles.input}
                    value={ip}
                    onChangeText={setIp}
                    placeholder="192.168.1.X"
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                />
            </View>

            <TouchableOpacity style={styles.btnJoin} onPress={handleJoin}>
                <Text style={styles.btnText}>JOIN GAME</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkUpdate} onPress={() => checkForUpdates(true)}>
                <Text style={styles.linkText}>Check for Updates</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center', // Center vertically
        padding: 20,
    },
    title: {
        color: '#ffaa00',
        fontSize: 40,
        fontWeight: 'bold',
        marginBottom: 40,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 20,
    },
    label: {
        color: '#aaa',
        marginBottom: 5,
    },
    input: {
        backgroundColor: '#333',
        color: '#fff',
        padding: 15,
        borderRadius: 10,
        fontSize: 18,
    },
    divider: {
        height: 20,
    },
    btnHost: {
        backgroundColor: '#d63031',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnJoin: {
        backgroundColor: '#0984e3',
        width: '100%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    orText: {
        color: '#aaa',
        marginVertical: 20,
        fontSize: 16,
    },
    linkUpdate: {
        marginTop: 20,
        padding: 10,
    },
    linkText: {
        color: '#aaa',
        textDecorationLine: 'underline',
    }
});
