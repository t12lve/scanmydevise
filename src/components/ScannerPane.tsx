import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Dimensions, FlatList, Modal, Pressable, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import TextRecognition from '@react-native-ml-kit/text-recognition';
import { CurrencyDisplay } from './CurrencyDisplay';
import { useRatesStore } from '../store/useRatesStore';
import * as Haptics from 'expo-haptics';
import { Search, Menu, X, Camera } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.75;

interface ScanEntry {
  id: string;
  raw: string;
  amount: number;
  timestamp: number;
}

export function ScannerPane() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedAmount, setScannedAmount] = useState<number>(0);
  const [scanHistory, setScanHistory] = useState<ScanEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  
  const cameraRef = useRef<CameraView>(null);
  const insets = useSafeAreaInsets();
  const { soundEnabled, vibrationEnabled } = useRatesStore();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const toggleDrawer = useCallback((open: boolean) => {
    if (open) setDrawerOpen(true);
    Animated.timing(slideAnim, {
      toValue: open ? 0 : -DRAWER_WIDTH,
      duration: 300,
      easing: Easing.out(Easing.poly(4)),
      useNativeDriver: true,
    }).start(() => {
      if (!open) setDrawerOpen(false);
    });
  }, [slideAnim]);

  const extractPrice = useCallback((text: string): { raw: string; amount: number } | null => {
    const priceMatches = text.match(/\d{1,3}(?:[\s.]\d{3})*[.,]\d{2}/g);
    if (priceMatches && priceMatches.length > 0) {
      let best = { raw: '', amount: 0 };
      for (const m of priceMatches) {
        const cleaned = m.replace(/\s/g, '').replace(',', '.');
        const val = parseFloat(cleaned);
        if (!isNaN(val) && val > best.amount && val >= 0.10 && val < 1000000) {
          best = { raw: m, amount: val };
        }
      }
      if (best.amount > 0) return best;
    }

    const fallbackMatches = text.match(/\b\d{2,}(?:[.,]\d+)?\b/g);
    if (fallbackMatches && fallbackMatches.length > 0) {
      for (const m of fallbackMatches) {
        const cleaned = m.replace(',', '.');
        const val = parseFloat(cleaned);
        if (!isNaN(val) && val >= 1 && val < 1000000) {
          return { raw: m, amount: val };
        }
      }
    }

    return null;
  }, []);

  const handleManualScan = async () => {
    if (!cameraRef.current || isProcessing) return;
    
    if (vibrationEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsProcessing(true);
    
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        shutterSound: soundEnabled,
      });

      if (photo?.uri) {
        const result = await TextRecognition.recognize(photo.uri);
        if (result && result.text) {
          const extracted = extractPrice(result.text);
          
          if (extracted) {
            setScannedAmount(extracted.amount);
            
            setScanHistory(prev => {
              const entry: ScanEntry = {
                id: Date.now().toString(),
                raw: extracted.raw,
                amount: extracted.amount,
                timestamp: Date.now(),
              };
              return [entry, ...prev].slice(0, 20);
            });

            if (vibrationEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } else {
            // No price found
            if (vibrationEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          }
        }
      }
    } catch (e) {
      console.error(e);
      if (vibrationEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderHistoryItem = ({ item }: { item: ScanEntry }) => (
    <View style={styles.historyRow}>
      <View style={styles.historyRawContainer}>
        <Search size={14} color="#888" />
        <Text style={styles.historyRaw}>{item.raw}</Text>
      </View>
      <CurrencyDisplay amount={item.amount} compact={true} />
    </View>
  );

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Permission caméra requise pour scanner.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Autoriser la caméra</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing="back"
        animateShutter={false}
      />

      {/* Viewfinder Overlay (Dimmed outside, clear inside) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.overlayTop} pointerEvents="none" />
        <View style={styles.overlayMiddle} pointerEvents="none">
          <View style={styles.overlaySide} />
          
          <View style={styles.viewfinder}>
            {/* Corner decorations for the viewfinder */}
            <View style={[styles.corner, styles.topLeftCorner]} />
            <View style={[styles.corner, styles.topRightCorner]} />
            <View style={[styles.corner, styles.bottomLeftCorner]} />
            <View style={[styles.corner, styles.bottomRightCorner]} />
          </View>
          
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayBottom} pointerEvents="none" />
        
        {/* Floating Drawer Button (Left edge) */}
        <TouchableOpacity 
          style={[styles.drawerBtn, { top: Math.max(insets.top + 60, 80) }]} 
          onPress={() => toggleDrawer(true)}
        >
          <Menu size={24} color="#FFF" />
        </TouchableOpacity>

        {/* Result Chip — Floating exactly in the middle of the screen (pink zone) */}
        {scannedAmount > 0 && (
          <View style={styles.resultChipContainer} pointerEvents="none">
            <CurrencyDisplay amount={scannedAmount} compact={true} />
          </View>
        )}

        {/* Shutter Button for Manual Scan */}
        <View style={[styles.shutterContainer, { bottom: Math.max(insets.bottom + 90, 110) }]} pointerEvents="box-none">
          <TouchableOpacity 
            style={styles.shutterBtn} 
            onPress={handleManualScan} 
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator color="#000" size="large" />
            ) : (
              <View style={styles.shutterInner} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Left Drawer Modal */}
      <Modal visible={drawerOpen} transparent animationType="none" onRequestClose={() => toggleDrawer(false)}>
        <View style={styles.modalOverlay}>
          {/* Backdrop */}
          <Pressable style={StyleSheet.absoluteFill} onPress={() => toggleDrawer(false)}>
            <Animated.View style={[
              StyleSheet.absoluteFill, 
              { backgroundColor: 'rgba(0,0,0,0.5)', opacity: slideAnim.interpolate({ inputRange: [-DRAWER_WIDTH, 0], outputRange: [0, 1] }) }
            ]} />
          </Pressable>
          
          {/* Drawer Content */}
          <Animated.View style={[
            styles.drawer, 
            { transform: [{ translateX: slideAnim }], paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 20) }
          ]}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Derniers scans</Text>
              <TouchableOpacity onPress={() => toggleDrawer(false)} style={styles.closeBtn}>
                <X size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={scanHistory}
              keyExtractor={(item) => item.id}
              renderItem={renderHistoryItem}
              contentContainerStyle={styles.historyList}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Aucun scan récent.</Text>
              }
            />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const overlayColor = 'rgba(0, 0, 0, 0.75)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  permBtn: {
    backgroundColor: '#208AEF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  permBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Viewfinder Overlay
  overlayTop: {
    flex: 1, 
    backgroundColor: overlayColor,
  },
  overlayBottom: {
    flex: 3.5, 
    backgroundColor: overlayColor,
  },
  overlayMiddle: {
    height: 180, 
    flexDirection: 'row',
  },
  overlaySide: {
    flex: 1,
    backgroundColor: overlayColor,
  },
  viewfinder: {
    width: 320, 
    backgroundColor: 'transparent',
  },
  
  // Viewfinder Corners
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: '#00E676', 
    borderWidth: 0,
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },

  // Result chip (Middle of the screen)
  resultChipContainer: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    transform: [{ translateY: -25 }], 
    zIndex: 50,
  },

  // Drawer Button
  drawerBtn: {
    position: 'absolute',
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 40,
  },

  // Shutter Button
  shutterContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 40,
  },
  shutterBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#CCC',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  // Left Drawer Modal
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawer: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#121212',
    borderRightWidth: 1,
    borderRightColor: '#2A2A2A',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    marginBottom: 10,
  },
  drawerTitle: {
    color: '#00E676',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
  },
  historyList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  historyRow: {
    flexDirection: 'column',
    gap: 8,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  historyRawContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  historyRaw: {
    color: '#888',
    fontSize: 14,
  },
  emptyText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
    fontStyle: 'italic',
  },
});
