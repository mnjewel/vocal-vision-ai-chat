
import { createContext, useContext } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>; // Changed return type to Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  // Converting the return type to match our interface
  const authValue: AuthContextType = {
    user: auth.user,
    session: auth.session,
    loading: auth.loading,
    // Wrap the signOut function to match our expected return type
    signOut: async () => {
      await auth.signOut();
    }
  };
  
  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
