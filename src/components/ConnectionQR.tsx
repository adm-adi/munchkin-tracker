import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import * as Network from 'expo-network';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface ConnectionQRProps {
    port: number;
}

export function ConnectionQR({ port }: ConnectionQRProps) {
    const [ipAddress, setIpAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const ip = await Network.getIpAddressAsync();
                setIpAddress(ip);
            } catch (e) {
                console.error("Failed to get IP", e);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    if (loading) {
        return <ActivityIndicator color={MunchkinColors.accent} />;
    }

    if (!ipAddress) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No se pudo obtener la IP</Text>
            </View>
        );
    }

    // Format: "munchkin://<ip>:<port>"
    const connectionString = JSON.stringify({ ip: ipAddress, port });

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Escanear para unirse:</Text>
            <View style={styles.qrContainer}>
                <QRCode
                    value={connectionString}
                    size={200}
                    color="black"
                    backgroundColor="white"
                />
            </View>
            <Text style={styles.ipText}>{ipAddress}:{port}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: Spacing.md,
    },
    qrContainer: {
        padding: Spacing.md,
        backgroundColor: 'white',
        borderRadius: Radius.lg,
        marginVertical: Spacing.sm,
    },
    label: {
        color: MunchkinColors.textSecondary,
        marginBottom: Spacing.xs,
    },
    ipText: {
        color: MunchkinColors.textMuted,
        marginTop: Spacing.xs,
        fontSize: 12,
    },
    errorText: {
        color: MunchkinColors.danger,
    }
});
