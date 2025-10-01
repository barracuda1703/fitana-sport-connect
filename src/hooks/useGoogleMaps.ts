import { useState, useEffect } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = 'AIzaSyA9Hu1aW3QOB0AhMoFJRsDQ_tjZm273c2o';

let initialized = false;

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadMaps = async () => {
      try {
        if (!initialized) {
          setOptions({ key: GOOGLE_MAPS_API_KEY });
          initialized = true;
        }
        
        await importLibrary('maps');
        await importLibrary('places');
        await importLibrary('marker');
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
