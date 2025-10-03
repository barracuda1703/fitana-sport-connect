import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { LANGUAGES, getLanguageName, searchLanguages, Language } from '@/data/languages';

interface LanguageSelectorProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  placeholder?: string;
  className?: string;
  maxDisplay?: number; // Max languages to show before "+N"
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguages,
  onLanguagesChange,
  placeholder = "Wybierz języki...",
  className,
  maxDisplay = 3
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState<Language[]>(LANGUAGES);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter languages based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredLanguages(searchLanguages(searchQuery));
    } else {
      setFilteredLanguages(LANGUAGES);
    }
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const handleLanguageToggle = (languageCode: string) => {
    if (selectedLanguages.includes(languageCode)) {
      onLanguagesChange(selectedLanguages.filter(code => code !== languageCode));
    } else {
      onLanguagesChange([...selectedLanguages, languageCode]);
    }
  };

  const handleRemoveLanguage = (languageCode: string) => {
    onLanguagesChange(selectedLanguages.filter(code => code !== languageCode));
  };

  const getSelectedLanguageNames = () => {
    return selectedLanguages.map(code => getLanguageName(code));
  };

  const getDisplayLanguages = () => {
    const names = getSelectedLanguageNames();
    if (names.length <= maxDisplay) {
      return names;
    }
    return names.slice(0, maxDisplay);
  };

  const getRemainingCount = () => {
    return Math.max(0, selectedLanguages.length - maxDisplay);
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Selected Languages Display */}
      <div className="min-h-[40px] border border-input rounded-md bg-background p-2 flex flex-wrap gap-1">
        {selectedLanguages.length === 0 ? (
          <span className="text-muted-foreground text-sm py-1">{placeholder}</span>
        ) : (
          <>
            {getDisplayLanguages().map((name, index) => (
              <Badge key={selectedLanguages[index]} variant="secondary" className="flex items-center gap-1">
                {name}
                <button
                  type="button"
                  onClick={() => handleRemoveLanguage(selectedLanguages[index])}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {getRemainingCount() > 0 && (
              <Badge variant="outline" className="text-muted-foreground">
                +{getRemainingCount()}
              </Badge>
            )}
          </>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="ml-auto h-6 w-6 p-0"
        >
          <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
        </Button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchRef}
                placeholder="Szukaj języków..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Language List */}
          <div className="max-h-48 overflow-y-auto">
            {filteredLanguages.length === 0 ? (
              <div className="p-3 text-center text-muted-foreground text-sm">
                Nie znaleziono języków
              </div>
            ) : (
              filteredLanguages.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => handleLanguageToggle(language.code)}
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-accent flex items-center justify-between text-sm",
                    selectedLanguages.includes(language.code) && "bg-accent"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{getLanguageName(language.code)}</span>
                    <span className="text-xs text-muted-foreground">
                      {language.name_native} ({language.code})
                    </span>
                  </div>
                  {selectedLanguages.includes(language.code) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;