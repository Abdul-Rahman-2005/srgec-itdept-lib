import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Journal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, FileText } from 'lucide-react';

interface ViewJournalsProps {
  allowedRoles: ('student' | 'faculty' | 'librarian')[];
}

const ViewJournals = ({ allowedRoles }: ViewJournalsProps) => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchJournals = async (query?: string) => {
    setLoading(true);
    try {
      let queryBuilder = supabase.from('journals').select('*');
      
      if (query && query.trim()) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,publisher.ilike.%${query}%,category.ilike.%${query}%,issn.ilike.%${query}%`
        );
      }
      
      const { data, error } = await queryBuilder.order('publication_year', { ascending: false });
      
      if (error) throw error;
      setJournals((data as Journal[]) || []);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch journals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJournals();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchJournals(searchQuery);
  };

  return (
    <DashboardLayout allowedRoles={allowedRoles}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Journals</h1>
          <p className="text-muted-foreground mt-1">Browse academic journals</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
          <Input
            type="text"
            placeholder="Search journals by title, publisher, ISSN, or category..."
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
        ) : journals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h2 className="font-serif text-xl font-semibold mb-2">No Journals Found</h2>
              <p className="text-muted-foreground">No academic journals available at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {journals.map((journal) => (
              <Card key={journal.id} className="border-border card-hover">
                <CardContent className="p-4">
                  <div className="w-full h-40 rounded bg-secondary mb-4 overflow-hidden">
                    {journal.cover_url ? (
                      <img src={journal.cover_url} alt={journal.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-serif font-semibold text-lg truncate">{journal.title}</h3>
                  <p className="text-sm text-muted-foreground">{journal.publisher}</p>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    <span className="bg-secondary px-2 py-1 rounded">ISSN: {journal.issn}</span>
                    <span className="bg-secondary px-2 py-1 rounded">Vol. {journal.volume}</span>
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded">{journal.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Issue {journal.issue} • {journal.publication_year}
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

export default ViewJournals;