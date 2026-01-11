import { useState, useEffect } from 'react';
import { Sparkles, Menu, X } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
  loginUrl: string;
}

export function Header({ loginUrl }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-sm shadow-sm'
          : 'bg-white/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none shadow-sm md:shadow-none'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#4F46E5] to-[#6366F1] rounded-lg flex items-center justify-center">
              <Sparkles className="size-5 text-white" />
            </div>
            <span
              className={`text-xl transition-colors ${
                isScrolled ? 'text-gray-900' : 'text-gray-900 md:text-white'
              }`}
            >
              Wish Master
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`transition-colors ${
                isScrolled ? 'text-gray-600 hover:text-[#4F46E5]' : 'text-white/90 hover:text-white'
              }`}
            >
              How it Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className={`transition-colors ${
                isScrolled ? 'text-gray-600 hover:text-[#4F46E5]' : 'text-white/90 hover:text-white'
              }`}
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('testimonials')}
              className={`transition-colors ${
                isScrolled ? 'text-gray-600 hover:text-[#4F46E5]' : 'text-white/90 hover:text-white'
              }`}
            >
              Testimonials
            </button>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a href={loginUrl}>
              <Button
                className={`rounded-full transition-colors ${
                  isScrolled
                    ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white'
                    : 'bg-white text-[#4F46E5] hover:bg-white/90'
                }`}
              >
                Log In
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
            {mobileMenuOpen ? (
              <X className="size-6 text-gray-900" />
            ) : (
              <Menu className="size-6 text-gray-900" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left text-gray-600 hover:text-[#4F46E5] transition-colors py-2"
              >
                How it Works
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="text-left text-gray-600 hover:text-[#4F46E5] transition-colors py-2"
              >
                Features
              </button>
              <button
                onClick={() => scrollToSection('testimonials')}
                className="text-left text-gray-600 hover:text-[#4F46E5] transition-colors py-2"
              >
                Testimonials
              </button>
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                <a href={loginUrl}>
                  <Button className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white">
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
