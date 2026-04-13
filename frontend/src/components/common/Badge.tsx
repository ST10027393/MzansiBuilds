// src/components/common/Badge.tsx
import React from 'react';

interface BadgeProps {
  text: string;
  color?: 'green' | 'muted' | 'danger';
}

export const Badge = ({ text, color = 'muted' }: BadgeProps) => {
  const colors = {
    green: "border-github-green text-github-green",
    muted: "border-github-border text-github-muted",
    danger: "border-github-danger text-github-danger",
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium border rounded-full ${colors[color]}`}>
      {text}
    </span>
  );
};