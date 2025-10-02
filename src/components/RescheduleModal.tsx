import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { bookingsService, trainersService, type Booking } from '@/services/supabase';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RescheduleRequest {
  id: string;
  newTime: string;
  status: string;
  requestedBy: string;
}

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
  const [availableSlotsMap, setAvailableSlotsMap] = useState<Map<string, string[]>>(new Map());
  const [isLoadingDates, setIsLoadingDates] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('date');
      setSelectedDate(undefined);
      setSelectedTime('');
      setAvailableDates([]);
      setAvailableSlotsMap(new Map());
    }
  }, [isOpen]);

  // Load available slots using RPC when modal opens
  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (!isOpen || !booking) return;
      
      // 🐛 DEBUG: Log booking details
      console.log('[RescheduleModal] Loading slots for:', {
        booking_id: booking.id,
        trainer_id: booking.trainer_id,
        service_id: booking.service_id,
        scheduled_at: booking.scheduled_at
      });
      
      setIsLoadingDates(true);
      try {
        const trainer = await trainersService.getByUserId(booking.trainer_id);
        const durationMin = 60; // Default to 60 minutes
        const timezone = (trainer?.settings as any)?.timezone || 'Europe/Warsaw';
        
        // 🐛 DEBUG: Log RPC parameters
        console.log('[RescheduleModal] Calling RPC with:', {
          trainer_id: booking.trainer_id,
          duration_min: durationMin,
          window_weeks: 12,
          timezone
        });
        
        const { data, error } = await supabase.rpc('get_trainer_available_slots', {
          p_trainer_id: booking.trainer_id,
          p_duration_min: durationMin,
          p_window_start: new Date().toISOString(),
          p_window_end: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000).toISOString(),
          p_timezone: timezone
        });
        
        if (error) {
          console.error('[RescheduleModal] RPC error:', error);
          throw error;
        }
        
        // 🐛 DEBUG: Log results
        console.log('[RescheduleModal] RPC returned slots:', data?.length || 0);
        
        // Group slots by date
        const slotsByDate = new Map<string, string[]>();
        data?.forEach((slot: any) => {
          const slotDate = new Date(slot.slot_start);
          const dateKey = slotDate.toISOString().split('T')[0];
          const timeStr = slotDate.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
          });
          
          if (!slotsByDate.has(dateKey)) {
            slotsByDate.set(dateKey, []);
          }
          slotsByDate.get(dateKey)!.push(timeStr);
        });
        
        setAvailableDates(Array.from(slotsByDate.keys()));
        setAvailableSlotsMap(slotsByDate);
        
        if (slotsByDate.size === 0) {
          console.warn('[RescheduleModal] No slots found - check trainer availability and time_off');
        }
      } catch (error) {
        console.error('[RescheduleModal] Error loading slots:', error);
        setAvailableDates([]);
        setAvailableSlotsMap(new Map());
      } finally {
        setIsLoadingDates(false);
      }
    };

    loadAvailableSlots();
  }, [isOpen, booking]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time selection
    if (date) {
      setStep('hour');
    }
  };
  
  // Get available hours for selected date
  const getAvailableHours = (): string[] => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toISOString().split('T')[0];
    return availableSlotsMap.get(dateKey) || [];
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

      const rescheduleRequests: RescheduleRequest[] = [...(booking.reschedule_requests || []), {
        id: crypto.randomUUID(),
        requestedAt: new Date().toISOString(),
        requestedBy: 'trainer' as const,
        newTime: newScheduledAt.toISOString(),
        status: 'pending' as const,
        awaitingDecisionBy: 'client' as const
      }];

      // Update booking with reschedule request
      await bookingsService.update(booking.id, {
        reschedule_requests: rescheduleRequests
      });
      
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

  const getClientName = () => {
    if (booking?.client?.name && booking?.client?.surname) {
      return `${booking.client.name} ${booking.client.surname}`;
    }
    return 'Klient';
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
              <p className="font-medium">{getClientName()}</p>
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
              {isLoadingDates ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ładowanie dostępnych terminów...
                </p>
              ) : availableDates.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Brak dostępnych terminów w najbliższym czasie
                </p>
              ) : (
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={(date) => !isDateAvailable(date)}
                  className="w-full"
                />
              )}
            </div>
          )}

          {step === 'hour' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="font-medium">Wybierz godzinę</span>
              </div>
              {getAvailableHours().length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Brak dostępnych godzin w tym dniu
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {getAvailableHours().map((time) => (
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