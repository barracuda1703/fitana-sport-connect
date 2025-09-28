import React, { useState } from 'react';
import { ArrowLeft, Bell, Globe, Clock, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface PreferencesState {
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
  availability: {
    autoAccept: boolean;
    bufferTime: number;
  };
}

export const TrainerPreferences: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('preferences');
  const [preferences, setPreferences] = useState<PreferencesState>({
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
    availability: {
      autoAccept: false,
      bufferTime: 15,
    }
  });

  const handleNotificationChange = (key: keyof PreferencesState['notifications']) => {
    setPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const handlePrivacyChange = (key: keyof PreferencesState['privacy']) => {
    setPreferences(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: !prev.privacy[key]
      }
    }));
  };

  const handleAvailabilityChange = (key: keyof PreferencesState['availability'], value: boolean | number) => {
    setPreferences(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // In real app, would save to backend
    toast({
      title: "Preferencje zapisane",
      description: "Twoje ustawienia zostały pomyślnie zaktualizowane.",
    });
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
            <h1 className="text-2xl font-bold">Preferencje</h1>
            <p className="text-muted-foreground">Zarządzaj ustawieniami prywatności i powiadomień</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Zapisz
          </Button>
        </div>
      </header>

      {/* Settings */}
      <section className="p-4 space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Powiadomienia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="newBookings">Nowe rezerwacje</Label>
                <div className="text-sm text-muted-foreground">Powiadamiaj o nowych rezerwacjach</div>
              </div>
              <Switch
                id="newBookings"
                checked={preferences.notifications.newBookings}
                onCheckedChange={() => handleNotificationChange('newBookings')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="cancellations">Anulowania</Label>
                <div className="text-sm text-muted-foreground">Powiadamiaj o anulowanych treningach</div>
              </div>
              <Switch
                id="cancellations"
                checked={preferences.notifications.cancellations}
                onCheckedChange={() => handleNotificationChange('cancellations')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminders">Przypomnienia</Label>
                <div className="text-sm text-muted-foreground">Przypomnienia o nadchodzących treningach</div>
              </div>
              <Switch
                id="reminders"
                checked={preferences.notifications.reminders}
                onCheckedChange={() => handleNotificationChange('reminders')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reviews">Nowe opinie</Label>
                <div className="text-sm text-muted-foreground">Powiadamiaj o nowych opiniach</div>
              </div>
              <Switch
                id="reviews"
                checked={preferences.notifications.reviews}
                onCheckedChange={() => handleNotificationChange('reviews')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="promotions">Promocje</Label>
                <div className="text-sm text-muted-foreground">Powiadomienia marketingowe</div>
              </div>
              <Switch
                id="promotions"
                checked={preferences.notifications.promotions}
                onCheckedChange={() => handleNotificationChange('promotions')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Prywatność i bezpieczeństwo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showPhone">Pokaż numer telefonu</Label>
                <div className="text-sm text-muted-foreground">Widoczny w profilu publicznym</div>
              </div>
              <Switch
                id="showPhone"
                checked={preferences.privacy.showPhoneNumber}
                onCheckedChange={() => handlePrivacyChange('showPhoneNumber')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="showLocation">Pokaż dokładną lokalizację</Label>
                <div className="text-sm text-muted-foreground">Dokładny adres placówek</div>
              </div>
              <Switch
                id="showLocation"
                checked={preferences.privacy.showExactLocation}
                onCheckedChange={() => handlePrivacyChange('showExactLocation')}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="directMessages">Wiadomości bezpośrednie</Label>
                <div className="text-sm text-muted-foreground">Pozwól klientom pisać wiadomości</div>
              </div>
              <Switch
                id="directMessages"
                checked={preferences.privacy.allowDirectMessages}
                onCheckedChange={() => handlePrivacyChange('allowDirectMessages')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language & Region */}
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
                value={preferences.language} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
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
                value={preferences.timezone} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, timezone: value }))}
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

        {/* Availability Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ustawienia dostępności
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoAccept">Automatyczne potwierdzanie</Label>
                <div className="text-sm text-muted-foreground">Automatycznie akceptuj rezerwacje</div>
              </div>
              <Switch
                id="autoAccept"
                checked={preferences.availability.autoAccept}
                onCheckedChange={(checked) => handleAvailabilityChange('autoAccept', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bufferTime">Czas buforowy między treningami</Label>
              <Select 
                value={preferences.availability.bufferTime.toString()} 
                onValueChange={(value) => handleAvailabilityChange('bufferTime', parseInt(value))}
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
                Automatyczna przerwa między treningami na przygotowanie
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole="trainer"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};