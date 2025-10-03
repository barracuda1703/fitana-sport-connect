import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO
  end: string;   // ISO
  status: 'confirmed' | 'pending' | 'canceled';
  location?: string;
  type?: 'booking' | 'block';
}

interface CalendarGridProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  className?: string;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  selectedDate,
  onDateChange,
  onEventClick,
  className = ''
}) => {
  const [currentMonth, setCurrentMonth] = useState(selectedDate);

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateChange(today);
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      try {
        const eventDate = new Date(event.start);
        if (isNaN(eventDate.getTime())) {
          console.warn('Invalid event start date:', event.start);
          return false;
        }
        return eventDate.toISOString().split('T')[0] === dateStr;
      } catch (error) {
        console.warn('Error parsing event date:', event.start, error);
        return false;
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'block':
        return 'bg-gray-200 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            {currentMonth.toLocaleDateString('pl-PL', { 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Dzisiaj
          </Button>
          <Button variant="outline" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Component */}
      <Card>
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateChange(date)}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            className="rounded-md border"
            modifiers={{
              hasEvents: (date) => getEventsForDate(date).length > 0
            }}
            modifiersStyles={{
              hasEvents: {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Events for selected date */}
      {selectedDate && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3">
              Wydarzenia na {selectedDate.toLocaleDateString('pl-PL')}
            </h4>
            <div className="space-y-2">
              {getEventsForDate(selectedDate).length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  Brak wydarzeń w tym dniu
                </p>
              ) : (
                getEventsForDate(selectedDate).map((event) => (
                  <div
                    key={event.id}
                    className={cn(
                      'p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors',
                      getStatusColor(event.status)
                    )}
                    onClick={() => onEventClick?.(event)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.start).toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {new Date(event.end).toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        {event.location && (
                          <p className="text-xs text-muted-foreground mt-1">
                            📍 {event.location}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={getStatusColor(event.status)}>
                        {event.status === 'confirmed' ? 'Potwierdzone' :
                         event.status === 'pending' ? 'Oczekujące' : 'Anulowane'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
