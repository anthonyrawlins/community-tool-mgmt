import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface MainLayoutProps {
  children: ReactNode;
  skipLinkTarget?: string;
}

export function MainLayout({ children, skipLinkTarget = "main-content" }: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Skip Link for Screen Readers */}
      <a
        href={`#${skipLinkTarget}`}
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>

      <Header />
      
      <main 
        id={skipLinkTarget}
        className="flex-1 focus:outline-none"
        tabIndex={-1}
      >
        {children}
      </main>
      
      <Footer />
    </div>
  );
}