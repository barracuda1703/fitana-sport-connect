import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Save, User, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LocationManagement } from '@/components/LocationManagement';
import { ServiceManagementModal } from '@/components/ServiceManagementModal';
import { PhotoUploaderWithUpload } from '@/components/PhotoUploaderWithUpload';
import { LanguageSelector } from '@/components/LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { trainersService } from '@/services/supabase';
import { sportsCategories, getSportName } from '@/data/sports';
import { toast } from 'sonner';
import type { Location, Service } from '@/types';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Poniedziałek' },
  { id: 'tuesday', label: 'Wtorek' },
  { id: 'wednesday', label: 'Środa' },
  { id: 'thursday', label: 'Czwartek' },
  { id: 'friday', label: 'Piątek' },
  { id: 'saturday', label: 'Sobota' },
  { id: 'sunday', label: 'Niedziela' }
];

// Helper functions to safely parse JSONB data
const parseLocations = (data: any): Location[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data as Location[];
  return [];
};

const parseServices = (data: any): Service[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data as Service[];
  return [];
};

export const TrainerSettings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [gender, setGender] = useState<string>('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Locations state
  const [locations, setLocations] = useState<Location[]>([]);
  
  // Services state
  const [services, setServices] = useState<Service[]>([]);
  
  // Availability state
  const [availability, setAvailability] = useState<any>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);
        const trainer = await trainersService.getByUserId(user.id);
        
        if (!trainer) {
          // Auto-create trainer record if it doesn't exist
          await trainersService.create({
            user_id: user.id,
            display_name: user.name,
            specialties: [],
            languages: ['pl'],
            locations: [],
            services: [],
            availability: [],
            gallery: [],
            settings: {}
          });
          // Set defaults
          setDisplayName(user.name || '');
          setSelectedLanguages(['pl']);
          setLocations([]);
          setServices([]);
          setAvailability({});
        } else {
          // Load existing data
          setDisplayName(trainer.display_name || '');
          setBio(trainer.bio || '');
          setGender(trainer.gender || '');
          setSelectedLanguages(trainer.languages || ['pl']);
          setSelectedSpecialties(trainer.specialties || []);
          setAvatarUrl(user.avatarUrl || '');
          setLocations(parseLocations(trainer.locations));
          setServices(parseServices(trainer.services));
          setAvailability(trainer.availability || {});
        }
      } catch (error: any) {
        console.error('Error loading trainer settings:', error);
        setError(error.message || 'Nie udało się załadować ustawień');
        toast.error('Błąd podczas ładowania ustawień');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (!displayName.trim()) {
      toast.error('Nazwa wyświetlana jest wymagana');
      return;
    }

    if (locations.length === 0) {
      toast.error('Dodaj przynajmniej jedną lokalizację');
      return;
    }

    if (services.length === 0) {
      toast.error('Dodaj przynajmniej jedną usługę');
      return;
    }

    try {
      await trainersService.updateByUserId(user.id, {
        display_name: displayName,
        bio,
        gender: gender || null,
        languages: selectedLanguages,
        specialties: selectedSpecialties,
        locations,
        services,
        availability
      });

      toast.success('Ustawienia zostały zapisane');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error saving trainer settings:', error);
      toast.error(error.message || 'Nie udało się zapisać ustawień');
    }
  };

  const handleAddService = (service: Service) => {
    setServices([...services, service]);
  };

  const handleSpecialtyToggle = (sportId: string) => {
    setSelectedSpecialties(prev =>
      prev.includes(sportId)
        ? prev.filter(id => id !== sportId)
        : [...prev, sportId]
    );
  };

  if (!user) return null;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate('/profile')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold flex-1">Ustawienia</h1>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              Zapisz
            </Button>
          </div>
        </header>

        {error ? (
          <div className="p-4">
            <Card className="border-destructive">
              <CardContent className="p-6 text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Spróbuj ponownie
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : loading ? (
          <div className="p-4 space-y-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        ) : (
        <div className="p-4 pb-24">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="locations">
                <MapPin className="h-4 w-4 mr-2" />
                Lokalizacje
              </TabsTrigger>
              <TabsTrigger value="services">
                <Briefcase className="h-4 w-4 mr-2" />
                Usługi
              </TabsTrigger>
              <TabsTrigger value="availability">
                <Clock className="h-4 w-4 mr-2" />
                Dostępność
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Zdjęcie profilowe</CardTitle>
                </CardHeader>
                <CardContent>
                  <PhotoUploaderWithUpload
                    profilePhoto={avatarUrl}
                    gallery={[]}
                    onProfilePhotoChange={(url) => setAvatarUrl(url || '')}
                    onGalleryChange={() => {}}
                    userId={user.id}
                    role="trainer"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Podstawowe informacje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Nazwa wyświetlana *</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Twoja nazwa wyświetlana"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">O mnie</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Opisz siebie i swoje doświadczenie..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">Płeć</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Wybierz płeć" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Mężczyzna</SelectItem>
                        <SelectItem value="female">Kobieta</SelectItem>
                        <SelectItem value="other">Inna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Języki</CardTitle>
                </CardHeader>
                <CardContent>
                  <LanguageSelector
                    selectedLanguages={selectedLanguages}
                    onLanguagesChange={setSelectedLanguages}
                    placeholder="Wybierz języki, którymi się posługujesz"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Specjalizacje</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sportsCategories.map(sport => (
                      <Button
                        key={sport.id}
                        variant={selectedSpecialties.includes(sport.id) ? 'default' : 'outline'}
                        onClick={() => handleSpecialtyToggle(sport.id)}
                        className="justify-start"
                      >
                        <span className="mr-2">{sport.icon}</span>
                        {getSportName(sport.id, 'pl')}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Locations Tab */}
            <TabsContent value="locations" className="mt-4">
              <LocationManagement
                locations={locations}
                onLocationsChange={setLocations}
              />
            </TabsContent>

            {/* Services Tab */}
            <TabsContent value="services" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Usługi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ServiceManagementModal onAddService={handleAddService} />
                  
                  {services.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nie dodano jeszcze żadnych usług
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {services.map((service) => (
                        <Card key={service.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className="font-semibold">{service.name}</h4>
                                <p className="text-sm text-muted-foreground">{service.description}</p>
                                <div className="flex gap-4 mt-2 text-sm">
                                  <span>{service.price} {service.currency}</span>
                                  <span>{service.duration} min</span>
                                  <span className="capitalize">{service.type}</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setServices(services.filter(s => s.id !== service.id))}
                              >
                                Usuń
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Availability Tab */}
            <TabsContent value="availability" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Dostępność
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`${day.id}-enabled`} className="text-base font-semibold">
                          {day.label}
                        </Label>
                        <Switch
                          id={`${day.id}-enabled`}
                          checked={availability[day.id]?.enabled || false}
                          onCheckedChange={(checked) => {
                            setAvailability({
                              ...availability,
                              [day.id]: {
                                ...availability[day.id],
                                enabled: checked,
                                startTime: availability[day.id]?.startTime || '08:00',
                                endTime: availability[day.id]?.endTime || '20:00'
                              }
                            });
                          }}
                        />
                      </div>
                      
                      {availability[day.id]?.enabled && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor={`${day.id}-start`} className="text-sm">Od:</Label>
                              <Input
                                id={`${day.id}-start`}
                                type="time"
                                value={availability[day.id]?.startTime || '08:00'}
                                onChange={(e) => {
                                  setAvailability({
                                    ...availability,
                                    [day.id]: {
                                      ...availability[day.id],
                                      startTime: e.target.value
                                    }
                                  });
                                }}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor={`${day.id}-end`} className="text-sm">Do:</Label>
                              <Input
                                id={`${day.id}-end`}
                                type="time"
                                value={availability[day.id]?.endTime || '20:00'}
                                onChange={(e) => {
                                  const startTime = availability[day.id]?.startTime || '08:00';
                                  if (e.target.value <= startTime) {
                                    toast.error('Godzina końcowa musi być późniejsza niż początkowa');
                                    return;
                                  }
                                  setAvailability({
                                    ...availability,
                                    [day.id]: {
                                      ...availability[day.id],
                                      endTime: e.target.value
                                    }
                                  });
                                }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`${day.id}-frequency`} className="text-sm">Częstotliwość treningów:</Label>
                            <Select
                              value={availability[day.id]?.frequency || '60'}
                              onValueChange={(value) => {
                                setAvailability({
                                  ...availability,
                                  [day.id]: {
                                    ...availability[day.id],
                                    frequency: value
                                  }
                                });
                              }}
                            >
                              <SelectTrigger id={`${day.id}-frequency`}>
                                <SelectValue placeholder="Wybierz częstotliwość" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="30">Co 30 minut</SelectItem>
                                <SelectItem value="45">Co 45 minut</SelectItem>
                                <SelectItem value="60">Co godzinę</SelectItem>
                                <SelectItem value="90">Co 1.5 godziny</SelectItem>
                                <SelectItem value="120">Co 2 godziny</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

        <BottomNavigation 
          userRole={user?.role || 'trainer'}
          activeTab={activeTab}
          onTabChange={() => {}}
        />
      </div>
    </ErrorBoundary>
  );
};
