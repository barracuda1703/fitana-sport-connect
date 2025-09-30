import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { bookingsService, Booking } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onReschedule: () => void;
}

type RescheduleStep = 'date' | 'hour' | 'confirm';

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ 
  isOpen, 
  onClose, 
  booking, 
  onReschedule 
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<RescheduleStep>('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('date');
      setSelectedDate(undefined);
      setSelectedTime('');
      setAvailableDates([]);
      setAvailableHours([]);
    }
  }, [isOpen]);

  // Load available dates when modal opens
  useEffect(() => {
    if (isOpen && booking) {
      // TODO: Implement getAvailableDates in backend
      const dates: string[] = [];
      setAvailableDates(dates);
    }
  }, [isOpen, booking]);

  // Load available hours when date is selected
  useEffect(() => {
    if (selectedDate && booking) {
      // TODO: Implement getAvailableHours in backend
      const hours: string[] = [];
      setAvailableHours(hours);
    }
  }, [selectedDate, booking]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setStep('hour');
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('confirm');
  };

  const handleConfirmReschedule = async () => {
    if (!booking || !selectedDate || !selectedTime) return;

    try {
      const newScheduledAt = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':').map(Number);
      newScheduledAt.setHours(hours, minutes, 0, 0);

      const rescheduleRequests = [...(booking.reschedule_requests || []), {
        id: crypto.randomUUID(),
        requestedAt: new Date().toISOString(),
        requestedBy: 'trainer',
        newTime: newScheduledAt.toISOString(),
        status: 'pending',
        awaitingDecisionBy: 'client'
      }];

      await bookingsService.update(booking.id, { reschedule_requests: rescheduleRequests });
      
      toast({
        title: "Propozycja wysłana",
        description: `Zaproponowano nowy termin: ${newScheduledAt.toLocaleDateString('pl-PL')} o ${selectedTime}. Oczekuj na odpowiedź klienta.`,
      });

      onReschedule();
      onClose();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaproponować nowego terminu",
        variant: "destructive",
      });
    }
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return availableDates.includes(dateStr) && date >= new Date();
  };

  const getClientName = (clientId: string) => {
    return `Klient ${clientId.slice(-4)}`;
  };

  const getServiceName = (serviceId: string) => {
    const serviceNames: { [key: string]: string } = {
      'fitness': 'Trening personalny',
      'yoga': 'Yoga',
      'boxing': 'Boks',
      'pilates': 'Pilates'
    };
    return serviceNames[serviceId] || serviceId;
  };

  if (!booking) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Zaproponuj nowy termin</DialogTitle>
        </DialogHeader>

        {/* Booking Info */}
        <Card className="bg-gradient-card">
          <CardContent className="p-3">
            <div className="text-sm">
              <p className="font-medium">{getClientName(booking.client_id)}</p>
              <p className="text-muted-foreground">{getServiceName(booking.service_id)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Obecny termin: {new Date(booking.scheduled_at).toLocaleDateString('pl-PL')} o{' '}
                {new Date(booking.scheduled_at).toLocaleTimeString('pl-PL', {
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        <div className="space-y-4">
          {step === 'date' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-primary" />
                <span className="font-medium">Wybierz datę</span>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => !isDateAvailable(date)}
                className="w-full"
              />
            </div>
          )}

          {step === 'hour' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Wybierz godzinę</span>
              </div>
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                {availableHours.map((time) => (
                  <Button
                    key={time}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTimeSelect(time)}
                    className={cn(
                      "text-xs",
                      selectedTime === time && "bg-primary text-primary-foreground"
                    )}
                  >
                    {time}
                  </Button>
                ))}
              </div>
              {availableHours.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Brak dostępnych godzin w tym dniu
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStep('date')}
                className="w-full"
              >
                Wróć do wyboru daty
              </Button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-success" />
                <span className="font-medium">Potwierdź nowy termin</span>
              </div>
              
              <Card className="bg-success/10 border-success/20">
                <CardContent className="p-3">
                  <div className="text-center">
                    <p className="font-medium text-success">Nowy termin</p>
                    <p className="text-lg font-bold">
                      {selectedDate?.toLocaleDateString('pl-PL')}
                    </p>
                    <p className="text-lg font-bold">{selectedTime}</p>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setStep('hour')}
                  className="flex-1"
                >
                  Wróć
                </Button>
                <Button
                  onClick={handleConfirmReschedule}
                  className="flex-1"
                >
                  Zaproponuj termin
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};