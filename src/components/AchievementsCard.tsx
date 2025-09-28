import React, { useState, useEffect } from 'react';
import { Trophy, Target, Flame, Calendar, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { dataStore, Booking } from '@/services/DataStore';

interface Achievement {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
}

export const AchievementsCard: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    if (!user || user.role !== 'client') return;

    // Fetch user's bookings to calculate achievements
    const userBookings = dataStore.getBookings(user.id);
    const completedBookings = userBookings.filter(
      booking => booking.status === 'completed'
    );

    // Calculate unique disciplines
    const uniqueDisciplines = new Set<string>();
    completedBookings.forEach(booking => {
      // Mock service to discipline mapping
      const serviceIdToDiscipline: Record<string, string> = {
        'srv-1': 'Fitness',
        'srv-2': 'Yoga',
        'srv-3': 'Boks',
        'srv-4': 'Crossfit',
        'srv-5': 'Pilates',
        'srv-6': 'Stretching'
      };
      const discipline = serviceIdToDiscipline[booking.serviceId];
      if (discipline) {
        uniqueDisciplines.add(discipline);
      }
    });

    // Calculate favorite trainer (most booked trainer)
    const trainerCounts: Record<string, number> = {};
    completedBookings.forEach(booking => {
      trainerCounts[booking.trainerId] = (trainerCounts[booking.trainerId] || 0) + 1;
    });
    
    const favoriteTrainerId = Object.entries(trainerCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0];

    const getFavoriteTrainerName = (trainerId: string) => {
      const trainerMap: Record<string, string> = {
        't-1': 'Anna K.',
        't-2': 'Marek N.', 
        't-3': 'Ewa W.'
      };
      return trainerMap[trainerId] || 'Brak';
    };

    // Calculate streak (mock - consecutive days with trainings)
    const calculateStreak = () => {
      // Simplified streak calculation - in real app would be more complex
      const recentBookings = completedBookings
        .filter(booking => {
          const bookingDate = new Date(booking.scheduledAt);
          const daysDiff = Math.floor((Date.now() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
          return daysDiff <= 30; // Last 30 days
        });
      
      return Math.min(recentBookings.length, 7); // Max 7 days streak for demo
    };

    // Calculate total training time (assuming 60 min per session)
    const totalMinutes = completedBookings.length * 60;
    const totalHours = Math.floor(totalMinutes / 60);

    const calculatedAchievements: Achievement[] = [
      {
        icon: <Trophy className="h-5 w-5" />,
        value: completedBookings.length,
        label: 'Treningów',
        color: 'text-primary'
      },
      {
        icon: <Target className="h-5 w-5" />,
        value: uniqueDisciplines.size,
        label: 'Dyscypliny',
        color: 'text-accent'
      },
      {
        icon: <Flame className="h-5 w-5" />,
        value: calculateStreak(),
        label: 'Dni z rzędu',
        color: 'text-warning'
      },
      {
        icon: <Calendar className="h-5 w-5" />,
        value: `${totalHours}h`,
        label: 'Łączny czas',
        color: 'text-success'
      },
      {
        icon: <Star className="h-5 w-5" />,
        value: favoriteTrainerId ? getFavoriteTrainerName(favoriteTrainerId) : 'Brak',
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

        {/* Progress Message */}
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
      </CardContent>
    </Card>
  );
};