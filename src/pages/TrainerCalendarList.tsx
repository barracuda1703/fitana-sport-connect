import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, X, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { dataStore, Booking } from '@/services/DataStore';

export const TrainerCalendarListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
  }, [user]);

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduledAt);
    return bookingDate > new Date() && booking.status === 'confirmed';
  });
  const pastBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduledAt);
    return bookingDate <= new Date() || booking.status === 'completed';
  });

  const handleAcceptBooking = async (bookingId: string) => {
    await dataStore.updateBookingStatus(bookingId, 'confirmed');
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
    toast({
      title: "Rezerwacja zaakceptowana",
      description: "Klient został powiadomiony o potwierdzeniu.",
    });
  };

  const handleDeclineBooking = async (bookingId: string) => {
    await dataStore.updateBookingStatus(bookingId, 'declined');
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
    toast({
      title: "Rezerwacja odrzucona",
      description: "Klient został powiadomiony o odrzuceniu.",
    });
  };

  const handleReschedule = async (booking: Booking) => {
    setShowRescheduleDialog(booking);
    // Generate next 7 days
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setNewDate(tomorrow.toISOString().split('T')[0]);
    setNewTime('10:00');
  };

  const confirmReschedule = async () => {
    if (!showRescheduleDialog || !newDate || !newTime) return;

    // In a real app, this would create a reschedule request
    toast({
      title: "Propozycja nowego terminu wysłana",
      description: "Klient otrzymał propozycję zmiany terminu.",
    });
    setShowRescheduleDialog(null);
  };

  const getClientName = (clientId: string) => {
    return clientId === 'u-client1' ? 'Kasia' : 'Klient';
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

  const BookingCard: React.FC<{ booking: Booking; showActions?: boolean }> = ({ booking, showActions = false }) => {
    const { date, time } = formatDateTime(booking.scheduledAt);
    
    return (
      <Card className="bg-gradient-card hover:shadow-card transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {getClientName(booking.clientId)}
              </p>
            </div>
            {booking.status === 'pending' && (
              <Badge variant="secondary" className="bg-warning/20 text-warning">
                Oczekuje
              </Badge>
            )}
          </div>
          
          <div className="space-y-2 text-sm text-muted-foreground mb-3">
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

          {showActions && booking.status === 'pending' && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                className="flex-1 bg-success hover:bg-success/80"
                onClick={() => handleAcceptBooking(booking.id)}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Akceptuj
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleDeclineBooking(booking.id)}
              >
                <X className="h-3 w-3 mr-1" />
                Odrzuć
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleReschedule(booking)}
              >
                <Clock className="h-3 w-3 mr-1" />
                Zmień
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
            <p className="text-muted-foreground">Zarządzaj rezerwacjami</p>
          </div>
        </div>
      </header>

      {/* Pending Bookings */}
      <section className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-warning">
          Do zatwierdzenia ({pendingBookings.length})
        </h2>
        {pendingBookings.length > 0 ? (
          <div className="space-y-3">
            {pendingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} showActions={true} />
            ))}
          </div>
        ) : (
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center text-muted-foreground">
              Brak oczekujących rezerwacji
            </CardContent>
          </Card>
        )}
      </section>

      <Separator className="mx-4" />

      {/* Upcoming Bookings */}
      <section className="p-4 space-y-4">
        <h2 className="text-xl font-semibold text-success">
          Nadchodzące ({upcomingBookings.length})
        </h2>
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
              {pastBookings.slice(0, 3).map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={!!showRescheduleDialog} onOpenChange={() => setShowRescheduleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zaproponuj nowy termin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nowa data:</label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nowa godzina:</label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowRescheduleDialog(null)}>
                Anuluj
              </Button>
              <Button className="flex-1" onClick={confirmReschedule}>
                Wyślij propozycję
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};