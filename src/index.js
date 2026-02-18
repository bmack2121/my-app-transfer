import React from 'react';
import ReactDOM from 'react-dom/client';
import { StatusBar, Style } from '@capacitor/status-bar';
import { NavigationBar } from '@capgo/capacitor-navigation-bar';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

// Styles
import './index.css';         
import './styles/global.css';  

import App from './App';

/**
 * Native Environment Initialization
 * Synchronizes the physical device hardware with the VinPro Dark Theme.
 */
const initializeNativeApp = async () => {
  if (Capacitor.isNativePlatform()) {
    try {
      // 1. Top Bar: Overlay allows our CSS safe-area-insets to work
      await StatusBar.setStyle({ style: Style.Dark });
      
      if (Capacitor.getPlatform() === 'android') {
        // Allows the webview to flow UNDER the status bar
        await StatusBar.setOverlaysWebView({ overlay: true });
        
        // Sets the bottom navigation bar to Slate-950 with a light pill
        await NavigationBar.setbackgroundColor({ color: '#020617' });
      }

      // 2. Lifecycle Listener: Re-apply theme when app resumes
      CapApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          StatusBar.setStyle({ style: Style.Dark });
        }
      });

    } catch (err) {
      console.warn("Native UI initialization skipped:", err);
    }
  }
};

// Initialize before rendering for a flicker-free start
initializeNativeApp();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);