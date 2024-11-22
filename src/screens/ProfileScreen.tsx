/*
 * Filename: ProfileScreen.tsx
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Thursday November 21st 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Thursday, 21st November 2024 6:31:54 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../styles/colors';

export function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Profil utilisateur</Text>
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
