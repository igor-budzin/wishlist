import { toast } from 'sonner';
import { Share2 } from './icons';
import { Button } from './ui/button';

interface ShareProfileButtonProps {
  userId: string;
}

export function ShareProfileButton({ userId }: ShareProfileButtonProps) {
  const handleShare = async () => {
    try {
      const profileUrl = `${window.location.origin}/user/${userId}`;
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link. Please try again.');
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleShare} className="md:px-3">
      <Share2 className="h-4 w-4 md:mr-2" />
      <span className="hidden md:inline">Share Profile</span>
    </Button>
  );
}
