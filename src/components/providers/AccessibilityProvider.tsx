"use client";

import React, { ReactNode, useEffect } from "react";
import ReactDOM from "react-dom";

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  useEffect(() => {
    // Initialize axe-core in development mode
    if (process.env.NODE_ENV === "development") {
      import("@axe-core/react").then((axe) => {
        axe.default(React, ReactDOM, 1000);
      });
    }

    // Set up focus management for skip links
    const handleSkipLinkClick = (event: Event) => {
      const target = event.target as HTMLAnchorElement;
      const href = target.getAttribute("href");
      
      if (href && href.startsWith("#")) {
        const targetElement = document.getElementById(href.substring(1));
        if (targetElement) {
          // Small delay to ensure the element is focusable
          setTimeout(() => {
            targetElement.focus();
          }, 100);
        }
      }
    };

    // Listen for skip link clicks
    document.addEventListener("click", handleSkipLinkClick);

    // Announce page changes to screen readers
    const announcePageChange = () => {
      const title = document.title;
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "polite");
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";
      announcement.textContent = `Page loaded: ${title}`;
      
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        if (document.body.contains(announcement)) {
          document.body.removeChild(announcement);
        }
      }, 1000);
    };

    // Announce initial page load
    announcePageChange();

    // Clean up event listeners
    return () => {
      document.removeEventListener("click", handleSkipLinkClick);
    };
  }, []);

  return <>{children}</>;
}

// Make React available globally for axe-core
if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).React = React;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ReactDOM = ReactDOM;
}