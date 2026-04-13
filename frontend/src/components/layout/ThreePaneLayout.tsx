import type { ReactNode } from 'react';

interface LayoutProps {
  left?: ReactNode;
  middle: ReactNode;
  right?: ReactNode;
  hideLeft?: boolean;
  hideRight?: boolean;
}

export const ThreePaneLayout = ({ 
  left, 
  middle, 
  right, 
  hideLeft = false, 
  hideRight = false 
}: LayoutProps) => {
  return (
    // GitHub typically caps the max width and centers the content
    <div className="max-w-[1280px] mx-auto pt-8 px-4 sm:px-6 md:px-8 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* LEFT PANE: Profile Info / Project Previews */}
        {!hideLeft && (
          <aside className="hidden md:block col-span-3">
            {left}
          </aside>
        )}

        {/* MIDDLE PANE: The Main Stage (Live Feed / Details / Forms) */}
        <main className={`col-span-12 ${hideLeft && hideRight ? 'md:col-span-12' : 'md:col-span-6'} min-h-screen`}>
          {middle}
        </main>

        {/* RIGHT PANE: Chat / Collaborators / Friend Requests */}
        {!hideRight && (
          <aside className="hidden md:block col-span-3">
            {right}
          </aside>
        )}

      </div>
    </div>
  );
};