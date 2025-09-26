import React, { useState } from 'react';
import { X, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { dataStore, Trainer, Service } from '@/services/DataStore';
import { useToast } from '@/hooks/use-toast';

interface BookingModalProps {
  trainer: Trainer;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ trainer, isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [step, setStep] = useState<'service' | 'datetime' | 'confirm'>('service');

  // Generate next 7 days for booking
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split('T')[0];
  });

  // Generate time slots
  const timeSlots = [
    '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', 
    '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('datetime');
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedService || !selectedDate || !selectedTime) return;

    const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    
    await dataStore.createBooking({
      clientId: user.id,
      trainerId: trainer.id,
      serviceId: selectedService.id,
      scheduledAt,
      status: 'pending',
      notes: notes.trim() || undefined,
    });

    toast({
      title: "Rezerwacja wysłana!",
      description: "Trener otrzymał prośbę o rezerwację. Oczekuj na potwierdzenie.",
    });

    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedService(null);
    setSelectedLocation('');
    setSelectedDate('');
    setSelectedTime('');
    setNotes('');
    setStep('service');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-xl">
              {trainer.avatar}
            </div>
            <div>
              <h3 className="font-semibold">{trainer.name}</h3>
              <p className="text-sm text-muted-foreground">Rezerwacja treningu</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {step === 'service' && (
          <div className="space-y-4">
            <h4 className="font-medium">Wybierz usługę:</h4>
            <div className="space-y-2">
              {trainer.services.map((service) => (
                <Card 
                  key={service.id} 
                  className="cursor-pointer hover:shadow-card transition-all duration-200"
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h5 className="font-medium">{service.name}</h5>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
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

        {step === 'datetime' && selectedService && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setStep('service')}>
                ← Wstecz
              </Button>
              <h4 className="font-medium">{selectedService.name}</h4>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Data:</label>
                <Select value={selectedDate} onValueChange={setSelectedDate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz datę" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {new Date(date).toLocaleDateString('pl-PL', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Godzina:</label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz godzinę" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Notatki (opcjonalne):</label>
                <Textarea
                  placeholder="Dodaj uwagi lub pytania..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setStep('service')}
              >
                Wstecz
              </Button>
              <Button 
                className="flex-1"
                onClick={handleConfirmBooking}
                disabled={!selectedDate || !selectedTime}
              >
                Zarezerwuj ({selectedService.price} zł)
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};