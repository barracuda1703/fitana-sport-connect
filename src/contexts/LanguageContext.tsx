import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const languages: Language[] = [
  { code: 'pl', name: 'Polish', nativeName: 'Polski' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

// Comprehensive translations for the entire app
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
    'common.search': 'Szukaj',
    'common.filter': 'Filtruj',
    'common.clear': 'Wyczyść',
    'common.apply': 'Zastosuj',
    'common.edit': 'Edytuj',
    'common.delete': 'Usuń',
    'common.close': 'Zamknij',
    'common.confirm': 'Potwierdź',
    'common.select': 'Wybierz',
    
    // Landing
    'landing.title': 'Znajdź swojego idealnego trenera',
    'landing.subtitle': 'Rezerwuj treningi indywidualne z najlepszymi trenerami w Twojej okolicy',
    'landing.getStarted': 'Rozpocznij',
    'landing.roleSelection': 'Kim jesteś?',
    'landing.client': 'Szukam trenera',
    'landing.trainer': 'Jestem trenerem',
    'landing.clientDesc': 'Znajdź i zarezerwuj treningi z profesjonalnymi trenerami',
    'landing.trainerDesc': 'Oferuj swoje usługi i zarządzaj kalendarzem treningów',
    'landing.feature1.title': 'Znajdź trenera',
    'landing.feature1.desc': 'Przeglądaj setki zweryfikowanych trenerów w Twojej okolicy',
    'landing.feature2.title': 'Zarezerwuj trening',
    'landing.feature2.desc': 'Łatwe rezerwowanie i zarządzanie treningami',
    'landing.feature3.title': 'Komunikuj się',
    'landing.feature3.desc': 'Bezpośrednia komunikacja z trenerem',
    
    // Navigation
    'nav.home': 'Główna',
    'nav.calendar': 'Kalendarz',
    'nav.chat': 'Wiadomości',
    'nav.profile': 'Profil',
    'nav.dashboard': 'Panel',
    'nav.settings': 'Ustawienia',
    'nav.clients': 'Klienci',
    'nav.statistics': 'Statystyki',
    
    // Auth
    'auth.login': 'Zaloguj się',
    'auth.signup': 'Zarejestruj się',
    'auth.logout': 'Wyloguj się',
    'auth.email': 'Email',
    'auth.password': 'Hasło',
    'auth.confirmPassword': 'Potwierdź hasło',
    'auth.forgotPassword': 'Zapomniałeś hasła?',
    'auth.rememberMe': 'Zapamiętaj mnie',
    
    // Profile
    'profile.edit': 'Edytuj profil',
    'profile.name': 'Imię i nazwisko',
    'profile.bio': 'O mnie',
    'profile.location': 'Lokalizacja',
    'profile.languages': 'Języki',
    'profile.specializations': 'Specjalizacje',
    'profile.experience': 'Doświadczenie',
    'profile.certifications': 'Certyfikaty',
    
    // Booking
    'booking.book': 'Zarezerwuj',
    'booking.cancel': 'Anuluj rezerwację',
    'booking.reschedule': 'Zmień termin',
    'booking.confirm': 'Potwierdź rezerwację',
    'booking.pending': 'Oczekująca',
    'booking.confirmed': 'Potwierdzona',
    'booking.completed': 'Zakończona',
    'booking.cancelled': 'Anulowana',
    
    // Calendar
    'calendar.day': 'Dzień',
    'calendar.week': 'Tydzień',
    'calendar.month': 'Miesiąc',
    'calendar.today': 'Dziś',
    'calendar.noEvents': 'Brak wydarzeń',
    
    // Chat
    'chat.typeMessage': 'Wpisz wiadomość...',
    'chat.send': 'Wyślij',
    'chat.noMessages': 'Brak wiadomości',
  },
  'en-GB': {
    // Common
    'common.welcome': 'Welcome to Fitana',
    'common.continue': 'Continue',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.clear': 'Clear',
    'common.apply': 'Apply',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.select': 'Select',
    
    // Landing
    'landing.title': 'Find your perfect trainer',
    'landing.subtitle': 'Book individual training sessions with the best trainers in your area',
    'landing.getStarted': 'Get Started',
    'landing.roleSelection': 'Who are you?',
    'landing.client': 'Looking for a trainer',
    'landing.trainer': 'I am a trainer',
    'landing.clientDesc': 'Find and book training sessions with professional trainers',
    'landing.trainerDesc': 'Offer your services and manage your training calendar',
    'landing.feature1.title': 'Find a trainer',
    'landing.feature1.desc': 'Browse hundreds of verified trainers in your area',
    'landing.feature2.title': 'Book a session',
    'landing.feature2.desc': 'Easy booking and session management',
    'landing.feature3.title': 'Communicate',
    'landing.feature3.desc': 'Direct communication with your trainer',
    
    // Navigation
    'nav.home': 'Home',
    'nav.calendar': 'Calendar',
    'nav.chat': 'Chat',
    'nav.profile': 'Profile',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.clients': 'Clients',
    'nav.statistics': 'Statistics',
    
    // Auth
    'auth.login': 'Log in',
    'auth.signup': 'Sign up',
    'auth.logout': 'Log out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.rememberMe': 'Remember me',
    
    // Profile
    'profile.edit': 'Edit profile',
    'profile.name': 'Full name',
    'profile.bio': 'About me',
    'profile.location': 'Location',
    'profile.languages': 'Languages',
    'profile.specializations': 'Specialisations',
    'profile.experience': 'Experience',
    'profile.certifications': 'Certifications',
    
    // Booking
    'booking.book': 'Book',
    'booking.cancel': 'Cancel booking',
    'booking.reschedule': 'Reschedule',
    'booking.confirm': 'Confirm booking',
    'booking.pending': 'Pending',
    'booking.confirmed': 'Confirmed',
    'booking.completed': 'Completed',
    'booking.cancelled': 'Cancelled',
    
    // Calendar
    'calendar.day': 'Day',
    'calendar.week': 'Week',
    'calendar.month': 'Month',
    'calendar.today': 'Today',
    'calendar.noEvents': 'No events',
    
    // Chat
    'chat.typeMessage': 'Type a message...',
    'chat.send': 'Send',
    'chat.noMessages': 'No messages',
  },
  uk: {
    // Common
    'common.welcome': 'Ласкаво просимо до Fitana',
    'common.continue': 'Продовжити',
    'common.back': 'Назад',
    'common.next': 'Далі',
    'common.save': 'Зберегти',
    'common.cancel': 'Скасувати',
    'common.loading': 'Завантаження...',
    'common.search': 'Пошук',
    'common.filter': 'Фільтр',
    'common.clear': 'Очистити',
    'common.apply': 'Застосувати',
    'common.edit': 'Редагувати',
    'common.delete': 'Видалити',
    'common.close': 'Закрити',
    'common.confirm': 'Підтвердити',
    'common.select': 'Вибрати',
    
    // Landing
    'landing.title': 'Знайдіть свого ідеального тренера',
    'landing.subtitle': 'Бронюйте індивідуальні тренування з найкращими тренерами у вашому районі',
    'landing.getStarted': 'Почати',
    'landing.roleSelection': 'Хто ви?',
    'landing.client': 'Шукаю тренера',
    'landing.trainer': 'Я тренер',
    'landing.clientDesc': 'Знайдіть і забронюйте тренування з професійними тренерами',
    'landing.trainerDesc': 'Пропонуйте свої послуги та керуйте календарем тренувань',
    'landing.feature1.title': 'Знайдіть тренера',
    'landing.feature1.desc': 'Переглядайте сотні перевірених тренерів у вашому районі',
    'landing.feature2.title': 'Забронюйте тренування',
    'landing.feature2.desc': 'Легке бронювання та керування тренуваннями',
    'landing.feature3.title': 'Спілкуйтеся',
    'landing.feature3.desc': 'Пряме спілкування з тренером',
    
    // Navigation
    'nav.home': 'Головна',
    'nav.calendar': 'Календар',
    'nav.chat': 'Повідомлення',
    'nav.profile': 'Профіль',
    'nav.dashboard': 'Панель',
    'nav.settings': 'Налаштування',
    'nav.clients': 'Клієнти',
    'nav.statistics': 'Статистика',
    
    // Auth
    'auth.login': 'Увійти',
    'auth.signup': 'Зареєструватися',
    'auth.logout': 'Вийти',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Підтвердіть пароль',
    'auth.forgotPassword': 'Забули пароль?',
    'auth.rememberMe': "Запам'ятати мене",
    
    // Profile
    'profile.edit': 'Редагувати профіль',
    'profile.name': "Ім'я та прізвище",
    'profile.bio': 'Про мене',
    'profile.location': 'Місцезнаходження',
    'profile.languages': 'Мови',
    'profile.specializations': 'Спеціалізації',
    'profile.experience': 'Досвід',
    'profile.certifications': 'Сертифікати',
    
    // Booking
    'booking.book': 'Забронювати',
    'booking.cancel': 'Скасувати бронювання',
    'booking.reschedule': 'Перенести',
    'booking.confirm': 'Підтвердити бронювання',
    'booking.pending': 'Очікування',
    'booking.confirmed': 'Підтверджено',
    'booking.completed': 'Завершено',
    'booking.cancelled': 'Скасовано',
    
    // Calendar
    'calendar.day': 'День',
    'calendar.week': 'Тиждень',
    'calendar.month': 'Місяць',
    'calendar.today': 'Сьогодні',
    'calendar.noEvents': 'Немає подій',
    
    // Chat
    'chat.typeMessage': 'Введіть повідомлення...',
    'chat.send': 'Відправити',
    'chat.noMessages': 'Немає повідомлень',
  },
  ru: {
    // Common
    'common.welcome': 'Добро пожаловать в Fitana',
    'common.continue': 'Продолжить',
    'common.back': 'Назад',
    'common.next': 'Далее',
    'common.save': 'Сохранить',
    'common.cancel': 'Отмена',
    'common.loading': 'Загрузка...',
    'common.search': 'Поиск',
    'common.filter': 'Фильтр',
    'common.clear': 'Очистить',
    'common.apply': 'Применить',
    'common.edit': 'Редактировать',
    'common.delete': 'Удалить',
    'common.close': 'Закрыть',
    'common.confirm': 'Подтвердить',
    'common.select': 'Выбрать',
    
    // Landing
    'landing.title': 'Найдите своего идеального тренера',
    'landing.subtitle': 'Бронируйте индивидуальные тренировки с лучшими тренерами в вашем районе',
    'landing.getStarted': 'Начать',
    'landing.roleSelection': 'Кто вы?',
    'landing.client': 'Ищу тренера',
    'landing.trainer': 'Я тренер',
    'landing.clientDesc': 'Найдите и забронируйте тренировки с профессиональными тренерами',
    'landing.trainerDesc': 'Предлагайте свои услуги и управляйте календарём тренировок',
    'landing.feature1.title': 'Найдите тренера',
    'landing.feature1.desc': 'Просматривайте сотни проверенных тренеров в вашем районе',
    'landing.feature2.title': 'Забронируйте тренировку',
    'landing.feature2.desc': 'Легкое бронирование и управление тренировками',
    'landing.feature3.title': 'Общайтесь',
    'landing.feature3.desc': 'Прямое общение с тренером',
    
    // Navigation
    'nav.home': 'Главная',
    'nav.calendar': 'Календарь',
    'nav.chat': 'Сообщения',
    'nav.profile': 'Профиль',
    'nav.dashboard': 'Панель',
    'nav.settings': 'Настройки',
    'nav.clients': 'Клиенты',
    'nav.statistics': 'Статистика',
    
    // Auth
    'auth.login': 'Войти',
    'auth.signup': 'Зарегистрироваться',
    'auth.logout': 'Выйти',
    'auth.email': 'Email',
    'auth.password': 'Пароль',
    'auth.confirmPassword': 'Подтвердите пароль',
    'auth.forgotPassword': 'Забыли пароль?',
    'auth.rememberMe': 'Запомнить меня',
    
    // Profile
    'profile.edit': 'Редактировать профиль',
    'profile.name': 'Имя и фамилия',
    'profile.bio': 'О себе',
    'profile.location': 'Местоположение',
    'profile.languages': 'Языки',
    'profile.specializations': 'Специализации',
    'profile.experience': 'Опыт',
    'profile.certifications': 'Сертификаты',
    
    // Booking
    'booking.book': 'Забронировать',
    'booking.cancel': 'Отменить бронирование',
    'booking.reschedule': 'Перенести',
    'booking.confirm': 'Подтвердить бронирование',
    'booking.pending': 'Ожидание',
    'booking.confirmed': 'Подтверждено',
    'booking.completed': 'Завершено',
    'booking.cancelled': 'Отменено',
    
    // Calendar
    'calendar.day': 'День',
    'calendar.week': 'Неделя',
    'calendar.month': 'Месяц',
    'calendar.today': 'Сегодня',
    'calendar.noEvents': 'Нет событий',
    
    // Chat
    'chat.typeMessage': 'Введите сообщение...',
    'chat.send': 'Отправить',
    'chat.noMessages': 'Нет сообщений',
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
