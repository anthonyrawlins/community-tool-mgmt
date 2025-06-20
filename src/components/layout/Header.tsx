"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="text-2xl font-bold text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              <span className="sr-only">Ballarat Tool Library - </span>
              Home
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" aria-label="Main navigation">
            <Link 
              href="/catalog" 
              className="text-lg text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-2 py-1"
            >
              Tool Catalog
            </Link>
            <Link 
              href="/member" 
              className="text-lg text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-2 py-1"
            >
              Member Portal
            </Link>
            <Link 
              href="/about" 
              className="text-lg text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-2 py-1"
            >
              About
            </Link>
            <Link 
              href="/contact" 
              className="text-lg text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-2 py-1"
            >
              Contact
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="/register">Join Now</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="outline"
            size="lg"
            className="md:hidden"
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav 
            id="mobile-menu"
            className="md:hidden mt-4 py-4 border-t border-border"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col space-y-4">
              <Link 
                href="/catalog" 
                className="text-lg text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Tool Catalog
              </Link>
              <Link 
                href="/member" 
                className="text-lg text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Member Portal
              </Link>
              <Link 
                href="/about" 
                className="text-lg text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="text-lg text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm px-2 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <div className="flex flex-col space-y-3 pt-4">
                <Button variant="outline" size="lg" asChild>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button size="lg" asChild>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    Join Now
                  </Link>
                </Button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}