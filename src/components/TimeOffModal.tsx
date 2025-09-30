import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { timeOffService, bookingsService } from '@/services/supabase';
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

  const handleSubmit = async () => {
    if (!startDate || (mode === 'hours' && (!startTime || !endTime))) {
      return;
    }

    try {
      const startDateTime = mode === 'allDay' 
        ? startDate + 'T00:00:00Z'
        : startDate + 'T' + startTime + ':00Z';
      
      const endDateTime = mode === 'allDay'
        ? endDate + 'T23:59:59Z'
        : endDate + 'T' + endTime + ':00Z';

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
              Zapisz
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeOffModal;
