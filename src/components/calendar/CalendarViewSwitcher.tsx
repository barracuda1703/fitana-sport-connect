import React from 'react';
import { List, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ViewType = 'list' | 'calendar';

interface CalendarViewSwitcherProps {
  viewType: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

export const CalendarViewSwitcher: React.FC<CalendarViewSwitcherProps> = ({
  viewType,
  onViewChange,
  className = ''
}) => {
  return (
    <div className={`flex bg-muted rounded-lg p-1 ${className}`}>
      <Button
        variant={viewType === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('list')}
        className="flex items-center gap-2"
      >
        <List className="h-4 w-4" />
        Lista
      </Button>
      <Button
        variant={viewType === 'calendar' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('calendar')}
        className="flex items-center gap-2"
      >
        <Calendar className="h-4 w-4" />
        Kalendarz
      </Button>
    </div>
  );
};
