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
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const loadingPromiseRef = useRef<Promise<void> | null>(null);

  const fetchApiKey = async (): Promise<string> => {
    // Check localStorage cache first
    const cached = localStorage.getItem('google_maps_api_key');
    if (cached) {
      console.log('Using cached Google Maps API key');
      return cached;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('get-google-maps-key');
    if (error) throw error;
    if (!data?.apiKey) throw new Error('No API key received');
    
    // Cache the key in localStorage
    localStorage.setItem('google_maps_api_key', data.apiKey);
    console.log('Google Maps API key fetched and cached');
    
    return data.apiKey;
  };

  const loadGoogleMapsScript = async (attempt: number = 1): Promise<void> => {
    // If already loading, wait for that promise
    if (loadingPromiseRef.current) {
      console.log('Google Maps loading already in progress, waiting...');
      return loadingPromiseRef.current;
    }

    // Create new loading promise
    loadingPromiseRef.current = (async () => {
      try {
        console.log(`Loading Google Maps... (attempt ${attempt}/3)`);
        setRetryCount(attempt);
        
        const key = await fetchApiKey();
        setApiKey(key);

        const loader = new Loader({
          apiKey: key,
          version: 'weekly',
          libraries: ['places', 'marker'],
        });

        // Load the Google Maps script - TypeScript workaround
        await (loader as any).load();
        
        setIsLoaded(true);
        setError(null);
        setIsRetrying(false);
        console.log('Google Maps loaded successfully');
        loadingPromiseRef.current = null;
      } catch (err) {
        console.error(`Google Maps loading attempt ${attempt} failed:`, err);
        
        if (attempt < 3) {
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          setIsRetrying(true);
          loadingPromiseRef.current = null;
          await new Promise(resolve => setTimeout(resolve, delay));
          return loadGoogleMapsScript(attempt + 1);
        }
        
        setError(err instanceof Error ? err : new Error('Failed to load Google Maps'));
        setIsLoaded(false);
        setIsRetrying(false);
        loadingPromiseRef.current = null;
      }
    })();

    return loadingPromiseRef.current;
  };

  const retryLoad = () => {
    setError(null);
    setRetryCount(0);
    setIsRetrying(true);
    loadingPromiseRef.current = null;
    loadGoogleMapsScript(1);
  };

  useEffect(() => {
    loadGoogleMapsScript(1);
  }, []);

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
