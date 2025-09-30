import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar as CalendarIcon, Check, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  type: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface TrainerBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingCreated: () => void;
}

type BookingStep = 'client' | 'service' | 'date' | 'hour' | 'notes' | 'summary';

export const TrainerBookingModal: React.FC<TrainerBookingModalProps> = ({ 
  isOpen, 
  onClose, 
  onBookingCreated 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<BookingStep>('client');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newClientMode, setNewClientMode] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [availableHours] = useState<string[]>(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00']);

  const [existingClients] = useState<Client[]>([
    { id: 'u-client1', name: 'Kasia Nowak', email: 'kasia@example.com' },
    { id: 'u-client2', name: 'Marek Kowalski', email: 'marek@example.com' },
    { id: 'u-client3', name: 'Anna Wiśniewska', email: 'anna@example.com' }
  ]);

  const [trainerServices] = useState<Service[]>([
    {
      id: 'srv-1',
      name: 'Trening personalny',
      price: 90,
      duration: 60,
      type: 'gym'
    },
    {
      id: 'srv-2', 
      name: 'Trening boksu',
      price: 100,
      duration: 75,
      type: 'gym'
    },
    {
      id: 'srv-3',
      name: 'Yoga online',
      price: 65,
      duration: 45,
      type: 'online'
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      setStep('client');
      setSelectedClient(null);
      setNewClientMode(false);
      setNewClientName('');
      setNewClientEmail('');
      setSelectedService(null);
      setSelectedDate(undefined);
      setSelectedTime('');
      setNotes('');
    }
  }, [isOpen]);

  const handleClientSelect = (clientId: string) => {
    const client = existingClients.find(c => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      setStep('service');
    }
  };

  const handleNewClient = () => {
    if (!newClientName.trim() || !newClientEmail.trim()) {
      toast({
        title: "Błąd walidacji",
        description: "Wypełnij imię i email nowego klienta.",
        variant: "destructive"
      });
      return;
    }

    const newClient: Client = {
      id: `new-${Date.now()}`,
      name: newClientName.trim(),
      email: newClientEmail.trim()
    };
    
    setSelectedClient(newClient);
    setNewClientMode(false);
    setStep('service');
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
    setStep('notes');
  };

  const handleNotesNext = () => {
    setStep('summary');
  };

  const handleConfirmBooking = async () => {
    if (!user || !selectedClient || !selectedService || !selectedDate || !selectedTime) return;

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(hours, minutes, 0, 0);
    
    try {
      await bookingsService.create({
        client_id: selectedClient.id,
        trainer_id: user.id,
        service_id: selectedService.id,
        scheduled_at: scheduledAt.toISOString(),
        status: 'confirmed',
        notes: notes.trim() || undefined,
      });

      toast({
        title: "Trening dodany!",
        description: `Trening z ${selectedClient.name} został dodany do kalendarza.`,
      });

      onBookingCreated();
      onClose();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać treningu",
        variant: "destructive"
      });
    }
  };

  const handleBack = () => {
    switch (step) {
      case 'service':
        setStep('client');
        break;
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
      case 'client': return 'Wybierz klienta';
      case 'service': return 'Wybierz usługę';
      case 'date': return 'Wybierz datę';
      case 'hour': return 'Wybierz godzinę';
      case 'notes': return 'Dodaj notatki';
      case 'summary': return 'Podsumowanie';
      default: return '';
    }
  };

  const isDateAvailable = (date: Date) => {
    return date > new Date();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {step !== 'client' && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {getStepTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'client' && (
            <div className="space-y-3">
              {!newClientMode ? (
                <>
                  <div className="space-y-2">
                    <Label>Istniejący klienci</Label>
                    {existingClients.map(client => (
                      <Card 
                        key={client.id}
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => handleClientSelect(client.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-xs text-muted-foreground">{client.email}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setNewClientMode(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Dodaj nowego klienta
                  </Button>
                </>
              ) : (
                <div className="space-y-3">
                  <div>
                    <Label>Imię i nazwisko</Label>
                    <Input
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      placeholder="np. Jan Kowalski"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                      placeholder="jan@example.com"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      className="flex-1"
                      onClick={() => setNewClientMode(false)}
                    >
                      Anuluj
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleNewClient}
                    >
                      Dodaj
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 'service' && (
            <div className="space-y-2">
              {trainerServices.map(service => (
                <Card 
                  key={service.id}
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {service.duration} min • {service.type}
                        </p>
                      </div>
                      <Badge>{service.price} zł</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {step === 'date' && (
            <div className="space-y-3">
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
              <div className="grid grid-cols-3 gap-2">
                {availableHours.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeSelect(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {step === 'notes' && (
            <div className="space-y-3">
              <div>
                <Label>Notatki (opcjonalne)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dodaj uwagi do tego treningu..."
                  rows={4}
                />
              </div>
              <Button 
                className="w-full"
                onClick={handleNotesNext}
              >
                Dalej
              </Button>
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-4">
              <Card className="bg-gradient-card">
                <CardContent className="p-4 space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Klient</p>
                    <p className="font-medium">{selectedClient?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Usługa</p>
                    <p className="font-medium">{selectedService?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data i godzina</p>
                    <p className="font-medium">
                      {selectedDate?.toLocaleDateString('pl-PL')} o {selectedTime}
                    </p>
                  </div>
                  {notes && (
                    <div>
                      <p className="text-sm text-muted-foreground">Notatki</p>
                      <p className="text-sm">{notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              <Button 
                className="w-full"
                onClick={handleConfirmBooking}
              >
                Potwierdź rezerwację
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
