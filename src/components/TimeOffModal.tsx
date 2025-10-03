import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Clock, AlertTriangle, Power } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { timeOffService, bookingsService, trainersService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';

interface TimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeOffAdded: () => void;
  trainerId: string;
  prefilledDate?: Date;
  prefilledMode?: 'allDay' | 'hours';
}

interface Collision {
  booking: any;
  conflictType: 'overlap' | 'within';
}

export const TimeOffModal: React.FC<TimeOffModalProps> = ({
  isOpen,
  onClose,
  onTimeOffAdded,
  trainerId,
  prefilledDate,
  prefilledMode
}) => {
  const { toast } = useToast();
  const [mode, setMode] = useState<'allDay' | 'hours'>('allDay');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');
  const [collisions, setCollisions] = useState<Collision[]>([]);
  const [isCheckingCollisions, setIsCheckingCollisions] = useState(false);
  const [offMode, setOffMode] = useState(false);
  const [loadingOffMode, setLoadingOffMode] = useState(false);

  // Load current off_mode state
  useEffect(() => {
    const loadOffModeState = async () => {
      try {
        const trainer = await trainersService.getByUserId(trainerId);
        if (trainer) {
          setOffMode(trainer.off_mode || false);
        }
      } catch (error) {
        console.error('Error loading off mode state:', error);
      }
    };
    
    if (isOpen && trainerId) {
      loadOffModeState();
    }
  }, [isOpen, trainerId]);

  useEffect(() => {
    if (isOpen) {
      if (prefilledDate) {
        const dateStr = prefilledDate.toISOString().split('T')[0];
        setStartDate(dateStr);
        setEndDate(dateStr);
      }
      if (prefilledMode) {
        setMode(prefilledMode);
      }
      setNote('');
      setCollisions([]);
    }
  }, [isOpen, prefilledDate, prefilledMode]);

  useEffect(() => {
    if (startDate && (mode === 'allDay' || (startTime && endTime))) {
      checkCollisions();
    }
  }, [startDate, endDate, startTime, endTime, mode]);

  const checkCollisions = async () => {
    if (!startDate) return;

    setIsCheckingCollisions(true);
    try {
      const trainerBookings = await bookingsService.getByUserId(trainerId);
      const foundCollisions: Collision[] = [];

      const startDateTime = mode === 'allDay' 
        ? new Date(startDate + 'T00:00:00')
        : new Date(startDate + 'T' + startTime + ':00');
      
      const endDateTime = mode === 'allDay'
        ? new Date(endDate + 'T23:59:59')
        : new Date(endDate + 'T' + endTime + ':00');

      trainerBookings.forEach(booking => {
        const bookingStart = new Date(booking.scheduled_at);
        const bookingEnd = new Date(bookingStart.getTime() + 60 * 60000);

        if (
          (bookingStart < endDateTime && bookingEnd > startDateTime) ||
          (startDateTime < bookingEnd && endDateTime > bookingStart)
        ) {
          foundCollisions.push({
            booking,
            conflictType: 'overlap'
          });
        }
      });

      setCollisions(foundCollisions);
    } catch (error) {
      console.error('Error checking collisions:', error);
    } finally {
      setIsCheckingCollisions(false);
    }
  };

  const handleOffModeToggle = async (checked: boolean) => {
    setLoadingOffMode(true);
    try {
      await trainersService.updateByUserId(trainerId, { off_mode: checked });
      setOffMode(checked);
      
      toast({
        title: checked ? "Tryb OFF włączony" : "Tryb OFF wyłączony",
        description: checked 
          ? "Nie będziesz widoczny dla użytkowników szukających trenerów"
          : "Jesteś ponownie widoczny dla użytkowników"
      });
    } catch (error) {
      console.error('Error toggling off mode:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zmienić trybu OFF",
        variant: "destructive"
      });
    } finally {
      setLoadingOffMode(false);
    }
  };

  const handleSubmit = async () => {
    if (!startDate || (mode === 'hours' && (!startTime || !endTime))) {
      return;
    }

    try {
      // Save dates without UTC "Z" - use local time
      const startDateTime = mode === 'allDay' 
        ? startDate + 'T00:00:00'
        : startDate + 'T' + startTime + ':00';
      
      const endDateTime = mode === 'allDay'
        ? endDate + 'T23:59:59'
        : endDate + 'T' + endTime + ':00';

      await timeOffService.create({
        trainer_id: trainerId,
        start_date: startDateTime,
        end_date: endDateTime,
        all_day: mode === 'allDay',
        note: note.trim() || undefined,
      });

      toast({
        title: "Wolne dodane",
        description: "Pomyślnie dodano wolne w kalendarzu"
      });

      onTimeOffAdded();
      onClose();
    } catch (error) {
      console.error('Error adding time off:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się dodać wolnego",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Dodaj wolne / urlop
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* OFF Mode Toggle */}
          <Card className="p-4 bg-muted/50 border-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${offMode ? 'bg-destructive/20' : 'bg-primary/20'}`}>
                  <Power className={`h-5 w-5 ${offMode ? 'text-destructive' : 'text-primary'}`} />
                </div>
                <div>
                  <h4 className="font-semibold">Tryb OFF</h4>
                  <p className="text-xs text-muted-foreground">
                    Szybkie wyłączenie dostępności w nagłych wypadkach
                  </p>
                </div>
              </div>
              <Switch
                checked={offMode}
                onCheckedChange={handleOffModeToggle}
                disabled={loadingOffMode}
              />
            </div>
            {offMode && (
              <Alert className="mt-3 border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  Jesteś niewidoczny dla użytkowników. Nowe rezerwacje nie są możliwe.
                </AlertDescription>
              </Alert>
            )}
          </Card>
          <div className="space-y-2">
            <Label>Tryb</Label>
            <Select value={mode} onValueChange={(value: 'allDay' | 'hours') => setMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="allDay">Cały dzień / zakres dni</SelectItem>
                <SelectItem value="hours">Konkretne godziny</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Od</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Do</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          {mode === 'hours' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Od godziny</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Do godziny</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="note">Notatka (opcjonalnie)</Label>
            <Textarea
              id="note"
              placeholder="Np. Urlop, wizyta lekarska, prywatne sprawy..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {collisions.length > 0 && (
            <Alert className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <p className="font-medium">Wykryto {collisions.length} kolizji z istniejącymi treningami</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Anuluj
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!startDate || (mode === 'hours' && (!startTime || !endTime))}
            >
              Zapisz wolne
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeOffModal;
