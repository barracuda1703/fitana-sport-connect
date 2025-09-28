import React, { useState } from 'react';
import { Calendar, Users, TrendingUp, Settings, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { ReviewsModal } from '@/components/ReviewsModal';
import { RescheduleModal } from '@/components/RescheduleModal';
import { ConflictResolutionModal } from '@/components/ConflictResolutionModal';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { dataStore, Booking } from '@/services/DataStore';

export const TrainerDashboard: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);
  const [conflictBooking, setConflictBooking] = useState<Booking | null>(null);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);

  React.useEffect(() => {
    if (user) {
      const userBookings = dataStore.getBookings(user.id);
      setBookings(userBookings);
    }
  }, [user]);

  // Check for booking conflicts
  const hasConflict = (scheduledAt: string) => {
    return bookings.some(booking => 
      booking.status === 'confirmed' && 
      booking.scheduledAt === scheduledAt
    );
  };

  const handleAcceptBooking = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Check for conflicts
    if (hasConflict(booking.scheduledAt)) {
      const conflictingBooking = bookings.find(b => 
        b.status === 'confirmed' && 
        b.scheduledAt === booking.scheduledAt
      );
      setConflictBooking(conflictingBooking || null);
      setPendingBooking(booking);
      setIsConflictModalOpen(true);
      return;
    }

    await dataStore.updateBookingStatus(bookingId, 'confirmed');
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
    toast({
      title: "Wizyta zaakceptowana",
      description: "Klient został powiadomiony o potwierdzeniu.",
    });
  };

  const handleDeclineBooking = async (bookingId: string) => {
    await dataStore.updateBookingStatus(bookingId, 'declined');
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
    toast({
      title: "Wizyta odrzucona", 
      description: "Klient został powiadomiony o odrzuceniu.",
    });
  };

  const handleProposeNewTime = (booking: Booking) => {
    setRescheduleBooking(booking);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleComplete = () => {
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
    setIsRescheduleModalOpen(false);
    setRescheduleBooking(null);
    toast({
      title: "Propozycja wysłana",
      description: "Klient otrzymał propozycję nowego terminu.",
    });
  };

  const handleConflictReplace = async () => {
    if (!pendingBooking || !conflictBooking) return;
    
    // Decline the conflicting booking
    await dataStore.updateBookingStatus(conflictBooking.id, 'declined');
    // Accept the new booking
    await dataStore.updateBookingStatus(pendingBooking.id, 'confirmed');
    
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
    
    setIsConflictModalOpen(false);
    setConflictBooking(null);
    setPendingBooking(null);
    
    toast({
      title: "Trening zastąpiony",
      description: "Nowy trening został zaakceptowany, a poprzedni anulowany.",
    });
  };

  const handleConflictReschedule = () => {
    if (!pendingBooking) return;
    
    setIsConflictModalOpen(false);
    setRescheduleBooking(pendingBooking);
    setIsRescheduleModalOpen(true);
    setConflictBooking(null);
    setPendingBooking(null);
  };

  const handlePendingClick = () => {
    navigate('/trainer-calendar?tab=pending');
  };

  const todayBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduledAt);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  });

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  
  // Enhanced stats with better calculations
  const getWeeklyStats = () => {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const weekBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledAt);
      return bookingDate >= startOfWeek && bookingDate <= endOfWeek && booking.status === 'confirmed';
    });
    
    const weeklyEarnings = weekBookings.reduce((sum, booking) => sum + 90, 0);
    
    return {
      count: weekBookings.length,
      earnings: weeklyEarnings,
      breakdown: weekBookings.reduce((acc, booking) => {
        const day = new Date(booking.scheduledAt).getDay();
        const dayNames = ['Nie', 'Pon', 'Wto', 'Śro', 'Czw', 'Pią', 'Sob'];
        acc[dayNames[day]] = (acc[dayNames[day]] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  };
  
  const weeklyStats = getWeeklyStats();
  
  const mockStats = {
    todayTrainings: todayBookings.filter(b => b.status === 'confirmed').length,
    pendingBookings: pendingBookings.length,
    weeklyTrainings: weeklyStats.count,
    weeklyEarnings: weeklyStats.earnings,
    todayEarnings: todayBookings.filter(b => b.status === 'confirmed').reduce((sum, b) => sum + 90, 0),
    rating: 4.9,
    completedSessions: 127,
    weekBreakdown: weeklyStats.breakdown
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
          <Button variant="outline" size="icon" onClick={() => navigate('/trainer-settings')}>
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
              <div className="text-xs text-muted-foreground mt-1">
                Zarobek dziś: {mockStats.todayEarnings} zł
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card cursor-pointer hover:shadow-floating transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Oczekujące rezerwacje
              </CardTitle>
            </CardHeader>
            <CardContent onClick={handlePendingClick}>
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
                {mockStats.weeklyTrainings}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {mockStats.weeklyEarnings} zł • {Object.entries(mockStats.weekBreakdown).slice(0, 3).map(([day, count]) => `${day}: ${count}`).join(' • ')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card shadow-card cursor-pointer hover:shadow-floating transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Ocena
              </CardTitle>
            </CardHeader>
            <CardContent onClick={() => setIsReviewsModalOpen(true)}>
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
                          className="h-6 px-2 text-xs bg-success hover:bg-success/80"
                          onClick={() => handleAcceptBooking(booking.id)}
                        >
                          Akceptuj
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 px-2 text-xs"
                          onClick={() => handleDeclineBooking(booking.id)}
                        >
                          Odrzuć
                        </Button>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-6 px-2 text-xs"
                          onClick={() => handleProposeNewTime(booking)}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Nowy termin
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
          <Button 
            variant="trainer" 
            className="h-16 flex-col gap-2"
            onClick={() => navigate('/trainer/clients')}
          >
            <Users className="h-5 w-5" />
            <span className="text-sm">Zarządzaj klientami</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-16 flex-col gap-2"
            onClick={() => navigate('/trainer/statistics')}
          >
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

      {/* Reviews Modal */}
      <ReviewsModal
        isOpen={isReviewsModalOpen}
        onClose={() => setIsReviewsModalOpen(false)}
        trainerId={user?.id || ''}
      />

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <RescheduleModal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          booking={rescheduleBooking}
          onReschedule={handleRescheduleComplete}
        />
      )}

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal
        isOpen={isConflictModalOpen}
        onClose={() => setIsConflictModalOpen(false)}
        conflictingBooking={conflictBooking}
        newBooking={pendingBooking}
        onReplace={handleConflictReplace}
        onReschedule={handleConflictReschedule}
      />
    </div>
  );
};