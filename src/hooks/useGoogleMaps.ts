import { useState, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadMaps = async () => {
      try {
        if (!GOOGLE_MAPS_API_KEY) {
          throw new Error('Google Maps API key is not configured. Please contact support.');
        }

        // Load the Google Maps script dynamically
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=weekly`;
          script.async = true;
          script.defer = true;
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Nie udało się załadować mapy. Sprawdź połączenie internetowe.'));
            document.head.appendChild(script);
          });
        }
        
        setIsLoaded(true);
      } catch (err) {
        setError(err as Error);
        console.error('Error loading Google Maps:', err);
      }
    };

    loadMaps();
  }, []);

  return { isLoaded, error };
};
