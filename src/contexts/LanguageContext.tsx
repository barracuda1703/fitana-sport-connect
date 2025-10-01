import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '@/types';
import { supabase } from '@/integrations/supabase/client';

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
const translations: Record<string, Record<string, string>> = {
  pl: {
    // Navigation
    home: 'Strona główna',
    calendar: 'Kalendarz',
    chat: 'Czat',
    profile: 'Profil',
    
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
    
    // Trainer Profile Settings
    save: 'Zapisz',
    cancel: 'Anuluj',
    close: 'Zamknij',
    back: 'Wstecz',
    loading: 'Ładowanie...',
    trainerSettings: 'Ustawienia trenera',
    profileAndAppearance: 'Profil i wygląd',
    workSettings: 'Ustawienia pracy',
    basicInfo: 'Podstawowe informacje',
    displayName: 'Wyświetlana nazwa',
    bio: 'Opis',
    bioPlaceholder: 'Opowiedz o sobie, swoim doświadczeniu i podejściu do treningu...',
    profilePhoto: 'Zdjęcie profilowe',
    languages: 'Języki',
    selectLanguages: 'Wybierz języki, którymi się posługujesz',
    specialties: 'Specjalizacje',
    selectSpecialties: 'Wybierz maksymalnie 3 specjalizacje',
    selectedSpecialties: 'Wybrane specjalizacje',
    locations: 'Lokalizacje',
    servicesAndPricing: 'Usługi i cennik',
    weeklyAvailability: 'Dostępność tygodniowa',
    selectAvailableHours: 'Wybierz dostępne godziny dla każdego dnia tygodnia',
    from: 'Od',
    to: 'Do',
    bookingSettings: 'Ustawienia rezerwacji',
    autoAcceptBookings: 'Automatycznie akceptuj rezerwacje',
    bufferTime: 'Czas buforowy między sesjami (minuty)',
    notificationPreferences: 'Preferencje powiadomień',
    emailNotifications: 'Powiadomienia email',
    pushNotifications: 'Powiadomienia push',
    smsNotifications: 'Powiadomienia SMS',
    privacySettings: 'Ustawienia prywatności',
    showEmail: 'Pokaż email w profilu',
    showPhone: 'Pokaż telefon w profilu',
    languageAndRegion: 'Język i region',
    appLanguage: 'Język aplikacji',
    timezone: 'Strefa czasowa',
    changesSaved: 'Zmiany zapisane pomyślnie',
    errorSaving: 'Błąd podczas zapisywania zmian',
    maxSpecialties: 'Możesz wybrać maksymalnie 3 specjalizacje',
    monday: 'Poniedziałek',
    tuesday: 'Wtorek',
    wednesday: 'Środa',
    thursday: 'Czwartek',
    friday: 'Piątek',
    saturday: 'Sobota',
    sunday: 'Niedziela',
  },
  'en-GB': {
    // Navigation
    home: 'Home',
    calendar: 'Calendar',
    chat: 'Chat',
    profile: 'Profile',
    
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
    
    // Trainer Profile Settings
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    loading: 'Loading...',
    trainerSettings: 'Trainer Settings',
    profileAndAppearance: 'Profile & Appearance',
    workSettings: 'Work Settings',
    basicInfo: 'Basic Information',
    displayName: 'Display Name',
    bio: 'Bio',
    bioPlaceholder: 'Tell about yourself, your experience and approach to training...',
    profilePhoto: 'Profile Photo',
    languages: 'Languages',
    selectLanguages: 'Select languages you speak',
    specialties: 'Specialties',
    selectSpecialties: 'Select up to 3 specialties',
    selectedSpecialties: 'Selected Specialties',
    locations: 'Locations',
    servicesAndPricing: 'Services & Pricing',
    weeklyAvailability: 'Weekly Availability',
    selectAvailableHours: 'Select available hours for each day of the week',
    from: 'From',
    to: 'To',
    bookingSettings: 'Booking Settings',
    autoAcceptBookings: 'Auto-accept bookings',
    bufferTime: 'Buffer time between sessions (minutes)',
    notificationPreferences: 'Notification Preferences',
    emailNotifications: 'Email notifications',
    pushNotifications: 'Push notifications',
    smsNotifications: 'SMS notifications',
    privacySettings: 'Privacy Settings',
    showEmail: 'Show email in profile',
    showPhone: 'Show phone in profile',
    languageAndRegion: 'Language & Region',
    appLanguage: 'App Language',
    timezone: 'Timezone',
    changesSaved: 'Changes saved successfully',
    errorSaving: 'Error saving changes',
    maxSpecialties: 'You can select up to 3 specialties',
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
  },
  uk: {
    // Navigation
    home: 'Головна',
    calendar: 'Календар',
    chat: 'Чат',
    profile: 'Профіль',
    
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
    
    // Trainer Profile Settings
    save: 'Зберегти',
    cancel: 'Скасувати',
    close: 'Закрити',
    back: 'Назад',
    loading: 'Завантаження...',
    trainerSettings: 'Налаштування тренера',
    profileAndAppearance: 'Профіль та вигляд',
    workSettings: 'Налаштування роботи',
    basicInfo: 'Основна інформація',
    displayName: 'Відображуване ім\'я',
    bio: 'Опис',
    bioPlaceholder: 'Розкажіть про себе, свій досвід та підхід до тренувань...',
    profilePhoto: 'Фото профілю',
    languages: 'Мови',
    selectLanguages: 'Виберіть мови, якими ви розмовляєте',
    specialties: 'Спеціалізації',
    selectSpecialties: 'Виберіть до 3 спеціалізацій',
    selectedSpecialties: 'Обрані спеціалізації',
    locations: 'Локації',
    servicesAndPricing: 'Послуги та ціни',
    weeklyAvailability: 'Тижнева доступність',
    selectAvailableHours: 'Виберіть доступні години для кожного дня тижня',
    from: 'Від',
    to: 'До',
    bookingSettings: 'Налаштування бронювання',
    autoAcceptBookings: 'Автоматично приймати бронювання',
    bufferTime: 'Час буфера між сесіями (хвилини)',
    notificationPreferences: 'Налаштування сповіщень',
    emailNotifications: 'Email сповіщення',
    pushNotifications: 'Push сповіщення',
    smsNotifications: 'SMS сповіщення',
    privacySettings: 'Налаштування приватності',
    showEmail: 'Показати email в профілі',
    showPhone: 'Показати телефон в профілі',
    languageAndRegion: 'Мова та регіон',
    appLanguage: 'Мова додатку',
    timezone: 'Часовий пояс',
    changesSaved: 'Зміни збережено успішно',
    errorSaving: 'Помилка при збереженні змін',
    maxSpecialties: 'Ви можете вибрати максимум 3 спеціалізації',
    monday: 'Понеділок',
    tuesday: 'Вівторок',
    wednesday: 'Середа',
    thursday: 'Четвер',
    friday: 'П\'ятниця',
    saturday: 'Субота',
    sunday: 'Неділя',
  },
  ru: {
    // Navigation
    home: 'Главная',
    calendar: 'Календарь',
    chat: 'Чат',
    profile: 'Профиль',
    
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
    
    // Trainer Profile Settings
    save: 'Сохранить',
    cancel: 'Отмена',
    close: 'Закрыть',
    back: 'Назад',
    loading: 'Загрузка...',
    trainerSettings: 'Настройки тренера',
    profileAndAppearance: 'Профиль и внешний вид',
    workSettings: 'Настройки работы',
    basicInfo: 'Основная информация',
    displayName: 'Отображаемое имя',
    bio: 'Описание',
    bioPlaceholder: 'Расскажите о себе, своем опыте и подходе к тренировкам...',
    profilePhoto: 'Фото профиля',
    languages: 'Языки',
    selectLanguages: 'Выберите языки, которыми вы владеете',
    specialties: 'Специализации',
    selectSpecialties: 'Выберите до 3 специализаций',
    selectedSpecialties: 'Выбранные специализации',
    locations: 'Локации',
    servicesAndPricing: 'Услуги и цены',
    weeklyAvailability: 'Еженедельная доступность',
    selectAvailableHours: 'Выберите доступные часы для каждого дня недели',
    from: 'От',
    to: 'До',
    bookingSettings: 'Настройки бронирования',
    autoAcceptBookings: 'Автоматически принимать бронирования',
    bufferTime: 'Буферное время между сессиями (минуты)',
    notificationPreferences: 'Настройки уведомлений',
    emailNotifications: 'Email уведомления',
    pushNotifications: 'Push уведомления',
    smsNotifications: 'SMS уведомления',
    privacySettings: 'Настройки конфиденциальности',
    showEmail: 'Показать email в профиле',
    showPhone: 'Показать телефон в профиле',
    languageAndRegion: 'Язык и регион',
    appLanguage: 'Язык приложения',
    timezone: 'Часовой пояс',
    changesSaved: 'Изменения сохранены успешно',
    errorSaving: 'Ошибка при сохранении изменений',
    maxSpecialties: 'Вы можете выбрать максимум 3 специализации',
    monday: 'Понедельник',
    tuesday: 'Вторник',
    wednesday: 'Среда',
    thursday: 'Четверг',
    friday: 'Пятница',
    saturday: 'Суббота',
    sunday: 'Воскресенье',
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
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Load language preference from database
    const loadLanguagePreference = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('language_preference')
          .eq('id', user.id)
          .single();
        
        if (profile?.language_preference) {
          const lang = languages.find(l => l.code === profile.language_preference);
          if (lang) {
            setCurrentLanguage(lang);
          } else {
            // Default to Polish if preference not found
            setCurrentLanguage(languages[0]);
          }
        } else {
          // Default to Polish and save it
          setCurrentLanguage(languages[0]);
          await supabase
            .from('profiles')
            .update({ language_preference: 'pl' })
            .eq('id', user.id);
        }
      } else {
        // Not logged in, default to Polish
        setCurrentLanguage(languages[0]);
      }
    };
    loadLanguagePreference();
  }, []);

  const setLanguage = async (language: Language) => {
    setCurrentLanguage(language);
    
    // Save to database if user is logged in
    if (userId) {
      const { error } = await supabase
        .from('profiles')
        .update({ language_preference: language.code })
        .eq('id', userId);
      
      if (error) {
        console.error('Failed to save language preference:', error);
      }
    }
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
