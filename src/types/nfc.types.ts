/*
 * Filename: nfc.types.ts
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Friday November 22nd 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Friday, 22nd November 2024 11:22:24 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

// src/types/nfc.types.ts

import MifareService, { DumpData } from '../services/MifareService';

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

export interface NFCState {
    isSupported: boolean;
    isEnabled: boolean;
    isScanning: boolean;
    status: NFCReadingStatus;
    lastBadgeInfo: DumpData | null;  // Changé de BadgeInfo à DumpData
    error: NFCError | null;
}

export interface ReadingSectorInfo {
    sectorNumber: number;
    state: 'pending' | 'authenticating' | 'reading' | 'success' | 'failed';
    message: string;
    keyFound?: 'A' | 'B' | null;
}

// export interface NFCReadingStatus {
//     stage: 'STARTING' | 'DETECTING' | 'READING' | 'DECODING' | 'COMPLETE' | 'ERROR';
//     progress?: number;
//     message?: string;
//     dumpData?: DumpData;
//     currentSector?: ReadingSectorInfo;
//     error?: {
//         code: 'TAG_LOST' | 'AUTH_FAILED' | 'READ_ERROR' | 'UNKNOWN';
//         message: string;
//     };
// }

export type NFCErrorCode = 'TAG_LOST' | 'AUTH_FAILED' | 'READ_ERROR' | 'UNKNOWN';

export interface NFCError {
    code: NFCErrorCode;
    message: string;
}

export interface NFCReadingStatus {
    stage: 'STARTING' | 'DETECTING' | 'READING' | 'DECODING' | 'COMPLETE' | 'ERROR';
    progress?: number;
    message?: string;
    dumpData?: DumpData;
    currentSector?: ReadingSectorInfo;
    error?: NFCError;
}