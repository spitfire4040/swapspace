import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.swapspace.app',
  appName: 'SwapSpace',
  webDir: 'dist',
  android: {
    // Android uses https:// scheme (origin: "https://localhost").
    // iOS uses capacitor:// scheme (origin: "capacitor://localhost").
    // Both must be listed in the backend's CORS_ORIGIN env var.
    scheme: 'https',
  },
  plugins: {
    SplashScreen: {
      backgroundColor: '#FF4458',
      launchAutoHide: true,
      androidScaleType: 'CENTER_CROP',
    },
  },
  // Uncomment for live reload during dev (replace with your machine's IP):
  // server: {
  //   url: 'http://192.168.x.x:5173',
  //   cleartext: true,
  // },
};

export default config;
