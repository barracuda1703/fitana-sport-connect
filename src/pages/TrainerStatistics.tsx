import React, { useState, useEffect } from 'react';
import { ArrowLeft, TrendingUp, Users, DollarSign, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataStore } from '@/services/DataStore';

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
    if (user) {
      // Mock statistics - in real app would fetch from backend
      setTimeout(() => {
        const mockStats: TrainerStats = {
          todayTrainings: 3,
          weekTrainings: 12,
          monthTrainings: 48,
          totalTrainings: 127,
          averageRating: 4.9,
          todayEarnings: 270,
          weekEarnings: 1200,
          monthEarnings: 4800,
          totalEarnings: 15600,
          activeClients: 15,
          totalClients: 23
        };
        setStats(mockStats);
        setLoading(false);
      }, 500);
    }
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
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Oceny i opinie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-warning/10 rounded-lg">
              <div className="text-4xl font-bold text-warning mb-2">
                ⭐ {stats.averageRating}
              </div>
              <div className="text-sm text-muted-foreground">Średnia ocena</div>
              <div className="text-xs text-muted-foreground mt-2">
                Na podstawie {Math.floor(stats.totalTrainings * 0.8)} opinii
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Trendy i spostrzeżenia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-success/10 rounded-lg">
              <div className="text-sm font-medium text-success">📈 Wzrost aktywności</div>
              <div className="text-xs text-muted-foreground mt-1">
                W tym miesiącu przeprowadziłeś o 25% więcej treningów niż w poprzednim
              </div>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="text-sm font-medium text-primary">⭐ Wysoka ocena</div>
              <div className="text-xs text-muted-foreground mt-1">
                Twoja średnia ocena jest wyższa od 89% trenerów na platformie
              </div>
            </div>
            <div className="p-4 bg-warning/10 rounded-lg">
              <div className="text-sm font-medium text-warning">👥 Lojalność klientów</div>
              <div className="text-xs text-muted-foreground mt-1">
                65% Twoich klientów to stali klienci (powyżej 5 treningów)
              </div>
            </div>
          </CardContent>
        </Card>
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