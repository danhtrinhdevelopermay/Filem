import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.filestorage.app',
  appName: 'File Storage App',
  webDir: 'dist/public',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffff",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    App: {
      launchUrl: ""
    }
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
