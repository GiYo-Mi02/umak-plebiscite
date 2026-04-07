import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export type College = {
  id: number;
  name: string;
};

export function useColleges() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const { data, error } = await supabase
          .from('colleges')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching colleges:', error);
          return;
        }

        setColleges((data as College[]) ?? []);
      } catch (err) {
        console.error('Error fetching colleges:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchColleges();
  }, []);

  return { colleges, loading };
}
