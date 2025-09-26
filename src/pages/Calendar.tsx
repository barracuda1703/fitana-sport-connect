import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

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
          {user.role === 'trainer' && (
            <Button variant="outline" size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </header>

      {/* Calendar */}
      <section className="p-4">
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
            />
          </CardContent>
        </Card>
      </section>

      {/* Events for Selected Date */}
      <section className="px-4 space-y-4">
        <h2 className="text-xl font-semibold">
          Wydarzenia na {selectedDate?.toLocaleDateString('pl-PL')}
        </h2>
        
        <Card className="bg-gradient-card">
          <CardContent className="p-4 text-center text-muted-foreground">
            Brak wydarzeń na wybrany dzień
          </CardContent>
        </Card>
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