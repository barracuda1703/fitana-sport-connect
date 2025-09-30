import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { bookingsService, trainersService, timeOffService, manualBlocksService, type Booking } from '@/services/supabase';
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
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(false);
  const [isLoadingHours, setIsLoadingHours] = useState(false);

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
    const loadAvailableDates = async () => {
      if (!isOpen || !booking) return;
      
      setIsLoadingDates(true);
      try {
        const trainer = await trainersService.getByUserId(booking.trainer_id);
        if (!trainer || !trainer.availability) {
          setAvailableDates([]);
          return;
        }

        const availability = Array.isArray(trainer.availability) ? trainer.availability : [];
        const timeOff = await timeOffService.getByTrainerId(booking.trainer_id);
        const dates: string[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Generate next 60 days
        for (let i = 1; i <= 60; i++) {
          const checkDate = new Date(today);
          checkDate.setDate(today.getDate() + i);
          const dayOfWeek = checkDate.getDay(); // 0=Sunday, 1=Monday, etc.

          // Check if trainer is available on this day
          const dayAvailability: any = availability.find((av: any) => av.day === dayOfWeek);
          if (!dayAvailability || !dayAvailability.available) continue;

          // Check if date is in time_off
          const dateStr = checkDate.toISOString().split('T')[0];
          const isTimeOff = timeOff?.some((to: any) => {
            const startDate = new Date(to.start_date).toISOString().split('T')[0];
            const endDate = new Date(to.end_date).toISOString().split('T')[0];
            return dateStr >= startDate && dateStr <= endDate;
          });

          if (!isTimeOff) {
            dates.push(dateStr);
          }
        }

        setAvailableDates(dates);
      } catch (error) {
        console.error('Error loading available dates:', error);
        setAvailableDates([]);
      } finally {
        setIsLoadingDates(false);
      }
    };

    loadAvailableDates();
  }, [isOpen, booking]);

  // Load available hours when date is selected
  useEffect(() => {
    const loadAvailableHours = async () => {
      if (!selectedDate || !booking) return;
      
      setIsLoadingHours(true);
      try {
        const trainer = await trainersService.getByUserId(booking.trainer_id);
        if (!trainer || !trainer.availability) {
          setAvailableHours([]);
          return;
        }

        const availability = Array.isArray(trainer.availability) ? trainer.availability : [];
        const dayOfWeek = selectedDate.getDay();
        const dayAvailability: any = availability.find((av: any) => av.day === dayOfWeek);
        
        if (!dayAvailability || !dayAvailability.slots || dayAvailability.slots.length === 0) {
          setAvailableHours([]);
          return;
        }

        // Get existing bookings for this date
        const dateStr = selectedDate.toISOString().split('T')[0];
        const existingBookings = await bookingsService.getByTrainerAndDate(booking.trainer_id, dateStr);
        
        // Get manual blocks for this date
        const manualBlocks = await manualBlocksService.getByTrainerId(booking.trainer_id);
        const dayBlocks = manualBlocks?.filter((block: any) => 
          new Date(block.date).toISOString().split('T')[0] === dateStr
        ) || [];

        const availableSlots: string[] = [];

        // Process each availability slot
        dayAvailability.slots.forEach((slot: any) => {
          const [startHour, startMin] = slot.start.split(':').map(Number);
          const [endHour, endMin] = slot.end.split(':').map(Number);
          
          // Generate 30-minute slots
          let currentHour = startHour;
          let currentMin = startMin;
          
          while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
            const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
            const slotDateTime = new Date(selectedDate);
            slotDateTime.setHours(currentHour, currentMin, 0, 0);

            // Check if slot is in the future
            const now = new Date();
            if (slotDateTime <= now) {
              currentMin += 30;
              if (currentMin >= 60) {
                currentMin = 0;
                currentHour += 1;
              }
              continue;
            }

            // Check conflicts with existing bookings
            const hasBookingConflict = existingBookings?.some((b: any) => {
              if (b.id === booking.id) return false; // Exclude current booking
              const bookingTime = new Date(b.scheduled_at);
              const bookingHour = bookingTime.getHours();
              const bookingMin = bookingTime.getMinutes();
              return bookingHour === currentHour && bookingMin === currentMin;
            });

            // Check conflicts with manual blocks
            const hasBlockConflict = dayBlocks.some((block: any) => {
              const [blockStartH, blockStartM] = block.start_time.split(':').map(Number);
              const [blockEndH, blockEndM] = block.end_time.split(':').map(Number);
              const slotMinutes = currentHour * 60 + currentMin;
              const blockStartMinutes = blockStartH * 60 + blockStartM;
              const blockEndMinutes = blockEndH * 60 + blockEndM;
              return slotMinutes >= blockStartMinutes && slotMinutes < blockEndMinutes;
            });

            if (!hasBookingConflict && !hasBlockConflict) {
              availableSlots.push(timeStr);
            }

            // Move to next 30-minute slot
            currentMin += 30;
            if (currentMin >= 60) {
              currentMin = 0;
              currentHour += 1;
            }
          }
        });

        setAvailableHours(availableSlots);
      } catch (error) {
        console.error('Error loading available hours:', error);
        setAvailableHours([]);
      } finally {
        setIsLoadingHours(false);
      }
    };

    loadAvailableHours();
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
              {isLoadingHours ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Ładowanie dostępnych godzin...
                </p>
              ) : availableHours.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Brak dostępnych godzin w tym dniu
                </p>
              ) : (
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