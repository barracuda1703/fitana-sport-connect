import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, MapPin, Calendar as CalendarIcon, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsService, chatsService, availabilityService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';

interface Service {
  name: string;
  price: number;
  duration: number;
  type: string;
}

interface Trainer {
  id: string;
  user_id: string;
  display_name: string | null;
  services: any;
}

interface BookingModalProps {
  trainer: Trainer;
  isOpen: boolean;
  onClose: () => void;
}

type BookingStep = 'service' | 'date' | 'hour' | 'notes' | 'summary';

export const BookingModal: React.FC<BookingModalProps> = ({ trainer, isOpen, onClose }) => {
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
    if (selectedService && trainer.user_id) {
      fetchAvailableDates();
    }
  }, [selectedService, trainer.user_id]);

  // Fetch available hours when date is selected
  useEffect(() => {
    if (selectedService && selectedDate && trainer.user_id) {
      fetchAvailableHours();
    }
  }, [selectedService, selectedDate, trainer.user_id]);

  const fetchAvailableDates = async () => {
    if (!trainer.user_id) return;
    
    setLoadingAvailability(true);
    try {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 30);
      
      const dates = await availabilityService.getAvailableDates(trainer.user_id, today, futureDate);
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
    if (!trainer.user_id || !selectedDate) return;
    
    setLoadingAvailability(true);
    try {
      const hours = await availabilityService.getAvailableHours(trainer.user_id, selectedDate);
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
      setSelectedTime(''); // Reset time when date changes
      setStep('hour');
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep('notes');
  };

  const handleNotesNext = () => {
    setStep('summary');
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) return;

    // Validate trainer has user_id
    if (!trainer.user_id) {
      toast({
        title: "Błąd",
        description: "Brak danych trenera. Spróbuj ponownie.",
        variant: "destructive"
      });
      return;
    }

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);
      
      // Use service name as identifier since services don't have explicit IDs
      const serviceIdentifier = selectedService.name;
      
      const bookingData = {
        client_id: user.id,
        trainer_id: trainer.user_id, // Use user_id to match profiles table
        service_id: serviceIdentifier,
        scheduled_at: scheduledAt.toISOString(),
        status: 'pending',
        notes: notes.trim() || undefined,
        reschedule_requests: []
      };

      console.log('Creating booking with data:', bookingData);
      
      await bookingsService.create(bookingData);

      // Create chat between client and trainer using user_id
      await chatsService.createForBooking(user.id, trainer.user_id);

      toast({
        title: "Rezerwacja wysłana!",
        description: "Trener otrzymał prośbę o rezerwację. Oczekuj na potwierdzenie.",
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
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'date':
        setStep('service');
        break;
      case 'hour':
        setStep('date');
        break;
      case 'notes':
        setStep('hour');
        break;
      case 'summary':
        setStep('notes');
        break;
      default:
        onClose();
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 'service': return 'Wybierz usługę';
      case 'date': return 'Wybierz datę';
      case 'hour': return 'Wybierz godzinę';
      case 'notes': return 'Dodaj notatki';
      case 'summary': return 'Podsumowanie';
      default: return '';
    }
  };

  const isDateAvailable = (date: Date) => {
    if (date <= new Date()) return true; // Disable past dates
    return !availableDates.some(availableDate => 
      availableDate.toISOString().split('T')[0] === date.toISOString().split('T')[0]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {step !== 'service' && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-xl">
              {trainer.display_name ? trainer.display_name.charAt(0) : 'T'}
            </div>
            <div>
              <h3 className="font-semibold">{trainer.display_name || 'Trener'}</h3>
              <p className="text-sm text-muted-foreground">{getStepTitle()}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Step Progress Indicator */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            {['service', 'date', 'hour', 'notes', 'summary'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === stepName ? "bg-primary text-primary-foreground" :
                  ['service', 'date', 'hour', 'notes', 'summary'].indexOf(step) > index ? "bg-success text-white" :
                  "bg-muted text-muted-foreground"
                )}>
                  {['service', 'date', 'hour', 'notes', 'summary'].indexOf(step) > index ? 
                    <Check className="h-4 w-4" /> : 
                    index + 1
                  }
                </div>
                {index < 4 && (
                  <div className={cn(
                    "w-4 h-0.5 mx-1",
                    ['service', 'date', 'hour', 'notes', 'summary'].indexOf(step) > index ? "bg-success" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Service Selection */}
        {step === 'service' && (
          <div className="space-y-4">
            <div className="space-y-2">
              {(Array.isArray(trainer.services) ? trainer.services : []).map((service: Service, index: number) => (
                <Card 
                  key={`${service.name}-${index}`}
                  className="cursor-pointer hover:shadow-card transition-all duration-200 hover:border-primary"
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardContent className="p-4">
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Date Selection */}
        {step === 'date' && selectedService && (
          <div className="space-y-4">
            {loadingAvailability ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Ładowanie dostępnych terminów...</p>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => isDateAvailable(date)}
                    className={cn("mx-auto pointer-events-auto")}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Dostępne terminy dla: <strong>{selectedService.name}</strong>
                </p>
              </>
            )}
          </div>
        )}

        {/* Step 3: Hour Selection */}
        {step === 'hour' && selectedService && selectedDate && (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                {selectedDate.toLocaleDateString('pl-PL', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
              <p className="font-medium">{selectedService.name}</p>
            </div>
            
            {loadingAvailability ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Ładowanie dostępnych godzin...</p>
              </div>
            ) : availableHours.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Brak dostępnych godzin na wybrany dzień
                  </p>
                </CardContent>
              </Card>
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

        {/* Step 4: Notes */}
        {step === 'notes' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notatki dla trenera (opcjonalne):</label>
              <Textarea
                placeholder="Np. Jestem początkujący, mam kontuzję kolana, wolę treningi rano..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
            
            <Button onClick={handleNotesNext} className="w-full">
              Dalej
            </Button>
          </div>
        )}

        {/* Step 5: Summary */}
        {step === 'summary' && selectedService && selectedDate && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    💪
                  </div>
                  <div>
                    <p className="font-medium">{selectedService.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedService.duration} min</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {selectedDate.toLocaleDateString('pl-PL', { 
                      weekday: 'long', 
                      month: 'long', 
                      day: 'numeric' 
                    })} o {selectedTime}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {selectedService.type === 'online' ? 'Online' : 
                     selectedService.type === 'gym' ? 'Siłownia' :
                     selectedService.type === 'court' ? 'Kort' : 'Dojazd do klienta'}
                  </span>
                </div>
                
                {notes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Notatki:</p>
                    <p className="text-sm text-muted-foreground">{notes}</p>
                  </div>
                )}
                
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Koszt:</span>
                    <span className="text-lg font-bold text-primary">{selectedService.price} zł</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Button onClick={handleConfirmBooking} className="w-full" size="lg">
              Potwierdź rezerwację
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
