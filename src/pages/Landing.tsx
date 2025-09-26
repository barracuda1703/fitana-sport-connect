import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { LanguageSelector } from '@/components/LanguageSelector';
import { RoleSelection } from '@/components/RoleSelection';
import fitnessHero from '@/assets/fitness-hero.jpg';
import { useNavigate } from 'react-router-dom';
import fitanaLogo from '@/assets/fitana-logo.png';

export const Landing: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'trainer' | null>(null);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'client' ? '/client' : '/trainer');
    }
  }, [user, navigate]);

  const handleGetStarted = () => {
    setShowRoleSelection(true);
  };

  const handleRoleSelect = (role: 'client' | 'trainer') => {
    setSelectedRole(role);
    console.log(`Selected role: ${role}`);
    
    // Navigate to appropriate page based on role
    if (role === 'client') {
      navigate('/client');
    } else {
      navigate('/trainer');
    }
  };

  if (showRoleSelection) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-card shadow-sm">
          <div className="flex items-center gap-3">
            <img src={fitanaLogo} alt="Fitana" className="h-8 w-8" />
            <span className="font-bold text-xl text-primary">Fitana</span>
          </div>
          <LanguageSelector />
        </header>

        {/* Role Selection Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <RoleSelection onRoleSelect={handleRoleSelect} />
        </main>

        {/* Back Button */}
        <div className="p-4">
          <Button 
            variant="ghost" 
            onClick={() => setShowRoleSelection(false)}
            className="w-full"
          >
            {t('common.back')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={fitanaLogo} alt="Fitana" className="h-8 w-8" />
          <span className="font-bold text-xl text-primary">Fitana</span>
        </div>
        <LanguageSelector />
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${fitnessHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/60" />
        </div>

        {/* Content */}
        <div className="relative z-10 px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              {t('landing.title')}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90 animate-slide-up">
              {t('landing.subtitle')}
            </p>
            <Button 
              variant="hero" 
              size="lg"
              onClick={handleGetStarted}
              className="animate-scale-in text-lg px-8 py-6 h-auto"
            >
              {t('landing.getStarted')}
            </Button>
          </div>
        </div>
      </section>

      {/* Features Preview */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-gradient-card shadow-card hover:shadow-floating transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏃‍♀️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Znajdź trenera</h3>
              <p className="text-muted-foreground">Przeglądaj setki zweryfikowanych trenerów w Twojej okolicy</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-card shadow-card hover:shadow-floating transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Zarezerwuj trening</h3>
              <p className="text-muted-foreground">Łatwe rezerwowanie i zarządzanie treningami</p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-card shadow-card hover:shadow-floating transition-all duration-200">
              <div className="w-16 h-16 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Komunikuj się</h3>
              <p className="text-muted-foreground">Bezpośrednia komunikacja z trenerem</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};