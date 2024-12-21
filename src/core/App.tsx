import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { Session } from '@supabase/supabase-js';
import md5 from 'md5';
import { useEffect, useRef, useState } from 'react';
import felineStoriesLogo from '../assets/feline-stories.webp';
import { supabase } from './lib/supabase';

export const App = () => {
  const auth = useAuth();

  if (!auth.session) {
    return <LoginPage />;
  }

  return (
    <HomePage
      user={{
        id: auth.session.user.id,
        email: auth.session.user.email,
      }}
    />
  );
};

const LoginPage = () => {
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

interface User {
  id: string;
  email: string | undefined;
}

const UserWidget = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // Generate gravatar URL from email
  const gravatarUrl = user.email
    ? `https://www.gravatar.com/avatar/${md5(user.email.toLowerCase().trim())}?d=identicon`
    : 'https://www.gravatar.com/avatar/?d=mp';

  return (
    <div className="fixed top-4 right-4" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full overflow-hidden border-2 border-felineGreen-dark hover:border-felineGreen-light transition-colors"
      >
        <img src={gravatarUrl} alt="User avatar" className="w-full h-full object-cover" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 border border-gray-200">
          <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 truncate">
            {user.email}
          </div>
          <button
            onClick={() => void handleSignOut()}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Wyloguj
          </button>
        </div>
      )}
    </div>
  );
};

const HomePage = ({ user }: { user: User }) => {
  const cats = useCatsQuery();

  return (
    <div className="relative">
      <UserWidget user={user} />
      <div className="max-w-7xl mx-auto p-8 flex flex-col items-center justify-center gap-4">
        <img className="h-[400px]" src={felineStoriesLogo} alt="logo" />
        <h1 className="text-felineGreen-dark text-[6rem] font-cursive text-gradient-animation">
          Kocie Opowieści
        </h1>

        <pre className="w-full overflow-auto">{JSON.stringify({ user, cats }, null, 2)}</pre>
      </div>
    </div>
  );
};

const useAuth = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          setError(error);
        } else {
          setSession(data.session);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session, isLoading, error };
};

type TestCat = unknown;
const useCatsQuery = () => {
  const [testCats, setTestCats] = useState<TestCat[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchTestCats = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('test_cats').select('*');

        if (error) throw error;
        setTestCats((data as TestCat[]) || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTestCats();
  }, []);

  return { data: testCats, error, isLoading };
};
