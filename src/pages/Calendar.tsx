import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, List, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { dataStore, Booking } from '@/services/DataStore';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [calendarView, setCalendarView] = useState<'list' | 'month'>('list');

  useEffect(() => {
    if (user) {
      setBookings(dataStore.getBookings(user.id));
    }
  }, [user]);

  const handleNavigateToFullCalendar = () => {
    if (user?.role === 'trainer') {
      navigate('/trainer-calendar');
    } else {
      navigate('/client-calendar');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Kalendarz</h1>
            <p className="text-muted-foreground">
              {user.role === 'client' ? 'Twoje treningi' : 'Harmonogram pracy'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={calendarView === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCalendarView('list')}
                className="h-7 px-2"
              >
                <List className="h-3 w-3 mr-1" />
                Lista
              </Button>
              <Button
                variant={calendarView === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCalendarView('month')}
                className="h-7 px-2"
              >
                <Grid3X3 className="h-3 w-3 mr-1" />
                Kalendarz
              </Button>
            </div>
            
            {user.role === 'trainer' && (
              <Button variant="outline" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Calendar */}
      <section className="p-4">
        {calendarView === 'month' ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                {selectedDate?.toLocaleDateString('pl-PL', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                modifiers={{
                  hasBooking: (date) => {
                    const dateStr = date.toISOString().split('T')[0];
                    return bookings.some(booking => {
                      const bookingDate = new Date(booking.scheduledAt).toISOString().split('T')[0];
                      return bookingDate === dateStr;
                    });
                  }
                }}
                modifiersStyles={{
                  hasBooking: { 
                    backgroundColor: 'hsl(var(--primary))',
                    color: 'hsl(var(--primary-foreground))',
                    borderRadius: '50%'
                  }
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Lista wydarzeń
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        )}
      </section>

      {/* Events for Selected Date */}
      <section className="px-4 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            Wydarzenia na {selectedDate?.toLocaleDateString('pl-PL')}
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleNavigateToFullCalendar}
          >
            Zobacz wszystkie
          </Button>
        </div>
        
        {/* Show bookings for selected date */}
        {(() => {
          const selectedDateStr = selectedDate?.toISOString().split('T')[0];
          const dayBookings = bookings.filter(booking => {
            const bookingDate = new Date(booking.scheduledAt).toISOString().split('T')[0];
            return bookingDate === selectedDateStr;
          });

          return dayBookings.length > 0 ? (
            <div className="space-y-2">
              {dayBookings.map((booking) => (
                <Card key={booking.id} className="bg-gradient-card">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {user.role === 'trainer' 
                            ? `Klient #${booking.clientId.slice(-4)}` 
                            : `Trening - ${booking.serviceId}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.scheduledAt).toLocaleTimeString('pl-PL', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded ${
                        booking.status === 'confirmed' ? 'bg-success/20 text-success' :
                        booking.status === 'pending' ? 'bg-warning/20 text-warning' :
                        'bg-muted/20 text-muted-foreground'
                      }`}>
                        {booking.status === 'confirmed' ? 'Potwierdzone' :
                         booking.status === 'pending' ? 'Oczekuje' : booking.status}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gradient-card">
              <CardContent className="p-4 text-center text-muted-foreground">
                Brak wydarzeń na wybrany dzień
              </CardContent>
            </Card>
          );
        })()}
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};