import React, { useState, useEffect } from 'react';
import { Calendar, Users, TrendingUp, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { dataStore, Booking } from '@/services/DataStore';

export const TrainerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (user) {
      const userBookings = dataStore.getBookings(user.id);
      setBookings(userBookings);
    }
  }, [user]);

  const handleAcceptBooking = async (bookingId: string) => {
    await dataStore.updateBookingStatus(bookingId, 'confirmed');
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    await dataStore.updateBookingStatus(bookingId, 'declined');
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
  };

  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduledAt);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  });

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  
  const mockStats = {
    todayTrainings: todayBookings.length,
    pendingBookings: pendingBookings.length,
    thisWeekEarnings: 1200,
    rating: 4.9,
    completedSessions: 127,
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Panel trenera</h1>
            <p className="text-muted-foreground">Zarządzaj swoimi treningami</p>
          </div>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="p-4 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Dzisiejsze treningi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {mockStats.todayTrainings}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Oczekujące rezerwacje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">
                {mockStats.pendingBookings}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ten tydzień
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {mockStats.thisWeekEarnings} zł
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ocena
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                ⭐ {mockStats.rating}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Today's Schedule */}
      <section className="px-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Dzisiejszy harmonogram</h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/trainer-calendar')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Zobacz cały kalendarz
          </Button>
        </div>

        <div className="space-y-3">
          {todayBookings.length > 0 ? todayBookings.map((booking) => (
            <Card key={booking.id} className="bg-gradient-card shadow-card hover:shadow-floating transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">
                        {new Date(booking.scheduledAt).toLocaleTimeString('pl-PL', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">Klient #{booking.clientId.slice(-4)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {booking.serviceId} • {booking.notes || 'Brak notatek'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                      className={booking.status === 'confirmed' ? 'bg-success/20 text-success' : ''}
                    >
                      {booking.status === 'confirmed' ? 'Potwierdzone' : 'Oczekuje'}
                    </Badge>
                    {booking.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="default" 
                          className="h-7 px-2 bg-success hover:bg-success/80"
                          onClick={() => handleAcceptBooking(booking.id)}
                        >
                          ✓
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-2"
                          onClick={() => handleDeclineBooking(booking.id)}
                        >
                          ✕
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )) : (
            <Card className="bg-gradient-card shadow-card">
              <CardContent className="p-4 text-center text-muted-foreground">
                Brak treningów na dziś
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="p-4 space-y-4">
        <h2 className="text-xl font-semibold">Szybkie akcje</h2>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="trainer" className="h-16 flex-col gap-2">
            <Users className="h-5 w-5" />
            <span className="text-sm">Zarządzaj klientami</span>
          </Button>
          <Button variant="outline" className="h-16 flex-col gap-2">
            <TrendingUp className="h-5 w-5" />
            <span className="text-sm">Statystyki</span>
          </Button>
        </div>
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole="trainer"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};