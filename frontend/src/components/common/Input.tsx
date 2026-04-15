// FILE: frontend/src/components/common/Input.tsx
import { useId } from 'react';
import type { InputHTMLAttributes } from 'react';
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className = '', id, ...props }: InputProps) => {
  // Automatically generate a unique ID if one isn't explicitly provided
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className={`flex flex-col w-full ${className}`}>
      {/* Addedthe 'htmlFor' attribute to link the label to the input below */}
      {label && (
        <label htmlFor={inputId} className="mb-1 text-sm font-semibold text-github-text">
          {label}
        </label>
      )}
      <input 
        id={inputId} // assigned the unique ID here
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