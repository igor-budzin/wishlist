import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { wishlistItemSchema, type WishlistItemFormData } from '../../lib/validations';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ItemFormProps {
  defaultValues?: Partial<WishlistItemFormData>;
  onSubmit: (data: WishlistItemFormData) => Promise<boolean>;
  submitLabel: string;
  isSubmitting?: boolean;
}

export function ItemForm({ defaultValues, onSubmit, submitLabel, isSubmitting }: ItemFormProps) {
  const form = useForm<WishlistItemFormData>({
    resolver: zodResolver(wishlistItemSchema),
    defaultValues: {
      title: defaultValues?.title || '',
      description: defaultValues?.description || '',
      url: defaultValues?.url || '',
      priority: defaultValues?.priority || 'medium',
    },
  });

  const handleSubmit = async (data: WishlistItemFormData) => {
    const success = await onSubmit(data);
    if (success) {
      form.reset();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter item title..." {...field} />
              </FormControl>
              <FormDescription>Give your wishlist item a descriptive title</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add more details about this item..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>Provide additional details or notes about this item</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL (optional)</FormLabel>
              <FormControl>
                <Input type="url" placeholder="https://example.com/product" {...field} />
              </FormControl>
              <FormDescription>Link to where this item can be found</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>How important is this item to you?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isSubmitting || form.formState.isSubmitting}>
            {isSubmitting || form.formState.isSubmitting ? 'Saving...' : submitLabel}
          </Button>
        </div>
      </form>
    </Form>
  );
}
