import React from 'react';
import { Star, MapPin, Calendar, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface Trainer {
  id: string;
  user_id: string | null;
  display_name: string | null;
  name?: string;
  city?: string;
  avatarurl?: string | null;
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
  gender: string | null;
  gallery: string[];
  distance?: number;
}

interface TrainerCardProps {
  trainer: Trainer;
  onQuickBook: (trainerId: string) => void;
  onViewProfile: (trainerId: string) => void;
  onChat: (trainerId: string) => void;
  showDistance?: boolean;
}

export const TrainerCard: React.FC<TrainerCardProps> = ({
  trainer,
  onQuickBook,
  onViewProfile,
  onChat,
  showDistance = false
}) => {
  const imageUrl = trainer.gallery?.[0] || trainer.avatarurl;

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-card cursor-pointer"
      onClick={() => onViewProfile(trainer.id)}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Avatar className="h-16 w-16 flex-shrink-0">
            {imageUrl ? (
              <AvatarImage src={imageUrl} alt={trainer.display_name || 'Trener'} />
            ) : null}
            <AvatarFallback className="text-xl">
              {trainer.display_name?.charAt(0) || 'T'}
            </AvatarFallback>
          </Avatar>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">
                  {trainer.display_name || trainer.name || 'Trener'}
                  {trainer.is_verified && (
                    <Badge variant="secondary" className="ml-2 text-xs">✓</Badge>
                  )}
                </h3>
                {trainer.city && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {trainer.city}
                    {showDistance && trainer.distance !== undefined && trainer.distance !== Infinity && (
                      <span>• {trainer.distance.toFixed(1)} km</span>
                    )}
                  </p>
                )}
              </div>
              
              {trainer.rating !== null && trainer.rating > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="h-3 w-3 fill-warning text-warning" />
                  <span className="text-sm font-medium">{trainer.rating.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Specialties & Price */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                {trainer.specialties?.slice(0, 2).map((specialty, index) => (
                  <Badge key={index} variant="outline" className="text-xs py-0 px-1.5">
                    {specialty}
                  </Badge>
                ))}
                {trainer.specialties?.length > 2 && (
                  <Badge variant="outline" className="text-xs py-0 px-1.5">
                    +{trainer.specialties.length - 2}
                  </Badge>
                )}
              </div>
              
              {trainer.price_from && (
                <span className="text-sm font-bold text-primary flex-shrink-0">
                  {trainer.price_from} zł
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickBook(trainer.id);
                }}
              >
                <Calendar className="h-3 w-3 mr-1" />
                Zarezerwuj
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onChat(trainer.user_id || trainer.id);
                }}
              >
                <MessageCircle className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
