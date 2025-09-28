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
import { dataStore, Service } from '@/services/DataStore';
import { useToast } from '@/hooks/use-toast';

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
  const [availableHours, setAvailableHours] = useState<string[]>([]);

  // Mock clients data - in real app would come from backend
  const [existingClients] = useState<Client[]>([
    { id: 'u-client1', name: 'Kasia Nowak', email: 'kasia@example.com' },
    { id: 'u-client2', name: 'Marek Kowalski', email: 'marek@example.com' },
    { id: 'u-client3', name: 'Anna Wiśniewska', email: 'anna@example.com' }
  ]);

  // Mock trainer services - in real app would come from user profile
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

  // Reset form when modal opens/closes
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
      setAvailableHours([]);
    }
  }, [isOpen]);

  // Load available hours when date and service are selected
  useEffect(() => {
    if (selectedService && selectedDate && user) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const hours = dataStore.getAvailableHoursWithSettings(user.id, dateStr, selectedService.duration);
      setAvailableHours(hours);
    }
  }, [selectedService, selectedDate, user]);

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
    
    // Check for conflicts
    const existingBookings = dataStore.getBookings(user.id);
    const hasConflict = existingBookings.some(booking => 
      booking.status === 'confirmed' && 
      booking.scheduledAt === scheduledAt.toISOString()
    );

    if (hasConflict) {
      toast({
        title: "Konflikt terminów",
        description: "Masz już trening zaplanowany w tym czasie.",
        variant: "destructive"
      });
      return;
    }
    
    await dataStore.createBooking({
      clientId: selectedClient.id,
      trainerId: user.id,
      serviceId: selectedService.id,
      scheduledAt: scheduledAt.toISOString(),
      status: 'confirmed', // Trainer-created bookings are automatically confirmed
      notes: notes.trim() || undefined,
      rescheduleRequests: []
    });

    toast({
      title: "Trening dodany!",
      description: `Trening z ${selectedClient.name} został dodany do kalendarza.`,
    });

    onBookingCreated();
    onClose();
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
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-xl">
              📅
            </div>
            <div>
              <h3 className="font-semibold">Dodaj trening</h3>
              <p className="text-sm text-muted-foreground">{getStepTitle()}</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Step Progress Indicator */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            {['client', 'service', 'date', 'hour', 'notes', 'summary'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step === stepName ? "bg-primary text-primary-foreground" :
                  ['client', 'service', 'date', 'hour', 'notes', 'summary'].indexOf(step) > index ? "bg-success text-white" :
                  "bg-muted text-muted-foreground"
                )}>
                  {['client', 'service', 'date', 'hour', 'notes', 'summary'].indexOf(step) > index ? 
                    <Check className="h-4 w-4" /> : 
                    index + 1
                  }
                </div>
                {index < 5 && (
                  <div className={cn(
                    "w-4 h-0.5 mx-1",
                    ['client', 'service', 'date', 'hour', 'notes', 'summary'].indexOf(step) > index ? "bg-success" : "bg-muted"
                  )} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Client Selection */}
        {step === 'client' && (
          <div className="space-y-4">
            {!newClientMode ? (
              <>
                <div className="space-y-2">
                  {existingClients.map((client) => (
                    <Card 
                      key={client.id} 
                      className="cursor-pointer hover:shadow-card transition-all duration-200 hover:border-primary"
                      onClick={() => handleClientSelect(client.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h5 className="font-medium">{client.name}</h5>
                            <p className="text-sm text-muted-foreground">{client.email}</p>
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Imię i nazwisko</Label>
                  <Input
                    id="clientName"
                    placeholder="Np. Jan Kowalski"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="jan@example.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setNewClientMode(false)}>
                    Anuluj
                  </Button>
                  <Button onClick={handleNewClient} className="flex-1">
                    Dodaj klienta
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Service Selection */}
        {step === 'service' && (
          <div className="space-y-4">
            <div className="space-y-2">
              {trainerServices.map((service) => (
                <Card 
                  key={service.id} 
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

        {/* Step 3: Date Selection */}
        {step === 'date' && selectedService && (
          <div className="space-y-4">
            <div className="text-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={(date) => !isDateAvailable(date)}
                className={cn("mx-auto pointer-events-auto")}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Wybierz datę dla: <strong>{selectedService.name}</strong>
            </p>
          </div>
        )}

        {/* Step 4: Hour Selection */}
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
            
            {availableHours.length === 0 && (
              <Card className="bg-muted/50">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Brak dostępnych godzin na wybrany dzień
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Step 5: Notes */}
        {step === 'notes' && (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notatki (opcjonalne):</label>
              <Textarea
                placeholder="Np. Pierwszy trening, skupić się na technice, klient ma kontuzję..."
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

        {/* Step 6: Summary */}
        {step === 'summary' && selectedClient && selectedService && selectedDate && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{selectedClient.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
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
              Dodaj trening do kalendarza
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};