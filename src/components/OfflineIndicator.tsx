import { MunchkinColors, Spacing } from '@/constants/theme';
import * as Network from 'expo-network';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface OfflineIndicatorProps {
    showAlways?: boolean;
}

export function OfflineIndicator({ showAlways = false }: OfflineIndicatorProps) {
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Check network status periodically
        const checkNetwork = async () => {
            try {
                const networkState = await Network.getNetworkStateAsync();
                const connected = networkState.isConnected && networkState.isInternetReachable !== false;

                if (!connected && isConnected) {
                    // Just disconnected - fade in
                    setIsConnected(false);
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 300,
                        useNativeDriver: true,
                    }).start();
                } else if (connected && !isConnected) {
                    // Just reconnected - fade out
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }).start(() => setIsConnected(true));
                }
            } catch (e) {
                console.error('Error checking network:', e);
            }
        };

        // Initial check
        checkNetwork();

        // Check every 5 seconds
        const interval = setInterval(checkNetwork, 5000);

        return () => clearInterval(interval);
    }, [fadeAnim, isConnected]);

    // If connected and not showing always, render nothing
    if (isConnected && !showAlways) {
        return null;
    }

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <View style={styles.content}>
                <Text style={styles.icon}>📡</Text>
                <Text style={styles.text}>Sin conexión</Text>
            </View>
        </Animated.View>
    );
}

// Simple hook to check connection status
export function useNetworkStatus() {
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkNetwork = async () => {
            try {
                const networkState = await Network.getNetworkStateAsync();
                setIsConnected(networkState.isConnected ?? true);
                setIsLoading(false);
            } catch (e) {
                setIsLoading(false);
            }
        };

        checkNetwork();
        const interval = setInterval(checkNetwork, 5000);
        return () => clearInterval(interval);
    }, []);

    return { isConnected, isLoading };
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: MunchkinColors.danger,
        paddingVertical: Spacing.sm,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    icon: {
        fontSize: 16,
    },
    text: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
