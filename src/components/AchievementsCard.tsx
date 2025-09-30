import React, { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Calendar, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { bookingsService } from '@/services/supabase';

interface Achievement {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

export const AchievementsCard: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAchievements = async () => {
      if (!user || user.role !== 'client') return;

      try {
        const userBookings = await bookingsService.getByUserId(user.id);
        const completedBookings = userBookings.filter(
          booking => booking.status === 'completed'
        );

        const calculatedAchievements: Achievement[] = [
          {
            icon: <Trophy className="h-5 w-5" />,
            value: completedBookings.length,
            label: 'Treningów',
            color: 'text-primary'
          },
          {
            icon: <Target className="h-5 w-5" />,
            value: new Set(completedBookings.map(b => b.service_id)).size,
            label: 'Dyscypliny',
            color: 'text-accent'
          },
          {
            icon: <Flame className="h-5 w-5" />,
            value: Math.min(completedBookings.length, 7),
            label: 'Dni z rzędu',
            color: 'text-warning'
          },
          {
            icon: <Calendar className="h-5 w-5" />,
            value: `${completedBookings.length * 1}h`,
            label: 'Łączny czas',
            color: 'text-success'
          },
          {
            icon: <Star className="h-5 w-5" />,
            value: 'Brak',
            label: 'Ulubiony trener',
            color: 'text-primary'
          },
          {
            icon: <TrendingUp className="h-5 w-5" />,
            value: completedBookings.length > 0 ? '📈' : '🎯',
            label: completedBookings.length > 0 ? 'Aktywny' : 'Nowy',
            color: 'text-accent'
          }
        ];

        setAchievements(calculatedAchievements);
      } catch (error) {
        console.error('Error loading achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [user]);

  if (!user || user.role !== 'client') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Twoje osiągnięcia
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground">Ładowanie...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="text-center space-y-1">
                  <div className={`flex items-center justify-center ${achievement.color} mb-1`}>
                    {achievement.icon}
                  </div>
                  <div className={`text-xl font-bold ${achievement.color}`}>
                    {achievement.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {achievement.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-gradient-primary/10 rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                {achievements[0]?.value === 0 
                  ? '🎯 Zarezerwuj swój pierwszy trening!'
                  : achievements[0]?.value === 1 
                  ? '🎉 Gratulacje pierwszego treningu!'
                  : `💪 Świetnie! ${achievements[0]?.value} treningów za Tobą!`
                }
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
