import React from 'react';
import { Home, Calendar, MessageCircle, User, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface BottomNavigationProps {
  userRole: 'client' | 'trainer';
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  userRole,
  activeTab,
  onTabChange,
}) => {
  const { t } = useLanguage();

  const clientTabs = [
    { id: 'home', icon: Home, label: t('nav.home') },
    { id: 'calendar', icon: Calendar, label: t('nav.calendar') },
    { id: 'chat', icon: MessageCircle, label: t('nav.chat') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ];

  const trainerTabs = [
    { id: 'dashboard', icon: BarChart3, label: t('nav.dashboard') },
    { id: 'calendar', icon: Calendar, label: t('nav.calendar') },
    { id: 'chat', icon: MessageCircle, label: t('nav.chat') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ];

  const tabs = userRole === 'client' ? clientTabs : trainerTabs;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-floating z-50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 min-w-[60px]",
              activeTab === id
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            )}
          >
            <Icon className="h-5 w-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};