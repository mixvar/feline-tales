import { Session } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string | undefined;
}

export interface AuthState {
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
}
