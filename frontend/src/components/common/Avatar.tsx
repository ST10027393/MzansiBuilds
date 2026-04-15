// FILE: frontend/src/components/common/Avatar.tsx
// src/components/common/Avatar.tsx

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar = ({ src, alt = "User avatar", size = 'md' }: AvatarProps) => {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-16 w-16"
  };

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden bg-github-border border border-github-muted flex-shrink-0`}>
      {src ? (
        <img src={src} alt={alt} className="h-full w-full object-cover" />
      ) : (
        // A generic placeholder if no image is provided
        <svg className="h-full w-full text-github-muted" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )}
    </div>
  );
};