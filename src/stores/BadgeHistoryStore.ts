/*
 * Filename: BadgeHistoryStore.ts
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Saturday November 23rd 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Saturday, 23rd November 2024 1:26:59 am
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

// src/stores/BadgeHistoryStore.ts

// src/stores/BadgeHistoryStore.ts

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BadgeInfo } from '../services/NFCService';

interface HistoryEntry extends BadgeInfo {
    id: string;
    timestamp: number;
}

interface BadgeHistoryState {
    history: HistoryEntry[];
    addEntry: (badge: BadgeInfo) => void;
    removeEntry: (id: string) => void;
    clearHistory: () => void;
}

export const useBadgeHistory = create<BadgeHistoryState>()(
    persist(
        (set) => ({
            history: [],
            addEntry: (badge: BadgeInfo) => {
                const newEntry: HistoryEntry = {
                    ...badge,
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                };

                set((state) => {
                    // Éviter les doublons en vérifiant le timestamp
                    const isDuplicate = state.history.some(
                        entry => Date.now() - entry.timestamp < 1000 // Ignorer les lectures dans la même seconde
                    );

                    if (isDuplicate) return state;

                    // Ajouter la nouvelle entrée au début
                    return {
                        history: [newEntry, ...state.history].slice(0, 50), // Garder les 50 derniers
                    };
                });

                console.log('Badge ajouté à l\'historique:', newEntry); // Debug
            },
            removeEntry: (id: string) =>
                set((state) => ({
                    history: state.history.filter((entry) => entry.id !== id),
                })),
            clearHistory: () => set({ history: [] }),
        }),
        {
            name: 'badge-history',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);

// Debug: Écouter les changements
useBadgeHistory.subscribe((state) => {
    console.log('État de l\'historique mis à jour:', state.history.length, 'entrées');
});