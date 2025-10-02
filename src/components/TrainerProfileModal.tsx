import React, { useState, useEffect } from 'react';
import { X, Star, MapPin, Clock, CheckCircle, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { reviewsService } from '@/services/supabase/reviews';
import { Skeleton } from '@/components/ui/skeleton';

interface Trainer {
  id: string;
  display_name: string | null;
  bio: string | null;
  specialties: string[];
  services: any;
  locations: any;
  languages: string[];
  price_from: number | null;
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
  has_video: boolean | null;
  avatarurl?: string | null;
  city?: string;
}

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
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    if (isOpen && trainer.id) {
      loadReviews();
    }
  }, [isOpen, trainer.id]);

  const loadReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await reviewsService.getByTrainerId(trainer.id);
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center text-2xl">
                {trainer.display_name ? trainer.display_name.charAt(0) : 'T'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{trainer.display_name || 'Trener'}</h2>
                  {trainer.is_verified && (
                    <CheckCircle className="h-5 w-5 text-success" />
                  )}
                  {trainer.has_video && (
                    <Video className="h-5 w-5 text-primary" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{trainer.rating || 0}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({trainer.review_count || 0} opinii)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Bio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">O trenerze</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{trainer.bio || 'Brak opisu'}</p>
            </CardContent>
          </Card>

          {/* Specialties */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Specjalizacje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {(trainer.specialties || []).map((specialty) => (
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
            <CardContent>
              <div className="space-y-3">
                {(Array.isArray(trainer.services) ? trainer.services : []).map((service: any) => (
                  <div key={service.id} className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{service.duration} min</span>
                        <Badge variant="outline" className="ml-2">
                          {service.type === 'online' ? 'Online' : 
                           service.type === 'gym' ? 'Siłownia' :
                           service.type === 'court' ? 'Kort' : 'Dojazd'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">{service.price} zł</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Opinie klientów</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingReviews ? (
                <>
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Brak opinii
                </p>
              ) : (
                reviews.map((review, index) => (
                  <div key={review.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {review.profiles?.name || 'Klient'}
                      </span>
                      <div className="flex">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-warning text-warning" />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(review.created_at).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.comment}</p>
                    {index !== reviews.length - 1 && (
                      <Separator className="mt-3" />
                    )}
                  </div>
                ))
              )}
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

export default TrainerProfileModal;
