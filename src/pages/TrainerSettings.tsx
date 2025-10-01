import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { trainersService } from '@/services/supabase';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Poniedziałek' },
  { id: 'tuesday', label: 'Wtorek' },
  { id: 'wednesday', label: 'Środa' },
  { id: 'thursday', label: 'Czwartek' },
  { id: 'friday', label: 'Piątek' },
  { id: 'saturday', label: 'Sobota' },
  { id: 'sunday', label: 'Niedziela' }
];

export const TrainerSettings: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab] = useState('profile');
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
          setAvailability({});
        } else {
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

    try {
      await trainersService.updateByUserId(user.id, {
        availability
      });

      toast.success('Ustawienia zostały zapisane');
      navigate('/profile');
    } catch (error: any) {
      console.error('Error saving trainer settings:', error);
      toast.error(error.message || 'Nie udało się zapisać ustawień');
    }
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
        <div className="p-4 space-y-4">
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
