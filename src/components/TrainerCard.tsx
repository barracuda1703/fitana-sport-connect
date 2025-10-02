import React, { useState } from 'react';
import { Star, Video, MapPin, MessageCircle, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { FavoriteButton } from '@/components/FavoriteButton';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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
  const [imageIndex, setImageIndex] = useState(0);
  const images = trainer.gallery?.length > 0 ? trainer.gallery : [trainer.avatarurl].filter(Boolean);
  const hasMultipleImages = images.length > 1;

  return (
    <Card 
      className="overflow-hidden hover:shadow-card transition-all duration-200 bg-gradient-card group cursor-pointer"
      onClick={() => onViewProfile(trainer.id)}
    >
      <CardContent className="p-0">
        {/* Gallery/Image Section */}
        <div className="relative h-48 bg-muted">
          {hasMultipleImages ? (
            <Carousel className="w-full h-full" opts={{ loop: true }}>
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div 
                      className="h-48 bg-cover bg-center"
                      style={{ backgroundImage: `url(${image})` }}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" onClick={(e) => e.stopPropagation()} />
              <CarouselNext className="right-2" onClick={(e) => e.stopPropagation()} />
            </Carousel>
          ) : images[0] ? (
            <div 
              className="h-48 bg-cover bg-center"
              style={{ backgroundImage: `url(${images[0]})` }}
            />
          ) : (
            <div className="h-48 flex items-center justify-center bg-gradient-accent">
              <Avatar className="w-24 h-24">
                <AvatarFallback className="text-4xl">
                  {trainer.display_name?.charAt(0) || 'T'}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          
          {/* Overlays */}
          <div className="absolute top-3 right-3 flex gap-2">
            {trainer.has_video && (
              <Badge className="bg-black/60 backdrop-blur-sm">
                <Video className="h-3 w-3 mr-1" />
                Video
              </Badge>
            )}
            <div onClick={(e) => e.stopPropagation()}>
              <FavoriteButton 
                trainerId={trainer.user_id || trainer.id} 
                className="bg-black/60 backdrop-blur-sm hover:bg-black/80"
              />
            </div>
          </div>
          
          {trainer.is_verified && (
            <Badge className="absolute top-3 left-3 bg-success/90 backdrop-blur-sm">
              ✓ Zweryfikowany
            </Badge>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-lg truncate">
                {trainer.display_name || trainer.name || 'Trener'}
              </h3>
              {trainer.city && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {trainer.city}
                  {showDistance && trainer.distance !== undefined && trainer.distance !== Infinity && (
                    <span className="ml-1">({trainer.distance.toFixed(1)} km)</span>
                  )}
                </p>
              )}
            </div>
            
            {trainer.rating !== null && trainer.rating > 0 && (
              <div className="flex items-center gap-1 bg-warning/10 px-2 py-1 rounded">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-medium">{trainer.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({trainer.review_count || 0})</span>
              </div>
            )}
          </div>

          {/* Specialties */}
          <div className="flex flex-wrap gap-1 mb-3">
            {trainer.specialties?.slice(0, 3).map((specialty, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {trainer.specialties?.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{trainer.specialties.length - 3}
              </Badge>
            )}
          </div>

          {/* Bio */}
          {trainer.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {trainer.bio}
            </p>
          )}

          {/* Price */}
          {trainer.price_from && (
            <div className="flex items-center justify-between mb-3 pb-3 border-b">
              <span className="text-sm text-muted-foreground">Od:</span>
              <span className="text-lg font-bold text-primary">{trainer.price_from} zł</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onQuickBook(trainer.id);
              }}
            >
              <Calendar className="h-4 w-4 mr-1" />
              Zarezerwuj
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onChat(trainer.user_id || trainer.id);
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
