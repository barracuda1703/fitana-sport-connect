import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, DollarSign, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { trainersService } from '@/services/supabase';

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('settings');
  const [availability, setAvailability] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;

      try {
        const trainer = await trainersService.getByUserId(user.id);
        if (trainer && trainer.availability) {
          setAvailability(trainer.availability);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    try {
      await trainersService.update(user.id, {
        availability
      });

      toast({
        title: "Ustawienia zapisane",
        description: "Twoje preferencje zostały zaktualizowane"
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać ustawień",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/trainer')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Ustawienia</h1>
            <p className="text-muted-foreground">Zarządzaj swoimi preferencjami</p>
          </div>
          <Button onClick={handleSave}>Zapisz</Button>
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
                <div key={day.id} className="flex items-center justify-between">
                  <Label htmlFor={day.id}>{day.label}</Label>
                  <Switch
                    id={day.id}
                    checked={availability[day.id]?.enabled || false}
                    onCheckedChange={(checked) => {
                      setAvailability({
                        ...availability,
                        [day.id]: { ...availability[day.id], enabled: checked }
                      });
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
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
