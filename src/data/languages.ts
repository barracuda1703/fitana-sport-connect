export interface Language {
  code: string;
  name_en: string;
  name_native: string;
}

export const LANGUAGES: Language[] = [
  // Major European languages
  { code: 'pl', name_en: 'Polish', name_native: 'Polski' },
  { code: 'en', name_en: 'English', name_native: 'English' },
  { code: 'de', name_en: 'German', name_native: 'Deutsch' },
  { code: 'fr', name_en: 'French', name_native: 'Français' },
  { code: 'es', name_en: 'Spanish', name_native: 'Español' },
  { code: 'it', name_en: 'Italian', name_native: 'Italiano' },
  { code: 'pt', name_en: 'Portuguese', name_native: 'Português' },
  { code: 'ru', name_en: 'Russian', name_native: 'Русский' },
  { code: 'uk', name_en: 'Ukrainian', name_native: 'Українська' },
  { code: 'be', name_en: 'Belarusian', name_native: 'Беларуская' },
  { code: 'cs', name_en: 'Czech', name_native: 'Čeština' },
  { code: 'sk', name_en: 'Slovak', name_native: 'Slovenčina' },
  { code: 'hu', name_en: 'Hungarian', name_native: 'Magyar' },
  { code: 'ro', name_en: 'Romanian', name_native: 'Română' },
  { code: 'bg', name_en: 'Bulgarian', name_native: 'Български' },
  { code: 'hr', name_en: 'Croatian', name_native: 'Hrvatski' },
  { code: 'sr', name_en: 'Serbian', name_native: 'Српски' },
  { code: 'sl', name_en: 'Slovenian', name_native: 'Slovenščina' },
  { code: 'et', name_en: 'Estonian', name_native: 'Eesti' },
  { code: 'lv', name_en: 'Latvian', name_native: 'Latviešu' },
  { code: 'lt', name_en: 'Lithuanian', name_native: 'Lietuvių' },
  { code: 'fi', name_en: 'Finnish', name_native: 'Suomi' },
  { code: 'sv', name_en: 'Swedish', name_native: 'Svenska' },
  { code: 'no', name_en: 'Norwegian', name_native: 'Norsk' },
  { code: 'da', name_en: 'Danish', name_native: 'Dansk' },
  { code: 'is', name_en: 'Icelandic', name_native: 'Íslenska' },
  { code: 'ga', name_en: 'Irish', name_native: 'Gaeilge' },
  { code: 'cy', name_en: 'Welsh', name_native: 'Cymraeg' },
  { code: 'mt', name_en: 'Maltese', name_native: 'Malti' },
  { code: 'el', name_en: 'Greek', name_native: 'Ελληνικά' },
  { code: 'tr', name_en: 'Turkish', name_native: 'Türkçe' },
  { code: 'he', name_en: 'Hebrew', name_native: 'עברית' },
  { code: 'ar', name_en: 'Arabic', name_native: 'العربية' },
  
  // Asian languages
  { code: 'zh', name_en: 'Chinese', name_native: '中文' },
  { code: 'ja', name_en: 'Japanese', name_native: '日本語' },
  { code: 'ko', name_en: 'Korean', name_native: '한국어' },
  { code: 'th', name_en: 'Thai', name_native: 'ไทย' },
  { code: 'vi', name_en: 'Vietnamese', name_native: 'Tiếng Việt' },
  { code: 'id', name_en: 'Indonesian', name_native: 'Bahasa Indonesia' },
  { code: 'ms', name_en: 'Malay', name_native: 'Bahasa Melayu' },
  { code: 'tl', name_en: 'Filipino', name_native: 'Filipino' },
  { code: 'hi', name_en: 'Hindi', name_native: 'हिन्दी' },
  { code: 'bn', name_en: 'Bengali', name_native: 'বাংলা' },
  { code: 'ur', name_en: 'Urdu', name_native: 'اردو' },
  { code: 'ta', name_en: 'Tamil', name_native: 'தமிழ்' },
  { code: 'te', name_en: 'Telugu', name_native: 'తెలుగు' },
  { code: 'ml', name_en: 'Malayalam', name_native: 'മലയാളം' },
  { code: 'kn', name_en: 'Kannada', name_native: 'ಕನ್ನಡ' },
  { code: 'gu', name_en: 'Gujarati', name_native: 'ગુજરાતી' },
  { code: 'pa', name_en: 'Punjabi', name_native: 'ਪੰਜਾਬੀ' },
  { code: 'or', name_en: 'Odia', name_native: 'ଓଡ଼ିଆ' },
  { code: 'as', name_en: 'Assamese', name_native: 'অসমীয়া' },
  { code: 'ne', name_en: 'Nepali', name_native: 'नेपाली' },
  { code: 'si', name_en: 'Sinhala', name_native: 'සිංහල' },
  { code: 'my', name_en: 'Burmese', name_native: 'မြန်မာ' },
  { code: 'km', name_en: 'Khmer', name_native: 'ខ្មែរ' },
  { code: 'lo', name_en: 'Lao', name_native: 'ລາວ' },
  { code: 'ka', name_en: 'Georgian', name_native: 'ქართული' },
  { code: 'hy', name_en: 'Armenian', name_native: 'Հայերեն' },
  { code: 'az', name_en: 'Azerbaijani', name_native: 'Azərbaycan' },
  { code: 'kk', name_en: 'Kazakh', name_native: 'Қазақша' },
  { code: 'ky', name_en: 'Kyrgyz', name_native: 'Кыргызча' },
  { code: 'uz', name_en: 'Uzbek', name_native: 'Oʻzbekcha' },
  { code: 'tg', name_en: 'Tajik', name_native: 'Тоҷикӣ' },
  { code: 'mn', name_en: 'Mongolian', name_native: 'Монгол' },
  
  // African languages
  { code: 'sw', name_en: 'Swahili', name_native: 'Kiswahili' },
  { code: 'am', name_en: 'Amharic', name_native: 'አማርኛ' },
  { code: 'ha', name_en: 'Hausa', name_native: 'Hausa' },
  { code: 'yo', name_en: 'Yoruba', name_native: 'Yorùbá' },
  { code: 'ig', name_en: 'Igbo', name_native: 'Igbo' },
  { code: 'zu', name_en: 'Zulu', name_native: 'IsiZulu' },
  { code: 'xh', name_en: 'Xhosa', name_native: 'IsiXhosa' },
  { code: 'af', name_en: 'Afrikaans', name_native: 'Afrikaans' },
  
  // American languages
  { code: 'pt-BR', name_en: 'Brazilian Portuguese', name_native: 'Português do Brasil' },
  { code: 'es-MX', name_en: 'Mexican Spanish', name_native: 'Español de México' },
  { code: 'es-AR', name_en: 'Argentine Spanish', name_native: 'Español de Argentina' },
  { code: 'en-US', name_en: 'American English', name_native: 'American English' },
  { code: 'en-GB', name_en: 'British English', name_native: 'British English' },
  { code: 'en-AU', name_en: 'Australian English', name_native: 'Australian English' },
  { code: 'en-CA', name_en: 'Canadian English', name_native: 'Canadian English' },
  { code: 'fr-CA', name_en: 'Canadian French', name_native: 'Français du Canada' },
  
  // Other important languages
  { code: 'fa', name_en: 'Persian', name_native: 'فارسی' },
  { code: 'ps', name_en: 'Pashto', name_native: 'پښتو' },
  { code: 'sd', name_en: 'Sindhi', name_native: 'سنڌي' },
  { code: 'ku', name_en: 'Kurdish', name_native: 'Kurdî' },
  { code: 'yi', name_en: 'Yiddish', name_native: 'ייִדיש' },
  { code: 'eo', name_en: 'Esperanto', name_native: 'Esperanto' },
  { code: 'la', name_en: 'Latin', name_native: 'Latina' },
  { code: 'sa', name_en: 'Sanskrit', name_native: 'संस्कृतम्' },
];

// Helper function to get language by code
export const getLanguageByCode = (code: string): Language | undefined => {
  return LANGUAGES.find(lang => lang.code === code);
};

// Helper function to get language name in interface language
export const getLanguageName = (code: string, interfaceLanguage: string = 'pl'): string => {
  const language = getLanguageByCode(code);
  if (!language) return code;
  
  // For Polish interface, show native names for major languages, English for others
  if (interfaceLanguage === 'pl') {
    const majorLanguages = ['pl', 'en', 'de', 'fr', 'es', 'it', 'ru', 'uk', 'cs', 'sk', 'hu'];
    return majorLanguages.includes(code) ? language.name_native : language.name_en;
  }
  
  // For other interfaces, show English names
  return language.name_en;
};

// Helper function to search languages
export const searchLanguages = (query: string): Language[] => {
  const lowercaseQuery = query.toLowerCase();
  return LANGUAGES.filter(lang => 
    lang.name_en.toLowerCase().includes(lowercaseQuery) ||
    lang.name_native.toLowerCase().includes(lowercaseQuery) ||
    lang.code.toLowerCase().includes(lowercaseQuery)
  );
};
