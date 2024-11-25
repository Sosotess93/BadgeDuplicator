/*
 * Filename: HomeStack.tsx
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Thursday November 21st 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Thursday, 21st November 2024 6:22:04 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen, NFCReadScreen, NFCWriteScreen, BadgeDetailScreen } from '../screens';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function HomeStack() {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="HomeScreen"
                component={HomeScreen}
                options={{ title: 'Accueil' }}
            />
            <Stack.Screen
                name="NFCRead"
                component={NFCReadScreen}
                options={{ title: 'Lecture Badge' }}
            />
            <Stack.Screen
                name="NFCWrite"
                component={NFCWriteScreen}
                options={{ title: 'Copie Badge' }}
            />
            <Stack.Screen
                name="BadgeDetail"
                component={BadgeDetailScreen}
                options={{
                    title: 'Détails du Badge',
                    // Animation de transition card pour un effet plus fluide
                    animation: 'slide_from_right'
                }}
            />
        </Stack.Navigator>
    );
}