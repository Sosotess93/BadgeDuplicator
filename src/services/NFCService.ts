/*
 * Filename: NFCService.ts
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Friday November 22nd 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Friday, 22nd November 2024 11:22:00 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */


// src/services/NFCService.ts

import NfcManager, { NfcTech, NfcEvents, TagEvent } from 'react-native-nfc-manager';
import MifareService, { DumpData } from './MifareService';

export enum BadgeType {
    MC1K = 'mc1k',    // Mifare Classic 1K
    MC2K = 'mc2k',    // Mifare Classic 2K
    MC4K = 'mc4k',    // Mifare Classic 4K
    MC320 = 'mc320',  // Mifare Classic 320
    MU64 = 'mu64',    // Mifare Ultralight 64
    MU192 = 'mu192',  // Mifare Ultralight 192
    UNKNOWN = 'unknown'
}

export interface BadgeInfo {
    type: BadgeType;
    blockSize: number;
    nbBlocks: number;
    nbSectors: number;
}

export interface NFCReadingStatus {
    stage: 'STARTING' | 'DETECTING' | 'READING' | 'DECODING' | 'COMPLETE' | 'ERROR';
    progress?: number;
    message?: string;
    dumpData?: DumpData;
}

export class NFCService {
    private static instance: NFCService;
    private statusCallback?: (status: NFCReadingStatus) => void;
    private tagCallback?: (dump: DumpData) => void;
    private mifare: MifareService;

    private readonly badgeConfigs: { [key in BadgeType]: BadgeInfo } = {
        [BadgeType.MC1K]: {
            type: BadgeType.MC1K,
            blockSize: 16,
            nbBlocks: 64,
            nbSectors: 16
        },
        [BadgeType.MC2K]: {
            type: BadgeType.MC2K,
            blockSize: 32,
            nbBlocks: 128,
            nbSectors: 16
        },
        [BadgeType.MC4K]: {
            type: BadgeType.MC4K,
            blockSize: 40,
            nbBlocks: 256,
            nbSectors: 16
        },
        [BadgeType.MC320]: {
            type: BadgeType.MC320,
            blockSize: 5,
            nbBlocks: 20,
            nbSectors: 16
        },
        [BadgeType.MU64]: {
            type: BadgeType.MU64,
            blockSize: 1,
            nbBlocks: 4,
            nbSectors: 4
        },
        [BadgeType.MU192]: {
            type: BadgeType.MU192,
            blockSize: 1,
            nbBlocks: 48,
            nbSectors: 4
        },
        [BadgeType.UNKNOWN]: {
            type: BadgeType.UNKNOWN,
            blockSize: 0,
            nbBlocks: 0,
            nbSectors: 0
        }
    };

    private constructor() {
        this.mifare = MifareService.getInstance();
    }

    public static getInstance(): NFCService {
        if (!NFCService.instance) {
            NFCService.instance = new NFCService();
        }
        return NFCService.instance;
    }

    public async initialize(): Promise<boolean> {
        try {
            const supported = await NfcManager.isSupported();
            if (supported) {
                await NfcManager.start();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to initialize NFC', error);
            return false;
        }
    }

    public async isEnabled(): Promise<boolean> {
        try {
            const enabled = await NfcManager.isEnabled();
            return enabled;
        } catch (error) {
            console.error('Failed to check NFC state', error);
            return false;
        }
    }

    public async startScan(
        onStatus: (status: NFCReadingStatus) => void,
        onTagFound: (dump: DumpData) => void
    ): Promise<void> {
        this.statusCallback = onStatus;
        this.tagCallback = onTagFound;

        try {
            this.statusCallback({
                stage: 'STARTING',
                message: 'Initialisation du lecteur NFC...'
            });

            await NfcManager.start();

            // Important : ajouter le listener pour la détection
            NfcManager.setEventListener(NfcEvents.DiscoverTag, async (tag: TagEvent) => {
                if (tag) {
                    console.log('Tag détecté:', tag);
                    await this.handleTag(tag);
                }
            });

            await NfcManager.registerTagEvent();

            this.statusCallback({
                stage: 'DETECTING',
                message: 'En attente d\'un badge...'
            });
        } catch (error) {
            console.error('Erreur démarrage scan:', error);
            this.statusCallback({
                stage: 'ERROR',
                message: 'Erreur d\'initialisation NFC'
            });
            throw error;
        }
    }

    private async handleTag(tag: TagEvent) {
        try {
            this.statusCallback?.({
                stage: 'READING',
                progress: 0,
                message: 'Badge détecté, lecture en cours...'
            });

            console.log('Début de la lecture du badge');

            // Détecter le type de badge
            const badgeInfo = await this.detectBadgeType(tag);
            console.log('Type de badge détecté:', badgeInfo.type);

            this.statusCallback?.({
                stage: 'DECODING',
                progress: 10,
                message: `Badge ${badgeInfo.type} détecté, lecture des secteurs...`
            });

            // Attendre que MifareService soit prêt
            await this.mifare.initialize(tag);

            // Lecture du badge
            const dumpData = await this.mifare.readEntireCard((progress) => {
                this.statusCallback?.({
                    stage: 'READING',
                    progress: 10 + (progress * 0.9),
                    message: `Lecture des secteurs... ${Math.round(progress)}%`
                });
            });

            if (dumpData.isComplete) {
                this.statusCallback?.({
                    stage: 'COMPLETE',
                    progress: 100,
                    message: 'Lecture terminée avec succès',
                    dumpData
                });
                this.tagCallback?.(dumpData);
            } else {
                throw new Error('Lecture incomplète du badge');
            }

        } catch (error) {
            console.error('Erreur lecture badge:', error);
            this.statusCallback?.({
                stage: 'ERROR',
                message: error instanceof Error ? error.message : 'Erreur de lecture du badge'
            });
        }
    }

    private async detectBadgeType(tag: TagEvent): Promise<BadgeInfo> {
        const techTypes = tag.techTypes || [];

        if (techTypes.includes('android.nfc.tech.MifareClassic')) {
            const tagData = tag as any;
            const size = tagData.maxTransceiveLength || 1024;

            switch (size) {
                case 320: return this.badgeConfigs[BadgeType.MC320];
                case 1024: return this.badgeConfigs[BadgeType.MC1K];
                case 2048: return this.badgeConfigs[BadgeType.MC2K];
                case 4096: return this.badgeConfigs[BadgeType.MC4K];
                default: return this.badgeConfigs[BadgeType.UNKNOWN];
            }
        }

        if (techTypes.includes('android.nfc.tech.MifareUltralight')) {
            const tagData = tag as any;
            const ultraLightType = tagData.ultraLightType || 1;

            return ultraLightType === 1
                ? this.badgeConfigs[BadgeType.MU64]
                : this.badgeConfigs[BadgeType.MU192];
        }

        return this.badgeConfigs[BadgeType.UNKNOWN];
    }

    public async stopScan(): Promise<void> {
        try {
            await NfcManager.unregisterTagEvent();
            NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
            this.statusCallback = undefined;
            this.tagCallback = undefined;
        } catch (error) {
            console.error('Error stopping NFC scan:', error);
        }
    }

    public async cleanUp(): Promise<void> {
        try {
            await NfcManager.cancelTechnologyRequest();
            await this.stopScan();
        } catch (error) {
            console.error('Error cleaning up NFC:', error);
        }
    }
}

export default NFCService;