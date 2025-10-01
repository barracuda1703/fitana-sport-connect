import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Load geolocation preference from database
    const loadPreference = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('geolocation_preference')
          .eq('id', user.id)
          .single();
        
        const savedPreference = profile?.geolocation_preference;
        
        if (savedPreference === 'denied') {
          setState(prev => ({ ...prev, permission: 'denied' }));
          return;
        }

        if (savedPreference === 'granted' && 'geolocation' in navigator) {
          requestLocation();
        }
      }
    };
    loadPreference();
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
      async (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
          permission: 'granted',
        });
        
        // Save to database instead of localStorage
        if (userId) {
          await supabase
            .from('profiles')
            .update({ geolocation_preference: 'granted' })
            .eq('id', userId);
        }
      },
      async (error) => {
        let errorMessage = 'Nie udało się pobrać lokalizacji';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Odmówiono dostępu do lokalizacji';
            if (userId) {
              await supabase
                .from('profiles')
                .update({ geolocation_preference: 'denied' })
                .eq('id', userId);
            }
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

  const denyLocation = async () => {
    if (userId) {
      await supabase
        .from('profiles')
        .update({ geolocation_preference: 'denied' })
        .eq('id', userId);
    }
    setState(prev => ({
      ...prev,
      permission: 'denied',
      loading: false,
    }));
  };

  const resetPermission = async () => {
    if (userId) {
      await supabase
        .from('profiles')
        .update({ geolocation_preference: null })
        .eq('id', userId);
    }
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
