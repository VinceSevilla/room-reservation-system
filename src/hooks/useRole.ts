import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/useAuth';
import type { Role } from '../types/roles';

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        console.log('Fetching role for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) {
          // Don't log errors for aborted requests (normal when navigating)
          if (error.code !== 'PGRST301' && !error.message?.includes('aborted')) {
            console.error('Supabase error fetching role:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            });
          }
          setRole('student' as Role); // Default to student on error
        } else {
          console.log('Successfully fetched role:', data?.role);
          setRole((data?.role as Role) ?? 'student'); // Default to student if no role
        }
      } catch (networkError) {
        // Handle network errors separately
        console.error('Network error fetching role:', networkError);
        setRole('student' as Role); // Default to student on network error
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { role, loading };
}
