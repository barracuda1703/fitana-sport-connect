import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'horizontal' | 'vertical' | 'grid';
  columns?: number;
  equalWidth?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  className,
  variant = 'horizontal',
  columns = 2,
  equalWidth = true
}) => {
  const getLayoutClasses = () => {
    const baseClasses = 'gap-2';
    
    switch (variant) {
      case 'vertical':
        return `flex flex-col ${baseClasses}`;
      case 'grid':
        return `grid grid-cols-${columns} ${baseClasses}`;
      default:
        return `flex ${baseClasses} ${equalWidth ? 'flex-1' : ''}`;
    }
  };

  return (
    <div className={cn(getLayoutClasses(), className)}>
      {children}
    </div>
  );
};

export default ButtonGroup;