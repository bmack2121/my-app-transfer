import React from 'react';
import ReactDOM from 'react-dom/client';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Capacitor } from '@capacitor/core';

// Styles
import './index.css';         
import './styles/global.css';  

import App from './App';

/**
 * Native Environment Initialization
 * Sets up the Android/iOS UI bars to match the VinPro Dark Theme
 */
const initializeNativeApp = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Set Status Bar (Top) to Dark for high contrast
      await StatusBar.setStyle({ style: Style.Dark });
      
      // 2. Handle Android Navigation Bar (Bottom) for Edge-to-Edge
      if (Capacitor.getPlatform() === 'android') {
        // Sets the bottom bar to match your slate-950 theme
        await NavigationBar.setbackgroundColor({ color: '#020617' });
      }
    } catch (err) {
      console.warn("Native UI initialization skipped:", err);
    }
  }
};

// Fire and forget initialization
initializeNativeApp();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);