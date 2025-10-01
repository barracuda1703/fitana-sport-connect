import React, { createContext, useContext, ReactNode } from 'react';
import { useGeolocation, GeolocationState } from '@/hooks/useGeolocation';

interface LocationContextType extends GeolocationState {
  requestLocation: () => void;
  denyLocation: () => void;
  resetPermission: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
  const geolocation = useGeolocation();

  return (
    <LocationContext.Provider value={geolocation}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
