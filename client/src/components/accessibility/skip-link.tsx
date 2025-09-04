import React from 'react';
import { cn } from '@/lib/utils';

interface SkipLinkProps {
  targetId?: string; // id of main content container
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ targetId = 'main-content', className }) => {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 z-50',
        'bg-primary text-primary-foreground px-4 py-2 rounded shadow-lg transition',
        className
      )}
    >
      Skip to main content
    </a>
  );
};
