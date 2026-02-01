import { createContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import type { User } from '@supabase/supabase-js';
import { ensureProfile } from '../services/profileService';


type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const SESSION_FLAG = 'app_session_active';

export { AuthContext };

const clearAllAuthData = async () => {
  console.log('Clearing all auth data...');
  // Sign out from Supabase
  await supabase.auth.signOut({ scope: 'local' });
  
  // Clear all localStorage keys related to Supabase
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('auth')) {
      localStorage.removeItem(key);
      console.log('Removed from localStorage:', key);
    }
  });
  
  // Clear sessionStorage
  sessionStorage.removeItem(SESSION_FLAG);
  
  console.log('All auth data cleared');
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log('Auth state changed:', _event, session?.user?.email);
        
        if (mounted) {
          const user = session?.user || null;
          setUser(user);

          // Set loading to false immediately - don't wait for ensureProfile
          setLoading(false);

          // Run ensureProfile in background if user exists
          if (user) {
            ensureProfile(user.id)
              .then(() => {
                console.log('Profile ensured for user:', user.id);
                if (mounted) sessionStorage.setItem(SESSION_FLAG, 'true');
              })
              .catch((error) => {
                console.error('Failed to ensure profile for user:', user.id, error);
              });
          } else {
            sessionStorage.removeItem(SESSION_FLAG);
          }
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Auto-logout when page is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('Page closing - clearing auth data');
      clearAllAuthData();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('unload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
