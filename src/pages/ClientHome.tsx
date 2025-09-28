import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, List, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { BookingModal } from '@/components/BookingModal';
import { TrainerProfileModal } from '@/components/TrainerProfileModal';
import { FavoriteButton } from '@/components/FavoriteButton';
import { FilterModal, FilterOptions } from '@/components/FilterModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataStore, Trainer } from '@/services/DataStore';

const sportsCategories = [
  { id: 'fitness', name: 'Fitness', icon: '💪', color: 'bg-accent' },
  { id: 'yoga', name: 'Yoga', icon: '🧘‍♀️', color: 'bg-primary' },
  { id: 'running', name: 'Bieganie', icon: '🏃‍♂️', color: 'bg-success' },
  { id: 'boxing', name: 'Boks', icon: '🥊', color: 'bg-warning' },
  { id: 'swimming', name: 'Pływanie', icon: '🏊‍♀️', color: 'bg-accent-light' },
  { id: 'tennis', name: 'Tenis', icon: '🎾', color: 'bg-primary-light' },
];

export const ClientHome: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [sports] = useState(dataStore.getSports());
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    maxDistance: 50,
    priceRange: [0, 500],
    minRating: 0,
    availableToday: false,
    showFavoritesOnly: false,
    trainerGender: 'all',
    serviceTypes: []
  });

  useEffect(() => {
    // Force reset data if needed for development
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('reset') === 'true') {
      dataStore.resetData();
      window.location.search = ''; // Remove reset param
    }
    
    setTrainers(dataStore.getTrainers());
  }, []);

  const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [filteredTrainers, setFilteredTrainers] = useState<Trainer[]>([]);

  useEffect(() => {
    let filtered = trainers;
    
    // Apply category filter
    if (selectedCategory) {
      const sportIdToSpecialty: Record<string, string> = {
        's-fitness': 'Fitness',
        's-yoga': 'Yoga', 
        's-running': 'Bieganie',
        's-boxing': 'Boks',
        's-swimming': 'Pływanie',
        's-tennis': 'Tenis'
      };
      
      const specialtyName = sportIdToSpecialty[selectedCategory];
      if (specialtyName) {
        filtered = filtered.filter(trainer => 
          trainer.specialties.some(specialty => 
            specialty.toLowerCase().includes(specialtyName.toLowerCase())
          )
        );
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(trainer => 
        trainer.name.toLowerCase().includes(query) ||
        trainer.specialties.some(specialty => 
          specialty.toLowerCase().includes(query)
        ) ||
        // Search in mock facility names
        'fitness club centrum siłownia'.includes(query)
      );
    }

    // Apply advanced filters
    if (filters.showFavoritesOnly) {
      // Mock favorites - in real app would check user's favoriteTrainers
      const mockFavorites = ['t-1', 't-3'];
      filtered = filtered.filter(trainer => mockFavorites.includes(trainer.id));
    }

    if (filters.minRating > 0) {
      filtered = filtered.filter(trainer => trainer.rating >= filters.minRating);
    }

    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 500) {
      filtered = filtered.filter(trainer => 
        trainer.priceFrom >= filters.priceRange[0] && 
        trainer.priceFrom <= filters.priceRange[1]
      );
    }

    // Mock distance filter (in real app would use GPS coordinates)
    if (filters.maxDistance < 50) {
      // Keep all trainers for demo - in real app would filter by actual distance
    }

    setFilteredTrainers(filtered);
  }, [trainers, selectedCategory, searchQuery, filters]);

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
              serviceTypes: []
            })}
          />
        </div>

        {/* View Toggle */}
        <div className="flex justify-between items-center">
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
          <span className="text-sm text-muted-foreground">
            {filteredTrainers.length} trenerów w pobliżu
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
             // Map DataStore sport IDs to specialty names for counting
             const sportIdToSpecialty: Record<string, string> = {
               's-fitness': 'Fitness',
               's-yoga': 'Yoga', 
               's-running': 'Bieganie',
               's-boxing': 'Boks',
               's-swimming': 'Pływanie',
               's-tennis': 'Tenis'
             };
             
             const specialtyName = sportIdToSpecialty[sport.id];
             const categoryCount = trainers.filter(trainer => 
               trainer.specialties.some(specialty => 
                 specialty.toLowerCase().includes(specialtyName?.toLowerCase() || '')
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
                 <span className="text-xs font-medium text-center">{sport.name}</span>
                 <span className="text-xs text-muted-foreground">({categoryCount})</span>
               </button>
             );
           })}
           
           {/* Debug Reset Button - only show in development */}
           {process.env.NODE_ENV === 'development' && (
             <button
               onClick={() => {
                 dataStore.resetData();
                 window.location.reload();
               }}
               className="flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-[80px] bg-red-100 hover:bg-red-200 text-red-700"
             >
               <span className="text-2xl mb-1">🔄</span>
               <span className="text-xs font-medium text-center">Reset</span>
             </button>
           )}
         </div>
       </section>

      {/* Trainers List */}
      <section className="px-4 space-y-4">
        {viewMode === 'map' && (
          <Card className="bg-gradient-card h-64 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p>Mapa z pinami trenerów</p>
              <p className="text-sm">(Wymaga klucza API)</p>
            </div>
          </Card>
        )}
        
        {viewMode === 'list' && filteredTrainers.map((trainer) => (
          <Card key={trainer.id} className="overflow-hidden hover:shadow-card transition-all duration-200 cursor-pointer bg-gradient-card">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center text-2xl">
                  {trainer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{trainer.name}</h3>
                    <FavoriteButton trainerId={trainer.id} size="sm" />
                    {trainer.isVerified && (
                      <Badge variant="secondary" className="bg-success/20 text-success">
                        ✓
                      </Badge>
                    )}
                    {trainer.hasVideo && (
                      <Badge variant="outline" className="text-primary">
                        📹
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-medium">{trainer.rating}</span>
                      <span className="text-sm text-muted-foreground">({trainer.reviewCount})</span>
                    </div>
                    <span className="text-sm text-muted-foreground">• {trainer.distance}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {trainer.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">
                    od {trainer.priceFrom} zł
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