import React from 'react';
import { X, Star, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LanguageChips } from '@/components/LanguageChips';

interface Trainer {
  id: string;
  user_id: string;
  display_name: string | null;
  bio: string | null;
  specialties: string[];
  languages: string[];
  price_from: number | null;
  rating: number | null;
  review_count: number | null;
  is_verified: boolean | null;
  has_video: boolean | null;
}

interface TrainerPopupProps {
  trainers: Trainer[];
  locationName: string;
  onClose: () => void;
  onBook: (trainerId: string) => void;
  onViewProfile: (trainerId: string) => void;
  onChat: (trainerId: string) => void;
}

export const TrainerPopup: React.FC<TrainerPopupProps> = ({
  trainers,
  locationName,
  onClose,
  onBook,
  onViewProfile,
  onChat
}) => {
  const sortedTrainers = [...trainers].sort((a, b) => 
    (b.rating || 0) - (a.rating || 0)
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <Card className="w-full sm:max-w-2xl max-h-[85vh] sm:max-h-[90vh] overflow-hidden flex flex-col animate-slide-in-right sm:animate-scale-in rounded-t-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">{locationName}</h3>
              <p className="text-sm text-muted-foreground">
                {trainers.length} {trainers.length === 1 ? 'trener' : 'trenerów'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-3">
          {sortedTrainers.map((trainer) => (
            <Card key={trainer.id} className="p-4 hover:shadow-lg transition-all bg-gradient-card">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-accent flex items-center justify-center text-2xl flex-shrink-0">
                  {trainer.display_name ? trainer.display_name.charAt(0).toUpperCase() : 'T'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{trainer.display_name || 'Trener'}</h4>
                    {trainer.is_verified && (
                      <Badge variant="secondary" className="bg-success/20 text-success text-xs">
                        ✓
                      </Badge>
                    )}
                    {trainer.has_video && (
                      <Badge variant="outline" className="text-primary text-xs">
                        📹
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-sm font-medium">{trainer.rating || 0}</span>
                      <span className="text-xs text-muted-foreground">
                        ({trainer.review_count || 0})
                      </span>
                    </div>
                    <span className="text-sm font-bold text-primary">
                      od {trainer.price_from || 0} zł
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {trainer.specialties?.slice(0, 3).map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>

                  {trainer.languages && trainer.languages.length > 0 && (
                    <div className="mb-3">
                      <LanguageChips 
                        languages={trainer.languages} 
                        maxDisplay={3} 
                        size="sm"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => onBook(trainer.id)}
                    >
                      Zarezerwuj
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewProfile(trainer.id)}
                    >
                      Profil
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => onChat(trainer.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
