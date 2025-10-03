import React, { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { LANGUAGES, getLanguageName, searchLanguages } from '@/data/languages';

interface SimpleLanguageSelectorProps {
  selectedLanguages: string[];
  onLanguagesChange: (languages: string[]) => void;
  placeholder?: string;
}

export const SimpleLanguageSelector: React.FC<SimpleLanguageSelectorProps> = ({
  selectedLanguages,
  onLanguagesChange,
  placeholder = "Wybierz języki..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLanguages, setFilteredLanguages] = useState(LANGUAGES);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Filter languages based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = searchLanguages(searchQuery);
      setFilteredLanguages(filtered);
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
    // Close dropdown and clear search after selection
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleRemoveLanguage = (languageCode: string) => {
    onLanguagesChange(selectedLanguages.filter(code => code !== languageCode));
  };

  return (
    <div className="space-y-2" ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={searchRef}
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10"
        />
      </div>

      {/* Selected Languages Chips */}
      {selectedLanguages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map((languageCode) => (
            <Badge key={languageCode} variant="secondary" className="flex items-center gap-1">
              {getLanguageName(languageCode)}
              <button
                type="button"
                onClick={() => handleRemoveLanguage(languageCode)}
                className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Language Dropdown */}
      {isOpen && (
        <div className="border border-input rounded-md bg-background shadow-lg max-h-60 overflow-y-auto">
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
      )}
    </div>
  );
};

export default SimpleLanguageSelector;
