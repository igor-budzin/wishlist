import { ExternalLink, Pencil } from '../icons';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';

interface AddItemChoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChoiceSelect: (choice: 'manual' | 'link') => void;
}

export function AddItemChoiceDialog({
  open,
  onOpenChange,
  onChoiceSelect,
}: AddItemChoiceDialogProps) {
  const handleChoiceSelect = (choice: 'manual' | 'link') => {
    onChoiceSelect(choice);
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>How do you want to add an item?</AlertDialogTitle>
          <AlertDialogDescription>
            Choose how you&apos;d like to create your wishlist item
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="grid gap-3 py-4">
          {/* Manual Entry Button */}
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4"
            onClick={() => handleChoiceSelect('manual')}
          >
            <div className="flex items-center gap-2">
              <Pencil className="h-5 w-5" />
              <span className="font-semibold">Manual Entry</span>
            </div>
            <span className="text-sm text-muted-foreground">Enter item details manually</span>
          </Button>

          {/* From Link Button */}
          <Button
            variant="outline"
            className="h-auto flex-col items-start gap-2 p-4"
            onClick={() => handleChoiceSelect('link')}
          >
            <div className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              <span className="font-semibold">From Link</span>
            </div>
            <span className="text-sm text-muted-foreground">Import details from a URL</span>
          </Button>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
