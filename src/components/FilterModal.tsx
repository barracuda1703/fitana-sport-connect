import React, { useState } from 'react';
import { Filter, Heart, Star, MapPin, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface FilterOptions {
  maxDistance: number;
  priceRange: [number, number];
  minRating: number;
  availableToday: boolean;
  showFavoritesOnly: boolean;
  trainerGender: 'all' | 'male' | 'female';
  serviceTypes: string[];
}

interface FilterModalProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onReset: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ 
  filters, 
  onFiltersChange, 
  onReset 
}) => {
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const serviceTypes = [
    { id: 'online', label: 'Online', icon: '💻' },
    { id: 'gym', label: 'Siłownia', icon: '🏋️' },
    { id: 'court', label: 'Boisko/Kort', icon: '⚽' },
    { id: 'home_visit', label: 'Wizyta domowa', icon: '🏠' }
  ];

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const defaultFilters: FilterOptions = {
      maxDistance: 50,
      priceRange: [0, 500],
      minRating: 0,
      availableToday: false,
      showFavoritesOnly: false,
      trainerGender: 'all',
      serviceTypes: []
    };
    setTempFilters(defaultFilters);
    onReset();
    setIsOpen(false);
  };

  const activeFiltersCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'maxDistance' && value !== 50) return count + 1;
    if (key === 'priceRange' && (value[0] !== 0 || value[1] !== 500)) return count + 1;
    if (key === 'minRating' && value > 0) return count + 1;
    if (key === 'availableToday' && value) return count + 1;
    if (key === 'showFavoritesOnly' && value) return count + 1;
    if (key === 'trainerGender' && value !== 'all') return count + 1;
    if (key === 'serviceTypes' && Array.isArray(value) && value.length > 0) return count + 1;
    return count;
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Filter className="h-4 w-4" />
          {activeFiltersCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtry wyszukiwania
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Distance Filter */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Maksymalna odległość: {tempFilters.maxDistance} km
            </Label>
            <Slider
              value={[tempFilters.maxDistance]}
              onValueChange={(value) => 
                setTempFilters(prev => ({ ...prev, maxDistance: value[0] }))
              }
              max={100}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <DollarSign className="h-4 w-4" />
              Zakres cen: {tempFilters.priceRange[0]} - {tempFilters.priceRange[1]} zł
            </Label>
            <Slider
              value={tempFilters.priceRange}
              onValueChange={(value) => 
                setTempFilters(prev => ({ ...prev, priceRange: value as [number, number] }))
              }
              max={500}
              min={0}
              step={10}
              className="w-full"
            />
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Star className="h-4 w-4" />
              Minimalna ocena: {tempFilters.minRating > 0 ? `${tempFilters.minRating}+` : 'Wszystkie'}
            </Label>
            <div className="flex gap-2">
              {[0, 3, 4, 4.5].map((rating) => (
                <Button
                  key={rating}
                  variant={tempFilters.minRating === rating ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTempFilters(prev => ({ ...prev, minRating: rating }))}
                  className="flex-1"
                >
                  {rating === 0 ? 'Wszystkie' : `${rating}+`}
                </Button>
              ))}
            </div>
          </div>

          {/* Gender Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Płeć trenera</Label>
            <Select 
              value={tempFilters.trainerGender} 
              onValueChange={(value: 'all' | 'male' | 'female') => 
                setTempFilters(prev => ({ ...prev, trainerGender: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie</SelectItem>
                <SelectItem value="male">Mężczyźni</SelectItem>
                <SelectItem value="female">Kobiety</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service Types Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Typy treningów</Label>
            <div className="grid grid-cols-2 gap-2">
              {serviceTypes.map((serviceType) => (
                <div key={serviceType.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`service-${serviceType.id}`}
                    checked={tempFilters.serviceTypes.includes(serviceType.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setTempFilters(prev => ({
                          ...prev,
                          serviceTypes: [...prev.serviceTypes, serviceType.id]
                        }));
                      } else {
                        setTempFilters(prev => ({
                          ...prev,
                          serviceTypes: prev.serviceTypes.filter(type => type !== serviceType.id)
                        }));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={`service-${serviceType.id}`}
                    className="text-xs cursor-pointer flex items-center gap-1"
                  >
                    <span>{serviceType.icon}</span>
                    {serviceType.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Filters */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Szybkie filtry</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="available-today"
                  checked={tempFilters.availableToday}
                  onCheckedChange={(checked) => 
                    setTempFilters(prev => ({ ...prev, availableToday: !!checked }))
                  }
                />
                <Label htmlFor="available-today" className="text-sm cursor-pointer flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Dostępni dzisiaj
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorites-only"
                  checked={tempFilters.showFavoritesOnly}
                  onCheckedChange={(checked) => 
                    setTempFilters(prev => ({ ...prev, showFavoritesOnly: !!checked }))
                  }
                />
                <Label htmlFor="favorites-only" className="text-sm cursor-pointer flex items-center gap-2">
                  <Heart className="h-3 w-3" />
                  Tylko ulubieni
                </Label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Wyczyść
          </Button>
          <Button onClick={handleApplyFilters} className="flex-1">
            Zastosuj filtry
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};