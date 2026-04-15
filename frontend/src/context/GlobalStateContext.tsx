// FILE: frontend/src/context/GlobalStateContext.tsx
import type { ReactNode } from 'react';
import { createContext, useContext, useState} from 'react';

// Define what a real notification from your database will look like
export interface AppNotification {
  id: string;
  message: string;
  type: 'collab' | 'friend' | 'system';
  isRead: boolean;
}

interface GlobalState {
  notifications: AppNotification[];
  setNotifications: (notifs: AppNotification[]) => void;
  unreadCount: number; // Derived dynamically
  isChatOpen: boolean;
  toggleChat: () => void;
  feedFilter: 'all' | 'friends' | 'completed';
  setFeedFilter: (filter: 'all' | 'friends' | 'completed') => void;
}

export const GlobalStateContext = createContext<GlobalState | undefined>(undefined);

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) throw new Error("useGlobalState must be used within a GlobalStateProvider");
  return context;
};

export const GlobalStateProvider = ({ children }: { children: ReactNode }) => {
  // 1. Initialize as empty! No hardcoded values.
  const [notifications, setNotifications] = useState<AppNotification[]>([]); 
  const [isChatOpen, setIsChatOpen] = useState(false); // Default to closed
  const [feedFilter, setFeedFilter] = useState<'all' | 'friends' | 'completed'>('all');

  // Dynamically calculate unread count based on the array
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <GlobalStateContext.Provider value={{
      notifications, setNotifications, unreadCount,
      isChatOpen, toggleChat,
      feedFilter, setFeedFilter
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};