/**
 * Firebase Cloud Backup Service
 * Handles backup and restore of game data to/from Firebase
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys that should be backed up
const BACKUP_STORAGE_KEYS = [
    'game-storage',      // Main game store (players, sessions)
    'stats-storage',     // Statistics and history
    'theme-storage',     // User preferences
];

export interface BackupData {
    timestamp: number;
    deviceId: string;
    version: string;
    data: Record<string, any>;
}

export interface CloudBackupService {
    isAuthenticated: boolean;
    userEmail: string | null;
    lastBackupTime: number | null;
    signIn: () => Promise<boolean>;
    signOut: () => Promise<void>;
    backup: () => Promise<boolean>;
    restore: () => Promise<boolean>;
    getBackupInfo: () => Promise<BackupData | null>;
}

// For now, we'll create a mock service that uses AsyncStorage
// to simulate cloud backup. This can be replaced with actual
// Firebase implementation once the Firebase project is configured.

class MockCloudBackupService implements CloudBackupService {
    isAuthenticated = false;
    userEmail: string | null = null;
    lastBackupTime: number | null = null;

    private BACKUP_KEY = 'cloud-backup-data';
    private AUTH_KEY = 'cloud-backup-auth';

    async init(): Promise<void> {
        try {
            const authData = await AsyncStorage.getItem(this.AUTH_KEY);
            if (authData) {
                const parsed = JSON.parse(authData);
                this.isAuthenticated = parsed.isAuthenticated;
                this.userEmail = parsed.userEmail;
                this.lastBackupTime = parsed.lastBackupTime;
            }
        } catch (error) {
            console.error('Failed to init cloud backup service:', error);
        }
    }

    async signIn(): Promise<boolean> {
        // Mock sign-in - in real implementation would use Firebase Auth
        try {
            this.isAuthenticated = true;
            this.userEmail = 'demo@munchkintracker.app';
            await this.saveAuthState();
            return true;
        } catch (error) {
            console.error('Sign in failed:', error);
            return false;
        }
    }

    async signOut(): Promise<void> {
        this.isAuthenticated = false;
        this.userEmail = null;
        this.lastBackupTime = null;
        await this.saveAuthState();
    }

    async backup(): Promise<boolean> {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated');
        }

        try {
            const data: Record<string, any> = {};

            for (const key of BACKUP_STORAGE_KEYS) {
                const value = await AsyncStorage.getItem(key);
                if (value) {
                    data[key] = JSON.parse(value);
                }
            }

            const backupData: BackupData = {
                timestamp: Date.now(),
                deviceId: 'local-device',
                version: '1.9.0',
                data,
            };

            // In real implementation, this would upload to Firestore
            await AsyncStorage.setItem(this.BACKUP_KEY, JSON.stringify(backupData));

            this.lastBackupTime = backupData.timestamp;
            await this.saveAuthState();

            return true;
        } catch (error) {
            console.error('Backup failed:', error);
            return false;
        }
    }

    async restore(): Promise<boolean> {
        if (!this.isAuthenticated) {
            throw new Error('Not authenticated');
        }

        try {
            const backupDataStr = await AsyncStorage.getItem(this.BACKUP_KEY);
            if (!backupDataStr) {
                throw new Error('No backup found');
            }

            const backupData: BackupData = JSON.parse(backupDataStr);

            for (const [key, value] of Object.entries(backupData.data)) {
                await AsyncStorage.setItem(key, JSON.stringify(value));
            }

            return true;
        } catch (error) {
            console.error('Restore failed:', error);
            return false;
        }
    }

    async getBackupInfo(): Promise<BackupData | null> {
        try {
            const backupDataStr = await AsyncStorage.getItem(this.BACKUP_KEY);
            if (!backupDataStr) {
                return null;
            }
            return JSON.parse(backupDataStr);
        } catch (error) {
            console.error('Failed to get backup info:', error);
            return null;
        }
    }

    private async saveAuthState(): Promise<void> {
        await AsyncStorage.setItem(this.AUTH_KEY, JSON.stringify({
            isAuthenticated: this.isAuthenticated,
            userEmail: this.userEmail,
            lastBackupTime: this.lastBackupTime,
        }));
    }
}

// Singleton instance
export const cloudBackupService = new MockCloudBackupService();

// Initialize on import
cloudBackupService.init();
