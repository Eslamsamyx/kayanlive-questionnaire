'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../../styles/navbar-animations.css';
import Button from './Button';

const imgKayanLogoOpenFile31 = "/823c27de600ccd2f92af3e073c8e10df3a192e5c.png";

interface NavItem {
  name: string;
  href: string;
  path: string;
}

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileMenuHasScroll, setMobileMenuHasScroll] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const pathname = usePathname();

  // Refs for click outside detection and scroll detection
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuScrollRef = useRef<HTMLDivElement>(null);

  const navItems: NavItem[] = [];

  const isActive = useCallback((path: string) => {
    if (path === '/') {
      return pathname === '/' || pathname === '';
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  }, [pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      // Delay adding the event listener to prevent immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMobileMenuOpen]);

  // Enhanced keyboard navigation with focus management
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          // Return focus to burger menu button
          const burgerButton = document.querySelector('[aria-controls="mobile-menu"]') as HTMLElement;
          burgerButton?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Body scroll lock for mobile menu and scroll detection
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';

      // Check if mobile menu content is scrollable
      const checkScrollable = () => {
        if (mobileMenuScrollRef.current) {
          const { scrollHeight, clientHeight } = mobileMenuScrollRef.current;
          setMobileMenuHasScroll(scrollHeight > clientHeight);
        }
      };

      // Debounced resize handler
      let resizeTimeout: NodeJS.Timeout;
      const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(checkScrollable, 150);
      };

      // Check initially and on resize
      setTimeout(checkScrollable, 100); // Small delay for DOM to settle
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      };
    } else {
      document.body.style.overflow = '';
      setMobileMenuHasScroll(false);
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <nav
      className="bg-[#2c2c2b] rounded-[61px] mx-1 sm:mx-4 px-2 sm:px-6 md:px-8 lg:px-12 py-3 md:py-6 relative"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Main navbar grid layout - Fixed logo width, right-aligned actions */}
      <div className="grid grid-cols-[auto_1fr_auto] gap-1 sm:gap-2 md:gap-3 lg:gap-4 items-center min-h-[44px] w-full min-w-0">

        {/* Logo - Fixed width, left-aligned */}
        <Link
          href="/"
          className="relative flex items-center justify-start focus:outline-none focus:ring-2 focus:ring-[#7afdd6] focus:ring-opacity-50 rounded-lg p-1 transition-all duration-200 flex-shrink-0 hover-lift gpu-accelerated"
          aria-label="Go to homepage"
        >
          <div className="relative w-20 sm:w-24 md:w-32 lg:w-36 h-8 sm:h-9 md:h-10 lg:h-12 flex-shrink-0">
            {imageLoadError ? (
              <div className="w-full h-full flex items-center justify-center bg-[#7afdd6]/10 rounded-lg">
                <span className="text-[#7afdd6] font-bold text-sm sm:text-base md:text-lg lg:text-xl">KAYAN</span>
              </div>
            ) : (
              <Image
                src={imgKayanLogoOpenFile31}
                alt="Kayan Live Logo"
                fill
                className="object-contain"
                priority
                onError={() => setImageLoadError(true)}
                onLoad={() => setImageLoadError(false)}
              />
            )}
          </div>
        </Link>

        {/* Center space - Empty for simplified navbar */}
        <div className="flex-1 min-w-0"></div>

        {/* Right side actions - Always right-aligned */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0 justify-self-end">

          {/* Contact CTA Button - Always visible */}
          <div className="flex">
            <Button
              href="https://kayanlive.com/contact/"
              variant="default"
              size="md"
              arrowIcon={true}
            >
              Contact
            </Button>
          </div>

        </div>
      </div>

    </nav>
  );
}