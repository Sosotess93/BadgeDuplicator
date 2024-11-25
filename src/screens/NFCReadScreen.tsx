/*
 * Filename: NFCReadScreen.tsx
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Thursday November 21st 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Thursday, 21st November 2024 6:29:36 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */
// src/screens/NFCReadScreen.tsx

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../styles/colors';
import { useNFC } from '../hooks/useNFC';
import { NFCStatusAnimation } from '../components/NFCStatusAnimation';
import HapticService from '../services/HapticService';
import { RootStackParamList } from '../types/navigation';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DumpData } from '../services/MifareService';
import { NFCReadingStatus, NFCError } from '../types/nfc.types';


// Définir le type de navigation pour cet écran
type NFCReadScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ReadingStatus = ({ status }: { status: NFCReadingStatus }) => {
    const currentSector = status.currentSector;

    if (!currentSector) return null;

    const getStatusColor = (state: string) => {
        switch (state) {
            case 'success': return COLORS.success;
            case 'failed': return COLORS.error;
            case 'reading': return COLORS.primary;
            default: return COLORS.text;
        }
    };

    return (
        <View style={styles.readingStatusContainer}>
            <Text style={styles.sectorTitle}>
                Secteur {currentSector.sectorNumber} / 15
            </Text>
            <Text style={[
                styles.sectorStatus,
                { color: getStatusColor(currentSector.state) }
            ]}>
                {currentSector.message}
            </Text>
            {currentSector.keyFound && (
                <Text style={styles.keyInfo}>
                    Clé {currentSector.keyFound} trouvée
                </Text>
            )}
        </View>
    );
};

export function NFCReadScreen() {
    const navigation = useNavigation<NFCReadScreenNavigationProp>();
    const {
        isSupported,
        isEnabled,
        status,
        error,
    } = useNFC();;

    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (error && error.code === 'TAG_LOST') {
            Alert.alert(
                'Badge perdu',
                'Le badge a été retiré avant la fin de la lecture. Veuillez réessayer.',
                [{ text: 'OK' }]
            );
        }
    }, [error]);

    // Gérer les effets d'animation
    useEffect(() => {
        if (status.stage === 'DETECTING') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 0.5,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            fadeAnim.setValue(1);
        }
    }, [status.stage]);

    // Gérer la navigation automatique vers les détails
    useEffect(() => {
        const { stage, dumpData } = status;

        if (stage === 'COMPLETE' && dumpData !== undefined) {
            HapticService.getInstance().success();
            setTimeout(() => {
                navigation.navigate('BadgeDetail', {
                    dumpData
                });
            }, 1000);
        }
    }, [status, navigation]);

    if (!isSupported || !isEnabled) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>
                    {!isSupported
                        ? 'NFC n\'est pas supporté sur cet appareil'
                        : 'NFC est désactivé. Veuillez l\'activer dans les paramètres.'
                    }
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.mainContent}>
                <NFCStatusAnimation status={status} />

                <Text style={styles.instructionText}>
                    {status.stage === 'DETECTING'
                        ? 'Approchez un badge du téléphone'
                        : status.message
                    }
                </Text>

                {status.stage === 'READING' && (
                    <ReadingStatus status={status} />
                )}

                {status.progress !== undefined && status.progress > 0 && (
                    <View style={styles.progressContainer}>
                        <View style={[
                            styles.progressBar,
                            { width: `${status.progress}%` }
                        ]} />
                        <Text style={styles.progressText}>
                            {Math.round(status.progress)}%
                        </Text>
                    </View>
                )}
            </View>

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error.message}</Text>
                    <Text style={styles.errorSubtext}>
                        {error.code === 'TAG_LOST'
                            ? 'Replacez le badge et réessayez'
                            : 'Réessayez ou utilisez un autre badge'
                        }
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    instructionText: {
        fontSize: 18,
        color: COLORS.text,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
    },
    progressContainer: {
        width: '80%',
        height: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 10,
        marginTop: 20,
        overflow: 'hidden',
        position: 'relative',
    },
    progressBar: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 10,
        position: 'absolute',
        left: 0,
        top: 0,
    },
    progressText: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        color: COLORS.text,
        fontSize: 12,
        lineHeight: 20,
    },
    errorContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: 'rgba(255, 0, 0, 0.1)',
        alignItems: 'center',
    },
    errorText: {
        color: COLORS.error,
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 5,
    },
    errorSubtext: {
        color: COLORS.error,
        fontSize: 14,
        opacity: 0.8,
    },
    readingStatusContainer: {
        backgroundColor: COLORS.surface,
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        width: '100%',
    },
    sectorTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 5,
    },
    sectorStatus: {
        fontSize: 14,
        marginBottom: 5,
    },
    keyInfo: {
        fontSize: 12,
        color: COLORS.success,
        fontStyle: 'italic',
    },
});