import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Booking {
  id: string;
  scheduled_at: string;
  service_id: string;
  client_id: string;
  status: string;
  notes?: string;
}

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: Booking[];
  onResolve: (bookingId: string, action: 'cancel' | 'reschedule') => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  conflicts,
  onResolve
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rozwiąż konflikty treningów</DialogTitle>
        </DialogHeader>

        <Alert className="border-warning bg-warning/10">
          <AlertDescription>
            Wykryto {conflicts.length} konfliktów z zaplanowanymi treningami. Zdecyduj co zrobić z każdym z nich.
          </AlertDescription>
        </Alert>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {conflicts.map((booking) => {
            const date = new Date(booking.scheduled_at);
            return (
              <Card key={booking.id} className="border-warning/30">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Usługa: {booking.service_id}</p>
                        <p className="text-sm text-muted-foreground">
                          {date.toLocaleDateString('pl-PL')} o {date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        {booking.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                      <Badge>Konflikt</Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => onResolve(booking.id, 'reschedule')}
                      >
                        Przenieś
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="flex-1"
                        onClick={() => onResolve(booking.id, 'cancel')}
                      >
                        Anuluj
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Button onClick={onClose} className="w-full">
          Zamknij
        </Button>
      </DialogContent>
    </Dialog>
  );
};
