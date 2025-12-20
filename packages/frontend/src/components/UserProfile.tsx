import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function UserProfile() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      to="/profile"
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label="View profile"
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.avatar || undefined} alt={user.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
