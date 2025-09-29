import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CalendarIcon, Clock, AlertTriangle } from 'lucide-react';
import { dataStore, TimeOff, Booking } from '@/services/DataStore';

interface TimeOffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTimeOffAdded: () => void;
  trainerId: string;
  prefilledDate?: Date;
  prefilledMode?: 'allDay' | 'hours';
}

interface Collision {
  booking: Booking;
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
  const [mode, setMode] = useState<'allDay' | 'hours'>('allDay');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [note, setNote] = useState('');
  const [collisions, setCollisions] = useState<Collision[]>([]);
  const [isCheckingCollisions, setIsCheckingCollisions] = useState(false);

  // Prefill form when modal opens
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

  // Check for collisions when form changes
  useEffect(() => {
    if (startDate && (mode === 'allDay' || (startTime && endTime))) {
      checkCollisions();
    }
  }, [startDate, endDate, startTime, endTime, mode]);

  const checkCollisions = async () => {
    if (!startDate) return;

    setIsCheckingCollisions(true);
    try {
      const startDateTime = mode === 'allDay' 
        ? new Date(startDate + 'T00:00:00').toISOString()
        : new Date(startDate + 'T' + startTime + ':00').toISOString();
      
      const endDateTime = mode === 'allDay'
        ? new Date(endDate + 'T23:59:59').toISOString()
        : new Date(endDate + 'T' + endTime + ':00').toISOString();

      const trainerBookings = dataStore.getBookings(trainerId);
      const foundCollisions: Collision[] = [];

      trainerBookings.forEach(booking => {
        const bookingStart = new Date(booking.scheduledAt);
        const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
        
        const timeOffStart = new Date(startDateTime);
        const timeOffEnd = new Date(endDateTime);

        // Check for overlap
        if (
          (bookingStart < timeOffEnd && bookingEnd > timeOffStart) ||
          (timeOffStart < bookingEnd && timeOffEnd > bookingStart)
        ) {
          foundCollisions.push({
            booking,
            conflictType: bookingStart >= timeOffStart && bookingEnd <= timeOffEnd ? 'within' : 'overlap'
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
        ? new Date(startDate + 'T00:00:00').toISOString()
        : new Date(startDate + 'T' + startTime + ':00').toISOString();
      
      const endDateTime = mode === 'allDay'
        ? new Date(endDate + 'T23:59:59').toISOString()
        : new Date(endDate + 'T' + endTime + ':00').toISOString();

      const timeOffData = {
        trainerId,
        type: 'time_off' as const,
        start: startDateTime,
        end: endDateTime,
        allDay: mode === 'allDay',
        note: note.trim() || undefined,
      };

      dataStore.addTimeOff(timeOffData);
      onTimeOffAdded();
      onClose();
    } catch (error) {
      console.error('Error adding time off:', error);
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pl-PL'),
      time: date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getClientName = (clientId: string) => {
    const client = dataStore.getUserById(clientId);
    return client ? `${client.name} ${client.surname || ''}`.trim() : 'Klient';
  };

  const getServiceName = (serviceId: string) => {
    const serviceMap: Record<string, string> = {
      'srv-1': 'Trening personalny',
      'srv-2': 'Yoga',
      'srv-3': 'Trening boksu',
      'srv-4': 'Crossfit',
      'srv-5': 'Pilates',
      'srv-6': 'Stretching'
    };
    return serviceMap[serviceId] || 'Trening';
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
          {/* Mode Selection */}
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

          {/* Date Range */}
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

          {/* Time Range (only for hours mode) */}
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

          {/* Note */}
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

          {/* Collisions Alert */}
          {collisions.length > 0 && (
            <Alert className="border-warning bg-warning/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Wykryto kolizje z istniejącymi treningami:</p>
                  <div className="space-y-1 text-sm">
                    {collisions.map((collision, index) => {
                      const { date, time } = formatDateTime(collision.booking.scheduledAt);
                      return (
                        <div key={index} className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            {getServiceName(collision.booking.serviceId)} z {getClientName(collision.booking.clientId)} - {date} {time}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Te treningi będą niedostępne w wybranym okresie. Rozważ zmianę terminu lub skontaktuj się z klientami.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Anuluj
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!startDate || (mode === 'hours' && (!startTime || !endTime)) || isCheckingCollisions}
            >
              {isCheckingCollisions ? 'Sprawdzanie...' : 'Zapisz'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimeOffModal;
