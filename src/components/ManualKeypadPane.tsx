import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CurrencyDisplay } from './CurrencyDisplay';
import { useRatesStore } from '../store/useRatesStore';
import * as Haptics from 'expo-haptics';

export function ManualKeypadPane() {
  const [inputValue, setInputValue] = useState<string>('0');
  const { vibrationEnabled } = useRatesStore();

  const handlePress = (value: string) => {
    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputValue((prev) => {
      if (prev === '0') {
        if (value === '00' || value === '0') return '0';
        return value;
      }
      if (prev.length > 8) return prev;
      return prev + value;
    });
  };

  const handleBackspace = () => {
    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setInputValue((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  };

  const handleClear = () => {
    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setInputValue('0');
  };

  const numericValue = parseInt(inputValue, 10);

  const KeyButton = ({ label, onPress, isSpecial }: { label: string, onPress?: () => void, isSpecial?: boolean }) => (
    <TouchableOpacity 
      style={[styles.keyButton, isSpecial && styles.specialKey]} 
      onPress={onPress || (() => handlePress(label))}
    >
      <Text style={[styles.keyText, isSpecial && styles.specialKeyText]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <CurrencyDisplay amount={numericValue} />
      
      <View style={styles.keypad}>
        <View style={styles.row}>
          <KeyButton label="1" />
          <KeyButton label="2" />
          <KeyButton label="3" />
        </View>
        <View style={styles.row}>
          <KeyButton label="4" />
          <KeyButton label="5" />
          <KeyButton label="6" />
        </View>
        <View style={styles.row}>
          <KeyButton label="7" />
          <KeyButton label="8" />
          <KeyButton label="9" />
        </View>
        <View style={styles.row}>
          <KeyButton label="C" onPress={handleClear} isSpecial={true} />
          <KeyButton label="0" />
          <KeyButton label="00" />
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.keyButton, styles.backspaceBtn]} onPress={handleBackspace}>
            <Text style={styles.keyText}>⌫ Effacer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
    justifyContent: 'center',
  },
  keypad: {
    marginTop: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  keyButton: {
    flex: 1,
    backgroundColor: '#252525',
    aspectRatio: 1.6,
    marginHorizontal: 6,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  specialKey: {
    backgroundColor: '#332222',
  },
  specialKeyText: {
    color: '#FF5252',
  },
  backspaceBtn: {
    backgroundColor: '#2A1F1F',
    aspectRatio: undefined,
    paddingVertical: 14,
    borderColor: '#522222',
  },
  keyText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
