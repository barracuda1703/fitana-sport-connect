import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ResponsiveButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
}

export const ResponsiveButtonGroup: React.FC<ResponsiveButtonGroupProps> = ({
  children,
  className,
  orientation = 'horizontal',
  columns = 2
}) => {
  const getLayoutClasses = () => {
    switch (orientation) {
      case 'vertical':
        return 'flex flex-col gap-2';
      case 'grid':
        return `grid grid-cols-${columns} gap-2`;
      default:
        return 'flex gap-2';
    }
  };

  return (
    <div className={cn(getLayoutClasses(), className)}>
      {children}
    </div>
  );
};

export default ResponsiveButtonGroup;