# Przygotowanie aplikacji hybrydowej Fitana

## 1. Wybór technologii

Dla aplikacji hybrydowej polecamy **Capacitor** (nowsza alternatywa dla Cordova):

### Dlaczego Capacitor?
- Lepsza integracja z nowoczesnymi frameworkami
- Wsparcie dla PWA
- Lepsze API dla natywnych funkcji
- Aktywny rozwój przez Ionic

## 2. Instalacja Capacitor

```bash
# Zainstaluj Capacitor CLI globalnie
npm install -g @capacitor/cli

# Zainstaluj Capacitor w projekcie
npm install @capacitor/core @capacitor/cli

# Zainstaluj platformy
npm install @capacitor/ios @capacitor/android

# Inicjalizuj Capacitor
npx cap init "Fitana" "com.fitana.app"
```

## 3. Konfiguracja

### capacitor.config.ts
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fitana.app',
  appName: 'Fitana',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    StatusBar: {
      style: 'default',
      backgroundColor: '#ffffff',
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
```

## 4. Dodatkowe pakiety dla funkcji mobilnych

```bash
# Notyfikacje push
npm install @capacitor/push-notifications

# Geolokalizacja
npm install @capacitor/geolocation

# Kamera i galeria
npm install @capacitor/camera

# Pliki
npm install @capacitor/filesystem

# Sieć
npm install @capacitor/network

# Status bar
npm install @capacitor/status-bar

# Splash screen
npm install @capacitor/splash-screen

# Haptics (wibracje)
npm install @capacitor/haptics

# Share
npm install @capacitor/share

# App state
npm install @capacitor/app
```

## 5. Konfiguracja dla iOS

```bash
# Dodaj platformę iOS
npx cap add ios

# Otwórz w Xcode
npx cap open ios
```

### Wymagania iOS:
- Xcode 14+
- iOS 13+
- Apple Developer Account (dla publikacji)

## 6. Konfiguracja dla Android

```bash
# Dodaj platformę Android
npx cap add android

# Otwórz w Android Studio
npx cap open android
```

### Wymagania Android:
- Android Studio
- Android SDK
- Java 11+

## 7. Konfiguracja PWA

### manifest.json
```json
{
  "name": "Fitana",
  "short_name": "Fitana",
  "description": "Znajdź swojego idealnego trenera",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### vite.config.ts (dodaj PWA)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Fitana',
        short_name: 'Fitana',
        description: 'Znajdź swojego idealnego trenera',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  // ... reszta konfiguracji
}));
```

## 8. Funkcje mobilne

### Geolokalizacja
```typescript
import { Geolocation } from '@capacitor/geolocation';

const getCurrentPosition = async () => {
  const coordinates = await Geolocation.getCurrentPosition();
  return {
    latitude: coordinates.coords.latitude,
    longitude: coordinates.coords.longitude
  };
};
```

### Notyfikacje push
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

const setupPushNotifications = async () => {
  await PushNotifications.requestPermissions();
  
  PushNotifications.addListener('registration', (token) => {
    console.log('Registration token: ', token.value);
  });
  
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('Push notification received: ', notification);
  });
};
```

### Kamera
```typescript
import { Camera, CameraResultType } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Uri
  });
  
  return image.webPath;
};
```

## 9. Build i deployment

### Build dla web
```bash
npm run build
```

### Sync z platformami
```bash
npx cap sync
```

### Build dla iOS
```bash
npx cap open ios
# W Xcode: Product > Archive
```

### Build dla Android
```bash
npx cap open android
# W Android Studio: Build > Generate Signed Bundle/APK
```

## 10. Publikacja

### App Store (iOS)
1. Utwórz App Store Connect account
2. Przygotuj metadane aplikacji
3. Prześlij przez Xcode lub Application Loader

### Google Play (Android)
1. Utwórz Google Play Console account
2. Przygotuj APK/AAB
3. Prześlij przez Google Play Console

## 11. Monitoring i analityka

### Firebase Analytics
```bash
npm install @capacitor-community/firebase-analytics
```

### Crashlytics
```bash
npm install @capacitor-community/firebase-crashlytics
```

## 12. Testowanie

### Testowanie na urządzeniach
```bash
# iOS Simulator
npx cap run ios

# Android Emulator
npx cap run android

# Live reload
npx cap run ios --livereload --external
```

### Testowanie PWA
```bash
# Serwuj z HTTPS (wymagane dla PWA)
npx cap serve --ssl
```

## 13. Optymalizacje

### Lazy loading
```typescript
const LazyComponent = React.lazy(() => import('./Component'));

// W komponencie
<Suspense fallback={<div>Loading...</div>}>
  <LazyComponent />
</Suspense>
```

### Service Worker
```typescript
// W main.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
```

## 14. Checklist przed publikacją

- [ ] Testy na różnych urządzeniach
- [ ] Optymalizacja obrazów
- [ ] Konfiguracja notyfikacji push
- [ ] Testy offline
- [ ] Performance audit
- [ ] Security audit
- [ ] Privacy policy
- [ ] Terms of service
- [ ] App store screenshots
- [ ] App store description



