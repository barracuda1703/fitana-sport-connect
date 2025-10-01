import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, DollarSign, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { bookingsService } from '@/services/supabase';

interface TrainerStats {
  todayTrainings: number;
  weekTrainings: number;
  monthTrainings: number;
  totalTrainings: number;
  averageRating: number;
  todayEarnings: number;
  weekEarnings: number;
  monthEarnings: number;
  totalEarnings: number;
  activeClients: number;
  totalClients: number;
}

export const TrainerStatistics: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('statistics');
  const [stats, setStats] = useState<TrainerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return;
      
      try {
        // Fetch real bookings data
        const allBookings = await bookingsService.getByUserId(user.id);
        
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // Filter bookings by time periods
        const todayBookings = allBookings.filter(b => {
          const bookingDate = new Date(b.scheduled_at);
          return bookingDate >= startOfDay && (b.status === 'confirmed' || b.status === 'completed');
        });
        
        const weekBookings = allBookings.filter(b => {
          const bookingDate = new Date(b.scheduled_at);
          return bookingDate >= startOfWeek && (b.status === 'confirmed' || b.status === 'completed');
        });
        
        const monthBookings = allBookings.filter(b => {
          const bookingDate = new Date(b.scheduled_at);
          return bookingDate >= startOfMonth && (b.status === 'confirmed' || b.status === 'completed');
        });
        
        const totalBookings = allBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
        
        // Calculate stats (using 90 PLN as average session price)
        const sessionPrice = 90;
        
        const calculatedStats: TrainerStats = {
          todayTrainings: todayBookings.length,
          weekTrainings: weekBookings.length,
          monthTrainings: monthBookings.length,
          totalTrainings: totalBookings.length,
          averageRating: 0, // Will be fetched from reviews in the future
          todayEarnings: todayBookings.length * sessionPrice,
          weekEarnings: weekBookings.length * sessionPrice,
          monthEarnings: monthBookings.length * sessionPrice,
          totalEarnings: totalBookings.length * sessionPrice,
          activeClients: new Set(allBookings.filter(b => b.status === 'confirmed' || b.status === 'completed').map(b => b.client_id)).size,
          totalClients: new Set(allBookings.map(b => b.client_id)).size
        };
        
        setStats(calculatedStats);
        setLoading(false);
      } catch (error) {
        console.error('Error loading statistics:', error);
        setLoading(false);
      }
    };
    
    loadStats();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Ładowanie statystyk...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/trainer')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Twoje statystyki</h1>
            <p className="text-muted-foreground">Przegląd Twoich wyników</p>
          </div>
        </div>
      </header>

      {/* Statistics */}
      <section className="p-4 space-y-6">
        {/* Training Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Treningi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{stats.todayTrainings}</div>
                <div className="text-sm text-muted-foreground">Dziś</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-accent">{stats.weekTrainings}</div>
                <div className="text-sm text-muted-foreground">Ten tydzień</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-success">{stats.monthTrainings}</div>
                <div className="text-sm text-muted-foreground">Ten miesiąc</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-warning">{stats.totalTrainings}</div>
                <div className="text-sm text-muted-foreground">Łącznie</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Earnings Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Zarobki
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{stats.todayEarnings} zł</div>
                <div className="text-sm text-muted-foreground">Dziś</div>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{stats.weekEarnings} zł</div>
                <div className="text-sm text-muted-foreground">Ten tydzień</div>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{stats.monthEarnings} zł</div>
                <div className="text-sm text-muted-foreground">Ten miesiąc</div>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-lg">
                <div className="text-2xl font-bold text-success">{stats.totalEarnings} zł</div>
                <div className="text-sm text-muted-foreground">Łącznie</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Klienci
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-6 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{stats.activeClients}</div>
                <div className="text-sm text-muted-foreground">Aktywni klienci</div>
              </div>
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <div className="text-3xl font-bold text-muted-foreground">{stats.totalClients}</div>
                <div className="text-sm text-muted-foreground">Łącznie klientów</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rating Stats */}
        {stats.totalTrainings > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Oceny i opinie
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-6 bg-muted/30 rounded-lg">
                <div className="text-sm text-muted-foreground">
                  System ocen będzie dostępny wkrótce
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Insights - Only show if trainer has significant activity */}
        {stats.totalTrainings >= 10 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Twoje postępy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-success/10 rounded-lg">
                <div className="text-sm font-medium text-success">💪 Świetna praca!</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Przeprowadziłeś już {stats.totalTrainings} treningów
                </div>
              </div>
              {stats.activeClients > 5 && (
                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-sm font-medium text-primary">👥 Rosnąca baza klientów</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Masz {stats.activeClients} aktywnych klientów
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {stats.totalTrainings === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground">
                <p className="text-lg font-semibold mb-2">Zacznij swoją przygodę!</p>
                <p className="text-sm">
                  Gdy zaczniesz przyjmować rezerwacje, tutaj zobaczysz swoje statystyki i postępy.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
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