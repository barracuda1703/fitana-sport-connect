import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getLanguageName } from '@/data/languages';
import { cn } from '@/lib/utils';

interface LanguageChipsProps {
  languages: string[];
  maxDisplay?: number;
  showTooltip?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LanguageChips: React.FC<LanguageChipsProps> = ({
  languages,
  maxDisplay = 3,
  showTooltip = true,
  className,
  size = 'sm'
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!languages || languages.length === 0) {
    return null;
  }

  const displayLanguages = showAll ? languages : languages.slice(0, maxDisplay);
  const remainingCount = Math.max(0, languages.length - maxDisplay);

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'md':
        return 'text-sm px-2.5 py-1.5';
      case 'lg':
        return 'text-sm px-3 py-2';
      default:
        return 'text-xs px-2 py-1';
    }
  };

  const renderChip = (languageCode: string, index: number) => {
    const languageName = getLanguageName(languageCode);
    const chip = (
      <Badge
        key={languageCode}
        variant="secondary"
        className={cn(
          "bg-primary/10 text-primary hover:bg-primary/20 transition-colors",
          getSizeClasses()
        )}
      >
        {languageName}
      </Badge>
    );

    if (showTooltip) {
      return (
        <TooltipProvider key={languageCode}>
          <Tooltip>
            <TooltipTrigger asChild>
              {chip}
            </TooltipTrigger>
            <TooltipContent>
              <p>{languageName} ({languageCode})</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return chip;
  };

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {displayLanguages.map((languageCode, index) => 
        renderChip(languageCode, index)
      )}
      
      {remainingCount > 0 && !showAll && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="outline"
                className={cn(
                  "text-muted-foreground cursor-pointer hover:bg-accent",
                  getSizeClasses()
                )}
                onClick={() => setShowAll(true)}
              >
                +{remainingCount}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-medium">Pozostałe języki:</p>
                {languages.slice(maxDisplay).map(lang => (
                  <p key={lang} className="text-sm">
                    {getLanguageName(lang)}
                  </p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {showAll && remainingCount > 0 && (
        <Badge
          variant="ghost"
          className={cn(
            "text-muted-foreground cursor-pointer hover:bg-accent",
            getSizeClasses()
          )}
          onClick={() => setShowAll(false)}
        >
          Pokaż mniej
        </Badge>
      )}
    </div>
  );
};

export default LanguageChips;
