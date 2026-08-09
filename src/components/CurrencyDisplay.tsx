import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRatesStore } from '../store/useRatesStore';

interface CurrencyDisplayProps {
  amount: number;
  compact?: boolean;
}

/**
 * Converts and displays a currency amount.
 * - Default mode: large display with source and target on separate lines.
 * - Compact/chip mode: single-line inline display for use in lists or badges.
 */
export function CurrencyDisplay({ amount, compact = false }: CurrencyDisplayProps) {
  const { rates, baseCurrency, targetCurrency } = useRatesStore();
  
  const baseRate = rates[baseCurrency] || 1;
  const targetRate = rates[targetCurrency] || 1;
  
  const eurAmount = amount / baseRate;
  const targetAmount = eurAmount * targetRate;
  
  const fmtTarget = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: targetCurrency,
    maximumFractionDigits: 2,
  }).format(targetAmount);
  
  const fmtSource = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: baseCurrency,
    maximumFractionDigits: 2,
  }).format(amount);

  if (compact) {
    return (
      <View style={styles.chipContainer}>
        <Text style={styles.chipSource}>{fmtSource}</Text>
        <Text style={styles.chipArrow}> → </Text>
        <Text style={styles.chipTarget}>{fmtTarget}</Text>
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      <Text style={styles.sourceText}>{fmtSource}</Text>
      <Text style={styles.targetText}>{fmtTarget}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- Chip mode (single line) ---
  chipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
  },
  chipSource: {
    fontSize: 15,
    color: '#CCC',
    fontWeight: '500',
  },
  chipArrow: {
    fontSize: 14,
    color: '#888',
  },
  chipTarget: {
    fontSize: 17,
    color: '#4CAF50',
    fontWeight: '800',
  },

  // --- Full mode (two lines, for manual keypad) ---
  fullContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(30, 30, 30, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    width: '100%',
  },
  sourceText: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 4,
    fontWeight: '500',
  },
  targetText: {
    fontSize: 42,
    fontWeight: '900',
    color: '#4CAF50',
    letterSpacing: -0.5,
  },
});
