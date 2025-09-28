import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataStore, Booking } from '@/services/DataStore';

export const ClientCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calendar');
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
  }, [user]);

  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduledAt);
    return bookingDate > new Date() && booking.status !== 'cancelled';
  });

  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduledAt);
    return bookingDate <= new Date() || booking.status === 'completed';
  });

  const getStatusBadge = (status: Booking['status']) => {
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

  const getTrainerName = (trainerId: string) => {
    const trainerMap: Record<string, string> = {
      't-1': 'Anna Kowalska',
      't-2': 'Marek Nowak', 
      't-3': 'Ewa Wiśniewska'
    };
    return trainerMap[trainerId] || 'Trener';
  };

  const getServiceName = (serviceId: string) => {
    const serviceMap: Record<string, string> = {
      'srv-1': 'Trening personalny',
      'srv-2': 'Yoga',
      'srv-3': 'Trening boksu',
      'srv-4': 'Crossfit',
      'srv-5': 'Pilates',
      'srv-6': 'Stretching'
    };
    return serviceMap[serviceId] || 'Trening';
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
    const { date, time } = formatDateTime(booking.scheduledAt);
    
    return (
      <Card className="bg-gradient-card hover:shadow-card transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
              <p className="text-sm text-muted-foreground">{getTrainerName(booking.trainerId)}</p>
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

          {booking.status === 'confirmed' && (
            <div className="mt-3 pt-3 border-t flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <MapPin className="h-3 w-3 mr-1" />
                Mapa
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => {
                  const chatId = `chat-u-${booking.clientId}-t-${booking.trainerId}`;
                  window.location.href = `/chat/${chatId}`;
                }}
              >
                💬 Chat
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Kalendarz</h1>
            <p className="text-muted-foreground">Twoje treningi</p>
          </div>
        </div>
      </header>

      {/* Upcoming Bookings */}
      <section className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Nadchodzące ({upcomingBookings.length})</h2>
        {upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center text-muted-foreground">
              Brak nadchodzących treningów
            </CardContent>
          </Card>
        )}
      </section>

      {pastBookings.length > 0 && (
        <>
          <Separator className="mx-4" />
          
          {/* Past Bookings */}
          <section className="p-4 space-y-4">
            <h2 className="text-xl font-semibold">Historia ({pastBookings.length})</h2>
            <div className="space-y-3">
              {pastBookings.slice(0, 5).map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};