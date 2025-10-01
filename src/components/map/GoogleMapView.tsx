import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { TrainerMarker } from './TrainerMarker';
import { TrainerPopup } from './TrainerPopup';
import { Card } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

interface Trainer {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  specialties: string[];
  services: any;
  locations: any;
  languages: string[];
  price_from: number | null;
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
  has_video: boolean | null;
  gender: string | null;
  gallery: string[];
}

interface LocationGroup {
  lat: number;
  lng: number;
  name: string;
  trainers: Trainer[];
  isPrimary: boolean;
}

interface GoogleMapViewProps {
  trainers: Trainer[];
  onBook: (trainerId: string) => void;
  onViewProfile: (trainerId: string) => void;
  onChat: (trainerId: string) => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  trainers,
  onBook,
  onViewProfile,
  onChat
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const { isLoaded, error } = useGoogleMaps();
  const [selectedLocation, setSelectedLocation] = useState<LocationGroup | null>(null);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Warsaw
    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 52.2297, lng: 21.0122 },
      zoom: 10,
      mapId: 'FITANA_MAP',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      minZoom: 9,
      maxZoom: 16,
    });

    mapInstanceRef.current = map;
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];

    // Group trainers by location
    const locationGroups = new Map<string, LocationGroup>();

    trainers.forEach(trainer => {
      if (!trainer.locations || !Array.isArray(trainer.locations)) return;

      trainer.locations.forEach((location: any, index: number) => {
        if (!location?.coordinates?.lat || !location?.coordinates?.lng) return;

        const key = `${location.coordinates.lat.toFixed(6)},${location.coordinates.lng.toFixed(6)}`;
        
        if (locationGroups.has(key)) {
          const group = locationGroups.get(key)!;
          group.trainers.push(trainer);
        } else {
          locationGroups.set(key, {
            lat: location.coordinates.lat,
            lng: location.coordinates.lng,
            name: location.name || location.address || 'Lokalizacja',
            trainers: [trainer],
            isPrimary: index === 0
          });
        }
      });
    });

    // Create markers for each location group
    locationGroups.forEach((group) => {
      const markerDiv = document.createElement('div');
      markerDiv.style.cursor = 'pointer';
      
      const root = document.createElement('div');
      markerDiv.appendChild(root);

      // Create marker element
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: { lat: group.lat, lng: group.lng },
        content: markerDiv,
      });

      // Render React component into marker
      import('react-dom/client').then(({ createRoot }) => {
        const reactRoot = createRoot(root);
        reactRoot.render(
          <TrainerMarker
            count={group.trainers.length}
            isPrimary={group.isPrimary}
            onClick={() => setSelectedLocation(group)}
          />
        );
      });

      markersRef.current.push(marker);
    });

    // Adjust map bounds to fit all markers
    if (locationGroups.size > 0) {
      const bounds = new google.maps.LatLngBounds();
      locationGroups.forEach((group) => {
        bounds.extend({ lat: group.lat, lng: group.lng });
      });
      mapInstanceRef.current.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
      
      // Don't zoom in too much for single markers
      if (locationGroups.size === 1) {
        mapInstanceRef.current.setZoom(12);
      }
      
      // Make sure zoom doesn't go below minimum after fitBounds
      const currentZoom = mapInstanceRef.current.getZoom();
      if (currentZoom && currentZoom > 12) {
        mapInstanceRef.current.setZoom(12);
      }
    }
  }, [isLoaded, trainers]);

  if (error) {
    return (
      <Card className="h-[500px] flex items-center justify-center bg-gradient-card">
        <div className="text-center text-destructive">
          <MapPin className="h-12 w-12 mx-auto mb-2" />
          <p>Błąd ładowania mapy</p>
          <p className="text-sm">{error.message}</p>
        </div>
      </Card>
    );
  }

  if (!isLoaded) {
    return (
      <Card className="h-[500px] flex items-center justify-center bg-gradient-card">
        <div className="text-center text-muted-foreground">
          <MapPin className="h-12 w-12 mx-auto mb-2 animate-pulse" />
          <p>Ładowanie mapy...</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <div ref={mapRef} className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg" />
      
      {selectedLocation && (
        <TrainerPopup
          trainers={selectedLocation.trainers}
          locationName={selectedLocation.name}
          onClose={() => setSelectedLocation(null)}
          onBook={onBook}
          onViewProfile={onViewProfile}
          onChat={onChat}
        />
      )}
    </>
  );
};
