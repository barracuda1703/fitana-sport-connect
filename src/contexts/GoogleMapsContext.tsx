import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GoogleMapsContextType {
  isLoaded: boolean;
  error: Error | null;
  apiKey: string | null;
  retryCount: number;
  isRetrying: boolean;
  retryLoad: () => void;
}

const GoogleMapsContext = createContext<GoogleMapsContextType | undefined>(undefined);

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff: 1s, 2s, 4s

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const loadGoogleMaps = useCallback(async (attempt: number = 0) => {
    try {
      setIsRetrying(attempt > 0);
      setError(null);

      // Check if already loaded (singleton)
      if (window.google?.maps) {
        setIsLoaded(true);
        setIsRetrying(false);
        return;
      }

      // Fetch API key (with caching)
      let key = apiKey;
      if (!key) {
        const { data, error: fetchError } = await supabase.functions.invoke('get-google-maps-key');
        
        if (fetchError) {
          throw new Error('Nie udało się pobrać klucza API map. Spróbuj odświeżyć stronę.');
        }

        if (!data?.apiKey) {
          throw new Error('Klucz API map nie jest skonfigurowany. Skontaktuj się z wsparciem.');
        }

        key = data.apiKey;
        setApiKey(key); // Cache the key
      }

      // Load script (singleton check)
      if (!document.querySelector('script[src*="maps.googleapis.com"]')) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places,marker&v=weekly`;
        script.async = true;
        script.defer = true;
        
        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Nie udało się załadować mapy. Sprawdź połączenie internetowe.'));
          document.head.appendChild(script);
        });
      }
      
      setIsLoaded(true);
      setIsRetrying(false);
      setRetryCount(0);

      if (attempt > 0) {
        toast.success('Mapy załadowane pomyślnie!');
      }
    } catch (err) {
      const errorObj = err as Error;
      console.error(`Google Maps loading attempt ${attempt + 1} failed:`, errorObj);
      
      // Retry with exponential backoff
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        setRetryCount(attempt + 1);
        
        setTimeout(() => {
          loadGoogleMaps(attempt + 1);
        }, delay);
      } else {
        setError(errorObj);
        setIsRetrying(false);
        toast.error('Nie udało się załadować map. Sprawdź połączenie i spróbuj ponownie.');
      }
    }
  }, [apiKey]);

  const retryLoad = useCallback(() => {
    setError(null);
    setRetryCount(0);
    loadGoogleMaps(0);
  }, [loadGoogleMaps]);

  useEffect(() => {
    loadGoogleMaps(0);
  }, [loadGoogleMaps]);

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
