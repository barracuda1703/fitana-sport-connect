import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, User, Settings, Camera, MapPin, Briefcase, Languages, Award, Clock, Bell, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BottomNavigation } from '@/components/BottomNavigation';
import { PhotoUploader } from '@/components/PhotoUploader';
import { LocationManagement } from '@/components/LocationManagement';
import { ServiceManagementModal } from '@/components/ServiceManagementModal';
import { SimpleLanguageSelector } from '@/components/SimpleLanguageSelector';
import { trainersService } from '@/services/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { X, Plus } from 'lucide-react';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Poniedziałek' },
  { id: 'tuesday', label: 'Wtorek' },
  { id: 'wednesday', label: 'Środa' },
  { id: 'thursday', label: 'Czwartek' },
  { id: 'friday', label: 'Piątek' },
  { id: 'saturday', label: 'Sobota' },
  { id: 'sunday', label: 'Niedziela' }
];

interface TrainerData {
  display_name: string;
  bio: string;
  specialties: string[];
  languages: string[];
  gallery: string[];
  locations: any[];
  services: any[];
  availability: any;
  settings: {
    notifications: {
      newBookings: boolean;
      cancellations: boolean;
      reminders: boolean;
      reviews: boolean;
      promotions: boolean;
    };
    privacy: {
      showPhoneNumber: boolean;
      showExactLocation: boolean;
      allowDirectMessages: boolean;
    };
    language: string;
    timezone: string;
    booking: {
      autoAccept: boolean;
      bufferTime: number;
    };
  };
}

