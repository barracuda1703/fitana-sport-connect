import React, { useState } from 'react';
import { Search, Filter, MapPin, List, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useLanguage } from '@/contexts/LanguageContext';

const sportsCategories = [
  { id: 'fitness', name: 'Fitness', icon: '💪', color: 'bg-accent' },
  { id: 'yoga', name: 'Yoga', icon: '🧘‍♀️', color: 'bg-primary' },
  { id: 'running', name: 'Bieganie', icon: '🏃‍♂️', color: 'bg-success' },
  { id: 'boxing', name: 'Boks', icon: '🥊', color: 'bg-warning' },
  { id: 'swimming', name: 'Pływanie', icon: '🏊‍♀️', color: 'bg-accent-light' },
  { id: 'tennis', name: 'Tenis', icon: '🎾', color: 'bg-primary-light' },
];

const mockTrainers = [
  {
    id: '1',
    name: 'Anna Kowalska',
    rating: 4.9,
    reviewCount: 127,
    priceFrom: 80,
    distance: '0.5 km',
    specialties: ['Fitness', 'Yoga'],
    isVerified: true,
    hasVideo: true,
    avatar: '👩‍🦰',
  },
  {
    id: '2', 
    name: 'Marek Nowak',
    rating: 4.8,
    reviewCount: 89,
    priceFrom: 90,
    distance: '1.2 km',
    specialties: ['Boks', 'Crossfit'],
    isVerified: true,
    hasVideo: false,
    avatar: '👨‍🦲',
  },
  {
    id: '3',
    name: 'Ewa Wiśniewska', 
    rating: 5.0,
    reviewCount: 203,
    priceFrom: 100,
    distance: '2.1 km',
    specialties: ['Pilates', 'Stretching'],
    isVerified: true,
    hasVideo: true,
    avatar: '👩‍🦱',
  },
];

export const ClientHome: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('home');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Szukaj trenerów, sportów..."
              className="w-full pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
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
            {mockTrainers.length} trenerów w pobliżu
          </span>
        </div>
      </header>

      {/* Sports Categories */}
      <section className="p-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {sportsCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(
                selectedCategory === category.id ? null : category.id
              )}
              className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl transition-all duration-200 min-w-[80px] ${
                selectedCategory === category.id
                  ? 'bg-primary text-primary-foreground shadow-button'
                  : 'bg-card hover:bg-accent/50'
              }`}
            >
              <span className="text-2xl mb-1">{category.icon}</span>
              <span className="text-xs font-medium text-center">{category.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Trainers List */}
      <section className="px-4 space-y-4">
        {mockTrainers.map((trainer) => (
          <Card key={trainer.id} className="overflow-hidden hover:shadow-card transition-all duration-200 cursor-pointer bg-gradient-card">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center text-2xl">
                  {trainer.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{trainer.name}</h3>
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
                <Button variant="default" size="sm" className="flex-1">
                  Zarezerwuj
                </Button>
                <Button variant="outline" size="sm">
                  Profil
                </Button>
                <Button variant="ghost" size="sm">
                  💬
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole="client"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};