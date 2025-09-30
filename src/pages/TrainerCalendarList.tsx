import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, X, Plus, ArrowLeft, List, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { RescheduleModal } from '@/components/RescheduleModal';
import { RescheduleNotificationModal } from '@/components/RescheduleNotificationModal';
import { TrainerBookingModal } from '@/components/TrainerBookingModal';
import { TimeOffModal } from '@/components/TimeOffModal';
import { CalendarViewSwitcher, CalendarGrid, useCalendarEvents } from '@/components/calendar';
import { bookingsService, manualBlocksService } from '@/services/supabase';

type ViewType = 'list' | 'calendar';

export const TrainerCalendarListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [bookings, setBookings] = useState<any[]>([]);
  const [manualBlocks, setManualBlocks] = useState<any[]>([]);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState<any>(null);
  const [showTrainerBookingDialog, setShowTrainerBookingDialog] = useState(false);
  const [showTimeOffDialog, setShowTimeOffDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [rescheduleNotificationModalOpen, setRescheduleNotificationModalOpen] = useState(false);
  const [selectedRescheduleRequest, setSelectedRescheduleRequest] = useState<any>(null);

  const { events } = useCalendarEvents({ userId: user?.id || '', role: 'trainer' });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'pending') {
      setViewType('list');
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const bookingsData = await bookingsService.getByUserId(user.id);
      setBookings(bookingsData);

      const blocksData = await manualBlocksService.getByTrainerId(user.id);
      setManualBlocks(blocksData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować danych",
        variant: "destructive"
      });
    }
  };

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await bookingsService.updateStatus(bookingId, 'confirmed');
      await loadData();
      toast({
        title: "Wizyta zaakceptowana",
        description: "Klient został powiadomiony",
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaakceptować wizyty",
        variant: "destructive"
      });
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    try {
      await bookingsService.updateStatus(bookingId, 'declined');
      await loadData();
      toast({
        title: "Wizyta odrzucona",
        description: "Klient został powiadomiony",
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się odrzucić wizyty",
        variant: "destructive"
      });
    }
  };

  const handleProposeNewTime = (booking: any) => {
    setRescheduleBooking(booking);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleComplete = async () => {
    await loadData();
    setIsRescheduleModalOpen(false);
    setRescheduleBooking(null);
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Kalendarz</h1>
              <p className="text-sm text-muted-foreground">Zarządzaj terminami</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={viewType === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewType === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewType('calendar')}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        <div className="flex gap-2">
          <Button 
            variant="default"
            className="flex-1"
            onClick={() => setShowTrainerBookingDialog(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj trening
          </Button>
          <Button 
            variant="outline"
            className="flex-1"
            onClick={() => setShowTimeOffDialog(true)}
          >
            <Clock className="h-4 w-4 mr-2" />
            Czas wolny
          </Button>
        </div>

        {viewType === 'list' ? (
          <div className="space-y-6">
            {pendingBookings.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Oczekujące ({pendingBookings.length})</h2>
                {pendingBookings.map(booking => (
                  <Card key={booking.id} className="bg-gradient-card">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Klient #{booking.client_id?.slice(-4)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(booking.scheduled_at).toLocaleDateString('pl-PL')} o{' '}
                              {new Date(booking.scheduled_at).toLocaleTimeString('pl-PL', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="text-sm text-muted-foreground">{booking.service_id}</p>
                          </div>
                          <Badge variant="secondary">Oczekuje</Badge>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="flex-1"
                            onClick={() => handleAcceptBooking(booking.id)}
                          >
                            Akceptuj
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleDeclineBooking(booking.id)}
                          >
                            Odrzuć
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => handleProposeNewTime(booking)}
                          >
                            Nowy termin
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {confirmedBookings.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Potwierdzone ({confirmedBookings.length})</h2>
                {confirmedBookings.map(booking => (
                  <Card key={booking.id} className="bg-gradient-card">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">Klient #{booking.client_id?.slice(-4)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.scheduled_at).toLocaleDateString('pl-PL')} o{' '}
                            {new Date(booking.scheduled_at).toLocaleTimeString('pl-PL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-sm text-muted-foreground">{booking.service_id}</p>
                        </div>
                        <Badge className="bg-success/20 text-success">Potwierdzone</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {bookings.length === 0 && (
              <Card className="bg-gradient-card">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Brak zaplanowanych treningów</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="w-full"
            />
            <CalendarGrid
              events={events}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onEventClick={(event) => {
                if (event.type === 'booking') {
                  const booking = bookings.find(b => b.id === event.id);
                  if (booking) {
                    setShowRescheduleDialog(booking);
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      <BottomNavigation
        userRole="trainer"
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <TrainerBookingModal
        isOpen={showTrainerBookingDialog}
        onClose={() => setShowTrainerBookingDialog(false)}
        onBookingCreated={loadData}
      />

      <TimeOffModal
        isOpen={showTimeOffDialog}
        onClose={() => setShowTimeOffDialog(false)}
        onTimeOffAdded={loadData}
        trainerId={user?.id || ''}
      />

      {rescheduleBooking && (
        <RescheduleModal
          isOpen={isRescheduleModalOpen}
          onClose={() => setIsRescheduleModalOpen(false)}
          booking={rescheduleBooking}
          onReschedule={handleRescheduleComplete}
        />
      )}

      {selectedRescheduleRequest && (
        <RescheduleNotificationModal
          isOpen={rescheduleNotificationModalOpen}
          onClose={() => setRescheduleNotificationModalOpen(false)}
          booking={selectedRescheduleRequest.booking}
          request={selectedRescheduleRequest.request}
          onAccept={async () => {
            await loadData();
            setRescheduleNotificationModalOpen(false);
            setSelectedRescheduleRequest(null);
          }}
          onDecline={async () => {
            await loadData();
            setRescheduleNotificationModalOpen(false);
            setSelectedRescheduleRequest(null);
          }}
        />
      )}
    </div>
  );
};
