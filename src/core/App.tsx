import { useState, useEffect } from 'react';
import felineStoriesLogo from '../assets/feline-stories.webp';

import { supabase } from './lib/supabase';

type Story = unknown;

function App() {
  const [stories, setStories] = useState<Story[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStories = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.from('test_cats').select('*');

        if (error) throw error;
        setStories(data || []);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchStories();
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto p-8 flex flex-col items-center justify-center gap-4">
        <img className="h-[400px]" src={felineStoriesLogo} alt="logo" />
        <h1 className="text-felineGreen-dark text-[6rem] font-cursive text-gradient-animation">
          Kocie Opowieści
        </h1>

        <pre className="w-full overflow-auto">
          {JSON.stringify(
            {
              stories,
              error: error?.message,
              isLoading,
            },
            null,
            2
          )}
        </pre>
      </div>
    </>
  );
}

export default App;
