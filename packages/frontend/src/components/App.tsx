import { Outlet } from 'react-router-dom';
import { Toaster } from './ui/sonner';

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <Outlet />
    </div>
  );
}

export default App;
