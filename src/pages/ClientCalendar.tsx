import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BottomNavigation } from '@/components/BottomNavigation';
import { RescheduleNotificationModal } from '@/components/RescheduleNotificationModal';
import { CalendarViewSwitcher } from '@/components/calendar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingsService } from '@/services/supabase';
import { useToast } from '@/hooks/use-toast';

type ViewType = 'list' | 'calendar';

interface Booking {
  id: string;
  client_id: string;
  trainer_id: string;
  service_id: string;
  scheduled_at: string;
  status: string;
  notes?: string;
}

export const ClientCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await bookingsService.getByUserId(user.id);
        setBookings(data || []);
      } catch (error) {
        console.error('Error loading bookings:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się załadować rezerwacji",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user]);

  // Handle URL params for view type
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const viewParam = urlParams.get('view');
    if (viewParam === 'calendar' || viewParam === 'list') {
      setViewType(viewParam);
    }
  }, [location.search]);

  const handleViewChange = (newView: ViewType) => {
    setViewType(newView);
    const url = new URL(window.location.href);
    url.searchParams.set('view', newView);
    window.history.replaceState({}, '', url.toString());
  };

  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      try {
        const bookingDate = new Date(booking.scheduled_at).toISOString().split('T')[0];
        return bookingDate === dateStr;
      } catch (error) {
        return false;
      }
    });
  };

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduled_at);
    return bookingDate > new Date() && booking.status !== 'cancelled';
  });

  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduled_at);
    return bookingDate <= new Date() || booking.status === 'completed';
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-warning/20 text-warning">Oczekuje</Badge>;
      case 'confirmed':
        return <Badge variant="secondary" className="bg-success/20 text-success">Potwierdzone</Badge>;
      case 'declined':
        return <Badge variant="secondary" className="bg-destructive/20 text-destructive">Odrzucone</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-primary/20 text-primary">Zakończone</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-muted/20 text-muted-foreground">Anulowane</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('pl-PL', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('pl-PL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    const { date, time } = formatDateTime(booking.scheduled_at);
    
    return (
      <Card className="booking-card">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold">Trening</h3>
              <p className="text-sm text-muted-foreground">Trener</p>
            </div>
            {getStatusBadge(booking.status)}
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{time}</span>
            </div>
            {booking.notes && (
              <div className="flex items-start gap-2">
                <span className="text-xs">💬</span>
                <span className="text-xs">{booking.notes}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Kalendarz</h1>
              <p className="text-muted-foreground">Twoje treningi</p>
            </div>
          </div>
          <CalendarViewSwitcher
            viewType={viewType}
            onViewChange={handleViewChange}
          />
        </div>
      </header>

      {loading ? (
        <div className="p-4">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Ładowanie...</p>
            </CardContent>
          </Card>
        </div>
      ) : viewType === 'list' ? (
        <>
          <section className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Nadchodzące ({upcomingBookings.length})</h2>
            {upcomingBookings.length > 0 ? (
              upcomingBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Brak nadchodzących treningów
                </CardContent>
              </Card>
            )}
          </section>

          <section className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Historia ({pastBookings.length})</h2>
            {pastBookings.length > 0 ? (
              pastBookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} />
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  Brak historii treningów
                </CardContent>
              </Card>
            )}
          </section>
        </>
      ) : (
        <section className="p-4">
          <Card>
            <CardContent className="p-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="mx-auto"
              />
            </CardContent>
          </Card>
          
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold">
              Treningi na {selectedDate.toLocaleDateString('pl-PL')}
            </h3>
            {getBookingsForDate(selectedDate).map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        </section>
      )}

      <BottomNavigation 
        userRole="client"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};
