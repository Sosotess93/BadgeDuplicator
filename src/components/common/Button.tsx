/*
 * Filename: Button.js
 * Project: /Users/sofiane/Desktop/PROJECT/BadgeDuplicator
 * Created Date: Thursday November 21st 2024
 * Author: Sofiane (sofiane@klark.app)
 * -----
 * Last Modified: Thursday, 21st November 2024 6:09:05 pm
 * Modified By: Sofiane (sofiane@klark.app)
 * -----
 * Copyright (c) 2024 Klark
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, TextStyle, ViewStyle } from 'react-native';
import { COLORS } from '../../styles/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  textStyle?: TextStyle;
  buttonStyle?: ViewStyle;
}

export function Button({
  onPress,
  title,
  disabled,
  textStyle,
  buttonStyle,
  ...props
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, buttonStyle]}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 5,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});