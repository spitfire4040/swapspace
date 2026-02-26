import React from 'react';
import ReactDOM from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import App from './App';
import './index.css';

if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {});
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
