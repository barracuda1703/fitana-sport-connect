import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

interface InterfaceLanguageSelectorProps {
  className?: string;
}

export const InterfaceLanguageSelector: React.FC<InterfaceLanguageSelectorProps> = ({ 
  className 
}) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageSelect = (langCode: string) => {
    const selectedLang = languages.find(lang => lang.code === langCode);
    if (selectedLang) {
      setLanguage(selectedLang);
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2 min-w-[100px]"
      >
        <span className="font-medium">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-background border border-border rounded-lg shadow-lg z-[100] overflow-hidden">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageSelect(lang.code)}
                className={cn(
                  "w-full px-4 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between",
                  currentLanguage.code === lang.code && "bg-accent font-semibold"
                )}
              >
                <span>{lang.nativeName}</span>
                {currentLanguage.code === lang.code && (
                  <span className="text-primary">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
