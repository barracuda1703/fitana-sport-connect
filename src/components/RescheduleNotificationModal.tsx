import React from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Booking, RescheduleRequest } from '@/services/DataStore';

interface RescheduleNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  rescheduleRequest: RescheduleRequest | null;
  onAccept: (bookingId: string, requestId: string) => void;
  onDecline: (bookingId: string, requestId: string) => void;
}

export const RescheduleNotificationModal: React.FC<RescheduleNotificationModalProps> = ({
  isOpen,
  onClose,
  booking,
  rescheduleRequest,
  onAccept,
  onDecline
}) => {
  const { toast } = useToast();

  if (!booking || !rescheduleRequest) {
    return null;
  }

  // Mock trainer names - in real app would come from database
  const getTrainerName = (trainerId: string) => {
    const trainerMap: Record<string, string> = {
      't-1': 'Anna Kowalska',
      't-2': 'Marek Nowak', 
      't-3': 'Ewa Wiśniewska'
    };
    return trainerMap[trainerId] || 'Trener';
  };

  // Mock service names - in real app would come from database
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

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return {
      date: dateObj.toLocaleDateString('pl-PL', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: dateObj.toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const originalTime = formatDateTime(booking.scheduledAt);
  const newTime = formatDateTime(rescheduleRequest.newTime);

  const handleAccept = () => {
    if (!booking || !rescheduleRequest) return;
    onAccept(booking.id, rescheduleRequest.id);
    toast({
      title: "Zmiana terminu zaakceptowana",
      description: "Termin treningu został pomyślnie zmieniony.",
    });
    onClose();
  };

  const handleDecline = () => {
    if (!booking || !rescheduleRequest) return;
    onDecline(booking.id, rescheduleRequest.id);
    toast({
      title: "Zmiana terminu odrzucona",
      description: "Propozycja zmiany terminu została odrzucona. Trening pozostaje w pierwotnym terminie.",
    });
    onClose();
  };

  if (rescheduleRequest.status !== 'pending') {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Propozycja zmiany terminu
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Training Info */}
          <Card className="bg-gradient-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold">
                  {getTrainerName(booking.trainerId).charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
                  <p className="text-sm text-muted-foreground">
                    z {getTrainerName(booking.trainerId)}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {rescheduleRequest.requestedBy === 'trainer' ? 'Od trenera' : 'Od klienta'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Time Comparison */}
          <div className="space-y-3">
            {/* Original Time */}
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
              <XCircle className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Aktualny termin</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {originalTime.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {originalTime.time}
                  </span>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary">↓</span>
              </div>
            </div>

            {/* New Time */}
            <div className="flex items-center gap-3 p-3 rounded-lg border bg-success/10 border-success/20">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm font-medium text-success">Nowy termin</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {newTime.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {newTime.time}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Request Info */}
          <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <User className="h-3 w-3" />
              <span className="font-medium">
                {rescheduleRequest.requestedBy === 'trainer' 
                  ? getTrainerName(booking.trainerId) 
                  : 'Ty'} 
                {rescheduleRequest.requestedBy === 'trainer' ? ' prosi' : ' prosisz'} o zmianę terminu
              </span>
            </div>
            <p className="text-xs">
              Propozycja z dnia: {formatDateTime(rescheduleRequest.requestedAt).date}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={handleDecline}
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Odrzuć
            </Button>
            <Button 
              onClick={handleAccept}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Akceptuj
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};