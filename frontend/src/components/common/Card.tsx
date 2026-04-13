// src/components/common/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

export const Card = ({ children, onClick, className = '', hoverable = false }: CardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-github-surface border border-github-border rounded-md p-4 
        ${hoverable ? 'cursor-pointer hover:border-github-muted transition-colors' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};