/*
 * Filename: HomeScreen.js
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Thursday November 21st 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Thursday, 21st November 2024 6:10:41 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../components/common/Button';
import { COLORS } from '../styles/colors';
import { RootStackParamList } from '../types/navigation';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HomeScreen'>;
};

export function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Button
        title="Lire un badge"
        onPress={() => navigation.navigate('NFCRead')}
      />
      <Button
        title="Dupliquer un badge"
        onPress={() => navigation.navigate('NFCWrite')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center'
  }
});