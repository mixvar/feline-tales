import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

export const LoginPage = () => {
  return (
    <div className="max-w-md w-full mx-auto p-8 bg-felineGreen-dark rounded-lg shadow-lg">
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google']}
        view="magic_link"
        magicLink
      />
    </div>
  );
};
