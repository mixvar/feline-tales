import { useEffect, useState } from 'react';
import { AuthState } from '../types';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        setState((prev) => ({
          ...prev,
          session: data.session,
          error: error ?? null,
        }));
      })
      .finally(() => {
        setState((prev) => ({ ...prev, isLoading: false }));
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, session }));
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
};
