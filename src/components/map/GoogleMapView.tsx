import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { TrainerMarker } from './TrainerMarker';
import { Card } from '@/components/ui/card';
import { MapPin, X } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';

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
  userLocation?: { lat: number; lng: number } | null;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  trainers,
  onBook,
  onViewProfile,
  onChat,
  userLocation
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const userMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
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
      
      // Include user location in bounds if available
      if (userLocation) {
        bounds.extend(userLocation);
      }
      
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
  }, [isLoaded, trainers, userLocation]);

  // Add user location marker
  useEffect(() => {
    if (!isLoaded || !mapInstanceRef.current || !userLocation) {
      // Remove user marker if location is not available
      if (userMarkerRef.current) {
        userMarkerRef.current.map = null;
        userMarkerRef.current = null;
      }
      return;
    }

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.map = null;
    }

    // Create user location marker with pulsating animation
    const markerDiv = document.createElement('div');
    markerDiv.innerHTML = `
      <div style="position: relative;">
        <div style="
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          cursor: pointer;
          position: relative;
          z-index: 2;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          background: rgba(102, 126, 234, 0.3);
          border-radius: 50%;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          z-index: 1;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(2);
          }
        }
      </style>
    `;

    const marker = new google.maps.marker.AdvancedMarkerElement({
      map: mapInstanceRef.current,
      position: userLocation,
      content: markerDiv,
      title: 'Twoja lokalizacja'
    });

    userMarkerRef.current = marker;

    // Center map on user location
    mapInstanceRef.current.setCenter(userLocation);
  }, [isLoaded, userLocation]);

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
        <Drawer open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {selectedLocation.name}
                </span>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="h-4 w-4" />
                  </Button>
                </DrawerClose>
              </DrawerTitle>
            </DrawerHeader>
            
            <div className="px-4 pb-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {selectedLocation.trainers.map((trainer) => (
                <Card key={trainer.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      {trainer.gallery?.[0] ? (
                        <AvatarImage src={trainer.gallery[0]} alt={trainer.display_name || 'Trener'} />
                      ) : (
                        <AvatarFallback>
                          {trainer.display_name?.charAt(0) || 'T'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{trainer.display_name || 'Trener'}</h4>
                        {trainer.is_verified && (
                          <Badge variant="secondary" className="text-xs">✓</Badge>
                        )}
                      </div>
                      
                      {trainer.rating && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                          <Star className="h-3 w-3 fill-warning text-warning" />
                          <span>{trainer.rating.toFixed(1)}</span>
                          <span>({trainer.review_count || 0})</span>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {trainer.specialties?.slice(0, 2).map((specialty, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            onBook(trainer.id);
                            setSelectedLocation(null);
                          }}
                        >
                          Zarezerwuj
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            onViewProfile(trainer.id);
                            setSelectedLocation(null);
                          }}
                        >
                          Profil
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </>
  );
};
