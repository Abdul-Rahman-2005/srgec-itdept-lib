import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Journal } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Edit2, Trash2, FileText, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ManageJournals = () => {
  const [journals, setJournals] = useState<Journal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editJournal, setEditJournal] = useState<Journal | null>(null);
  const [deleteJournal, setDeleteJournal] = useState<Journal | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newJournal, setNewJournal] = useState({
    title: '',
    publisher: '',
    issn: '',
    volume: '',
    issue: '',
    publication_year: new Date().getFullYear(),
    category: '',
    cover_url: '',
  });
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

  const handleAdd = async () => {
    if (!newJournal.title || !newJournal.publisher || !newJournal.issn || !newJournal.volume || !newJournal.issue || !newJournal.category) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setActionLoading(true);

    try {
      const { error } = await supabase.from('journals').insert({
        title: newJournal.title.trim(),
        publisher: newJournal.publisher.trim(),
        issn: newJournal.issn.trim(),
        volume: newJournal.volume.trim(),
        issue: newJournal.issue.trim(),
        publication_year: newJournal.publication_year,
        category: newJournal.category.trim(),
        cover_url: newJournal.cover_url.trim() || null,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Journal added successfully' });
      setAddDialogOpen(false);
      setNewJournal({ title: '', publisher: '', issn: '', volume: '', issue: '', publication_year: new Date().getFullYear(), category: '', cover_url: '' });
      fetchJournals(searchQuery);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add journal', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editJournal) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('journals')
        .update({
          title: editJournal.title,
          publisher: editJournal.publisher,
          issn: editJournal.issn,
          volume: editJournal.volume,
          issue: editJournal.issue,
          publication_year: editJournal.publication_year,
          category: editJournal.category,
          cover_url: editJournal.cover_url,
        })
        .eq('id', editJournal.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Journal updated successfully' });
      setEditJournal(null);
      fetchJournals(searchQuery);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update journal', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteJournal) return;
    setActionLoading(true);

    try {
      const { error } = await supabase.from('journals').delete().eq('id', deleteJournal.id);
      if (error) throw error;

      toast({ title: 'Success', description: 'Journal deleted successfully' });
      setDeleteJournal(null);
      fetchJournals(searchQuery);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete journal', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['librarian']}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Manage Journals</h1>
            <p className="text-muted-foreground mt-1">Add, edit, or delete academic journals</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Journal
          </Button>
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
              <p className="text-muted-foreground">Add some academic journals to the collection.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {journals.map((journal) => (
              <Card key={journal.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-28 rounded bg-secondary flex-shrink-0 overflow-hidden">
                      {journal.cover_url ? (
                        <img src={journal.cover_url} alt={journal.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FileText className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-lg truncate">{journal.title}</h3>
                      <p className="text-sm text-muted-foreground">by {journal.publisher}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="bg-secondary px-2 py-1 rounded">ISSN: {journal.issn}</span>
                        <span className="bg-secondary px-2 py-1 rounded">Vol. {journal.volume}, Issue {journal.issue}</span>
                        <span className="bg-secondary px-2 py-1 rounded">{journal.publication_year}</span>
                        <span className="bg-primary/10 text-primary px-2 py-1 rounded">{journal.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="icon" onClick={() => setEditJournal(journal)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setDeleteJournal(journal)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Add Dialog */}
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Journal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label>Journal Title *</Label>
                <Input value={newJournal.title} onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Publisher *</Label>
                <Input value={newJournal.publisher} onChange={(e) => setNewJournal({ ...newJournal, publisher: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>ISSN *</Label>
                <Input value={newJournal.issn} onChange={(e) => setNewJournal({ ...newJournal, issn: e.target.value })} placeholder="e.g., 1234-5678" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Volume *</Label>
                  <Input value={newJournal.volume} onChange={(e) => setNewJournal({ ...newJournal, volume: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Issue *</Label>
                  <Input value={newJournal.issue} onChange={(e) => setNewJournal({ ...newJournal, issue: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Year *</Label>
                  <Input type="number" value={newJournal.publication_year} onChange={(e) => setNewJournal({ ...newJournal, publication_year: parseInt(e.target.value) || new Date().getFullYear() })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category / Domain *</Label>
                <Input value={newJournal.category} onChange={(e) => setNewJournal({ ...newJournal, category: e.target.value })} placeholder="e.g., Computer Science, Medicine" />
              </div>
              <div className="space-y-2">
                <Label>Cover URL (optional)</Label>
                <Input value={newJournal.cover_url} onChange={(e) => setNewJournal({ ...newJournal, cover_url: e.target.value })} placeholder="https://example.com/cover.jpg" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Add Journal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editJournal} onOpenChange={() => setEditJournal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Journal</DialogTitle>
            </DialogHeader>
            {editJournal && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Journal Title</Label>
                  <Input value={editJournal.title} onChange={(e) => setEditJournal({ ...editJournal, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Publisher</Label>
                  <Input value={editJournal.publisher} onChange={(e) => setEditJournal({ ...editJournal, publisher: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>ISSN</Label>
                  <Input value={editJournal.issn} onChange={(e) => setEditJournal({ ...editJournal, issn: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Volume</Label>
                    <Input value={editJournal.volume} onChange={(e) => setEditJournal({ ...editJournal, volume: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Issue</Label>
                    <Input value={editJournal.issue} onChange={(e) => setEditJournal({ ...editJournal, issue: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input type="number" value={editJournal.publication_year} onChange={(e) => setEditJournal({ ...editJournal, publication_year: parseInt(e.target.value) || editJournal.publication_year })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={editJournal.category} onChange={(e) => setEditJournal({ ...editJournal, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Cover URL</Label>
                  <Input value={editJournal.cover_url || ''} onChange={(e) => setEditJournal({ ...editJournal, cover_url: e.target.value })} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditJournal(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deleteJournal} onOpenChange={() => setDeleteJournal(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Journal</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete "{deleteJournal?.title}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteJournal(null)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ManageJournals;