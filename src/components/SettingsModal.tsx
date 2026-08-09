import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Switch, 
  ScrollView, 
  Image 
} from 'react-native';
import { useRatesStore, SUPPORTED_CURRENCIES } from '../store/useRatesStore';
import * as Haptics from 'expo-haptics';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const {
    soundEnabled,
    vibrationEnabled,
    baseCurrency,
    targetCurrency,
    setSoundEnabled,
    setVibrationEnabled,
    setBaseCurrency,
    setTargetCurrency,
    swapCurrencies,
  } = useRatesStore();

  const handleToggleSound = (val: boolean) => {
    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSoundEnabled(val);
  };

  const handleToggleVibration = (val: boolean) => {
    if (val) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVibrationEnabled(val);
  };

  const handleSwap = () => {
    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swapCurrencies();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Réglages & À propos</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* AUDITIVE & HAPTIC FEEDBACK */}
            <Text style={styles.sectionTitle}>Retour tactile & Sonore</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Effets sonores (Bip au scan)</Text>
              <Switch
                value={soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#444', true: '#208AEF' }}
                thumbColor="#fff"
              />
            </View>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Vibration (Haptique)</Text>
              <Switch
                value={vibrationEnabled}
                onValueChange={handleToggleVibration}
                trackColor={{ false: '#444', true: '#208AEF' }}
                thumbColor="#fff"
              />
            </View>

            {/* CURRENCY PREFERENCES */}
            <Text style={styles.sectionTitle}>Devises de conversion</Text>

            <TouchableOpacity style={styles.swapBtn} onPress={handleSwap}>
              <Text style={styles.swapBtnText}>
                🔄 Inverser le sens : {baseCurrency} ➔ {targetCurrency}
              </Text>
            </TouchableOpacity>

            <Text style={styles.subTitle}>Devise scannée / saisie (Source) :</Text>
            <View style={styles.pickerContainer}>
              {SUPPORTED_CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={`base-${c.code}`}
                  style={[
                    styles.chip,
                    baseCurrency === c.code && styles.activeChip,
                  ]}
                  onPress={() => {
                    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setBaseCurrency(c.code);
                  }}
                >
                  <Text style={[styles.chipText, baseCurrency === c.code && styles.activeChipText]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.subTitle}>Devise résultat (Cible) :</Text>
            <View style={styles.pickerContainer}>
              {SUPPORTED_CURRENCIES.map((c) => (
                <TouchableOpacity
                  key={`target-${c.code}`}
                  style={[
                    styles.chip,
                    targetCurrency === c.code && styles.activeChip,
                  ]}
                  onPress={() => {
                    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setTargetCurrency(c.code);
                  }}
                >
                  <Text style={[styles.chipText, targetCurrency === c.code && styles.activeChipText]}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ABOUT SECTION */}
            <View style={styles.aboutCard}>
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={styles.aboutVersion}>Scan My Devise (SMD) v1.0.0</Text>
              <Text style={styles.aboutDescription}>
                Application ultra-ergonomique, 100% Offline-First et Privacy-by-Design.
              </Text>
              <Text style={styles.aboutBullet}>🔒 Zero Trackers & Zero Analytics</Text>
              <Text style={styles.aboutBullet}>⚡ Traitement OCR 100% local sur l'appareil</Text>
              <Text style={styles.aboutBullet}>📐 Compatible écrans pliables (Dual-Pane)</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  closeBtn: {
    padding: 8,
  },
  closeText: {
    color: '#AAA',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollBody: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#208AEF',
    marginTop: 16,
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 13,
    color: '#AAA',
    marginTop: 12,
    marginBottom: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  settingLabel: {
    fontSize: 14,
    color: '#DDD',
  },
  swapBtn: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#208AEF',
  },
  swapBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#2C2C2C',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  activeChip: {
    backgroundColor: '#208AEF',
  },
  chipText: {
    color: '#AAA',
    fontSize: 12,
  },
  activeChipText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  aboutCard: {
    backgroundColor: '#121212',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#333',
  },
  logoImage: {
    width: 140,
    height: 48,
    marginBottom: 8,
  },
  aboutVersion: {
    color: '#888',
    fontSize: 12,
    marginBottom: 12,
  },
  aboutDescription: {
    color: '#DDD',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },
  aboutBullet: {
    color: '#AAA',
    fontSize: 12,
    alignSelf: 'flex-start',
    marginVertical: 2,
  },
});
