/*
 * Filename: MifareService.ts
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Saturday November 23rd 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Saturday, 23rd November 2024 1:51:18 am
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */
// src/services/MifareService.ts

import NfcManager, { NfcTech, TagEvent } from 'react-native-nfc-manager';

export interface ReadingSectorInfo {
    sectorNumber: number;
    state: 'pending' | 'authenticating' | 'reading' | 'success' | 'failed';
    message: string;
    keyFound?: 'A' | 'B' | null;
}

export interface SectorKey {
    keyA?: number[];
    keyB?: number[];
}

export interface Block {
    data: number[];
    blockIndex: number;
}

export interface Sector {
    sectorIndex: number;
    blocks: Block[];
    key?: SectorKey;
}

export interface DumpData {
    sectors: Sector[];
    isComplete: boolean;
    type: string;
    totalBlocks: number;
}

export class MifareService {
    private static instance: MifareService;
    private validKeys: Map<number, SectorKey> = new Map();
    private preferedKeys: number[][] = [];

    private readonly defaultKeys: number[][] = [
        [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF],
        [0xA0, 0xA1, 0xA2, 0xA3, 0xA4, 0xA5],
        [0xD3, 0xF7, 0xD3, 0xF7, 0xD3, 0xF7],
        [0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
    ];

    // Ajout des clés de l'API
    private apiKeys: number[][] = [];
    private keysLoaded = false;

    private constructor() {
        this.loadApiKeys();
    }

    public async initialize(tag: TagEvent): Promise<void> {
        try {
            // Demander la technologie Mifare Classic
            await NfcManager.requestTechnology(NfcTech.MifareClassic);
            console.log('Technologie Mifare Classic activée');

            // Si on n'a pas encore chargé les clés API, le faire maintenant
            if (this.apiKeys.length === 0) {
                await this.loadApiKeys();
            }
        } catch (error) {
            console.error('Erreur initialisation MifareService:', error);
            throw error;
        }
    }

    private async loadApiKeys() {
        if (this.keysLoaded) return;

        try {
            console.log('Chargement des clés API...');
            const response = await fetch('https://izybadge.fr/scripts/izybadge/api-android.php?cle=1');
            const data = await response.text();

            if (response.status === 200 && data.length > 12) {
                // Décodage comme dans le code Java
                const decodedKeys = this.decodeApiKeys(data);
                // Grouper les clés comme dans le code Java
                this.groupKeys(decodedKeys);
                this.keysLoaded = true;
                console.log(`Clés API chargées: ${this.apiKeys.length} clés`);
            }
        } catch (error) {
            console.error('Erreur chargement clés API:', error);
        }
    }

    private groupKeys(decodedKeys: number[][]) {
        let currentGroup: number[][] = [];
        decodedKeys.forEach(key => {
            currentGroup.push(key);
            if (currentGroup.length >= 6) {
                this.apiKeys.push(...currentGroup);
                currentGroup = [];
            }
        });
        if (currentGroup.length > 0) {
            this.apiKeys.push(...currentGroup);
        }
    }

    private async tryAuthentication(sector: number, key: number[], keyType: 'A' | 'B'): Promise<boolean> {
        try {
            console.log(`Essai authentification secteur ${sector} avec clé ${keyType}:`, key);
            const firstBlock = sector * 4;
            const cmd = keyType === 'A' ? 0x60 : 0x61;
            await NfcManager.transceive([cmd, firstBlock, ...key]);

            // Si l'authentification réussit, stocker la clé
            if (keyType === 'A') {
                this.validKeys.set(sector, { keyA: key });
            } else {
                this.validKeys.set(sector, { keyB: key });
            }

            console.log(`✅ Authentification réussie secteur ${sector} avec clé ${keyType}`);
            return true;
        } catch (error) {
            return false;
        }
    }

    private decodeApiKeys(encodedKeys: string): number[][] {
        const replacements: { [key: string]: string } = {
            '!': '0', '#': '1', ':': '2', '$': '3', '^': '4',
            'Z': '5', 'x': '6', '/': '7', '&': '8', '@': '9',
            '(': 'a', ']': 'b', '[': 'c', 'y': 'd', '*': 'e', 'g': 'f'
        };

        // Décodage comme dans votre code Java
        let decodedString = encodedKeys;
        Object.entries(replacements).forEach(([key, value]) => {
            decodedString = decodedString.split(key).join(value);
        });

        // Convertir en tableau de clés
        return decodedString
            .split('u')
            .filter(key => key.length === 12)
            .map(key => {
                const bytes: number[] = [];
                for (let i = 0; i < key.length; i += 2) {
                    bytes.push(parseInt(key.substr(i, 2), 16));
                }
                return bytes;
            });
    }

    public static getInstance(): MifareService {
        if (!MifareService.instance) {
            MifareService.instance = new MifareService();
        }
        return MifareService.instance;
    }

    private async readBlock(blockIndex: number): Promise<number[]> {
        try {
            // Commande READ pour Mifare Classic
            const response = await NfcManager.transceive([0x30, blockIndex]);
            return Array.from(response);
        } catch (error) {
            console.error(`Erreur lecture bloc ${blockIndex}:`, error);
            throw error;
        }
    }

    private async authenticateBlock(blockIndex: number, key: number[], keyType: 'A' | 'B'): Promise<boolean> {
        try {
            const command = keyType === 'A' ? 0x60 : 0x61;
            await NfcManager.transceive([command, blockIndex, ...key]);
            console.log(`Authentification réussie avec clé ${keyType}:`, key);
            return true;
        } catch (error) {
            //console.log(`Échec authentification avec clé ${keyType}:`, key);
            return false;
        }
    }

    private async authenticateSector(sectorIndex: number): Promise<SectorKey | null> {
        console.log(`\nAuthentification secteur ${sectorIndex}...`);

        // 1. Essayer les clés déjà validées
        const validKey = this.validKeys.get(sectorIndex);
        if (validKey) {
            console.log('Utilisation d\'une clé précédemment validée');
            return validKey;
        }

        // 2. Essayer les clés par défaut
        for (const key of this.defaultKeys) {
            if (await this.tryAuthentication(sectorIndex, key, 'A')) {
                return { keyA: key };
            }
            if (await this.tryAuthentication(sectorIndex, key, 'B')) {
                return { keyB: key };
            }
        }

        // 3. Essayer les clés préférées
        for (const key of this.preferedKeys) {
            if (await this.tryAuthentication(sectorIndex, key, 'A')) {
                return { keyA: key };
            }
            if (await this.tryAuthentication(sectorIndex, key, 'B')) {
                return { keyB: key };
            }
        }

        // 4. Essayer les clés API
        for (const key of this.apiKeys) {
            if (await this.tryAuthentication(sectorIndex, key, 'A')) {
                return { keyA: key };
            }
            if (await this.tryAuthentication(sectorIndex, key, 'B')) {
                return { keyB: key };
            }
        }

        console.log(`❌ Aucune clé trouvée pour le secteur ${sectorIndex}`);
        return null;
    }

    private async readSector(sectorIndex: number, key: SectorKey): Promise<Sector | null> {
        try {
            const firstBlock = sectorIndex * 4;
            const blocks: Block[] = [];

            // Lire les 4 blocs du secteur
            for (let i = 0; i < 4; i++) {
                const blockIndex = firstBlock + i;
                try {
                    const data = await this.readBlock(blockIndex);
                    blocks.push({
                        blockIndex,
                        data
                    });
                } catch (error) {
                    console.error(`Erreur lecture bloc ${blockIndex}:`, error);
                    throw error;
                }
            }

            return {
                sectorIndex,
                blocks,
                key
            };
        } catch (error) {
            console.error(`Erreur lecture secteur ${sectorIndex}:`, error);
            return null;
        }
    }

    public async readEntireCard(
        onProgress: (progress: number, sectorInfo: ReadingSectorInfo) => void
    ): Promise<DumpData> {
        const dump: DumpData = {
            sectors: [],
            isComplete: false,
            type: 'mc1k',
            totalBlocks: 64
        };

        try {
            console.log('\n=== DÉBUT LECTURE BADGE ===');
            console.log(`Type de badge détecté: ${dump.type}`);

            const totalSectors = 16;
            let sectorsRead = 0;
            let sectorsSuccessful = 0;

            for (let sectorIndex = 0; sectorIndex < totalSectors; sectorIndex++) {
                console.log(`\n🔍 [${sectorsRead + 1}/${totalSectors}] Lecture secteur ${sectorIndex}`);

                try {
                    const key = await this.authenticateSector(sectorIndex);

                    if (!key) {
                        console.log(`⚠️ Secteur ${sectorIndex}: Accès impossible - Aucune clé valide`);
                        continue;
                    }

                    const sectorData = await this.readSector(sectorIndex, key);
                    if (sectorData) {
                        dump.sectors.push(sectorData);
                        sectorsSuccessful++;
                        console.log(`✅ Secteur ${sectorIndex}: Lu avec succès (${sectorsSuccessful} secteurs lus)`);
                    }

                } catch (error) {
                    console.log(`❌ Secteur ${sectorIndex}: Erreur de lecture`);
                }

                sectorsRead++;
                onProgress(
                    (sectorsRead / totalSectors) * 100,
                    {
                        sectorNumber: sectorIndex,
                        state: dump.sectors.some(s => s.sectorIndex === sectorIndex) ? 'success' : 'failed',
                        message: `Secteur ${sectorIndex}: ${dump.sectors.some(s => s.sectorIndex === sectorIndex) ? 'Lu' : 'Échec'}`,
                        keyFound: dump.sectors.find(s => s.sectorIndex === sectorIndex)?.key?.keyA ? 'A' : 'B'
                    }
                );
            }

            console.log('\n=== RÉSUMÉ DE LECTURE ===');
            console.log(`Total secteurs lus: ${sectorsSuccessful}/${totalSectors}`);
            console.log(`Taux de réussite: ${Math.round((sectorsSuccessful / totalSectors) * 100)}%`);
            console.log('=====================\n');

            dump.isComplete = sectorsSuccessful > 0;
            return dump;

        } catch (error) {
            console.error('Erreur lecture complète:', error);
            throw error;
        }
    }

    public async writeBlock(blockIndex: number, data: number[]): Promise<boolean> {
        try {
            const sectorIndex = Math.floor(blockIndex / 4);
            const key = await this.authenticateSector(sectorIndex);

            if (!key) {
                console.error(`Pas de clé valide pour le secteur ${sectorIndex}`);
                return false;
            }

            // Commande WRITE pour Mifare Classic
            await NfcManager.transceive([0xA0, blockIndex, ...data]);
            console.log(`Bloc ${blockIndex} écrit avec succès`);
            return true;
        } catch (error) {
            console.error(`Erreur écriture bloc ${blockIndex}:`, error);
            return false;
        }
    }
}

export default MifareService;