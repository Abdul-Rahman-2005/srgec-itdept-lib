import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Magazine } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, Edit2, Trash2, Newspaper, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ManageMagazines = () => {
  const [magazines, setMagazines] = useState<Magazine[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editMagazine, setEditMagazine] = useState<Magazine | null>(null);
  const [deleteMagazine, setDeleteMagazine] = useState<Magazine | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [newMagazine, setNewMagazine] = useState({
    title: '',
    publisher: '',
    issue_number: '',
    publication_date: '',
    category: '',
    cover_url: '',
  });
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

  const handleAdd = async () => {
    if (!newMagazine.title || !newMagazine.publisher || !newMagazine.issue_number || !newMagazine.publication_date || !newMagazine.category) {
      toast({ title: 'Error', description: 'Please fill all required fields', variant: 'destructive' });
      return;
    }
    setActionLoading(true);

    try {
      const { error } = await supabase.from('magazines').insert({
        title: newMagazine.title.trim(),
        publisher: newMagazine.publisher.trim(),
        issue_number: newMagazine.issue_number.trim(),
        publication_date: newMagazine.publication_date,
        category: newMagazine.category.trim(),
        cover_url: newMagazine.cover_url.trim() || null,
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Magazine added successfully' });
      setAddDialogOpen(false);
      setNewMagazine({ title: '', publisher: '', issue_number: '', publication_date: '', category: '', cover_url: '' });
      fetchMagazines(searchQuery);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add magazine', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editMagazine) return;
    setActionLoading(true);

    try {
      const { error } = await supabase
        .from('magazines')
        .update({
          title: editMagazine.title,
          publisher: editMagazine.publisher,
          issue_number: editMagazine.issue_number,
          publication_date: editMagazine.publication_date,
          category: editMagazine.category,
          cover_url: editMagazine.cover_url,
        })
        .eq('id', editMagazine.id);

      if (error) throw error;

      toast({ title: 'Success', description: 'Magazine updated successfully' });
      setEditMagazine(null);
      fetchMagazines(searchQuery);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update magazine', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteMagazine) return;
    setActionLoading(true);

    try {
      const { error } = await supabase.from('magazines').delete().eq('id', deleteMagazine.id);
      if (error) throw error;

      toast({ title: 'Success', description: 'Magazine deleted successfully' });
      setDeleteMagazine(null);
      fetchMagazines(searchQuery);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete magazine', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['librarian']}>
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground">Manage Magazines</h1>
            <p className="text-muted-foreground mt-1">Add, edit, or delete magazines from the collection</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Magazine
          </Button>
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
              <p className="text-muted-foreground">Add some magazines to the collection.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {magazines.map((magazine) => (
              <Card key={magazine.id} className="border-border">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-28 rounded bg-secondary flex-shrink-0 overflow-hidden">
                      {magazine.cover_url ? (
                        <img src={magazine.cover_url} alt={magazine.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif font-semibold text-lg truncate">{magazine.title}</h3>
                      <p className="text-sm text-muted-foreground">by {magazine.publisher}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs">
                        <span className="bg-secondary px-2 py-1 rounded">Issue #{magazine.issue_number}</span>
                        <span className="bg-secondary px-2 py-1 rounded">{magazine.category}</span>
                        <span className="bg-secondary px-2 py-1 rounded">
                          {new Date(magazine.publication_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="icon" onClick={() => setEditMagazine(magazine)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => setDeleteMagazine(magazine)}
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
              <DialogTitle>Add Magazine</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title *</Label>
                <Input value={newMagazine.title} onChange={(e) => setNewMagazine({ ...newMagazine, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Publisher *</Label>
                <Input value={newMagazine.publisher} onChange={(e) => setNewMagazine({ ...newMagazine, publisher: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Issue Number *</Label>
                  <Input value={newMagazine.issue_number} onChange={(e) => setNewMagazine({ ...newMagazine, issue_number: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Publication Date *</Label>
                  <Input type="date" value={newMagazine.publication_date} onChange={(e) => setNewMagazine({ ...newMagazine, publication_date: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Input value={newMagazine.category} onChange={(e) => setNewMagazine({ ...newMagazine, category: e.target.value })} placeholder="e.g., Technology, Science, Business" />
              </div>
              <div className="space-y-2">
                <Label>Cover URL (optional)</Label>
                <Input value={newMagazine.cover_url} onChange={(e) => setNewMagazine({ ...newMagazine, cover_url: e.target.value })} placeholder="https://example.com/cover.jpg" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Add Magazine
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={!!editMagazine} onOpenChange={() => setEditMagazine(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Magazine</DialogTitle>
            </DialogHeader>
            {editMagazine && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editMagazine.title} onChange={(e) => setEditMagazine({ ...editMagazine, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Publisher</Label>
                  <Input value={editMagazine.publisher} onChange={(e) => setEditMagazine({ ...editMagazine, publisher: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issue Number</Label>
                    <Input value={editMagazine.issue_number} onChange={(e) => setEditMagazine({ ...editMagazine, issue_number: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Publication Date</Label>
                    <Input type="date" value={editMagazine.publication_date} onChange={(e) => setEditMagazine({ ...editMagazine, publication_date: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input value={editMagazine.category} onChange={(e) => setEditMagazine({ ...editMagazine, category: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Cover URL</Label>
                  <Input value={editMagazine.cover_url || ''} onChange={(e) => setEditMagazine({ ...editMagazine, cover_url: e.target.value })} />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditMagazine(null)}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={actionLoading}>
                {actionLoading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={!!deleteMagazine} onOpenChange={() => setDeleteMagazine(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Magazine</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground">
              Are you sure you want to delete "{deleteMagazine?.title}"? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteMagazine(null)}>Cancel</Button>
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

export default ManageMagazines;