import { useState, useEffect } from 'react';

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
  permission: 'prompt' | 'granted' | 'denied' | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    permission: null,
  });

  useEffect(() => {
    // Check saved preference
    const savedPreference = localStorage.getItem('geolocation_preference');
    
    if (savedPreference === 'denied') {
      setState(prev => ({ ...prev, permission: 'denied' }));
      return;
    }

    if (savedPreference === 'granted' && 'geolocation' in navigator) {
      requestLocation();
    }
  }, []);

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setState(prev => ({
        ...prev,
        error: 'Geolokalizacja nie jest obsługiwana przez Twoją przeglądarkę',
        permission: 'denied',
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permission: 'granted',
        });
        localStorage.setItem('geolocation_preference', 'granted');
      },
      (error) => {
        let errorMessage = 'Nie udało się pobrać lokalizacji';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Odmówiono dostępu do lokalizacji';
            localStorage.setItem('geolocation_preference', 'denied');
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Lokalizacja niedostępna';
            break;
          case error.TIMEOUT:
            errorMessage = 'Przekroczono limit czasu';
            break;
        }

        setState({
          latitude: null,
          longitude: null,
          error: errorMessage,
          loading: false,
          permission: 'denied',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const denyLocation = () => {
    localStorage.setItem('geolocation_preference', 'denied');
    setState(prev => ({
      ...prev,
      permission: 'denied',
      loading: false,
    }));
  };

  const resetPermission = () => {
    localStorage.removeItem('geolocation_preference');
    setState({
      latitude: null,
      longitude: null,
      error: null,
      loading: false,
      permission: null,
    });
  };

  return {
    ...state,
    requestLocation,
    denyLocation,
    resetPermission,
  };
};
