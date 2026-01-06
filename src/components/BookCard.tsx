import { Book } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onClick?: () => void;
}

export function BookCard({ book, onClick }: BookCardProps) {
  const isAvailable = book.available_copies > 0;

  return (
    <Card 
      className="group cursor-pointer card-hover overflow-hidden border-0 shadow-md bg-card"
      onClick={onClick}
    >
      <div className="aspect-[3/4] relative overflow-hidden bg-secondary">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <BookOpen className="w-16 h-16 text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge 
            variant={isAvailable ? "default" : "destructive"}
            className={isAvailable ? "bg-emerald-500 hover:bg-emerald-600" : ""}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </Badge>
        </div>
      </div>
      <CardContent className="p-4 space-y-2">
        <h3 className="font-serif font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-1">
          by {book.author}
        </p>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span className="bg-secondary px-2 py-1 rounded">{book.publisher}</span>
          <span className="bg-secondary px-2 py-1 rounded">{book.edition}</span>
        </div>
        <div className="pt-2 border-t border-border">
          <p className="text-sm font-medium">
            <span className={isAvailable ? "text-emerald-600" : "text-destructive"}>
              {book.available_copies}
            </span>
            <span className="text-muted-foreground"> of {book.total_copies} copies available</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
