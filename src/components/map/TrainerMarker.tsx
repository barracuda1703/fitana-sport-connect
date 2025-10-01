import React from 'react';
import { Star, Users } from 'lucide-react';

interface TrainerMarkerProps {
  count: number;
  isPrimary?: boolean;
  onClick: () => void;
}

export const TrainerMarker: React.FC<TrainerMarkerProps> = ({ count, isPrimary, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center justify-center transition-all hover:scale-110 ${
        count > 1 ? 'w-12 h-12' : 'w-10 h-10'
      }`}
    >
      <div
        className={`absolute inset-0 rounded-full shadow-lg ${
          isPrimary
            ? 'bg-gradient-to-br from-primary to-primary/80 ring-2 ring-primary/30 ring-offset-2'
            : 'bg-gradient-to-br from-accent to-accent/80'
        }`}
      >
        {count > 1 && (
          <div className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-md">
            {count}
          </div>
        )}
      </div>
      <div className="relative z-10 text-white flex items-center justify-center">
        {count > 1 ? (
          <Users className="h-5 w-5" />
        ) : (
          <span className="text-lg font-bold">💪</span>
        )}
      </div>
    </button>
  );
};
