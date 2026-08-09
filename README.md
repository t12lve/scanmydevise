# Scan My Devise (SMD)

Application mobile Android native optimisée pour l'ergonomie de terrain, la performance offline-first, la confidentialité absolue et les écrans pliables.

## Fonctionnalités
- **OCR en Temps Réel** : Lecture des prix via la caméra, traitement local 100% sans envoi de données.
- **Conversion Instantanée** : Convertit les devises vers l'Euro (base paramétrable hors ligne).
- **Mode Pliable (Foldable)** : Détection dynamique de l'écran avec passage en mode double-panneau côte à côte.
- **Privacy-by-Design** : Aucun tracker (Expo Telemetry désactivé), appels réseau uniquement sur demande (Update Rates).

## Prérequis
- [Node.js](https://nodejs.org/) (v18+)
- Compte Expo (Optionnel mais recommandé pour EAS Build cloud)
- [EAS CLI](https://docs.expo.dev/build/setup/) (`npm install -g eas-cli`)

## Compilation de l'APK (Android)

L'application contient du code natif (`react-native-vision-camera`, `react-native-mmkv`). Elle ne peut pas être lancée dans l'application Expo Go standard. Vous devez compiler un *Development Client* ou directement un fichier APK.

Pour générer un fichier `.apk` prêt à être installé sur votre appareil Android :

1. Connectez-vous à Expo (si vous utilisez le build Cloud) :
   ```bash
   eas login
   ```

2. Lancez la compilation via EAS Build :
   ```bash
   eas build --profile preview --platform android
   ```
   *(EAS générera un lien de téléchargement vers le fichier .apk une fois la compilation terminée)*

   > **Note** : Si vous souhaitez compiler l'APK localement sur votre propre machine (nécessite Android Studio / SDK complet) :
   > ```bash
   > eas build --profile preview --platform android --local
   > ```

## Lancer le Client de Développement (Local)

Si vous souhaitez modifier le code en direct avec Hot-Reloading :
1. Compilez un client de développement Android : `eas build --profile development --platform android`
2. Installez-le sur votre appareil.
3. Lancez le serveur Expo : `npx expo start` et scannez le QR Code avec la caméra de l'appareil.

## Structure du projet
- `app.json` : Configuration Expo avec télémétrie désactivée et plugins pour Camera/MMKV.
- `src/app/` : Navigation (Expo Router) et détection du mode pliable.
- `src/store/` : Gestion de l'état global et persistance locale (Zustand + MMKV).
- `src/components/` : Composants UI (ScannerPane, ManualKeypadPane, CurrencyDisplay).
- `src/hooks/` : Logique réutilisable (détection layout adaptatif).
