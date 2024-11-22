/*
 * Filename: TabNavigator.tsx
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Thursday November 21st 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Thursday, 21st November 2024 6:19:53 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { HomeStack } from './HomeStack';
import { HistoryScreen, ProfileScreen } from '../screens';
import { COLORS } from '../styles/colors';
import { RootTabParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<RootTabParamList>();

export function TabNavigator() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    switch (route.name) {
                        case 'Home':
                            iconName = focused ? 'home' : 'home-outline';
                            break;
                        case 'History':
                            iconName = focused ? 'time' : 'time-outline';
                            break;
                        case 'Profile':
                            iconName = focused ? 'person' : 'person-outline';
                            break;
                        default:
                            iconName = 'help-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: COLORS.textLight,
                headerShown: false,
            })}>
            <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{ title: 'Accueil' }}
            />
            <Tab.Screen
                name="History"
                component={HistoryScreen}
                options={{ title: 'Historique' }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: 'Profil' }}
            />
        </Tab.Navigator>
    );
}