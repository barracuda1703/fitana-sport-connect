import { useState, useEffect } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyA9Hu1aW3QOB0AhMoFJRsDQ_tjZm273c2o';

export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadMaps = async () => {
      try {
        // Load the Google Maps script dynamically
        if (!window.google) {
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,marker&v=weekly`;
          script.async = true;
          script.defer = true;
          
          await new Promise<void>((resolve, reject) => {
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load Google Maps'));
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
