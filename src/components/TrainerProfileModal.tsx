import React from 'react';
import { X, Star, MapPin, Clock, CheckCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trainer } from '@/services/DataStore';

interface TrainerProfileModalProps {
  trainer: Trainer;
  isOpen: boolean;
  onClose: () => void;
  onBook: () => void;
  onChat: () => void;
}

export const TrainerProfileModal: React.FC<TrainerProfileModalProps> = ({ 
  trainer, 
  isOpen, 
  onClose, 
  onBook, 
  onChat 
}) => {
  // Mock reviews data
  const reviews = [
    {
      id: '1',
      clientName: 'Marcin K.',
      rating: 5,
      comment: 'Świetny trener! Bardzo profesjonalne podejście i indywidualne dostosowanie ćwiczeń.',
      date: '2024-01-15'
    },
    {
      id: '2', 
      clientName: 'Agata S.',
      rating: 5,
      comment: 'Polecam! Anna potrafi zmotywować i wytłumaczyć każde ćwiczenie.',
      date: '2024-01-10'
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center text-2xl">
              {trainer.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">{trainer.name}</h3>
                {trainer.isVerified && (
                  <CheckCircle className="h-5 w-5 text-success" />
                )}
                {trainer.hasVideo && (
                  <Video className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="font-medium">{trainer.rating}</span>
                  <span className="text-sm text-muted-foreground">({trainer.reviewCount})</span>
                </div>
                <span className="text-sm text-muted-foreground">• {trainer.distance}</span>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">O trenerze</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{trainer.bio}</p>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Specjalizacje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {trainer.specialties.map((specialty) => (
                  <Badge key={specialty} variant="secondary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Usługi i ceny</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trainer.services.map((service) => (
                <div key={service.id} className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {service.duration} min
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{service.price} zł</div>
                    <Badge variant="outline" className="text-xs">
                      {service.type === 'online' ? 'Online' : 
                       service.type === 'gym' ? 'Siłownia' :
                       service.type === 'court' ? 'Kort' : 'Dojazd'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opinie klientów</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{review.clientName}</span>
                    <div className="flex">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(review.date).toLocaleDateString('pl-PL')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                  {review.id !== reviews[reviews.length - 1].id && (
                    <Separator className="mt-3" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 sticky bottom-0 bg-background pt-2">
            <Button 
              variant="default" 
              className="flex-1"
              onClick={onBook}
            >
              Zarezerwuj
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onChat}
            >
              Napisz
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};