# Scan My Devise (SMD)

[![Release APK](https://img.shields.io/badge/Release-APK%20v1.0.0-00E676?style=for-the-badge&logo=android&logoColor=white)](https://github.com/t12lve/scanmydevise/releases/download/v1.0.0/app-release.apk)
[![Landing Page](https://img.shields.io/badge/Site-GitHub%20Pages-00D2FF?style=for-the-badge&logo=githubpages&logoColor=white)](https://t12lve.github.io/scanmydevise/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

Application mobile Android native optimisée pour l'ergonomie de terrain, la performance offline-first, la confidentialité absolue et les écrans pliables.

> 📲 **Téléchargement direct APK** : [Télécharger `app-release.apk` (v1.0.0)](https://github.com/t12lve/scanmydevise/releases/download/v1.0.0/app-release.apk)  
> 🌐 **Site vitrine GitHub Pages** : [https://t12lve.github.io/scanmydevise/](https://t12lve.github.io/scanmydevise/)  
> ⚠️ **Note** : Cette application est distribuée exclusivement et directement via GitHub (aucune publication sur le Play Store).

## Fonctionnalités
- **OCR en Temps Réel** : Lecture des prix via la caméra, traitement local 100% sans envoi de données.
- **Conversion Instantanée** : Convertit les devises vers l'Euro (base paramétrable hors ligne).
- **Mode Pliable (Foldable)** : Détection dynamique de l'écran avec passage en mode double-panneau côte à côte.
- **Privacy-by-Design** : Aucun tracker (Expo Telemetry désactivé), appels réseau uniquement sur demande (Update Rates).

## Télécharger et Installer
1. Téléchargez la dernière version : [app-release.apk (v1.0.0)](https://github.com/t12lve/scanmydevise/releases/download/v1.0.0/app-release.apk)
2. Sur Android, autorisez l'installation d'applications inconnues depuis votre navigateur.
3. Ouvrez le fichier APK pour l'installer et lancez l'application.

## Prérequis pour le développement
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
