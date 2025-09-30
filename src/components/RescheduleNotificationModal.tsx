import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  scheduled_at: string;
  service_id: string;
  trainer_id: string;
  status: string;
}

interface RescheduleRequest {
  id: string;
  newTime: string;
  status: string;
  requestedBy: string;
}

interface RescheduleNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
  request: RescheduleRequest;
  onAccept: () => void;
  onDecline: () => void;
}

export const RescheduleNotificationModal: React.FC<RescheduleNotificationModalProps> = ({
  isOpen,
  onClose,
  booking,
  request,
  onAccept,
  onDecline
}) => {
  const { toast } = useToast();

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pl-PL'),
      time: date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const currentDateTime = formatDateTime(booking.scheduled_at);
  const newDateTime = formatDateTime(request.newTime);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Prośba o zmianę terminu</DialogTitle>
        </DialogHeader>

        <Alert>
          <AlertDescription>
            {request.requestedBy === 'client' ? 'Klient' : 'Trener'} proponuje zmianę terminu treningu.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Obecny termin:</p>
                  <p className="text-sm text-muted-foreground">
                    {currentDateTime.date} o {currentDateTime.time}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-primary">Nowy termin:</p>
                  <p className="text-sm text-primary font-semibold">
                    {newDateTime.date} o {newDateTime.time}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onDecline}
              className="flex-1"
            >
              Odrzuć
            </Button>
            <Button
              onClick={onAccept}
              className="flex-1"
            >
              Zaakceptuj
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
