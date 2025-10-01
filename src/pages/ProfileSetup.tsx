import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { LocationManagement } from '@/components/LocationManagement';
import { SimplePhotoUploader } from '@/components/SimplePhotoUploader';
import { SPORTS_LIST } from '@/data/sports';
import { ArrowLeft, ArrowRight } from 'lucide-react';

type ProfileSetupStep = 'basic' | 'photo' | 'trainer-details' | 'trainer-locations' | 'trainer-availability';

export const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<ProfileSetupStep>('basic');
  
  const [formData, setFormData] = useState({
    surname: user?.surname || '',
    city: user?.city || '',
    avatarUrl: user?.avatarUrl || '',
    bio: '',
    mainDiscipline: '',
    locations: [] as any[],
    availability: {} as any,
  });

  const isTrainer = user?.role === 'trainer';

  const handleSubmit = async (skipOptional: boolean = false) => {
    setLoading(true);

    try {
      // Update profile
      const { error: profileError } = await (supabase as any)
        .from('profiles')
        .update({
          surname: formData.surname,
          city: formData.city,
          avatarurl: formData.avatarUrl,
        })
        .eq('id', user?.id);

      if (profileError) throw profileError;

      // If trainer, create/update trainer profile
      if (isTrainer) {
        const trainerData: any = {
          user_id: user?.id,
          display_name: `${user?.name} ${formData.surname}`,
        };

        if (formData.bio) {
          trainerData.bio = formData.bio;
        }

        if (formData.mainDiscipline) {
          trainerData.specialties = [formData.mainDiscipline];
        }

        if (formData.locations.length > 0) {
          trainerData.locations = formData.locations;
        }

        if (formData.availability && Object.keys(formData.availability).length > 0) {
          trainerData.availability = formData.availability;
        }

        const { error: trainerError } = await (supabase as any)
          .from('trainers')
          .upsert(trainerData, { onConflict: 'user_id' });

        if (trainerError) throw trainerError;
      }

      await refreshUser();

      toast({
        title: t('success'),
        description: 'Profil został zaktualizowany',
      });

      // Redirect based on role
      navigate(user?.role === 'client' ? '/client' : '/trainer', { replace: true });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'basic') {
      if (!formData.surname || !formData.city) {
        toast({
          title: 'Błąd',
          description: 'Wypełnij wszystkie wymagane pola',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep('photo');
    } else if (currentStep === 'photo') {
      if (isTrainer && !formData.avatarUrl) {
        toast({
          title: 'Błąd',
          description: 'Dodaj zdjęcie profilowe - jest wymagane dla trenerów',
          variant: 'destructive',
        });
        return;
      }
      if (isTrainer) {
        setCurrentStep('trainer-details');
      } else {
        handleSubmit();
      }
    } else if (currentStep === 'trainer-details') {
      if (!formData.mainDiscipline) {
        toast({
          title: 'Błąd',
          description: 'Wybierz swoją główną dyscyplinę',
          variant: 'destructive',
        });
        return;
      }
      if (!formData.bio || !formData.bio.trim()) {
        toast({
          title: 'Błąd',
          description: 'Opis jest wymagany dla trenera',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep('trainer-locations');
    } else if (currentStep === 'trainer-locations') {
      if (formData.locations.length === 0) {
        toast({
          title: 'Błąd',
          description: 'Dodaj przynajmniej jedną lokalizację',
          variant: 'destructive',
        });
        return;
      }
      setCurrentStep('trainer-availability');
    } else if (currentStep === 'trainer-availability') {
      const hasAnyAvailability = Object.values(formData.availability).some(
        (day: any) => day?.enabled && day?.startTime && day?.endTime
      );
      if (!hasAnyAvailability) {
        toast({
          title: 'Błąd',
          description: 'Ustaw dostępność przynajmniej dla jednego dnia',
          variant: 'destructive',
        });
        return;
      }
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep === 'photo') {
      setCurrentStep('basic');
    } else if (currentStep === 'trainer-details') {
      setCurrentStep('photo');
    } else if (currentStep === 'trainer-locations') {
      setCurrentStep('trainer-details');
    } else if (currentStep === 'trainer-availability') {
      setCurrentStep('trainer-locations');
    }
  };

  const handleSkip = () => {
    if (currentStep === 'photo' && !isTrainer) {
      handleSubmit(true);
    } else if (currentStep === 'trainer-details') {
      setCurrentStep('trainer-locations');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user) {
    return null;
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'basic':
        return 'Podstawowe informacje';
      case 'photo':
        return isTrainer ? 'Zdjęcie profilowe (wymagane)' : 'Zdjęcie profilowe';
      case 'trainer-details':
        return 'Twoja specjalizacja';
      case 'trainer-locations':
        return 'Lokalizacje treningów';
      case 'trainer-availability':
        return 'Godziny dostępności';
      default:
        return '';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'basic':
        return 'Uzupełnij swoje podstawowe dane';
      case 'photo':
        return isTrainer ? 'Dodaj zdjęcie profilowe (wymagane dla trenerów)' : 'Dodaj zdjęcie profilowe aby zwiększyć zaufanie';
      case 'trainer-details':
        return 'Wybierz swoją główną dyscyplinę sportową';
      case 'trainer-locations':
        return 'Dodaj do 5 lokalizacji gdzie prowadzisz treningi';
      case 'trainer-availability':
        return 'Ustaw godziny pracy dla każdego dnia tygodnia';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{getStepTitle()}</CardTitle>
          <CardDescription>{getStepDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 'basic' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Imię</Label>
                <Input
                  id="name"
                  value={user.name}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="surname">Nazwisko *</Label>
                <Input
                  id="surname"
                  name="surname"
                  value={formData.surname}
                  onChange={handleInputChange}
                  required
                  placeholder="Wprowadź nazwisko"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Miasto *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  placeholder="Wprowadź miasto"
                />
              </div>
            </div>
          )}

          {currentStep === 'photo' && (
            <div className="space-y-4">
              <SimplePhotoUploader
                currentPhoto={formData.avatarUrl}
                onPhotoUploaded={(url) => setFormData({ ...formData, avatarUrl: url })}
                userId={user.id}
              />
            </div>
          )}

           {currentStep === 'trainer-details' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mainDiscipline">Główna dyscyplina *</Label>
                <Select
                  value={formData.mainDiscipline}
                  onValueChange={(value) => setFormData({ ...formData, mainDiscipline: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz dyscyplinę" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPORTS_LIST('pl').map((sport) => (
                      <SelectItem key={sport} value={sport}>
                        {sport}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Krótki opis o sobie *</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Opowiedz o swoim doświadczeniu..."
                  rows={4}
                  required
                />
              </div>
            </div>
          )}

          {currentStep === 'trainer-locations' && (
            <div className="space-y-4">
              <LocationManagement
                locations={formData.locations}
                onLocationsChange={(locations) => setFormData({ ...formData, locations })}
              />
              {formData.locations.length >= 5 && (
                <p className="text-sm text-muted-foreground">
                  Osiągnąłeś maksymalną liczbę lokalizacji (5)
                </p>
              )}
            </div>
          )}

          {currentStep === 'trainer-availability' && (
            <div className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                const dayLabels = {
                  monday: 'Poniedziałek',
                  tuesday: 'Wtorek',
                  wednesday: 'Środa',
                  thursday: 'Czwartek',
                  friday: 'Piątek',
                  saturday: 'Sobota',
                  sunday: 'Niedziela'
                };
                
                return (
                  <div key={day} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`${day}-enabled`} className="text-base font-semibold">
                        {dayLabels[day as keyof typeof dayLabels]}
                      </Label>
                      <Switch
                        id={`${day}-enabled`}
                        checked={formData.availability[day]?.enabled || false}
                        onCheckedChange={(checked) => {
                          setFormData({
                            ...formData,
                            availability: {
                              ...formData.availability,
                              [day]: {
                                ...formData.availability[day],
                                enabled: checked,
                                startTime: formData.availability[day]?.startTime || '08:00',
                                endTime: formData.availability[day]?.endTime || '20:00'
                              }
                            }
                          });
                        }}
                      />
                    </div>
                    
                    {formData.availability[day]?.enabled && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`${day}-start`} className="text-sm">Od:</Label>
                          <Input
                            id={`${day}-start`}
                            type="time"
                            value={formData.availability[day]?.startTime || '08:00'}
                            onChange={(e) => {
                              setFormData({
                                ...formData,
                                availability: {
                                  ...formData.availability,
                                  [day]: {
                                    ...formData.availability[day],
                                    startTime: e.target.value
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`${day}-end`} className="text-sm">Do:</Label>
                          <Input
                            id={`${day}-end`}
                            type="time"
                            value={formData.availability[day]?.endTime || '20:00'}
                            onChange={(e) => {
                              const startTime = formData.availability[day]?.startTime || '08:00';
                              if (e.target.value <= startTime) {
                                toast({
                                  title: 'Błąd',
                                  description: 'Godzina końcowa musi być późniejsza niż początkowa',
                                  variant: 'destructive',
                                });
                                return;
                              }
                              setFormData({
                                ...formData,
                                availability: {
                                  ...formData.availability,
                                  [day]: {
                                    ...formData.availability[day],
                                    endTime: e.target.value
                                  }
                                }
                              });
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex gap-2 mt-6">
            {currentStep !== 'basic' && (
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Wstecz
              </Button>
            )}

            {currentStep === 'photo' && !isTrainer && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleSkip}
                disabled={loading}
              >
                Dodam później
              </Button>
            )}

            <Button
              type="button"
              className="ml-auto"
              onClick={handleNext}
              disabled={loading}
            >
              {loading ? 'Zapisywanie...' : 
                (currentStep === 'trainer-availability' && isTrainer) ? 'Zakończ konfigurację' :
                (currentStep === 'photo' && !isTrainer) ? 'Zapisz i kontynuuj' : 
                'Dalej'}
              {currentStep !== 'trainer-availability' && currentStep !== 'trainer-locations' && <ArrowRight className="h-4 w-4 ml-2" />}
            </Button>
          </div>

          {isTrainer && currentStep === 'trainer-availability' && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Po zakończeniu setup'u będziesz mógł dostosować więcej szczegółów w ustawieniach trenera,
                takich jak cennik i dodatkowe specjalizacje.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
