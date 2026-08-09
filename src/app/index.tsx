import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdaptiveLayout } from '../hooks/useAdaptiveLayout';
import { Header } from '../components/Header';
import { ScannerPane } from '../components/ScannerPane';
import { ManualKeypadPane } from '../components/ManualKeypadPane';
import { SettingsModal } from '../components/SettingsModal';
import { useRatesStore } from '../store/useRatesStore';
import * as Haptics from 'expo-haptics';
import { Camera, Keyboard } from 'lucide-react-native';

export default function IndexScreen() {
  const { isFoldable } = useAdaptiveLayout();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'scanner' | 'manual'>('scanner');
  const [settingsVisible, setSettingsVisible] = useState(false);
  const { vibrationEnabled } = useRatesStore();

  const handleTabChange = (tab: 'scanner' | 'manual') => {
    if (tab !== activeTab) {
      if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveTab(tab);
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* Header floats over camera */}
      <View style={[styles.headerOverlay, { paddingTop: Math.max(insets.top, 10) }]}>
        <Header onOpenSettings={() => setSettingsVisible(true)} />
      </View>
      
      {isFoldable ? (
        <View style={styles.dualPaneContainer}>
          <View style={styles.pane}>
            <ScannerPane />
          </View>
          <View style={styles.separator} />
          <View style={styles.pane}>
            <ManualKeypadPane />
          </View>
        </View>
      ) : (
        <View style={styles.singlePaneContainer}>
          {activeTab === 'scanner' ? <ScannerPane /> : <ManualKeypadPane />}
          
          {/* Floating Navigation Pill */}
          <View style={[styles.floatingNavContainer, { bottom: Math.max(insets.bottom + 16, 32) }]}>
            <View style={styles.floatingNav}>
              <TouchableOpacity 
                style={[styles.navItem, activeTab === 'scanner' && styles.activeNavItem]} 
                onPress={() => handleTabChange('scanner')}
              >
                <Camera size={16} color={activeTab === 'scanner' ? '#FFF' : '#888'} />
                <Text style={[styles.navText, activeTab === 'scanner' && styles.activeNavText]}>
                  Caméra
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.navItem, activeTab === 'manual' && styles.activeNavItem]} 
                onPress={() => handleTabChange('manual')}
              >
                <Keyboard size={16} color={activeTab === 'manual' ? '#FFF' : '#888'} />
                <Text style={[styles.navText, activeTab === 'manual' && styles.activeNavText]}>
                  Clavier
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  dualPaneContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  singlePaneContainer: {
    flex: 1,
  },
  pane: {
    flex: 1,
  },
  separator: {
    width: 2,
    backgroundColor: '#2A2A2A',
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: 24, // Place it nicely at the bottom
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 200, // Above everything including bottom sheet if possible
  },
  floatingNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 20, 20, 0.85)',
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navItem: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 26,
  },
  activeNavItem: {
    backgroundColor: '#208AEF',
  },
  navText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeNavText: {
    color: '#FFF',
  },
});
