import React, { useState } from 'react';
import { User, Settings, LogOut, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { AchievementsCard } from '@/components/AchievementsCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) return null;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Profil</h1>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => navigate(user?.role === 'trainer' ? '/trainer/settings' : '/profile/edit')}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Profile Info */}
      <section className="p-4 space-y-4">
        <Card className="bg-gradient-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback className="text-2xl">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{user.name} {user.surname}</h2>
                <p className="text-muted-foreground">{user.email}</p>
                <Badge variant="secondary" className="mt-2">
                  {user.role === 'client' ? 'Klient' : 'Trener'}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => navigate(user.role === 'trainer' ? '/trainer/settings' : '/profile/edit')}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            {user.city && (
              <p className="text-muted-foreground">📍 {user.city}</p>
            )}
          </CardContent>
        </Card>

        {/* Stats for Client */}
        {user.role === 'client' && <AchievementsCard />}

        {/* Stats for Trainer */}
        {user.role === 'trainer' && (
          <Card>
            <CardHeader>
              <CardTitle>Twoje statystyki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">4.9</div>
                  <div className="text-sm text-muted-foreground">Ocena</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">127</div>
                  <div className="text-sm text-muted-foreground">Treningów</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Ustawienia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate(user.role === 'trainer' ? '/trainer/settings' : '/profile/edit')}
            >
              <Settings className="h-4 w-4 mr-2" />
              {user.role === 'trainer' ? 'Ustawienia profilu' : 'Edytuj profil'}
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-600 hover:text-red-700"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Wyloguj się
            </Button>
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