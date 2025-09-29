import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BottomNavigation } from '@/components/BottomNavigation';
import { RescheduleNotificationModal } from '@/components/RescheduleNotificationModal';
import { ClientRescheduleModal } from '@/components/ClientRescheduleModal';
import { CalendarViewSwitcher } from '@/components/calendar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { dataStore, Booking, RescheduleRequest } from '@/services/DataStore';
import { useToast } from '@/hooks/use-toast';

type ViewType = 'list' | 'calendar';

export const ClientCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [clientRescheduleModalOpen, setClientRescheduleModalOpen] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState<Booking | null>(null);
  const [selectedRescheduleRequest, setSelectedRescheduleRequest] = useState<{
    booking: Booking;
    request: RescheduleRequest;
  } | null>(null);
  const [showDayDetails, setShowDayDetails] = useState<Date | null>(null);

  // Calendar helper functions
  const getBookingsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookings.filter(booking => {
      try {
        const bookingDate = new Date(booking.scheduledAt).toISOString().split('T')[0];
        return bookingDate === dateStr;
      } catch (error) {
        console.warn('Error parsing booking date:', booking.scheduledAt, error);
        return false;
      }
    });
  };

  const isDayBusy = (date: Date) => {
    return getBookingsForDate(date).length > 0;
  };

  useEffect(() => {
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
  }, [user]);

  // Handle URL params for view type
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const viewParam = urlParams.get('view');
    if (viewParam === 'calendar' || viewParam === 'list') {
      setViewType(viewParam);
    }
  }, [location.search]);

  // Save view preference to localStorage
  useEffect(() => {
    localStorage.setItem('clientCalendarView', viewType);
  }, [viewType]);

  // Load view preference from localStorage on mount
  useEffect(() => {
    const savedView = localStorage.getItem('clientCalendarView') as ViewType;
    if (savedView && (savedView === 'list' || savedView === 'calendar')) {
      setViewType(savedView);
    }
  }, []);

  const handleViewChange = (newView: ViewType) => {
    setViewType(newView);
    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('view', newView);
    window.history.replaceState({}, '', url.toString());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowDayDetails(date);
  };

  // Get requests awaiting client's decision
  const awaitingClientDecision = bookings.flatMap(booking => 
    (booking.rescheduleRequests || [])
      .filter(request => request.status === 'pending' && request.awaitingDecisionBy === 'client')
      .map(request => ({ booking, request }))
  );

  // Get requests awaiting trainer's decision
  const awaitingTrainerDecision = bookings.flatMap(booking => 
    (booking.rescheduleRequests || [])
      .filter(request => request.status === 'pending' && request.awaitingDecisionBy === 'trainer')
      .map(request => ({ booking, request }))
  );

  // Get client's own reschedule requests with responses
  const clientRescheduleResponses = bookings.flatMap(booking => 
    (booking.rescheduleRequests || [])
      .filter(request => request.requestedBy === 'client' && request.status !== 'pending')
      .map(request => ({ booking, request }))
  );

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

  const handleAcceptReschedule = async (bookingId: string, requestId: string) => {
    try {
      await dataStore.acceptRescheduleRequest(bookingId, requestId);
      toast({
        title: "Termin zaakceptowany",
        description: "Nowy termin został potwierdzony",
      });
      // Refresh bookings
      if (user) {
        setBookings(dataStore.getBookings(user.id));
      }
      setRescheduleModalOpen(false);
      setSelectedRescheduleRequest(null);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się zaakceptować nowego terminu",
        variant: "destructive",
      });
    }
  };

  const handleDeclineReschedule = async (bookingId: string, requestId: string) => {
    try {
      await dataStore.declineRescheduleRequest(bookingId, requestId);
      toast({
        title: "Termin odrzucony",
        description: "Propozycja nowego terminu została odrzucona",
      });
      // Refresh bookings
      if (user) {
        setBookings(dataStore.getBookings(user.id));
      }
      setRescheduleModalOpen(false);
      setSelectedRescheduleRequest(null);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się odrzucić propozycji",
        variant: "destructive",
      });
    }
  };

  const handleClientReschedule = () => {
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
    setClientRescheduleModalOpen(false);
    setSelectedBookingForReschedule(null);
  };

  const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
    const { date, time } = formatDateTime(booking.scheduledAt);
    
    return (
      <Card className="booking-card">
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

          {(booking.status === 'pending' || booking.status === 'confirmed') && (
            <div className="card-actions">
              {booking.status === 'confirmed' && (
                <div className="button-grid">
                  <Button variant="outline" size="sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    Mapa
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      const chatId = `chat-u-${booking.clientId}-t-${booking.trainerId}`;
                      window.location.href = `/chat/${chatId}`;
                    }}
                  >
                    💬 Chat
                  </Button>
                </div>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => {
                  setSelectedBookingForReschedule(booking);
                  setClientRescheduleModalOpen(true);
                }}
              >
                <CalendarIcon className="h-3 w-3 mr-1" />
                Nowy termin
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

      {/* Requests Awaiting Client's Decision */}
      {awaitingClientDecision.length > 0 && (
        <section className="p-4 space-y-4">
          <h2 className="text-xl font-semibold text-warning">Oczekuje na Twoją decyzję ({awaitingClientDecision.length})</h2>
          {awaitingClientDecision.map(({ booking, request }) => (
            <Card key={request.id} className="bg-warning/10 border-warning/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
                    <p className="text-sm text-muted-foreground">{getTrainerName(booking.trainerId)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Stary termin: {new Date(booking.scheduledAt).toLocaleDateString('pl-PL')} o{' '}
                      {new Date(booking.scheduledAt).toLocaleTimeString('pl-PL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-xs font-medium text-warning mt-1">
                      Nowy termin: {new Date(request.newTime).toLocaleDateString('pl-PL')} o{' '}
                      {new Date(request.newTime).toLocaleTimeString('pl-PL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-warning/20 text-warning">Nowa propozycja</Badge>
                </div>
                
                <div className="mt-3 pt-3 border-t flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleDeclineReschedule(booking.id, request.id)}
                  >
                    Odrzuć
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleAcceptReschedule(booking.id, request.id)}
                  >
                    Zaakceptuj
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Client Reschedule Responses */}
      {clientRescheduleResponses.length > 0 && (
        <section className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">Odpowiedzi na Twoje propozycje ({clientRescheduleResponses.length})</h2>
          {clientRescheduleResponses.map(({ booking, request }) => (
            <Card key={request.id} className={request.status === 'accepted' ? 'bg-success/10 border-success/30' : 'bg-destructive/10 border-destructive/30'}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
                    <p className="text-sm text-muted-foreground">{getTrainerName(booking.trainerId)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Zaproponowany termin: {new Date(request.newTime).toLocaleDateString('pl-PL')} o{' '}
                      {new Date(request.newTime).toLocaleTimeString('pl-PL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={request.status === 'accepted' ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}
                  >
                    {request.status === 'accepted' ? 'Zaakceptowane' : 'Odrzucone'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Requests Awaiting Trainer's Decision */}
      {awaitingTrainerDecision.length > 0 && (
        <section className="p-4 space-y-4">
          <h2 className="text-xl font-semibold text-info">Oczekuje na decyzję trenera ({awaitingTrainerDecision.length})</h2>
          {awaitingTrainerDecision.map(({ booking, request }) => (
            <Card key={request.id} className="bg-info/10 border-info/30">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
                    <p className="text-sm text-muted-foreground">{getTrainerName(booking.trainerId)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Stary termin: {new Date(booking.scheduledAt).toLocaleDateString('pl-PL')} o{' '}
                      {new Date(booking.scheduledAt).toLocaleTimeString('pl-PL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                    <p className="text-xs font-medium text-info mt-1">
                      Zaproponowany termin: {new Date(request.newTime).toLocaleDateString('pl-PL')} o{' '}
                      {new Date(request.newTime).toLocaleTimeString('pl-PL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-info/20 text-info">Oczekuje na decyzję trenera</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      {/* Main Content - List or Calendar View */}
      {viewType === 'list' ? (
        <>
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

          {/* Past Bookings - only in list view */}
          {pastBookings.length > 0 && (
            <>
              <Separator className="mx-4" />
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
        </>
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
                onDayClick={handleDayClick}
              />
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-warning/20 border border-warning/50"></div>
                  <span>Dni z treningami</span>
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

      {/* Day Details Panel */}
      {showDayDetails && (
        <Dialog open={!!showDayDetails} onOpenChange={() => setShowDayDetails(null)}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {showDayDetails.toLocaleDateString('pl-PL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {getBookingsForDate(showDayDetails).length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Brak treningów w tym dniu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getBookingsForDate(showDayDetails).map((booking) => (
                    <Card key={booking.id} className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold">{getServiceName(booking.serviceId)}</h3>
                          <p className="text-sm text-muted-foreground">{getTrainerName(booking.trainerId)}</p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {new Date(booking.scheduledAt).toLocaleTimeString('pl-PL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {booking.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{booking.location}</span>
                          </div>
                        )}
                        {booking.notes && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs">💬</span>
                            <span className="text-xs">{booking.notes}</span>
                          </div>
                        )}
                      </div>

                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <div className="mt-3 pt-3 border-t flex gap-2">
                          {booking.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBookingForReschedule(booking);
                                setClientRescheduleModalOpen(true);
                              }}
                              className="flex-1"
                            >
                              Zmień termin
                            </Button>
                          )}
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Reschedule Modals */}
      <RescheduleNotificationModal
        isOpen={rescheduleModalOpen}
        onClose={() => {
          setRescheduleModalOpen(false);
          setSelectedRescheduleRequest(null);
        }}
        booking={selectedRescheduleRequest?.booking || null}
        rescheduleRequest={selectedRescheduleRequest?.request || null}
        onAccept={(bookingId, requestId) => handleAcceptReschedule(bookingId, requestId)}
        onDecline={(bookingId, requestId) => handleDeclineReschedule(bookingId, requestId)}
      />
      
      <ClientRescheduleModal
        isOpen={clientRescheduleModalOpen}
        onClose={() => {
          setClientRescheduleModalOpen(false);
          setSelectedBookingForReschedule(null);
        }}
        booking={selectedBookingForReschedule}
        onReschedule={handleClientReschedule}
      />
    </div>
  );
};

export default ClientCalendarPage;
