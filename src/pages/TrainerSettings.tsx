import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Clock, Calendar, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { dataStore, TrainerSettings } from '@/services/DataStore';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Niedziela' },
  { value: 1, label: 'Poniedziałek' },
  { value: 2, label: 'Wtorek' },
  { value: 3, label: 'Środa' },
  { value: 4, label: 'Czwartek' },
  { value: 5, label: 'Piątek' },
  { value: 6, label: 'Sobota' },
];

const TIME_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return [`${hour}:00`, `${hour}:30`];
}).flat();

export const TrainerSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [settings, setSettings] = useState<TrainerSettings>({
    workingDays: [1, 2, 3, 4, 5], // Mon-Fri by default
    workingHours: {
      1: { start: "09:00", end: "18:00" },
      2: { start: "09:00", end: "18:00" },
      3: { start: "09:00", end: "18:00" },
      4: { start: "09:00", end: "18:00" },
      5: { start: "09:00", end: "18:00" },
    },
    slotDuration: 30,
    defaultServiceDuration: 60,
  });

  useEffect(() => {
    if (user) {
      const existingSettings = dataStore.getTrainerSettings(user.id);
      if (existingSettings) {
        setSettings(existingSettings);
      }
    }
  }, [user]);

  const handleWorkingDayChange = (dayValue: number, checked: boolean) => {
    if (checked) {
      setSettings(prev => ({
        ...prev,
        workingDays: [...prev.workingDays, dayValue].sort(),
        workingHours: {
          ...prev.workingHours,
          [dayValue]: { start: "09:00", end: "18:00" }
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        workingDays: prev.workingDays.filter(day => day !== dayValue),
        workingHours: Object.fromEntries(
          Object.entries(prev.workingHours).filter(([key]) => parseInt(key) !== dayValue)
        )
      }));
    }
  };

  const handleWorkingHourChange = (day: number, type: 'start' | 'end', value: string) => {
    setSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [type]: value
        }
      }
    }));
  };

  const handleSave = () => {
    if (!user) return;

    dataStore.updateTrainerSettings(user.id, settings);
    toast({
      title: "Ustawienia zapisane",
      description: "Twoje godziny pracy zostały zaktualizowane.",
    });
    navigate(-1);
  };

  if (!user || user.role !== 'trainer') return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Ustawienia dostępności</h1>
            <p className="text-sm text-muted-foreground">Zarządzaj godzinami pracy</p>
          </div>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Zapisz
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Working Days */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Dni pracy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              {DAYS_OF_WEEK.map(day => (
                <div key={day.value} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={settings.workingDays.includes(day.value)}
                      onCheckedChange={(checked) => 
                        handleWorkingDayChange(day.value, checked as boolean)
                      }
                    />
                    <Label htmlFor={`day-${day.value}`} className="font-medium">
                      {day.label}
                    </Label>
                  </div>
                  
                  {settings.workingDays.includes(day.value) && (
                    <div className="ml-6 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm">Od:</Label>
                        <Select
                          value={settings.workingHours[day.value]?.start || "09:00"}
                          onValueChange={(value) => handleWorkingHourChange(day.value, 'start', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">Do:</Label>
                        <Select
                          value={settings.workingHours[day.value]?.end || "18:00"}
                          onValueChange={(value) => handleWorkingHourChange(day.value, 'end', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_OPTIONS.map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Slot Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ustawienia terminów
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Długość slotów czasowych</Label>
              <Select
                value={settings.slotDuration.toString()}
                onValueChange={(value) => setSettings(prev => ({ ...prev, slotDuration: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minut</SelectItem>
                  <SelectItem value="30">30 minut</SelectItem>
                  <SelectItem value="60">60 minut</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Jak często klienci mogą zamawiać nowe terminy
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium">Domyślna długość treningu</Label>
              <Select
                value={settings.defaultServiceDuration.toString()}
                onValueChange={(value) => setSettings(prev => ({ ...prev, defaultServiceDuration: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minut</SelectItem>
                  <SelectItem value="45">45 minut</SelectItem>
                  <SelectItem value="60">60 minut</SelectItem>
                  <SelectItem value="90">90 minut</SelectItem>
                  <SelectItem value="120">120 minut</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Używane gdy usługa nie ma określonej długości
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Podgląd ustawień
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Dni pracy:</strong> {
                settings.workingDays
                  .map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label)
                  .join(', ')
              }</p>
              <p><strong>Sloty co:</strong> {settings.slotDuration} minut</p>
              <p><strong>Domyślna długość treningu:</strong> {settings.defaultServiceDuration} minut</p>
              <div className="mt-3">
                <p className="font-medium">Przykładowe godziny pracy:</p>
                <div className="mt-1 space-y-1">
                  {settings.workingDays.slice(0, 3).map(day => {
                    const dayName = DAYS_OF_WEEK.find(d => d.value === day)?.label;
                    const hours = settings.workingHours[day];
                    return hours ? (
                      <p key={day} className="text-xs text-muted-foreground">
                        {dayName}: {hours.start} - {hours.end}
                      </p>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};