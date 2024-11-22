/*
 * Filename: NFCWriteScreen.tsx
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Thursday November 21st 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Thursday, 21st November 2024 6:30:50 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../styles/colors';

export function NFCWriteScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Écran de duplication NFC</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    text: {
        fontSize: 18,
        color: COLORS.text,
    }
});