import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const languages: Language[] = [
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

// Translation keys - in a real app, this would be loaded from external files
const translations = {
  pl: {
    // Common
    'common.welcome': 'Witamy w Fitana',
    'common.continue': 'Kontynuuj',
    'common.back': 'Wstecz',
    'common.next': 'Następny',
    'common.save': 'Zapisz',
    'common.cancel': 'Anuluj',
    'common.loading': 'Ładowanie...',
    
    // Landing
    'landing.title': 'Znajdź swojego idealnego trenera',
    'landing.subtitle': 'Rezerwuj treningi indywidualne z najlepszymi trenerami w Twojej okolicy',
    'landing.getStarted': 'Rozpocznij',
    'landing.roleSelection': 'Kim jesteś?',
    'landing.client': 'Szukam trenera',
    'landing.trainer': 'Jestem trenerem',
    'landing.clientDesc': 'Znajdź i zarezerwuj treningi z profesjonalnymi trenerami',
    'landing.trainerDesc': 'Oferuj swoje usługi i zarządzaj kalendarzem treningów',
    
    // Navigation
    'nav.home': 'Główna',
    'nav.calendar': 'Kalendarz',
    'nav.chat': 'Wiadomości',
    'nav.profile': 'Profil',
    'nav.dashboard': 'Panel',
  },
  en: {
    'common.welcome': 'Welcome to Fitana',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    
    'landing.title': 'Find your perfect trainer',
    'landing.subtitle': 'Book individual training sessions with the best trainers in your area',
    'landing.getStarted': 'Get Started',
    'landing.roleSelection': 'Who are you?',
    'landing.client': 'Looking for a trainer',
    'landing.trainer': 'I am a trainer',
    'landing.clientDesc': 'Find and book training sessions with professional trainers',
    'landing.trainerDesc': 'Offer your services and manage your training calendar',
    
    'nav.home': 'Home',
    'nav.calendar': 'Calendar',
    'nav.chat': 'Chat',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
  },
  uk: {
    'common.welcome': 'Ласкаво просимо до Fitana',
    'common.continue': 'Продовжити',
    'common.back': 'Назад',
    'common.next': 'Далі',
    'common.save': 'Зберегти',
    'common.cancel': 'Скасувати',
    'common.loading': 'Завантаження...',
    
    'landing.title': 'Знайдіть свого ідеального тренера',
    'landing.subtitle': "Бронюйте індивідуальні тренування з найкращими тренерами у вашому районі",
    'landing.getStarted': 'Почати',
    'landing.roleSelection': 'Хто ви?',
    'landing.client': 'Шукаю тренера',
    'landing.trainer': 'Я тренер',
    'landing.clientDesc': 'Знайдіть і забронюйте тренування з професійними тренерами',
    'landing.trainerDesc': 'Пропонуйте свої послуги та керуйте календарем тренувань',
    
    'nav.home': 'Головна',
    'nav.calendar': 'Календар',
    'nav.chat': 'Повідомлення',
    'nav.profile': 'Профіль',
    'nav.dashboard': 'Панель',
  },
  ru: {
    'common.welcome': 'Добро пожаловать в Fitana',
    'common.continue': 'Продолжить',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.loading': 'Загрузка...',
    
    'landing.title': 'Найдите своего идеального тренера',
    'landing.subtitle': 'Бронируйте индивидуальные тренировки с лучшими тренерами в вашем районе',
    'landing.getStarted': 'Начать',
    'landing.roleSelection': 'Кто вы?',
    'landing.client': 'Ищу тренера',
    'landing.trainer': 'Я тренер',
    'landing.clientDesc': 'Найдите и забронируйте тренировки с профессиональными тренерами',
    'landing.trainerDesc': 'Предлагайте свои услуги и управляйте календарём тренировок',
    
    'nav.home': 'Главная',
    'nav.calendar': 'Календарь',
    'nav.chat': 'Сообщения',
    'nav.profile': 'Профиль',
    'nav.dashboard': 'Панель',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]); // Default to Polish

  useEffect(() => {
    // Check for saved language preference first
    const savedLang = localStorage.getItem('fitana-language');
    const savedLanguage = savedLang ? languages.find(lang => lang.code === savedLang) : null;
    
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    } else {
      // Keep Polish as default regardless of browser language
      setCurrentLanguage(languages[0]); // Polish
      localStorage.setItem('fitana-language', 'pl');
    }
  }, []);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('fitana-language', language.code);
  };

  const t = (key: string): string => {
    const translation = translations[currentLanguage.code]?.[key];
    return translation || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { languages };