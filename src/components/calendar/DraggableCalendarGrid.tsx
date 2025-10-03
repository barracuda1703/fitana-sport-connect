// Stage 3: Enhanced CalendarGrid with Drag-and-Drop
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO
  end: string;   // ISO
  status: 'confirmed' | 'pending' | 'canceled';
  location?: string;
  type?: 'booking' | 'block';
}

interface DraggableCalendarGridProps {
  events: CalendarEvent[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onEventMove?: (eventId: string, newDateTime: Date) => Promise<void>;
  isDraggable?: boolean;
  className?: string;
}

interface DraggableEventProps {
  event: CalendarEvent;
  onClick?: () => void;
  isDraggable: boolean;
}

const DraggableEvent: React.FC<DraggableEventProps> = ({ event, onClick, isDraggable }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: event.id, disabled: !isDraggable });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'canceled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors',
        getStatusColor(event.status),
        isDragging && 'z-50'
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          {isDraggable && (
            <div {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1">
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
        </div>
        <Badge variant="outline" className={getStatusColor(event.status)}>
          {event.status === 'confirmed' ? 'Potwierdzone' :
           event.status === 'pending' ? 'Oczekujące' : 'Anulowane'}
        </Badge>
      </div>
    </div>
  );
};

export const DraggableCalendarGrid: React.FC<DraggableCalendarGridProps> = ({
  events,
  selectedDate,
  onDateChange,
  onEventClick,
  onEventMove,
  isDraggable = false,
  className = ''
}) => {
  const { toast } = useToast();
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [optimisticEvents, setOptimisticEvents] = useState<CalendarEvent[]>(events);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  React.useEffect(() => {
    setOptimisticEvents(events);
  }, [events]);

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
    return optimisticEvents.filter(event => {
      try {
        const eventDate = new Date(event.start);
        if (isNaN(eventDate.getTime())) {
          return false;
        }
        return eventDate.toISOString().split('T')[0] === dateStr;
      } catch (error) {
        return false;
      }
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    if (!onEventMove || !isDraggable) return;

    const { active } = event;
    const draggedEventId = active.id as string;
    const draggedEvent = optimisticEvents.find(e => e.id === draggedEventId);

    if (!draggedEvent) return;

    // For now, we'll just show a toast. In a full implementation,
    // you'd need to determine the new date/time based on where it was dropped
    // This would require a more complex UI with drop zones
    toast({
      title: "Przesuwanie treningów",
      description: "Ta funkcja będzie dostępna wkrótce. Użyj przycisku 'Zmień termin'.",
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
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
              className="rounded-md border pointer-events-auto"
              modifiers={{
                hasEvents: (date) => getEventsForDate(date).length > 0
              }}
              modifiersStyles={{
                hasEvents: {
                  backgroundColor: 'hsl(var(--primary) / 0.1)',
                  border: '1px solid hsl(var(--primary) / 0.3)'
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
                    <DraggableEvent
                      key={event.id}
                      event={event}
                      onClick={() => onEventClick?.(event)}
                      isDraggable={isDraggable && event.status !== 'canceled'}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DndContext>
  );
};
