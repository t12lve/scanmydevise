import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useRatesStore } from '../store/useRatesStore';
import * as Haptics from 'expo-haptics';
import { Settings, RefreshCw } from 'lucide-react-native';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  const { 
    lastUpdated, 
    updateRatesFromAPI, 
    baseCurrency, 
    targetCurrency, 
    swapCurrencies,
    vibrationEnabled 
  } = useRatesStore();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdate = async () => {
    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsUpdating(true);
    try {
      await updateRatesFromAPI();
      if (vibrationEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      if (vibrationEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSwap = () => {
    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swapCurrencies();
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/logo.png')} 
        style={styles.logo} 
        resizeMode="contain" 
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.swapChip} onPress={handleSwap}>
          <Text style={styles.swapText}>{baseCurrency} → {targetCurrency}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={handleUpdate} disabled={isUpdating}>
          {isUpdating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <RefreshCw size={16} color="#FFF" />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconBtn} onPress={onOpenSettings}>
          <Settings size={16} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 44,
    paddingBottom: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 100,
  },
  logo: {
    width: 72,
    height: 26,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swapChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  swapText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBtnText: {
    fontSize: 14,
  },
});
