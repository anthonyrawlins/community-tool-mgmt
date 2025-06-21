'use client';

import React, { useState, useRef, useEffect } from 'react';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  onClose: () => void;
}

export function BarcodeScanner({ onBarcodeScanned, onClose }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      setIsScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera if available
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      setCameraPermission('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Note: For a real implementation, you would integrate with a barcode scanning library
      // such as @zxing/library, quagga2, or zxing-js/library
      // For now, we'll simulate the scanning process
      
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraPermission('denied');
      setError('Unable to access camera. Please check permissions or enter barcode manually.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onBarcodeScanned(manualInput.trim());
    }
  };

  // Simulated barcode detection (replace with actual barcode scanning library)
  const simulateBarcodeScan = (barcode: string) => {
    stopCamera();
    onBarcodeScanned(barcode);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Barcode Scanner</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Camera Scanner */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Camera Scanner</h4>
            
            {cameraPermission === 'pending' && (
              <div className="text-center">
                <div className="bg-gray-100 rounded-lg p-8 mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-gray-600 mb-4">Position the barcode within the camera view</p>
                </div>
                <button
                  onClick={startCamera}
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Start Camera
                </button>
              </div>
            )}

            {cameraPermission === 'granted' && (
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full h-64 bg-black rounded-lg"
                  autoPlay
                  playsInline
                  muted
                />
                
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-primary rounded-lg w-48 h-32 bg-transparent relative">
                      <div className="absolute inset-0 border-2 border-red-500 rounded-lg animate-pulse"></div>
                      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary"></div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-center space-x-3">
                  <button
                    onClick={stopCamera}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    Stop Camera
                  </button>
                  
                  {/* Demo buttons for testing */}
                  <button
                    onClick={() => simulateBarcodeScan('123456789012')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Simulate Scan
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-2">
                  Position the barcode within the scanning area
                </p>
              </div>
            )}

            {cameraPermission === 'denied' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-800">
                      Camera access denied. Please enable camera permissions or enter the barcode manually below.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Manual Input */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Manual Entry</h4>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter Barcode
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Enter barcode number"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={!manualInput.trim()}
                className="w-full px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Use This Barcode
              </button>
            </form>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Scanning Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li className="flex items-start">
                <svg className="h-4 w-4 mt-0.5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Hold the camera steady and ensure good lighting
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 mt-0.5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Position the entire barcode within the scanning area
              </li>
              <li className="flex items-start">
                <svg className="h-4 w-4 mt-0.5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                If scanning fails, try manual entry below
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}