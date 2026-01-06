import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, BookPlus } from 'lucide-react';
import { z } from 'zod';

const bookSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  author: z.string().min(1, 'Author is required').max(100),
  publisher: z.string().min(1, 'Publisher is required').max(100),
  edition: z.string().min(1, 'Edition is required').max(50),
  total_copies: z.number().min(1, 'At least 1 copy required'),
  cover_url: z.string().url('Invalid URL').optional().or(z.literal('')),
});

const AddBook = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    publisher: '',
    edition: '',
    total_copies: 1,
    cover_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 1 : value,
    }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = bookSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from('books').insert({
        title: formData.title.trim(),
        author: formData.author.trim(),
        publisher: formData.publisher.trim(),
        edition: formData.edition.trim(),
        total_copies: formData.total_copies,
        available_copies: formData.total_copies,
        cover_url: formData.cover_url.trim() || null,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Book added successfully!',
      });

      setFormData({
        title: '',
        author: '',
        publisher: '',
        edition: '',
        total_copies: 1,
        cover_url: '',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add book',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout allowedRoles={['librarian']}>
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Add New Book</h1>
          <p className="text-muted-foreground mt-1">Add a new book to the library collection</p>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookPlus className="w-5 h-5 text-primary" />
              Book Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter book title"
                  value={formData.title}
                  onChange={handleChange}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Author *</Label>
                <Input
                  id="author"
                  name="author"
                  placeholder="Enter author name"
                  value={formData.author}
                  onChange={handleChange}
                  className={errors.author ? 'border-destructive' : ''}
                />
                {errors.author && <p className="text-sm text-destructive">{errors.author}</p>}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="publisher">Publisher *</Label>
                  <Input
                    id="publisher"
                    name="publisher"
                    placeholder="Enter publisher name"
                    value={formData.publisher}
                    onChange={handleChange}
                    className={errors.publisher ? 'border-destructive' : ''}
                  />
                  {errors.publisher && <p className="text-sm text-destructive">{errors.publisher}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edition">Edition *</Label>
                  <Input
                    id="edition"
                    name="edition"
                    placeholder="e.g., 3rd Edition"
                    value={formData.edition}
                    onChange={handleChange}
                    className={errors.edition ? 'border-destructive' : ''}
                  />
                  {errors.edition && <p className="text-sm text-destructive">{errors.edition}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_copies">Number of Copies *</Label>
                <Input
                  id="total_copies"
                  name="total_copies"
                  type="number"
                  min="1"
                  value={formData.total_copies}
                  onChange={handleChange}
                  className={errors.total_copies ? 'border-destructive' : ''}
                />
                {errors.total_copies && <p className="text-sm text-destructive">{errors.total_copies}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_url">Cover Image URL (optional)</Label>
                <Input
                  id="cover_url"
                  name="cover_url"
                  placeholder="https://example.com/cover.jpg"
                  value={formData.cover_url}
                  onChange={handleChange}
                  className={errors.cover_url ? 'border-destructive' : ''}
                />
                {errors.cover_url && <p className="text-sm text-destructive">{errors.cover_url}</p>}
              </div>

              <Button type="submit" size="lg" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Book
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AddBook;
