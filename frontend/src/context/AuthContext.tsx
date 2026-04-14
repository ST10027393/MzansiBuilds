import { createContext, useContext, useEffect, useState} from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This listener automatically fires when a user logs in, logs out, or returns to the site days later!
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-github-dark flex items-center justify-center text-github-text">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-github-green"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};