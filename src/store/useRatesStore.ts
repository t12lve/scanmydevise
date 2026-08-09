import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CurrencyRates = Record<string, number>;

export const SUPPORTED_CURRENCIES = [
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'ALL', label: 'Lek Albanais (Lek)' },
  { code: 'USD', label: 'Dollar US ($)' },
  { code: 'GBP', label: 'Livre Sterling (£)' },
  { code: 'CHF', label: 'Franc Suisse (CHF)' },
  { code: 'JPY', label: 'Yen Japonais (¥)' },
  { code: 'CAD', label: 'Dollar Canadien (C$)' },
  { code: 'AUD', label: 'Dollar Australien (A$)' },
  { code: 'MAD', label: 'Dirham Marocain (DH)' },
  { code: 'TND', label: 'Dinar Tunisien (DT)' },
  { code: 'TRY', label: 'Livre Turque (₺)' },
];

interface RatesState {
  rates: CurrencyRates;
  lastUpdated: number | null;
  baseCurrency: string;
  targetCurrency: string;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  setRates: (rates: CurrencyRates) => void;
  setBaseCurrency: (currency: string) => void;
  setTargetCurrency: (currency: string) => void;
  swapCurrencies: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVibrationEnabled: (enabled: boolean) => void;
  updateRatesFromAPI: () => Promise<void>;
}

const FALLBACK_RATES: CurrencyRates = {
  EUR: 1,
  USD: 1.08,
  GBP: 0.85,
  CHF: 0.95,
  JPY: 160.5,
  CAD: 1.47,
  AUD: 1.63,
  ALL: 104.5,
  MAD: 10.85,
  TND: 3.38,
  TRY: 35.8,
};

export const useRatesStore = create<RatesState>()(
  persist(
    (set, get) => ({
      rates: FALLBACK_RATES,
      lastUpdated: null,
      baseCurrency: 'ALL',
      targetCurrency: 'EUR',
      soundEnabled: true,
      vibrationEnabled: true,
      setRates: (rates) => set({ rates, lastUpdated: Date.now() }),
      setBaseCurrency: (currency) => set({ baseCurrency: currency }),
      setTargetCurrency: (currency) => set({ targetCurrency: currency }),
      swapCurrencies: () => set((state) => ({
        baseCurrency: state.targetCurrency,
        targetCurrency: state.baseCurrency,
      })),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setVibrationEnabled: (enabled) => set({ vibrationEnabled: enabled }),
      updateRatesFromAPI: async () => {
        try {
          const response = await fetch('https://api.frankfurter.app/latest?from=EUR');
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          
          if (data && data.rates) {
            const newRates: CurrencyRates = {
              EUR: 1,
              ...data.rates,
              ALL: data.rates.ALL || FALLBACK_RATES.ALL, 
              MAD: data.rates.MAD || FALLBACK_RATES.MAD,
              TND: data.rates.TND || FALLBACK_RATES.TND,
            };
            set({ rates: newRates, lastUpdated: Date.now() });
          }
        } catch (error) {
          console.error('Failed to update rates', error);
          throw error;
        }
      },
    }),
    {
      name: 'smd-rates-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
