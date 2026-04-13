// src/components/common/Button.tsx
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

export const Button = ({ variant = 'secondary', children, className = '', ...props }: ButtonProps) => {
  const baseStyles = "px-4 py-1.5 rounded-md font-medium text-sm transition-colors border";
  
  const variants = {
    primary: "bg-github-green hover:bg-github-greenHover text-white border-transparent",
    secondary: "bg-github-surface hover:bg-[#1f242c] text-github-text border-github-border",
    danger: "bg-transparent hover:bg-github-danger text-github-danger hover:text-white border-github-border hover:border-github-danger"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};