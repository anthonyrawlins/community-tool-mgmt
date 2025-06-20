"use client";

import { useEffect } from 'react';

// Version information for the frontend
const VERSION_INFO = {
  buildVersion: 'alpha-2',
  buildDate: new Date().toISOString(),
  nextjsVersion: '15.3.4',
  reactVersion: '19.0.0',
  expectedApiVersion: 'v1',
  appVersion: '0.1.0'
};

export function VersionLogger() {
  useEffect(() => {
    // Log version information to console
    console.group('🏗️ Ballarat Tool Library - Frontend Build Info');
    console.log('📦 Build Version:', VERSION_INFO.buildVersion);
    console.log('🕒 Build Date:', VERSION_INFO.buildDate);
    console.log('⚛️ React Version:', VERSION_INFO.reactVersion);
    console.log('🚀 Next.js Version:', VERSION_INFO.nextjsVersion);
    console.log('🔢 Expected API Version:', VERSION_INFO.expectedApiVersion);
    console.log('📋 App Version:', VERSION_INFO.appVersion);
    console.log('🌐 Environment:', process.env.NODE_ENV || 'development');
    console.log('🖥️ User Agent:', navigator.userAgent);
    console.groupEnd();

    // Add version info to window for debugging
    if (typeof window !== 'undefined') {
      (window as unknown as { __BALLARAT_VERSION__: typeof VERSION_INFO }).__BALLARAT_VERSION__ = VERSION_INFO;
    }
  }, []);

  return null; // This component doesn't render anything
}