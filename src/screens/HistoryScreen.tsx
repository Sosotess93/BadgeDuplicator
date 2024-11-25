/*
 * Filename: HistoryScreen.tsx
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Thursday November 21st 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Thursday, 21st November 2024 6:31:18 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

// src/screens/HistoryScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../styles/colors';
import { useBadgeHistory } from '../stores/BadgeHistoryStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BadgeInfo } from '../services/NFCService';

// Interface pour un élément de l'historique
interface HistoryItem extends BadgeInfo {
    id: string;
    timestamp: number;
}

export function HistoryScreen() {
    const { history, removeEntry, clearHistory } = useBadgeHistory();

    const renderItem = ({ item }: { item: HistoryItem }) => (
        <View style={styles.historyItem}>
            <View style={styles.historyItemContent}>
                <Text style={styles.historyItemType}>{item.type}</Text>
                <Text style={styles.historyItemDate}>
                    {format(item.timestamp, 'dd MMM yyyy HH:mm', { locale: fr })}
                </Text>
                <Text style={styles.historyItemDetails}>
                    {item.nbBlocks} blocs, {item.nbSectors} secteurs
                </Text>
            </View>
            <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeEntry(item.id)}
            >
                <Text style={styles.deleteButtonText}>×</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={history}
                renderItem={renderItem}
                keyExtractor={(item: HistoryItem) => item.id}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        Aucun historique disponible
                    </Text>
                }
            />

            {history.length > 0 && (
                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearHistory}
                >
                    <Text style={styles.clearButtonText}>
                        Effacer tout l'historique
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    historyItem: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: COLORS.surface,
        marginHorizontal: 15,
        marginVertical: 5,
        borderRadius: 10,
        alignItems: 'center',
    },
    historyItemContent: {
        flex: 1,
    },
    historyItemType: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    historyItemDate: {
        fontSize: 14,
        color: COLORS.text,
        opacity: 0.7,
    },
    historyItemDetails: {
        fontSize: 14,
        color: COLORS.text,
        marginTop: 4,
    },
    deleteButton: {
        padding: 10,
    },
    deleteButtonText: {
        fontSize: 24,
        color: COLORS.error,
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: COLORS.text,
        opacity: 0.5,
    },
    clearButton: {
        backgroundColor: COLORS.error,
        margin: 15,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    clearButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
});