import { useCallback, useEffect, useState } from 'react';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device, State } from 'react-native-ble-plx';
import { useGameStore } from '../stores/gameStore';
import { GameSession } from '../types/game';

// Munchkin Tracker BLE Service UUID
const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';
const SESSION_CHAR_UUID = '12345678-1234-5678-1234-56789abcdef1';

export interface BluetoothState {
    isEnabled: boolean;
    isScanning: boolean;
    isAdvertising: boolean;
    isConnected: boolean;
    discoveredDevices: Device[];
    connectedDevice: Device | null;
    error: string | null;
}

export interface UseBluetoothResult {
    state: BluetoothState;
    startHosting: () => Promise<void>;
    stopHosting: () => void;
    scanForGames: () => Promise<void>;
    connectToHost: (device: Device) => Promise<void>;
    disconnect: () => void;
    sendGameState: (session: GameSession) => void;
}

const bleManager = new BleManager();

export function useBluetooth(): UseBluetoothResult {
    const [state, setState] = useState<BluetoothState>({
        isEnabled: false,
        isScanning: false,
        isAdvertising: false,
        isConnected: false,
        discoveredDevices: [],
        connectedDevice: null,
        error: null,
    });

    const { session, updateSession, localPlayer } = useGameStore();

    // Request Bluetooth permissions (Android 12+)
    const requestPermissions = useCallback(async (): Promise<boolean> => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
                    PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                ]);

                const allGranted = Object.values(granted).every(
                    (result) => result === PermissionsAndroid.RESULTS.GRANTED
                );

                if (!allGranted) {
                    setState(prev => ({ ...prev, error: 'Bluetooth permissions required' }));
                    return false;
                }
                return true;
            } catch (error) {
                console.error('Permission request error:', error);
                return false;
            }
        }
        return true;
    }, []);

    // Check Bluetooth state
    useEffect(() => {
        const subscription = bleManager.onStateChange((bleState) => {
            setState(prev => ({
                ...prev,
                isEnabled: bleState === State.PoweredOn,
            }));
        }, true);

        return () => subscription.remove();
    }, []);

    // Scan for games (client mode)
    const scanForGames = useCallback(async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const bleState = await bleManager.state();
        if (bleState !== State.PoweredOn) {
            Alert.alert('Bluetooth', 'Por favor, activa el Bluetooth');
            return;
        }

        setState(prev => ({ ...prev, isScanning: true, discoveredDevices: [], error: null }));

        bleManager.startDeviceScan(
            [SERVICE_UUID],
            { allowDuplicates: false },
            (error, device) => {
                if (error) {
                    console.error('Scan error:', error);
                    setState(prev => ({ ...prev, isScanning: false, error: error.message }));
                    return;
                }

                if (device && device.name?.includes('Munchkin')) {
                    setState(prev => {
                        const exists = prev.discoveredDevices.some(d => d.id === device.id);
                        if (exists) return prev;
                        return {
                            ...prev,
                            discoveredDevices: [...prev.discoveredDevices, device],
                        };
                    });
                }
            }
        );

        // Stop scanning after 10 seconds
        setTimeout(() => {
            bleManager.stopDeviceScan();
            setState(prev => ({ ...prev, isScanning: false }));
        }, 10000);
    }, [requestPermissions]);

    // Connect to a host device
    const connectToHost = useCallback(async (device: Device) => {
        try {
            bleManager.stopDeviceScan();
            setState(prev => ({ ...prev, isScanning: false }));

            const connectedDevice = await device.connect();
            await connectedDevice.discoverAllServicesAndCharacteristics();

            setState(prev => ({
                ...prev,
                isConnected: true,
                connectedDevice: connectedDevice,
            }));

            // Listen for game state updates
            connectedDevice.monitorCharacteristicForService(
                SERVICE_UUID,
                SESSION_CHAR_UUID,
                (error, characteristic) => {
                    if (error) {
                        console.error('Monitor error:', error);
                        return;
                    }

                    if (characteristic?.value) {
                        try {
                            const sessionData = JSON.parse(
                                Buffer.from(characteristic.value, 'base64').toString('utf-8')
                            );
                            updateSession(sessionData);
                        } catch (e) {
                            console.error('Parse error:', e);
                        }
                    }
                }
            );

        } catch (error) {
            console.error('Connection error:', error);
            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Connection failed'
            }));
        }
    }, [updateSession]);

    // Start hosting (server mode) - Note: BLE peripheral mode is limited in RN
    const startHosting = useCallback(async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        // Note: react-native-ble-plx doesn't fully support peripheral mode
        // For full P2P, we'd need a native module or different approach
        // For now, we'll use a workaround where the host also scans

        setState(prev => ({ ...prev, isAdvertising: true }));

        // The host will act as a central device that accepts connections
        // This is a simplified approach - full peripheral advertising needs native code

    }, [requestPermissions]);

    const stopHosting = useCallback(() => {
        setState(prev => ({ ...prev, isAdvertising: false }));
    }, []);

    const disconnect = useCallback(() => {
        if (state.connectedDevice) {
            state.connectedDevice.cancelConnection();
        }
        setState(prev => ({
            ...prev,
            isConnected: false,
            connectedDevice: null,
        }));
    }, [state.connectedDevice]);

    const sendGameState = useCallback((session: GameSession) => {
        // In central mode, we can write to the peripheral
        // This would be used by clients to send updates to host
        if (state.connectedDevice) {
            const data = Buffer.from(JSON.stringify(session)).toString('base64');
            state.connectedDevice.writeCharacteristicWithResponseForService(
                SERVICE_UUID,
                SESSION_CHAR_UUID,
                data
            ).catch(console.error);
        }
    }, [state.connectedDevice]);

    // Cleanup
    useEffect(() => {
        return () => {
            bleManager.stopDeviceScan();
            if (state.connectedDevice) {
                state.connectedDevice.cancelConnection();
            }
        };
    }, []);

    return {
        state,
        startHosting,
        stopHosting,
        scanForGames,
        connectToHost,
        disconnect,
        sendGameState,
    };
}
