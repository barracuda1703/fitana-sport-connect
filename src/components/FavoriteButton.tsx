import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  trainerId: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({ 
  trainerId, 
  className,
  size = 'default'
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Mock favorite state - in real app, this would come from user context
  const [isFavorite, setIsFavorite] = useState(() => {
    // Mock check - in real app check user's favoriteTrainers array
    const mockFavorites = ['t-1', 't-3']; // Mock some favorites
    return mockFavorites.includes(trainerId);
  });

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering parent onClick events
    
    if (!user) {
      toast({
        title: "Wymagane logowanie",
        description: "Zaloguj się, aby dodawać trenerów do ulubionych.",
        variant: "destructive"
      });
      return;
    }

    const newFavoriteState = !isFavorite;
    setIsFavorite(newFavoriteState);

    // In real app, update user's favoriteTrainers array in database
    toast({
      title: newFavoriteState ? "Dodano do ulubionych" : "Usunięto z ulubionych",
      description: newFavoriteState 
        ? "Trener został dodany do Twoich ulubionych."
        : "Trener został usunięty z ulubionych.",
    });
  };

  return (
    <Button
      variant="ghost"
      size={size === 'sm' ? 'sm' : 'icon'}
      className={cn(
        "transition-all duration-200 hover:scale-110",
        isFavorite 
          ? "text-red-500 hover:text-red-600" 
          : "text-muted-foreground hover:text-red-500",
        className
      )}
      onClick={handleToggleFavorite}
    >
      <Heart 
        className={cn(
          size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
          isFavorite && 'fill-current'
        )} 
      />
    </Button>
  );
};