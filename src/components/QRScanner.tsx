import { MunchkinColors, Radius, Spacing } from '@/constants/theme';
import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { Button, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QRScannerProps {
    visible: boolean;
    onScan: (data: string) => void;
    onClose: () => void;
}

export function QRScanner({ visible, onScan, onClose }: QRScannerProps) {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <Modal visible={visible} animationType="slide">
                <View style={styles.container}>
                    <Text style={styles.text}>Necesitamos permiso de cámara para escanear el QR</Text>
                    <Button onPress={requestPermission} title="Dar Permiso" />
                    <Button onPress={onClose} title="Cancelar" />
                </View>
            </Modal>
        );
    }

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);
        onScan(data);
        // Reset scanned after delay if needed, but usually we close modal
    };

    return (
        <Modal visible={visible} animationType="slide">
            <View style={styles.container}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                />
                <View style={styles.overlay}>
                    <Text style={styles.overlayText}>Escanea el código del Host</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <Text style={styles.closeText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        color: 'white',
        marginBottom: 20,
        textAlign: 'center',
    },
    overlay: {
        position: 'absolute',
        bottom: 50,
        alignItems: 'center',
    },
    overlayText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        backgroundColor: 'rgba(0,0,0,0.6)',
        padding: 10,
        borderRadius: 8,
    },
    closeButton: {
        backgroundColor: MunchkinColors.danger,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: Radius.full,
    },
    closeText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
