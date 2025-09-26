import React from 'react';
import { Users, Dumbbell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface RoleSelectionProps {
  onRoleSelect: (role: 'client' | 'trainer') => void;
}

export const RoleSelection: React.FC<RoleSelectionProps> = ({ onRoleSelect }) => {
  const { t } = useLanguage();

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold mb-2">{t('landing.roleSelection')}</h2>
        <p className="text-muted-foreground">
          {t('landing.subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Client Card */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-card cursor-pointer group bg-gradient-card">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
              <Users className="h-6 w-6 text-accent" />
            </div>
            <CardTitle className="text-xl">{t('landing.client')}</CardTitle>
            <CardDescription className="text-base">
              {t('landing.clientDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="client" 
              className="w-full"
              onClick={() => onRoleSelect('client')}
            >
              {t('common.continue')}
            </Button>
          </CardContent>
        </Card>

        {/* Trainer Card */}
        <Card className="relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-card cursor-pointer group bg-gradient-card">
          <CardHeader className="pb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{t('landing.trainer')}</CardTitle>
            <CardDescription className="text-base">
              {t('landing.trainerDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="trainer" 
              className="w-full"
              onClick={() => onRoleSelect('trainer')}
            >
              {t('common.continue')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};