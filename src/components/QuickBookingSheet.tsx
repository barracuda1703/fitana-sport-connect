import React, { useState, useEffect } from 'react';
import { Clock, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from '@/components/ui/drawer';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsService, chatsService, availabilityService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Service {
  name: string;
  price: number;
  duration: number;
  type: string;
}

interface QuickBookingSheetProps {
  trainerId: string;
  trainerName: string;
  services: Service[];
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = 'service' | 'date' | 'hour' | 'confirm';

export const QuickBookingSheet: React.FC<QuickBookingSheetProps> = ({
  trainerId,
  trainerName,
  services,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availableHours, setAvailableHours] = useState<string[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep('service');
      setSelectedService(null);
      setSelectedDate(undefined);
      setSelectedTime('');
      setNotes('');
      setAvailableDates([]);
      setAvailableHours([]);
    }
  }, [isOpen]);

  // Fetch available dates when service is selected
  useEffect(() => {
    if (selectedService && trainerId) {
      fetchAvailableDates();
    }
  }, [selectedService, trainerId]);

  // Fetch available hours when date is selected
  useEffect(() => {
    if (selectedService && selectedDate && trainerId) {
      fetchAvailableHours();
    }
  }, [selectedService, selectedDate, trainerId]);

  const fetchAvailableDates = async () => {
    setLoadingAvailability(true);
    try {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 30);
      
      const dates = await availabilityService.getAvailableDates(trainerId, today, futureDate);
      setAvailableDates(dates);
    } catch (error) {
      console.error('Error fetching available dates:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać dostępnych terminów",
        variant: "destructive"
      });
    } finally {
      setLoadingAvailability(false);
    }
  };

  const fetchAvailableHours = async () => {
    if (!selectedDate) return;
    
    setLoadingAvailability(true);
    try {
      const hours = await availabilityService.getAvailableHours(trainerId, selectedDate);
      setAvailableHours(hours);
    } catch (error) {
      console.error('Error fetching available hours:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać dostępnych godzin",
        variant: "destructive"
      });
    } finally {
      setLoadingAvailability(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('date');
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime('');
      setStep('hour');
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('confirm');
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) return;

    setSubmitting(true);
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);
      
      if (scheduledAt <= new Date()) {
        toast({
          title: "Błąd walidacji",
          description: "Nie można zarezerwować treningu w przeszłości.",
          variant: "destructive"
        });
        return;
      }
      
      const bookingData = {
        client_id: user.id,
        trainer_id: trainerId,
        service_id: selectedService.name,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending',
        notes: notes.trim() || undefined,
        reschedule_requests: []
      };

      await bookingsService.create(bookingData);
      await chatsService.createForBooking(user.id, trainerId);

      toast({
        title: "Rezerwacja wysłana!",
        description: "Trener otrzymał prośbę o rezerwację.",
      });

      onClose();
    } catch (error) {
      console.error('Booking creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nie udało się wysłać rezerwacji';
      toast({
        title: "Błąd",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isDateAvailable = (date: Date) => {
    if (date <= new Date()) return true;
    return !availableDates.some(availableDate => 
      availableDate.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {step === 'service' && 'Wybierz usługę'}
            {step === 'date' && 'Wybierz datę'}
            {step === 'hour' && 'Wybierz godzinę'}
            {step === 'confirm' && 'Potwierdź rezerwację'}
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* Step 1: Service Selection */}
          {step === 'service' && (
            <div className="space-y-3">
              {services.map((service, index) => (
                <button
                  key={`${service.name}-${index}`}
                  className="w-full p-4 rounded-lg border hover:border-primary bg-card hover:bg-accent/50 transition-all duration-200 text-left"
                  onClick={() => handleServiceSelect(service)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h5 className="font-medium">{service.name}</h5>
                      <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {service.duration} min
                        <Badge variant="outline" className="ml-2">
                          {service.type === 'online' ? 'Online' : 
                           service.type === 'gym' ? 'Siłownia' :
                           service.type === 'court' ? 'Kort' : 'Dojazd'}
                        </Badge>
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{service.price} zł</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Step 2: Date Selection */}
          {step === 'date' && selectedService && (
            <div className="space-y-4">
              {loadingAvailability ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Ładowanie dostępnych terminów...</p>
                </div>
              ) : (
                <div className="flex justify-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={isDateAvailable}
                    className="rounded-md border"
                    locale={pl}
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 3: Hour Selection */}
          {step === 'hour' && selectedService && selectedDate && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {format(selectedDate, 'EEEE, d MMMM', { locale: pl })}
                </p>
                <p className="font-medium">{selectedService.name}</p>
              </div>
              
              {loadingAvailability ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Ładowanie dostępnych godzin...</p>
                </div>
              ) : availableHours.length === 0 ? (
                <div className="p-6 text-center bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Brak dostępnych godzin na wybrany dzień
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {availableHours.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      onClick={() => handleTimeSelect(time)}
                      className="h-12"
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirm */}
          {step === 'confirm' && selectedService && selectedDate && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg border bg-card space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {format(selectedDate, 'EEEE, d MMMM', { locale: pl })} o {selectedTime}
                  </span>
                </div>
                
                <div>
                  <p className="font-medium">{selectedService.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedService.duration} min</p>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Koszt:</span>
                  <span className="text-lg font-bold text-primary">{selectedService.price} zł</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Notatki dla trenera (opcjonalne)
                </label>
                <Textarea
                  placeholder="Np. Jestem początkujący, mam kontuzję..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {step === 'confirm' && (
          <DrawerFooter>
            <Button 
              onClick={handleConfirmBooking} 
              className="w-full" 
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                'Potwierdź rezerwację'
              )}
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
};
