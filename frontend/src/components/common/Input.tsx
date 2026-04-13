// src/components/common/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className = '', ...props }: InputProps) => {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {label && <label className="mb-1 text-sm font-semibold text-github-text">{label}</label>}
      <input 
        className="
          bg-github-dark border border-github-border rounded-md px-3 py-1.5 
          text-github-text text-sm focus:outline-none focus:border-github-muted 
          focus:ring-1 focus:ring-github-muted transition-all placeholder-github-muted
        "
        {...props}
      />
    </div>
  );
};