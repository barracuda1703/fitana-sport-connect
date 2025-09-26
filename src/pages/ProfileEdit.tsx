import React, { useState } from 'react';
import { ArrowLeft, Save, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { LanguageSelector } from '@/components/LanguageSelector';
import { LocationManagement } from '@/components/LocationManagement';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Location } from '@/types';

export const ProfileEditPage: React.FC = () => {
  const { user, switchRole } = useAuth();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    city: user?.city || '',
    language: user?.language || currentLanguage.code,
    email: user?.email || '',
    specialties: (user?.role === 'trainer' ? (user as any)?.specialties || (user as any)?.disciplines || [] : []),
  });

  // Available disciplines - synchronized with ClientHome categories
  const availableDisciplines = [
    'Fitness',
    'Yoga', 
    'Bieganie',
    'Boks',
    'Pływanie',
    'Tenis'
  ];

  // Mock locations data - in real app, this would come from user data
  const [locations, setLocations] = useState<Location[]>([
    {
      id: 'loc-1',
      name: 'Fitness Club Centrum',
      address: 'ul. Marszałkowska 10, 00-001 Warszawa',
      coordinates: { lat: 52.2297, lng: 21.0122 },
      radius: 2
    }
  ]);

  const handleSave = () => {
    // In a real app, this would update the user in the backend
    // For trainers, validate that they have at least one location and one specialty
    if (user?.role === 'trainer') {
      if (locations.length === 0) {
        toast({
          title: "Błąd walidacji",
          description: "Musisz mieć co najmniej jedną placówkę.",
          variant: "destructive"
        });
        return;
      }
      
      if (formData.specialties.length === 0) {
        toast({
          title: "Błąd walidacji", 
          description: "Musisz wybrać co najmniej jedną dyscyplinę sportową.",
          variant: "destructive"
        });
        return;
      }
    }

    toast({
      title: "Profil zaktualizowany",
      description: "Twoje dane zostały pomyślnie zapisane.",
    });
    navigate(-1);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecialtyToggle = (specialty: string) => {
    const currentSpecialties = formData.specialties as string[];
    const isSelected = currentSpecialties.includes(specialty);
    
    if (isSelected) {
      handleInputChange('specialties', currentSpecialties.filter(s => s !== specialty));
    } else {
      handleInputChange('specialties', [...currentSpecialties, specialty]);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Edytuj profil</h1>
          </div>
          <LanguageSelector />
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Zapisz
          </Button>
        </div>
      </header>

      {/* Form */}
      <section className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Podstawowe informacje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Imię</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Wprowadź imię"
              />
            </div>

            {user.role === 'trainer' && (
              <div className="space-y-2">
                <Label htmlFor="surname">Nazwisko</Label>
                <Input
                  id="surname"
                  value={formData.surname}
                  onChange={(e) => handleInputChange('surname', e.target.value)}
                  placeholder="Wprowadź nazwisko"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="wprowadz@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Miasto</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Wprowadź miasto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Język</Label>
              <div className="flex gap-2 items-center">
                <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Wybierz język" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pl">Polski</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="uk">Українська</SelectItem>
                    <SelectItem value="ru">Русский</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-muted-foreground">lub</span>
                <LanguageSelector />
              </div>
            </div>
          </CardContent>
        </Card>

        {user.role === 'trainer' && (
          <Card>
            <CardHeader>
              <CardTitle>Dyscypliny sportowe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base">Wybierz dyscypliny, w których świadczysz usługi</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableDisciplines.map((discipline) => (
                    <div key={discipline} className="flex items-center space-x-2">
                      <Checkbox
                        id={`discipline-${discipline}`}
                        checked={(formData.specialties as string[]).includes(discipline)}
                        onCheckedChange={() => handleSpecialtyToggle(discipline)}
                      />
                      <Label 
                        htmlFor={`discipline-${discipline}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {discipline}
                      </Label>
                    </div>
                  ))}
                </div>
                {(formData.specialties as string[]).length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Wybierz co najmniej jedną dyscyplinę, aby klienci mogli Cię znaleźć
                  </p>
                )}
                {(formData.specialties as string[]).length > 0 && (
                  <p className="text-sm text-success">
                    ✓ Wybrano {(formData.specialties as string[]).length} {(formData.specialties as string[]).length === 1 ? 'dyscyplinę' : 'dyscyplin'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {user.role === 'trainer' && (
          <Card>
            <CardHeader>
              <CardTitle>Informacje dla trenerów</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status konta</Label>
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <p className="text-sm text-success">✓ Konto zweryfikowane</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Subskrypcja</Label>
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-primary">📋 Plan Pro - aktywny</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Następne rozliczenie: 15 lutego 2024
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate('/trainer-settings')}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Ustawienia dostępności
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {user.role === 'trainer' && (
          <LocationManagement
            locations={locations}
            onLocationsChange={setLocations}
          />
        )}
      </section>
    </div>
  );
};