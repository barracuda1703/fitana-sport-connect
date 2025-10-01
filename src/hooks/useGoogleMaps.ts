import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadMaps = async () => {
      try {
        // Fetch API key from Edge Function
        const { data, error: fetchError } = await supabase.functions.invoke('get-google-maps-key');
        
        if (fetchError) {
          throw new Error('Nie udało się pobrać klucza API map. Spróbuj odświeżyć stronę.');
        }

        if (!data?.apiKey) {
          throw new Error('Klucz API map nie jest skonfigurowany. Skontaktuj się z wsparciem.');
        }

        const GOOGLE_MAPS_API_KEY = data.apiKey;

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
