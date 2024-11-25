/*
 * Filename: useNFC.ts
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Friday November 22nd 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Friday, 22nd November 2024 11:22:11 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */


import { useState, useEffect, useCallback } from 'react';
import NFCService, { BadgeInfo } from '../services/NFCService';
import { NFCReadingStatus, NFCError, NFCState } from '../types/nfc.types';
import { DumpData } from '../services/MifareService';

// interface NFCState {
//     isSupported: boolean;
//     isEnabled: boolean;
//     isScanning: boolean;
//     status: NFCReadingStatus;
//     lastBadgeInfo: BadgeInfo | null;
//     error: NFCError | null;
// }

export const useNFC = () => {
    const [state, setState] = useState<NFCState>({
        isSupported: false,
        isEnabled: false,
        isScanning: false,
        status: {
            stage: 'STARTING',
            message: 'Initialisation...',
        },
        lastBadgeInfo: null,
        error: null,
    });

    const nfcService = NFCService.getInstance();

    const handleError = (error: Error | string): NFCError => {
        const errorMessage = error instanceof Error ? error.message : error;

        if (errorMessage.includes('TAG_LOST')) {
            return {
                code: 'TAG_LOST',
                message: 'Le badge a été retiré trop tôt'
            };
        } else if (errorMessage.includes('AUTH')) {
            return {
                code: 'AUTH_FAILED',
                message: 'Impossible d\'authentifier le badge'
            };
        } else {
            return {
                code: 'UNKNOWN',
                message: errorMessage
            };
        }
    };

    const startScan = useCallback(async () => {
        try {
            setState(prev => ({
                ...prev,
                isScanning: true,
                error: null
            }));

            await nfcService.startScan(
                // Status callback
                (status) => {
                    setState(prev => ({
                        ...prev,
                        status,
                        error: status.stage === 'ERROR'
                            ? handleError(status.message || 'Erreur inconnue')
                            : null,
                    }));

                    // Redémarrer automatiquement le scan après une lecture complète
                    if (status.stage === 'COMPLETE') {
                        setTimeout(() => {
                            startScan();
                        }, 2000);
                    }
                },
                // Tag callback
                (badgeInfo) => {
                    setState(prev => ({
                        ...prev,
                        lastBadgeInfo: badgeInfo,
                    }));
                }
            );
        } catch (error) {
            const nfcError = handleError(error instanceof Error ? error : 'Erreur de scan');
            setState(prev => ({
                ...prev,
                isScanning: false,
                error: nfcError,
            }));

            // Réessayer automatiquement en cas d'erreur
            setTimeout(() => {
                startScan();
            }, 1000);
        }
    }, []);

    useEffect(() => {
        const initNFC = async () => {
            try {
                const isSupported = await nfcService.initialize();
                const isEnabled = isSupported ? await nfcService.isEnabled() : false;

                setState(prev => ({
                    ...prev,
                    isSupported,
                    isEnabled,
                    error: null,
                }));

                if (isSupported && isEnabled) {
                    startScan();
                } else {
                    setState(prev => ({
                        ...prev,
                        error: handleError(
                            !isSupported
                                ? 'NFC non supporté sur cet appareil'
                                : 'NFC désactivé'
                        )
                    }));
                }
            } catch (error) {
                setState(prev => ({
                    ...prev,
                    error: handleError(error instanceof Error ? error : 'Erreur d\'initialisation NFC'),
                }));
            }
        };

        initNFC();

        return () => {
            nfcService.cleanUp();
        };
    }, []);

    const resetBadgeInfo = useCallback(() => {
        setState(prev => ({ ...prev, lastBadgeInfo: null }));
    }, []);

    const resetError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const stopScan = useCallback(async () => {
        try {
            await nfcService.stopScan();
            setState(prev => ({
                ...prev,
                isScanning: false,
                status: {
                    stage: 'STARTING',
                    message: 'Scan arrêté',
                },
            }));
        } catch (error) {
            setState(prev => ({
                ...prev,
                error: handleError(error instanceof Error ? error : 'Erreur lors de l\'arrêt du scan'),
            }));
        }
    }, []);

    return {
        ...state,
        startScan,
        stopScan,
        resetError,
        resetBadgeInfo,
    };
};

export default useNFC;