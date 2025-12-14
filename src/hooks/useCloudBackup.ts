/**
 * React hook for cloud backup functionality
 */

import { useCallback, useEffect, useState } from 'react';
import { BackupData, cloudBackupService } from '../services/cloudBackup';

export interface UseCloudBackupReturn {
    isAuthenticated: boolean;
    userEmail: string | null;
    isLoading: boolean;
    lastBackupTime: number | null;
    backupInfo: BackupData | null;
    signIn: () => Promise<boolean>;
    signOut: () => Promise<void>;
    backup: () => Promise<boolean>;
    restore: () => Promise<boolean>;
    refreshBackupInfo: () => Promise<void>;
}

export function useCloudBackup(): UseCloudBackupReturn {
    const [isAuthenticated, setIsAuthenticated] = useState(cloudBackupService.isAuthenticated);
    const [userEmail, setUserEmail] = useState(cloudBackupService.userEmail);
    const [isLoading, setIsLoading] = useState(false);
    const [lastBackupTime, setLastBackupTime] = useState(cloudBackupService.lastBackupTime);
    const [backupInfo, setBackupInfo] = useState<BackupData | null>(null);

    const refreshState = useCallback(() => {
        setIsAuthenticated(cloudBackupService.isAuthenticated);
        setUserEmail(cloudBackupService.userEmail);
        setLastBackupTime(cloudBackupService.lastBackupTime);
    }, []);

    const refreshBackupInfo = useCallback(async () => {
        const info = await cloudBackupService.getBackupInfo();
        setBackupInfo(info);
    }, []);

    useEffect(() => {
        refreshState();
        refreshBackupInfo();
    }, [refreshState, refreshBackupInfo]);

    const signIn = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            const result = await cloudBackupService.signIn();
            refreshState();
            await refreshBackupInfo();
            return result;
        } finally {
            setIsLoading(false);
        }
    }, [refreshState, refreshBackupInfo]);

    const signOut = useCallback(async (): Promise<void> => {
        setIsLoading(true);
        try {
            await cloudBackupService.signOut();
            refreshState();
            setBackupInfo(null);
        } finally {
            setIsLoading(false);
        }
    }, [refreshState]);

    const backup = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            const result = await cloudBackupService.backup();
            if (result) {
                refreshState();
                await refreshBackupInfo();
            }
            return result;
        } finally {
            setIsLoading(false);
        }
    }, [refreshState, refreshBackupInfo]);

    const restore = useCallback(async (): Promise<boolean> => {
        setIsLoading(true);
        try {
            return await cloudBackupService.restore();
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        isAuthenticated,
        userEmail,
        isLoading,
        lastBackupTime,
        backupInfo,
        signIn,
        signOut,
        backup,
        restore,
        refreshBackupInfo,
    };
}
