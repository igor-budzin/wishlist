import { useState, useEffect } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';
import { Button } from './Button';

interface NavLink {
  label: string;
  sectionId: string;
}

interface HeaderProps {
  loginUrl: string;
  navLinks?: NavLink[];
  variant?: 'transparent' | 'solid';
}

const defaultNavLinks: NavLink[] = [
  { label: 'How it Works', sectionId: 'how-it-works' },
  { label: 'Features', sectionId: 'features' },
  { label: 'See In Action', sectionId: 'see-in-action' },
];

export function Header({ loginUrl, navLinks, variant = 'transparent' }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const links = navLinks ?? defaultNavLinks;
  const hasNavLinks = links.length > 0;
  const isSolid = variant === 'solid';

  useEffect(() => {
    if (isSolid) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSolid]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const showSolidBg = isSolid || isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        showSolidBg
          ? 'bg-[#4F46E5] shadow-sm'
          : 'bg-white/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none shadow-sm md:shadow-none'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                showSolidBg
                  ? 'bg-white/20'
                  : 'bg-gradient-to-br from-[#4F46E5] to-[#6366F1]'
              }`}
            >
              <Sparkles className="size-5 text-white" />
            </div>
            <span
              className={`text-xl transition-colors ${
                showSolidBg ? 'text-white' : 'text-gray-900 md:text-white'
              }`}
            >
              Wish Master
            </span>
          </a>

          {/* Desktop Navigation */}
          {hasNavLinks && (
            <nav className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <button
                  key={link.sectionId}
                  onClick={() => scrollToSection(link.sectionId)}
                  className={`cursor-pointer transition-colors ${
                    showSolidBg ? 'text-white/90 hover:text-white' : 'text-white/90 hover:text-white'
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </nav>
          )}

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a href={loginUrl}>
              <Button
                className={`rounded-full transition-colors ${
                  showSolidBg
                    ? 'bg-white text-[#4F46E5] hover:bg-white/90'
                    : 'bg-white text-[#4F46E5] hover:bg-white/90'
                }`}
              >
                Log In
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          {hasNavLinks ? (
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? (
                <X className={`size-6 ${showSolidBg ? 'text-white' : 'text-gray-900'}`} />
              ) : (
                <Menu className={`size-6 ${showSolidBg ? 'text-white' : 'text-gray-900'}`} />
              )}
            </button>
          ) : (
            <a href={loginUrl} className="md:hidden">
              <Button className="bg-white text-[#4F46E5] hover:bg-white/90 rounded-full">
                Log In
              </Button>
            </a>
          )}
        </div>

        {/* Mobile Navigation */}
        {hasNavLinks && mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t ${showSolidBg ? 'border-white/20' : 'border-gray-200'}`}>
            <nav className="flex flex-col gap-4">
              {links.map((link) => (
                <button
                  key={link.sectionId}
                  onClick={() => scrollToSection(link.sectionId)}
                  className={`text-left cursor-pointer transition-colors py-2 ${
                    showSolidBg ? 'text-white/90 hover:text-white' : 'text-gray-600 hover:text-[#4F46E5]'
                  }`}
                >
                  {link.label}
                </button>
              ))}
              <div className={`flex flex-col gap-2 pt-4 border-t ${showSolidBg ? 'border-white/20' : 'border-gray-200'}`}>
                <a href={loginUrl}>
                  <Button
                    className={`w-full ${
                      showSolidBg
                        ? 'bg-white text-[#4F46E5] hover:bg-white/90'
                        : 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                    }`}
                  >
                    Log In
                  </Button>
                </a>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
