import React, { useState, useEffect, useRef } from 'react';
import { Plus, MapPin, Trash2, Edit, Star } from 'lucide-react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Location } from '@/types';
import { z } from 'zod';

const locationSchema = z.object({
  name: z.string().min(2, 'Nazwa placówki musi mieć co najmniej 2 znaki'),
  address: z.string().min(5, 'Adres musi mieć co najmniej 5 znaków')
});

interface LocationManagementProps {
  locations: Location[];
  onLocationsChange: (locations: Location[]) => void;
}

export const LocationManagement: React.FC<LocationManagementProps> = ({
  locations,
  onLocationsChange
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { isLoaded } = useGoogleMaps();
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!isLoaded || !addressInputRef.current || !isAddDialogOpen) return;

    autocompleteRef.current = new google.maps.places.Autocomplete(addressInputRef.current, {
      componentRestrictions: { country: 'pl' },
      fields: ['formatted_address', 'geometry', 'name', 'place_id'],
      types: ['gym', 'establishment']
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.geometry?.location) {
        setFormData(prev => ({
          ...prev,
          name: place.name || prev.name,
          address: place.formatted_address || prev.address
        }));
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, isAddDialogOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      address: ''
    });
    setErrors({});
  };

  const handleAddLocation = async () => {
    try {
      const validatedData = locationSchema.parse(formData);
      
      // Geocode the address to get coordinates
      let coordinates = { lat: 52.2297, lng: 21.0122 };
      
      if (isLoaded && formData.address) {
        try {
          const geocoder = new google.maps.Geocoder();
          const result = await geocoder.geocode({ address: formData.address });
          if (result.results[0]?.geometry?.location) {
            coordinates = {
              lat: result.results[0].geometry.location.lat(),
              lng: result.results[0].geometry.location.lng()
            };
          }
        } catch (error) {
          console.error('Geocoding error:', error);
        }
      }

      const newLocation: Location = {
        id: `loc-${Date.now()}`,
        name: validatedData.name,
        address: validatedData.address,
        coordinates,
        radius: 2
      };

      onLocationsChange([...locations, newLocation]);
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Dodano placówkę",
        description: `${newLocation.name} została dodana pomyślnie.`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address
    });
    setIsAddDialogOpen(true);
  };

  const handleUpdateLocation = () => {
    if (!editingLocation) return;
    
    try {
      const validatedData = locationSchema.parse(formData);
      const updatedLocation: Location = {
        ...editingLocation,
        name: validatedData.name,
        address: validatedData.address
        // Keep existing coordinates and radius
      };

      const updatedLocations = locations.map(loc => 
        loc.id === editingLocation.id ? updatedLocation : loc
      );
      onLocationsChange(updatedLocations);
      setIsAddDialogOpen(false);
      setEditingLocation(null);
      resetForm();
      toast({
        title: "Zaktualizowano placówkę",
        description: `${updatedLocation.name} została zaktualizowana pomyślnie.`
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message;
          }
        });
        setErrors(newErrors);
      }
    }
  };

  const handleRemoveLocation = (locationId: string) => {
    if (locations.length <= 1) {
      toast({
        title: "Nie można usunąć",
        description: "Musisz mieć co najmniej jedną placówkę.",
        variant: "destructive"
      });
      return;
    }

    const locationToRemove = locations.find(loc => loc.id === locationId);
    const updatedLocations = locations.filter(loc => loc.id !== locationId);
    onLocationsChange(updatedLocations);
    
    toast({
      title: "Usunięto placówkę",
      description: `${locationToRemove?.name} została usunięta.`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Moje placówki</span>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) {
              setEditingLocation(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Dodaj placówkę
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLocation ? 'Edytuj placówkę' : 'Dodaj nową placówkę'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location-name">Nazwa placówki</Label>
                  <Input
                    id="location-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="np. Fitness Club Centrum"
                  />
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location-address">Adres</Label>
                  <Input
                    ref={addressInputRef}
                    id="location-address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Zacznij wpisywać adres siłowni..."
                  />
                  {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  <p className="text-xs text-muted-foreground">
                    Wpisz nazwę lub adres siłowni, aby wybrać z listy
                  </p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsAddDialogOpen(false);
                      setEditingLocation(null);
                      resetForm();
                    }}
                  >
                    Anuluj
                  </Button>
                  <Button onClick={editingLocation ? handleUpdateLocation : handleAddLocation}>
                    {editingLocation ? 'Zaktualizuj' : 'Dodaj'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {locations.map((location, index) => (
            <div key={location.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <MapPin className="h-5 w-5 text-primary" />
                  {index === 0 && (
                    <Star className="h-3 w-3 text-warning fill-warning absolute -top-1 -right-1" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{location.name}</h4>
                    {index === 0 && (
                      <span className="text-xs text-muted-foreground">(główna)</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{location.address}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditLocation(location)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveLocation(location.id)}
                  disabled={locations.length <= 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {locations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nie masz jeszcze żadnych placówek</p>
              <p className="text-sm">Dodaj pierwszą placówkę, aby móc przyjmować rezerwacje</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};