export const TrainerProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');

  const [trainerData, setTrainerData] = useState<TrainerData>({
    display_name: '',
    bio: '',
    specialties: [],
    languages: [],
    gallery: [],
    locations: [],
    services: [],
    availability: {},
    settings: {
      notifications: {
        newBookings: true,
        cancellations: true,
        reminders: true,
        reviews: true,
        promotions: false,
      },
      privacy: {
        showPhoneNumber: false,
        showExactLocation: true,
        allowDirectMessages: true,
      },
      language: 'pl',
      timezone: 'Europe/Warsaw',
      booking: {
        autoAccept: false,
        bufferTime: 15,
      }
    }
  });

  useEffect(() => {
    const loadTrainerData = async () => {
      if (!user) return;

      try {
        const trainer = await trainersService.getByUserId(user.id);
        if (trainer) {
          setTrainerData({
            display_name: trainer.display_name || '',
            bio: trainer.bio || '',
            specialties: Array.isArray(trainer.specialties) ? trainer.specialties : [],
            languages: Array.isArray(trainer.languages) ? trainer.languages : [],
            gallery: Array.isArray(trainer.gallery) ? trainer.gallery : [],
            locations: Array.isArray(trainer.locations) ? trainer.locations : [],
            services: Array.isArray(trainer.services) ? trainer.services : [],
            availability: typeof trainer.availability === 'object' && trainer.availability !== null ? trainer.availability as any : {},
            settings: typeof trainer.settings === 'object' && trainer.settings !== null ? trainer.settings as any : trainerData.settings
          });
        }
      } catch (error) {
        console.error('Error loading trainer data:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się załadować danych",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadTrainerData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await trainersService.updateByUserId(user.id, trainerData);

      toast({
        title: "Zapisano zmiany",
        description: "Twój profil został zaktualizowany"
      });

      navigate('/profile');
    } catch (error) {
      console.error('Error saving trainer data:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać zmian",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim() && !trainerData.specialties.includes(newSpecialty.trim())) {
      setTrainerData(prev => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()]
      }));
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    setTrainerData(prev => ({
      ...prev,
      specialties: prev.specialties.filter(s => s !== specialty)
    }));
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Ustawienia profilu</h1>
            <p className="text-sm text-muted-foreground">Zarządzaj swoim profilem i preferencjami</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Zapisywanie...' : 'Zapisz'}
          </Button>
        </div>
      </header>

      {loading ? (
        <div className="p-4">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Ładowanie...</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="p-4">
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil i wygląd
              </TabsTrigger>
              <TabsTrigger value="work" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Ustawienia pracy
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Profil i wygląd */}
            <TabsContent value="appearance" className="space-y-4">
              {/* Podstawowe informacje */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Podstawowe informacje
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nazwa wyświetlana</Label>
                    <Input
                      id="displayName"
                      value={trainerData.display_name}
                      onChange={(e) => setTrainerData(prev => ({ ...prev, display_name: e.target.value }))}
                      placeholder="Jak chcesz być wyświetlany?"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">O mnie</Label>
                    <Textarea
                      id="bio"
                      value={trainerData.bio}
                      onChange={(e) => setTrainerData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Opowiedz o sobie, swoim doświadczeniu i podejściu do treningów..."
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Zdjęcia */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Zdjęcia profilu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PhotoUploader
                    profilePhoto={trainerData.gallery[0] || undefined}
                    gallery={trainerData.gallery.slice(1)}
                    onProfilePhotoChange={(photo) => {
                      const newGallery = [...trainerData.gallery];
                      if (photo) {
                        newGallery[0] = photo;
                      } else {
                        newGallery.shift();
                      }
                      setTrainerData(prev => ({ ...prev, gallery: newGallery }));
                    }}
                    onGalleryChange={(photos) => {
                      const profilePhoto = trainerData.gallery[0];
                      const newGallery = profilePhoto ? [profilePhoto, ...photos] : photos;
                      setTrainerData(prev => ({ ...prev, gallery: newGallery }));
                    }}
                  />
                </CardContent>
              </Card>

              {/* Języki */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Languages className="h-5 w-5" />
                    Języki obsługi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleLanguageSelector
                    selectedLanguages={trainerData.languages}
                    onLanguagesChange={(languages) => setTrainerData(prev => ({ ...prev, languages: languages }))}
                    placeholder="Wybierz języki, w których prowadzisz treningi"
                  />
                </CardContent>
              </Card>

              {/* Specjalizacje */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Dyscypliny i specjalizacje
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {trainerData.specialties.map((specialty) => (
                      <div
                        key={specialty}
                        className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full"
                      >
                        <span className="text-sm">{specialty}</span>
                        <button
                          onClick={() => handleRemoveSpecialty(specialty)}
                          className="hover:bg-primary/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Dodaj specjalizację (np. Yoga, Crossfit, Pilates)..."
                      value={newSpecialty}
                      onChange={(e) => setNewSpecialty(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSpecialty()}
                    />
                    <Button onClick={handleAddSpecialty} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Lokalizacje */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Lokalizacje treningów
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LocationManagement
                    locations={trainerData.locations}
                    onLocationsChange={(locations) => setTrainerData(prev => ({ ...prev, locations }))}
                  />
                </CardContent>
              </Card>

              {/* Usługi */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Usługi i cennik
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ServiceManagementModal
                    onAddService={(service) => {
                      setTrainerData(prev => ({
                        ...prev,
                        services: [...prev.services, service]
                      }));
                    }}
                  />
                  
                  {trainerData.services.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {trainerData.services.map((service: any, index: number) => (
                        <div key={index} className="p-3 border rounded-lg flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium">{service.name}</div>
                            <div className="text-sm text-muted-foreground">{service.description}</div>
                            <div className="text-sm mt-1">
                              <span className="font-semibold">{service.price} PLN</span>
                              <span className="text-muted-foreground"> • {service.duration} min</span>
                              <span className="text-muted-foreground"> • {service.type}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setTrainerData(prev => ({
                                ...prev,
                                services: prev.services.filter((_: any, i: number) => i !== index)
                              }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Ustawienia pracy */}
            <TabsContent value="work" className="space-y-4">
              {/* Dostępność */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Dostępność w tygodniu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.id} className="flex items-center justify-between">
                      <Label htmlFor={day.id}>{day.label}</Label>
                      <Switch
                        id={day.id}
                        checked={trainerData.availability[day.id]?.enabled || false}
                        onCheckedChange={(checked) => {
                          setTrainerData(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              [day.id]: { ...prev.availability[day.id], enabled: checked }
                            }
                          }));
                        }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Ustawienia rezerwacji */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Ustawienia rezerwacji
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoAccept">Automatyczne potwierdzanie</Label>
                      <div className="text-sm text-muted-foreground">Automatycznie akceptuj nowe rezerwacje</div>
                    </div>
                    <Switch
                      id="autoAccept"
                      checked={trainerData.settings.booking.autoAccept}
                      onCheckedChange={(checked) => {
                        setTrainerData(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            booking: { ...prev.settings.booking, autoAccept: checked }
                          }
                        }));
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bufferTime">Czas buforowy między treningami</Label>
                    <Select
                      value={trainerData.settings.booking.bufferTime.toString()}
                      onValueChange={(value) => {
                        setTrainerData(prev => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            booking: { ...prev.settings.booking, bufferTime: parseInt(value) }
                          }
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz czas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Brak</SelectItem>
                        <SelectItem value="15">15 minut</SelectItem>
                        <SelectItem value="30">30 minut</SelectItem>
                        <SelectItem value="45">45 minut</SelectItem>
                        <SelectItem value="60">60 minut</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-sm text-muted-foreground">
                      Automatyczna przerwa na przygotowanie między zajęciami
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Powiadomienia */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Powiadomienia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries({
                    newBookings: { label: 'Nowe rezerwacje', desc: 'Powiadamiaj o nowych rezerwacjach' },
                    cancellations: { label: 'Anulowania', desc: 'Powiadamiaj o anulowanych treningach' },
                    reminders: { label: 'Przypomnienia', desc: 'Przypomnienia o nadchodzących treningach' },
                    reviews: { label: 'Nowe opinie', desc: 'Powiadamiaj o nowych opiniach' },
                    promotions: { label: 'Promocje', desc: 'Powiadomienia marketingowe' },
                  }).map(([key, { label, desc }]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={key}>{label}</Label>
                        <div className="text-sm text-muted-foreground">{desc}</div>
                      </div>
                      <Switch
                        id={key}
                        checked={trainerData.settings.notifications[key as keyof typeof trainerData.settings.notifications]}
                        onCheckedChange={(checked) => {
                          setTrainerData(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              notifications: { ...prev.settings.notifications, [key]: checked }
                            }
                          }));
                        }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Prywatność */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Prywatność i bezpieczeństwo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries({
                    showPhoneNumber: { label: 'Pokaż numer telefonu', desc: 'Widoczny w profilu publicznym' },
                    showExactLocation: { label: 'Pokaż dokładną lokalizację', desc: 'Dokładny adres placówek' },
                    allowDirectMessages: { label: 'Wiadomości bezpośrednie', desc: 'Pozwól klientom pisać wiadomości' },
                  }).map(([key, { label, desc }]) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <Label htmlFor={key}>{label}</Label>
                        <div className="text-sm text-muted-foreground">{desc}</div>
                      </div>
                      <Switch
                        id={key}
                        checked={trainerData.settings.privacy[key as keyof typeof trainerData.settings.privacy]}
                        onCheckedChange={(checked) => {
                          setTrainerData(prev => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              privacy: { ...prev.settings.privacy, [key]: checked }
                            }
                          }));
                        }}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Język i region */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Język i region
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="language">Język aplikacji</Label>
                    <Select
                      value={trainerData.settings.language}
                      onValueChange={(value) => {
                        setTrainerData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, language: value }
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz język" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pl">Polski</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="uk">Українська</SelectItem>
                        <SelectItem value="ru">Русский</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Strefa czasowa</Label>
                    <Select
                      value={trainerData.settings.timezone}
                      onValueChange={(value) => {
                        setTrainerData(prev => ({
                          ...prev,
                          settings: { ...prev.settings, timezone: value }
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Wybierz strefę czasową" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Europe/Warsaw">Europa/Warszawa (GMT+1)</SelectItem>
                        <SelectItem value="Europe/London">Europa/Londyn (GMT+0)</SelectItem>
                        <SelectItem value="Europe/Berlin">Europa/Berlin (GMT+1)</SelectItem>
                        <SelectItem value="Europe/Kiev">Europa/Kijów (GMT+2)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      <BottomNavigation 
        userRole="trainer"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};
