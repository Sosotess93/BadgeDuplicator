/*
 * Filename: NFCStatusAnimation.ts
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Saturday November 23rd 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Saturday, 23rd November 2024 12:52:01 am
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../styles/colors';
import { NFCReadingStatus } from '../services/NFCService';

interface Props {
    status: NFCReadingStatus;
}

export const NFCStatusAnimation: React.FC<Props> = ({ status }) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (status.stage === 'DETECTING') {
            // Animation de rotation continue
            Animated.loop(
                Animated.sequence([
                    Animated.timing(rotateAnim, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.linear,
                        useNativeDriver: true
                    }),
                    Animated.timing(rotateAnim, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true
                    })
                ])
            ).start();

            // Animation de pulsation
            Animated.loop(
                Animated.sequence([
                    Animated.timing(scaleAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true
                    }),
                    Animated.timing(scaleAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true
                    })
                ])
            ).start();
        } else {
            // Arrêt des animations si le statut change
            rotateAnim.setValue(0);
            scaleAnim.setValue(1);
        }
    }, [status.stage]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    const getStatusColor = () => {
        switch (status.stage) {
            case 'ERROR':
                return COLORS.error;
            case 'COMPLETE':
                return COLORS.success;
            default:
                return COLORS.primary;
        }
    };

    return (
        <View style= { styles.container } >
        <Animated.View
        style={
        [
            styles.circle,
            {
                borderColor: getStatusColor(),
                transform: [
                    { rotate },
                    { scale: scaleAnim }
                ]
            }
        ]
    }
      >
        {(status.stage === 'READING' || status.stage === 'DECODING') && (
            <View style={ [styles.progressRing, { borderColor: getStatusColor() }] }>
                <Text style={ styles.progressText }>
                    { status.progress || 0 } %
                    </Text>
                    </View>
        )}
</Animated.View>

    < Text style = { [styles.statusText, { color: getStatusColor() }]} >
        { status.message || '' }
        </Text>

{
    status.stage === 'ERROR' && (
        <Text style={ styles.errorText }>
            Tapez pour réessayer
                </Text>
      )
}
</View>
  );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    circle: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    progressRing: {
        position: 'absolute',
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressText: {
        fontSize: 24,
        color: COLORS.text,
        fontWeight: 'bold',
    },
    statusText: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 10,
    },
    errorText: {
        fontSize: 14,
        color: COLORS.error,
        marginTop: 5,
    },
});