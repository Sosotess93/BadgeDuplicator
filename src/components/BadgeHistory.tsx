/*
 * Filename: BadgeHistory.tsx
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Saturday November 23rd 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Saturday, 23rd November 2024 1:27:27 am
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

// src/components/BadgeHistory.tsx

import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Animated } from 'react-native';
import { COLORS } from '../styles/colors';
import { useBadgeHistory } from '../stores/BadgeHistoryStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface BadgeHistoryProps {
    visible: boolean;
    onClose: () => void;
}

export const BadgeHistory: React.FC<BadgeHistoryProps> = ({ visible, onClose }) => {
    const { history, removeEntry, clearHistory } = useBadgeHistory();
    const slideAnim = React.useRef(new Animated.Value(visible ? 0 : 1)).current;

    React.useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: visible ? 1 : 0,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const renderItem = ({ item }: any) => (
        <Animated.View style={styles.historyItem}>
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
        </Animated.View>
    );

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        {
                            translateY: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [600, 0],
                            }),
                        },
                    ],
                },
            ]}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Historique des badges</Text>
                <TouchableOpacity onPress={onClose}>
                    <Text style={styles.closeButton}>Fermer</Text>
                </TouchableOpacity>
            </View>

            {history.length > 0 ? (
                <>
                    <FlatList
                        data={history}
                        renderItem={renderItem}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.list}
                    />
                    <TouchableOpacity
                        style={styles.clearButton}
                        onPress={clearHistory}
                    >
                        <Text style={styles.clearButtonText}>Effacer l'historique</Text>
                    </TouchableOpacity>
                </>
            ) : (
                <Text style={styles.emptyText}>Aucun badge dans l'historique</Text>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.surface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '80%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    closeButton: {
        fontSize: 16,
        color: COLORS.primary,
    },
    list: {
        paddingBottom: 20,
    },
    historyItem: {
        flexDirection: 'row',
        padding: 15,
        backgroundColor: COLORS.background,
        borderRadius: 10,
        marginBottom: 10,
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
        opacity: 0.8,
    },
    deleteButton: {
        padding: 10,
    },
    deleteButtonText: {
        fontSize: 24,
        color: COLORS.error,
    },
    clearButton: {
        backgroundColor: COLORS.error,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    clearButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: COLORS.text,
        opacity: 0.7,
        marginTop: 20,
    },
});