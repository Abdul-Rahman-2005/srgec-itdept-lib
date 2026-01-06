import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Magazine } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Newspaper } from 'lucide-react';

interface ViewMagazinesProps {
  allowedRoles: ('student' | 'faculty' | 'librarian')[];
}

const ViewMagazines = ({ allowedRoles }: ViewMagazinesProps) => {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchMagazines = async (query?: string) => {
    setLoading(true);
    try {
      let queryBuilder = supabase.from('magazines').select('*');
      
      if (query && query.trim()) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,publisher.ilike.%${query}%,category.ilike.%${query}%`
        );
      }
      
      const { data, error } = await queryBuilder.order('publication_date', { ascending: false });
      
      if (error) throw error;
      setMagazines((data as Magazine[]) || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch magazines',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMagazines();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMagazines(searchQuery);
  };

  return (
    <DashboardLayout allowedRoles={allowedRoles}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Magazines</h1>
          <p className="text-muted-foreground mt-1">Browse available magazines</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
          <Input
            type="text"
            placeholder="Search magazines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button type="submit">
            <Search className="w-4 h-4" />
          </Button>
        </form>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : magazines.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Newspaper className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="font-serif text-xl font-semibold mb-2">No Magazines Found</h2>
              <p className="text-muted-foreground">No magazines available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {magazines.map((magazine) => (
              <Card key={magazine.id} className="border-border card-hover">
                <CardContent className="p-4">
                  <div className="w-full h-40 rounded bg-secondary mb-4 overflow-hidden">
                    {magazine.cover_url ? (
                      <img src={magazine.cover_url} alt={magazine.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Newspaper className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif font-semibold text-lg truncate">{magazine.title}</h3>
                  <p className="text-sm text-muted-foreground">{magazine.publisher}</p>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    <span className="bg-secondary px-2 py-1 rounded">Issue #{magazine.issue_number}</span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">{magazine.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Published: {new Date(magazine.publication_date).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewMagazines;