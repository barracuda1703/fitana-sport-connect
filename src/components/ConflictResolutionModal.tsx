import React, { useState } from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Booking } from '@/services/supabase';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictingBooking: Booking | null;
  newBooking: Booking | null;
  onReplace: () => void;
  onReschedule: () => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  isOpen,
  onClose,
  conflictingBooking,
  newBooking,
  onReplace,
  onReschedule
}) => {
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pl-PL', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const getClientName = (clientId: string) => {
    return clientId === 'u-client1' ? 'Kasia' : 'Klient';
  };

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

  if (!conflictingBooking || !newBooking) return null;

  const conflictDateTime = formatDateTime(conflictingBooking.scheduled_at);
  const newDateTime = formatDateTime(newBooking.scheduled_at);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-warning">
            <AlertTriangle className="h-5 w-5" />
            Konflikt terminów
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Masz już zaplanowany trening w tym czasie. Wybierz jedną z opcji:
          </p>

          {/* Existing Booking */}
          <Card className="border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-warning">Istniejący trening</h4>
                  <Badge variant="default" className="mt-1">Potwierdzony</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Klient:</span>
                  <span>{getClientName(conflictingBooking.client_id)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Usługa:</span>
                  <span>{getServiceName(conflictingBooking.service_id)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{conflictDateTime.date} o {conflictDateTime.time}</span>
                </div>
                {conflictingBooking.notes && (
                  <div className="text-xs text-muted-foreground">
                    Notatka: {conflictingBooking.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* New Booking */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-medium text-primary">Nowy trening</h4>
                  <Badge variant="secondary" className="mt-1">Oczekuje</Badge>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Klient:</span>
                  <span>{getClientName(newBooking.client_id)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Usługa:</span>
                  <span>{getServiceName(newBooking.service_id)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{newDateTime.date} o {newDateTime.time}</span>
                </div>
                {newBooking.notes && (
                  <div className="text-xs text-muted-foreground">
                    Notatka: {newBooking.notes}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={onReschedule}
            >
              <Clock className="h-4 w-4 mr-2" />
              Zaproponuj inny termin
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full justify-start"
              onClick={onReplace}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Zastąp istniejący trening
            </Button>
            
            <Button 
              variant="ghost" 
              className="w-full justify-start"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-2" />
              Anuluj
            </Button>
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <strong>Uwaga:</strong> Zastąpienie istniejącego treningu automatycznie powiadomi pierwszego klienta o anulowaniu.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
