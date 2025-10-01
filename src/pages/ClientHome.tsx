import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, List, Star, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { BookingModal } from '@/components/BookingModal';
import { TrainerProfileModal } from '@/components/TrainerProfileModal';
import { FavoriteButton } from '@/components/FavoriteButton';
import { FilterModal, FilterOptions } from '@/components/FilterModal';
import { LanguageChips } from '@/components/LanguageChips';
import { GoogleMapView } from '@/components/map/GoogleMapView';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useUserLocation } from '@/contexts/LocationContext';
import { useNavigate } from 'react-router-dom';
import { trainersService } from '@/services/supabase';
import { supabase } from '@/integrations/supabase/client';
import { sportsCategories, getSportName } from '@/data/sports';
import { POLISH_CITIES } from '@/data/cities';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const sportsCategoriesWithColors = sportsCategories.map((sport, index) => ({
  ...sport,
  color: ['bg-accent', 'bg-primary', 'bg-warning', 'bg-success'][index % 4]
}));

export const ClientHome: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const userLocation = useUserLocation();
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [sports] = useState(sportsCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [filters, setFilters] = useState<FilterOptions>({
    maxDistance: 50,
    priceRange: [0, 500],
    minRating: 0,
    availableToday: false,
    showFavoritesOnly: false,
    trainerGender: 'all',
    serviceTypes: [],
    languages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTrainers = async () => {
      try {
        setLoading(true);
        const data = await trainersService.getAll();
        setTrainers(data || []);
      } catch (error) {
        console.error('Error loading trainers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrainers();

    // Parse language filter from URL
    const urlParams = new URLSearchParams(window.location.search);
    const langParam = urlParams.get('lang');
    if (langParam) {
      const languages = langParam.split(',').filter(Boolean);
      setFilters(prev => ({ ...prev, languages }));
    }

    // Check if we should show location permission modal from database
    const checkLocationPreference = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('geolocation_preference')
          .eq('id', user.id)
          .single();
        
        const savedPreference = profile?.geolocation_preference;
        if (!savedPreference && viewMode === 'map') {
          setShowLocationModal(true);
        }
      }
    };
    checkLocationPreference();
  }, []);

  // Show location modal when switching to map view for first time
  useEffect(() => {
    const checkLocationPreference = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('geolocation_preference')
          .eq('id', user.id)
          .single();
        
        const savedPreference = profile?.geolocation_preference;
        if (!savedPreference && viewMode === 'map') {
          setShowLocationModal(true);
        }
      }
    };
    checkLocationPreference();
  }, [viewMode, user]);

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    let filtered = trainers;
    
    // Filter out trainers with off_mode enabled
    filtered = filtered.filter(trainer => !(trainer as any).off_mode);
    
    // Calculate distances if we have user location or selected city
    let userLat = userLocation.latitude;
    let userLng = userLocation.longitude;
    
    if (!userLat && selectedCity) {
      const city = POLISH_CITIES.find(c => c.name === selectedCity);
      if (city) {
        userLat = city.lat;
        userLng = city.lng;
      }
    }
    
    // Apply category filter
    if (selectedCategory) {
      const sportIdToSpecialty: Record<string, string> = {
        'gym': 'Siłownia',
        'fitness': 'Fitness',
        'boxing': 'Boks',
        'kickboxing': 'Kickboxing',
        'mma': 'MMA',
        'swimming': 'Pływanie',
        'tennis': 'Tenis',
        'judo': 'Judo',
        'karate': 'Karate',
        'yoga': 'Joga',
        'pilates': 'Pilates',
        'dance': 'Taniec',
        'basketball': 'Koszykówka',
        'football': 'Piłka nożna',
        'horse-riding': 'Jazda konna',
        'skiing': 'Narciarstwo',
        'crossfit': 'Crossfit',
        'gymnastics': 'Gimnastyka',
        'snowboard': 'Snowboard',
        'squash': 'Squash',
        'badminton': 'Badminton',
        'running': 'Trening biegowy',
        'golf': 'Golf'
      };
      
      const specialtyName = sportIdToSpecialty[selectedCategory];
      if (specialtyName) {
        filtered = filtered.filter(trainer => 
          trainer.specialties?.some(specialty => 
            specialty.toLowerCase().includes(specialtyName.toLowerCase())
          )
        );
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(trainer => 
        (trainer.display_name?.toLowerCase().includes(query) || false) ||
        trainer.specialties?.some(specialty => 
          specialty.toLowerCase().includes(query)
        )
      );
    }

    // Apply advanced filters
    if (filters.showFavoritesOnly) {
      // TODO: Implement favorites in database
    }

    // Apply language filter
    if (filters.languages.length > 0) {
      filtered = filtered.filter(trainer => 
        trainer.languages && trainer.languages.some(trainerLang => 
          filters.languages.includes(trainerLang)
        )
      );
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(trainer => (trainer.rating || 0) >= filters.minRating);
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) {
      filtered = filtered.filter(trainer => 
        (trainer.price_from || 0) >= filters.priceRange[0] && 
        (trainer.price_from || 0) <= filters.priceRange[1]
      );
    }

    // Sort by distance if we have location
    if (userLat && userLng) {
      filtered = filtered.map(trainer => {
        const trainerLocations = trainer.locations || [];
        let minDistance = Infinity;
        
        trainerLocations.forEach((loc: any) => {
          if (loc.lat && loc.lng) {
            const distance = calculateDistance(userLat!, userLng!, loc.lat, loc.lng);
            if (distance < minDistance) {
              minDistance = distance;
            }
          }
        });
        
        return { ...trainer, distance: minDistance };
      }).sort((a: any, b: any) => (a.distance || Infinity) - (b.distance || Infinity));
    }

    setFilteredTrainers(filtered);
  }, [trainers, selectedCategory, searchQuery, filters, userLocation.latitude, userLocation.longitude, selectedCity]);

  // Update URL params when filters change
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Update language parameter
    if (filters.languages.length > 0) {
      urlParams.set('lang', filters.languages.join(','));
    } else {
      urlParams.delete('lang');
    }
    
    // Update URL without page reload
    const newUrl = urlParams.toString() ? `${window.location.pathname}?${urlParams.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newUrl);
  }, [filters.languages]);

  const handleBookTrainer = (trainerId: string) => {
    const trainer = trainers.find(t => t.id === trainerId);
    if (trainer) {
      setSelectedTrainer(trainer);
      setShowBookingModal(true);
    }
  };

  const handleViewProfile = (trainerId: string) => {
    const trainer = trainers.find(t => t.id === trainerId);
    if (trainer) {
      setSelectedTrainer(trainer);
      setShowProfileModal(true);
    }
  };

  const handleChat = (trainerId: string) => {
    const chatId = `chat-${user?.id}-${trainerId}`;
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Wyszukaj trenera lub placówkę"
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <FilterModal 
            filters={filters}
            onFiltersChange={setFilters}
            onReset={() => setFilters({
              maxDistance: 50,
              priceRange: [0, 500],
              minRating: 0,
              availableToday: false,
              showFavoritesOnly: false,
              trainerGender: 'all',
              serviceTypes: [],
              languages: []
            })}
          />
        </div>

        {/* View Toggle and City Selector */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8"
            >
              <List className="h-4 w-4 mr-1" />
              Lista
            </Button>
            <Button
              variant={viewMode === 'map' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('map')}
              className="h-8"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Mapa
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            {(!userLocation.latitude && !userLocation.loading) && (
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Miasto" />
                </SelectTrigger>
                <SelectContent>
                  {POLISH_CITIES.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {userLocation.permission !== 'granted' && !userLocation.loading && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLocationModal(true)}
                className="h-8"
              >
                <Navigation className="h-4 w-4 mr-1" />
                Lokalizacja
              </Button>
            )}
            
            {userLocation.loading && (
              <span className="text-xs text-muted-foreground">Pobieranie lokalizacji...</span>
            )}
          </div>
          
          <span className="text-sm text-muted-foreground">
            {filteredTrainers.length} trenerów
          </span>
        </div>
      </header>

       {/* Sports Categories */}
       <section className="p-4">
         <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
           {/* All Categories Button */}
           <button
             onClick={() => setSelectedCategory(null)}
             className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-[80px] ${
               selectedCategory === null
                 ? 'bg-primary text-primary-foreground shadow-button'
                 : 'bg-card hover:bg-accent/50'
             }`}
           >
             <span className="text-2xl mb-1">🏆</span>
             <span className="text-xs font-medium text-center">Wszystkie</span>
             <span className="text-xs text-muted-foreground">({trainers.length})</span>
           </button>
           
             {sports.map((sport) => {
              const sportName = getSportName(sport.id, currentLanguage.code);
              // Count trainers by specialty
               const categoryCount = trainers.filter(trainer => 
                 trainer.specialties?.some(specialty => 
                   specialty.toLowerCase().includes(sportName.toLowerCase())
                 )
               ).length;
             
              return (
                <button
                  key={sport.id}
                  onClick={() => setSelectedCategory(
                    selectedCategory === sport.id ? null : sport.id
                  )}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-[80px] ${
                    selectedCategory === sport.id
                      ? 'bg-primary text-primary-foreground shadow-button'
                      : 'bg-card hover:bg-accent/50'
                  }`}
                 >
                  <span className="text-2xl mb-1">{sport.icon}</span>
                  <span className="text-xs font-medium text-center">{sportName}</span>
                  <span className="text-xs text-muted-foreground">({categoryCount})</span>
                </button>
              );
            })}
         </div>
       </section>

      {/* Trainers List */}
      <section className="px-4 space-y-4">
        {viewMode === 'map' && (
          <GoogleMapView
            trainers={filteredTrainers}
            onBook={handleBookTrainer}
            onViewProfile={handleViewProfile}
            onChat={handleChat}
            userLocation={
              userLocation.latitude && userLocation.longitude
                ? { lat: userLocation.latitude, lng: userLocation.longitude }
                : selectedCity
                ? POLISH_CITIES.find(c => c.name === selectedCity) || null
                : null
            }
          />
        )}
        
        {loading ? (
          <Card className="bg-gradient-card">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Ładowanie trenerów...</p>
            </CardContent>
          </Card>
        ) : viewMode === 'list' && filteredTrainers.map((trainer) => (
          <Card key={trainer.id} className="overflow-hidden hover:shadow-card transition-all duration-200 cursor-pointer bg-gradient-card">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center text-2xl overflow-hidden">
                  <span className="text-2xl">
                    {trainer.display_name ? trainer.display_name.charAt(0).toUpperCase() : 'T'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">
                      {trainer.display_name || 'Trener'}
                    </h3>
                    <FavoriteButton trainerId={trainer.id} size="sm" />
                    {trainer.is_verified && (
                      <Badge variant="secondary" className="bg-success/20 text-success">
                        ✓
                      </Badge>
                    )}
                    {trainer.has_video && (
                      <Badge variant="outline" className="text-primary">
                        📹
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-medium">{trainer.rating || 0}</span>
                      <span className="text-sm text-muted-foreground">({trainer.review_count || 0})</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {trainer.specialties?.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  {trainer.languages && trainer.languages.length > 0 && (
                    <div className="mb-2">
                      <LanguageChips 
                        languages={trainer.languages} 
                        maxDisplay={3} 
                        size="sm"
                      />
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    od {trainer.price_from || 0} zł
                  </div>
                  <div className="text-sm text-muted-foreground">za sesję</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleBookTrainer(trainer.id)}
                >
                  Zarezerwuj
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewProfile(trainer.id)}
                >
                  Profil
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleChat(trainer.id)}
                >
                  💬
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Modals */}
      <LocationPermissionModal
        open={showLocationModal}
        onAllow={() => {
          userLocation.requestLocation();
          setShowLocationModal(false);
        }}
        onDeny={() => {
          userLocation.denyLocation();
          setShowLocationModal(false);
        }}
      />
      
      {selectedTrainer && (
        <>
          <BookingModal
            trainer={selectedTrainer}
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedTrainer(null);
            }}
          />
          <TrainerProfileModal
            trainer={selectedTrainer}
            isOpen={showProfileModal}
            onClose={() => {
              setShowProfileModal(false);
              setSelectedTrainer(null);
            }}
            onBook={() => {
              setShowProfileModal(false);
              setShowBookingModal(true);
            }}
            onChat={() => {
              setShowProfileModal(false);
              handleChat(selectedTrainer.id);
            }}
          />
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole="client"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};