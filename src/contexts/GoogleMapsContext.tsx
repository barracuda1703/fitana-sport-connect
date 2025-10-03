import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { supabase } from '@/integrations/supabase/client';

interface GoogleMapsContextType {
  isLoaded: boolean;
  error: Error | null;
  apiKey: string | null;
  retryCount: number;
  isRetrying: boolean;
  retryLoad: () => void;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [apiKey] = useState<string | null>(import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const loaderRef = useRef<Loader | null>(null);
  const MAX_RETRIES = 3;

  const loadGoogleMapsScript = async () => {
    try {
      setError(null);
      setIsRetrying(retryCount > 0);

      if (!apiKey) {
        throw new Error('VITE_GOOGLE_MAPS_API_KEY not found in environment variables. Please add it to your .env file.');
      }
      
      // Singleton pattern - create loader only once
      if (!loaderRef.current) {
        loaderRef.current = new Loader({
          apiKey: apiKey,
          version: 'weekly',
          libraries: ['places', 'marker']
        });
      }

      // @ts-ignore - Loader.load() exists but TS types may be outdated
      await loaderRef.current.load();
      setIsLoaded(true);
      
      console.log('Google Maps loaded successfully');
    } catch (err) {
      console.error('Error loading Google Maps:', err);
      const error = err as Error;
      
      // Map common errors to friendly messages
      let userFriendlyMessage = error.message;
      if (error.message.includes('InvalidKey')) {
        userFriendlyMessage = 'Nieprawidłowy klucz API Google Maps';
      } else if (error.message.includes('RefererNotAllowed')) {
        userFriendlyMessage = 'Domena nie jest autoryzowana w Google Console';
      } else if (error.message.includes('ApiNotActivated')) {
        userFriendlyMessage = 'Google Maps API nie jest włączone';
      } else if (error.message.includes('BillingNotEnabled')) {
        userFriendlyMessage = 'Rozliczenia Google Cloud nie są włączone';
      }
      
      setError(new Error(userFriendlyMessage));
      setIsRetrying(false);

      // Exponential backoff retry
      if (retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`Retrying in ${delay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, delay);
      }
    }
  };

  const retryLoad = () => {
    setError(null);
    setRetryCount(0);
    setIsRetrying(true);
    loaderRef.current = null;
    loadGoogleMapsScript();
  };

  useEffect(() => {
    loadGoogleMapsScript();
  }, [retryCount]);

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, error, apiKey, retryCount, isRetrying, retryLoad }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMapsContext = () => {
  const context = useContext(GoogleMapsContext);
  if (context === undefined) {
    throw new Error('useGoogleMapsContext must be used within GoogleMapsProvider');
  }
  return context;
};
