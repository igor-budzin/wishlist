import type { WishlistItem } from '@wishlist/shared';
import { formatDate } from '@wishlist/shared';

import { ExternalLink, Calendar, Pencil, Trash2 } from '../icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface WishlistItemCardProps {
  item: WishlistItem;
  onEdit?: () => void;
  onDelete?: () => void;
}

function getPriorityVariant(priority: string) {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'warning';
    case 'low':
      return 'success';
    default:
      return 'default';
  }
}

export function WishlistItemCard({ item, onEdit, onDelete }: WishlistItemCardProps) {
  return (
    <Card className="flex flex-col transition-all hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight line-clamp-2">{item.title}</CardTitle>
          <Badge variant={getPriorityVariant(item.priority)}>{item.priority}</Badge>
        </div>
        {item.description && (
          <CardDescription className="line-clamp-3">{item.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-end space-y-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          {formatDate(new Date(item.createdAt))}
        </div>

        <div className="flex gap-2">
          {item.url && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => window.open(item.url, '_blank')}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Link
            </Button>
          )}
          {!item.url && <div className="flex-1" />}

          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          )}

          {onDelete && (
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
