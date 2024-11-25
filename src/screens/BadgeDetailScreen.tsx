/*
 * Filename: BadgeDetailScreen.tsx
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Saturday November 23rd 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Saturday, 23rd November 2024 1:56:07 am
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

// src/screens/BadgeDetailScreen.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS } from '../styles/colors';
import { DumpData, Block } from '../services/MifareService';

interface BadgeDetailScreenProps {
    route: {
        params: {
            dumpData: DumpData;
        };
    };
    navigation: any;
}

export function BadgeDetailScreen({ route, navigation }: BadgeDetailScreenProps) {
    const { dumpData } = route.params;
    const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);

    const handleWriteMode = () => {
        navigation.navigate('BadgeWrite', { dumpData });
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.title}>Détails du Badge</Text>
                    <Text style={styles.subtitle}>
                        Type: {dumpData.type.toUpperCase()}
                    </Text>
                    <Text style={styles.subtitle}>
                        {dumpData.isComplete ? 'Lecture complète' : 'Lecture partielle'}
                    </Text>
                </View>

                {dumpData.sectors.map((sector) => (
                    <View key={sector.sectorIndex} style={styles.sectorContainer}>
                        <Text style={styles.sectorTitle}>
                            Secteur {sector.sectorIndex}
                        </Text>
                        {sector.blocks.map((block) => (
                            <TouchableOpacity
                                key={block.blockIndex}
                                style={styles.blockContainer}
                                onPress={() => setSelectedBlock(block)}
                            >
                                <Text style={styles.blockHeader}>
                                    Bloc {block.blockIndex}
                                </Text>
                                <Text style={styles.blockData}>
                                    {block.data.map(b => b.toString(16).padStart(2, '0')).join(' ')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={styles.writeButton}
                onPress={handleWriteMode}
            >
                <Text style={styles.writeButtonText}>Mode Écriture</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 20,
        backgroundColor: COLORS.surface,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.text,
        opacity: 0.8,
    },
    sectorContainer: {
        marginBottom: 20,
        padding: 10,
        backgroundColor: COLORS.surface,
        marginHorizontal: 10,
        borderRadius: 8,
    },
    sectorTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    blockContainer: {
        backgroundColor: COLORS.background,
        padding: 10,
        borderRadius: 6,
        marginBottom: 5,
    },
    blockHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    blockData: {
        fontFamily: 'monospace',
        color: COLORS.text,
        opacity: 0.8,
    },
    writeButton: {
        backgroundColor: COLORS.primary,
        padding: 15,
        margin: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    writeButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});