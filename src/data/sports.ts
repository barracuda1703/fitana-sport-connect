interface SportTranslations {
  pl: string;
  en: string;
  de: string;
  es: string;
}

interface SportCategory {
  id: string;
  translations: SportTranslations;
  icon: string;
}

export const sportsCategories: SportCategory[] = [
  { id: 'gym', translations: { pl: 'Siłownia', en: 'Gym', de: 'Fitnessstudio', es: 'Gimnasio' }, icon: '🏋️' },
  { id: 'fitness', translations: { pl: 'Fitness', en: 'Fitness', de: 'Fitness', es: 'Fitness' }, icon: '💪' },
  { id: 'boxing', translations: { pl: 'Boks', en: 'Boxing', de: 'Boxen', es: 'Boxeo' }, icon: '🥊' },
  { id: 'kickboxing', translations: { pl: 'Kickboxing', en: 'Kickboxing', de: 'Kickboxen', es: 'Kickboxing' }, icon: '🥋' },
  { id: 'mma', translations: { pl: 'MMA', en: 'MMA', de: 'MMA', es: 'MMA' }, icon: '🤼' },
  { id: 'swimming', translations: { pl: 'Pływanie', en: 'Swimming', de: 'Schwimmen', es: 'Natación' }, icon: '🏊‍♀️' },
  { id: 'tennis', translations: { pl: 'Tenis', en: 'Tennis', de: 'Tennis', es: 'Tenis' }, icon: '🎾' },
  { id: 'judo', translations: { pl: 'Judo', en: 'Judo', de: 'Judo', es: 'Judo' }, icon: '🥋' },
  { id: 'karate', translations: { pl: 'Karate', en: 'Karate', de: 'Karate', es: 'Karate' }, icon: '🥋' },
  { id: 'yoga', translations: { pl: 'Joga', en: 'Yoga', de: 'Yoga', es: 'Yoga' }, icon: '🧘‍♀️' },
  { id: 'pilates', translations: { pl: 'Pilates', en: 'Pilates', de: 'Pilates', es: 'Pilates' }, icon: '🤸' },
  { id: 'dance', translations: { pl: 'Taniec', en: 'Dance', de: 'Tanz', es: 'Baile' }, icon: '💃' },
  { id: 'basketball', translations: { pl: 'Koszykówka', en: 'Basketball', de: 'Basketball', es: 'Baloncesto' }, icon: '🏀' },
  { id: 'football', translations: { pl: 'Piłka nożna', en: 'Football', de: 'Fußball', es: 'Fútbol' }, icon: '⚽' },
  { id: 'horse-riding', translations: { pl: 'Jazda konna', en: 'Horse Riding', de: 'Reiten', es: 'Equitación' }, icon: '🏇' },
  { id: 'skiing', translations: { pl: 'Narciarstwo', en: 'Skiing', de: 'Skifahren', es: 'Esquí' }, icon: '⛷️' },
  { id: 'crossfit', translations: { pl: 'Crossfit', en: 'Crossfit', de: 'Crossfit', es: 'Crossfit' }, icon: '🏋️‍♀️' },
  { id: 'gymnastics', translations: { pl: 'Gimnastyka', en: 'Gymnastics', de: 'Gymnastik', es: 'Gimnasia' }, icon: '🤸‍♀️' },
  { id: 'snowboard', translations: { pl: 'Snowboard', en: 'Snowboard', de: 'Snowboard', es: 'Snowboard' }, icon: '🏂' },
  { id: 'squash', translations: { pl: 'Squash', en: 'Squash', de: 'Squash', es: 'Squash' }, icon: '🎾' },
  { id: 'badminton', translations: { pl: 'Badminton', en: 'Badminton', de: 'Badminton', es: 'Bádminton' }, icon: '🏸' },
  { id: 'running', translations: { pl: 'Trening biegowy', en: 'Running Training', de: 'Lauftraining', es: 'Entrenamiento de Carrera' }, icon: '🏃‍♂️' },
  { id: 'golf', translations: { pl: 'Golf', en: 'Golf', de: 'Golf', es: 'Golf' }, icon: '⛳' },
];

export const getSportName = (sportId: string, language: string = 'pl'): string => {
  const sport = sportsCategories.find(s => s.id === sportId);
  if (!sport) return sportId;
  return sport.translations[language as keyof SportTranslations] || sport.translations.pl;
};

export const SPORTS_LIST = (language: string = 'pl') => 
  sportsCategories.map(sport => sport.translations[language as keyof SportTranslations] || sport.translations.pl);
