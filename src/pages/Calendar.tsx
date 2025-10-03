// Stage 6: Full Calendar Implementation
import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { CalendarViewSwitcher } from '@/components/calendar/CalendarViewSwitcher';
import { DraggableCalendarGrid } from '@/components/calendar/DraggableCalendarGrid';
import { useCalendarEvents } from '@/components/calendar/useCalendarEvents';
import { TimeOffModal } from '@/components/TimeOffModal';
import { TrainerBookingModal } from '@/components/TrainerBookingModal';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { bookingsService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<'calendar' | 'list'>(
    (searchParams.get('view') as 'calendar' | 'list') || 'calendar'
  );
  const [showTimeOffModal, setShowTimeOffModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { events, loading, error } = useCalendarEvents({
    role: user?.role || 'client',
    userId: user?.id || ''
  });

  // Update URL when view changes
  const handleViewChange = (newView: 'calendar' | 'list') => {
    setViewType(newView);
    setSearchParams({ view: newView });
  };

  // Calculate statistics
  const stats = React.useMemo(() => {
    const now = new Date();
    const thisMonth = events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate.getMonth() === now.getMonth() &&
             eventDate.getFullYear() === now.getFullYear();
    });

    return {
      thisMonth: thisMonth.length,
      confirmed: events.filter(e => e.status === 'confirmed').length,
      pending: events.filter(e => e.status === 'pending').length,
    };
  }, [events]);

  const handleEventMove = async (eventId: string, newDateTime: Date) => {
    try {
      await bookingsService.update(eventId, {
        scheduled_at: newDateTime.toISOString()
      });
      toast({
        title: "Sukces",
        description: "Trening został przesunięty",
      });
    } catch (error) {
      console.error('Error moving event:', error);
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : "Nie udało się przesunąć treningu",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Zaloguj się, aby zobaczyć kalendarz</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Kalendarz</h1>
              <p className="text-sm text-muted-foreground">
                {user.role === 'trainer' ? 'Zarządzaj treningami' : 'Twoje rezerwacje'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarViewSwitcher
              viewType={viewType}
              onViewChange={handleViewChange}
            />
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Statistics Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{stats.thisMonth}</p>
              <p className="text-xs text-muted-foreground">Ten miesiąc</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{stats.confirmed}</p>
              <p className="text-xs text-muted-foreground">Potwierdzone</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Oczekujące</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        {user.role === 'trainer' && (
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowBookingModal(true)}
              className="flex-1"
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj trening
            </Button>
            <Button 
              onClick={() => setShowTimeOffModal(true)}
              variant="outline"
              className="flex-1"
            >
              <Filter className="h-4 w-4 mr-2" />
              Wolne
            </Button>
          </div>
        )}

        {/* Calendar View */}
        {loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Ładowanie...</p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        ) : (
          <DraggableCalendarGrid
            events={events}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onEventClick={(event) => {
              // Navigate to booking details
              if (user.role === 'trainer') {
                navigate('/trainer/calendar');
              } else {
                navigate('/client/calendar');
              }
            }}
            onEventMove={user.role === 'trainer' ? handleEventMove : undefined}
            isDraggable={user.role === 'trainer'}
          />
        )}
      </div>

      {/* Modals */}
      {user.role === 'trainer' && user.id && (
        <>
          <TimeOffModal
            isOpen={showTimeOffModal}
            onClose={() => setShowTimeOffModal(false)}
            onTimeOffAdded={() => {
              toast({
                title: "Sukces",
                description: "Wolne dodane",
              });
            }}
            trainerId={user.id}
          />
          <TrainerBookingModal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onBookingCreated={() => {
              setShowBookingModal(false);
              toast({
                title: "Sukces",
                description: "Trening został dodany",
              });
            }}
          />
        </>
      )}

      <BottomNavigation 
        userRole={user.role === 'trainer' ? 'trainer' : 'client'}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};
