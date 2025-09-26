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
import { dataStore, Booking, ManualBlock } from '@/services/DataStore';

type ViewType = 'list' | 'calendar';

export const TrainerCalendarListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [manualBlocks, setManualBlocks] = useState<ManualBlock[]>([]);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState<Booking | null>(null);
  const [showManualBlockDialog, setShowManualBlockDialog] = useState(false);
  const [showDayDetails, setShowDayDetails] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [blockForm, setBlockForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
  });

  // Check if we should show pending tab by default
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'pending') {
      setViewType('list');
    }
  }, [location.search]);

  useEffect(() => {
    if (user) {
      setBookings(dataStore.getBookings(user.id));
      setManualBlocks(dataStore.getManualBlocks(user.id));
    }
  }, [user]);

  const refreshData = () => {
    if (user) {
      setBookings(dataStore.getBookings(user.id));
      setManualBlocks(dataStore.getManualBlocks(user.id));
    }
  };

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');
  const upcomingBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.scheduledAt);
    return bookingDate > new Date() && booking.status === 'confirmed';
  });

  // Calendar helper functions
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.scheduledAt).toISOString().split('T')[0];
      return bookingDate === dateStr;
    });
  };

  const getBlocksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return manualBlocks.filter(block => block.date === dateStr);
  };

  const isDayBusy = (date: Date) => {
    return getBookingsForDate(date).length > 0 || getBlocksForDate(date).length > 0;
  };

  const generateAvailableSlots = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayOfWeek = date.getDay();
    
    // Default working hours (can be enhanced with trainer settings)
    const workingHours = {
      1: { start: "09:00", end: "18:00" }, // Monday
      2: { start: "09:00", end: "18:00" }, // Tuesday
      3: { start: "09:00", end: "18:00" }, // Wednesday
      4: { start: "09:00", end: "18:00" }, // Thursday
      5: { start: "09:00", end: "18:00" }, // Friday
      6: { start: "10:00", end: "16:00" }, // Saturday
      0: { start: "10:00", end: "16:00" }, // Sunday
    };

    const dayHours = workingHours[dayOfWeek as keyof typeof workingHours];
    if (!dayHours) return [];

    // Generate 60-minute slots by default
    const slots = dataStore.getAvailableHoursWithSettings(user!.id, dateStr, 60);
    return slots;
  };

  const handleAcceptBooking = async (bookingId: string) => {
    await dataStore.updateBookingStatus(bookingId, 'confirmed');
    refreshData();
    toast({
      title: "Rezerwacja zaakceptowana",
      description: "Klient został powiadomiony o potwierdzeniu.",
    });
  };

  const handleDeclineBooking = async (bookingId: string) => {
    await dataStore.updateBookingStatus(bookingId, 'declined');
    refreshData();
    toast({
      title: "Rezerwacja odrzucona",
      description: "Klient został powiadomiony o odrzuceniu.",
    });
  };

  const handleReschedule = (booking: Booking) => {
    setRescheduleBooking(booking);
    setIsRescheduleModalOpen(true);
  };

  const handleRescheduleComplete = () => {
    refreshData();
    setIsRescheduleModalOpen(false);
    setRescheduleBooking(null);
  };

  const confirmReschedule = async () => {
    if (!showRescheduleDialog || !newDate || !newTime) return;

    toast({
      title: "Propozycja nowego terminu wysłana",
      description: "Klient otrzymał propozycję zmiany terminu.",
    });
    setShowRescheduleDialog(null);
  };

  const handleAddManualBlock = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setBlockForm({
      title: '',
      date: tomorrow.toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
    });
    setShowManualBlockDialog(true);
  };

  const confirmAddManualBlock = () => {
    if (!blockForm.title || !blockForm.date || !blockForm.startTime || !blockForm.endTime) return;

    dataStore.addManualBlock({
      trainerId: user!.id,
      title: blockForm.title,
      date: blockForm.date,
      startTime: blockForm.startTime,
      endTime: blockForm.endTime,
    });

    refreshData();
    setShowManualBlockDialog(false);
    toast({
      title: "Blokada dodana",
      description: "Czas został zablokowany w kalendarzu.",
    });
  };

  const handleRemoveBlock = (blockId: string) => {
    dataStore.removeManualBlock(blockId);
    refreshData();
    toast({
      title: "Blokada usunięta",
      description: "Czas został odblokowany w kalendarzu.",
    });
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
                Zaproponuj nowy termin
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const ManualBlockCard: React.FC<{ block: ManualBlock }> = ({ block }) => {
    return (
      <Card className="bg-gradient-card border-l-4 border-l-warning">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold">{block.title}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                Wydarzenie prywatne
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <Clock className="h-4 w-4" />
                <span>{block.startTime} - {block.endTime}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveBlock(block.id)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const DayDetailsPanel: React.FC<{ date: Date }> = ({ date }) => {
    const dayBookings = getBookingsForDate(date);
    const dayBlocks = getBlocksForDate(date);
    const availableSlots = generateAvailableSlots(date);
    const pendingForDay = dayBookings.filter(b => b.status === 'pending');
    const confirmedForDay = dayBookings.filter(b => b.status === 'confirmed');

    return (
      <Dialog open={!!showDayDetails} onOpenChange={() => setShowDayDetails(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {date.toLocaleDateString('pl-PL', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Pending bookings */}
            {pendingForDay.length > 0 && (
              <div>
                <h4 className="font-medium text-warning mb-2">Do zatwierdzenia ({pendingForDay.length})</h4>
                <div className="space-y-2">
                  {pendingForDay.map(booking => (
                    <BookingCard key={booking.id} booking={booking} showActions={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed bookings */}
            {confirmedForDay.length > 0 && (
              <div>
                <h4 className="font-medium text-success mb-2">Potwierdzone ({confirmedForDay.length})</h4>
                <div className="space-y-2">
                  {confirmedForDay.map(booking => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            )}

            {/* Manual blocks */}
            {dayBlocks.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Prywatne blokady ({dayBlocks.length})</h4>
                <div className="space-y-2">
                  {dayBlocks.map(block => (
                    <ManualBlockCard key={block.id} block={block} />
                  ))}
                </div>
              </div>
            )}

            {/* Available slots */}
            {availableSlots.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Dostępne terminy ({availableSlots.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {availableSlots.map(slot => (
                    <Badge key={slot} variant="outline" className="bg-success/10">
                      {slot}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Kalendarz</h1>
            <p className="text-muted-foreground">Zarządzaj rezerwacjami</p>
          </div>
          <div className="flex gap-2">
            {/* View Toggle */}
            <div className="flex rounded-lg border bg-muted p-1">
              <Button
                variant={viewType === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewType === 'calendar' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewType('calendar')}
              >
                <Calendar className="h-4 w-4" />
              </Button>
            </div>
            {/* Add Block Button */}
            <Button variant="outline" size="sm" onClick={handleAddManualBlock}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      {viewType === 'list' ? (
        <div className="space-y-4">
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
        </div>
      ) : (
        /* Calendar View */
        <div className="p-4">
          <Card>
            <CardContent className="p-4">
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
                modifiers={{
                  busy: (date) => isDayBusy(date),
                }}
                modifiersStyles={{
                  busy: {
                    backgroundColor: 'hsl(var(--warning) / 0.2)',
                    color: 'hsl(var(--warning))',
                    fontWeight: 'bold',
                  },
                }}
                onDayClick={(date) => {
                  setSelectedDate(date);
                  setShowDayDetails(date);
                }}
              />
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-warning/20 border border-warning/50"></div>
                  <span>Zajęte dni</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-muted border"></div>
                  <span>Wolne dni</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Day Details Modal */}
      {showDayDetails && <DayDetailsPanel date={showDayDetails} />}

      {/* Reschedule Dialog */}
      <Dialog open={!!showRescheduleDialog} onOpenChange={() => setShowRescheduleDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zaproponuj nowy termin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Nowa data:</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Nowa godzina:</Label>
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

      {/* Manual Block Dialog */}
      <Dialog open={showManualBlockDialog} onOpenChange={setShowManualBlockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj blokadę czasu</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Tytuł:</Label>
              <Input
                value={blockForm.title}
                onChange={(e) => setBlockForm({ ...blockForm, title: e.target.value })}
                placeholder="np. Przerwa obiadowa"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Data:</Label>
              <Input
                type="date"
                value={blockForm.date}
                onChange={(e) => setBlockForm({ ...blockForm, date: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Od:</Label>
                <Select 
                  value={blockForm.startTime} 
                  onValueChange={(value) => setBlockForm({ ...blockForm, startTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return [`${hour}:00`, `${hour}:30`];
                    }).flat().map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium">Do:</Label>
                <Select 
                  value={blockForm.endTime} 
                  onValueChange={(value) => setBlockForm({ ...blockForm, endTime: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => {
                      const hour = i.toString().padStart(2, '0');
                      return [`${hour}:00`, `${hour}:30`];
                    }).flat().map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowManualBlockDialog(false)}>
                Anuluj
              </Button>
              <Button className="flex-1" onClick={confirmAddManualBlock}>
                Dodaj blokadę
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <RescheduleModal
        isOpen={isRescheduleModalOpen}
        onClose={() => setIsRescheduleModalOpen(false)}
        booking={rescheduleBooking}
        onReschedule={handleRescheduleComplete}
      />

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};