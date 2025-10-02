import { useGoogleMapsContext } from '@/contexts/GoogleMapsContext';

export const useGoogleMaps = () => {
  const { isLoaded, error } = useGoogleMapsContext();
  return { isLoaded, error };
};
