import { useEffect, useState } from 'react';
import { TestCat } from '../types';
import { supabase } from '../lib/supabase';

export const useCatsQuery = () => {
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
