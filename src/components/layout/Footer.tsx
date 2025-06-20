import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Ballarat Tool Library</h3>
            <p className="text-muted-foreground leading-relaxed">
              Sharing tools, building community. Access hundreds of tools with your annual membership.
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Basic Membership:</strong> $55/year
              </p>
              <p className="text-sm">
                <strong>Premium Membership:</strong> $70/year
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav aria-label="Footer navigation" className="space-y-2">
              <Link 
                href="/catalog" 
                className="block text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                Browse Tools
              </Link>
              <Link 
                href="/member" 
                className="block text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                Member Portal
              </Link>
              <Link 
                href="/register" 
                className="block text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                Join Now
              </Link>
              <Link 
                href="/how-it-works" 
                className="block text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                How It Works
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Support</h4>
            <nav aria-label="Support links" className="space-y-2">
              <Link 
                href="/contact" 
                className="block text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                Contact Us
              </Link>
              <Link 
                href="/faq" 
                className="block text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                Frequently Asked Questions
              </Link>
              <Link 
                href="/help" 
                className="block text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                Help Center
              </Link>
              <Link 
                href="/accessibility" 
                className="block text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
              >
                Accessibility
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold">Contact Information</h4>
            <address className="not-italic space-y-2 text-muted-foreground">
              <p>
                <strong>Phone:</strong>{" "}
                <a 
                  href="tel:+61353311234" 
                  className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                >
                  (03) 5331 1234
                </a>
              </p>
              <p>
                <strong>Email:</strong>{" "}
                <a 
                  href="mailto:info@ballarattoollibrary.org.au" 
                  className="hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
                >
                  info@ballarattoollibrary.org.au
                </a>
              </p>
              <p>
                <strong>Address:</strong><br />
                123 Main Street<br />
                Ballarat VIC 3350<br />
                Australia
              </p>
              <p className="text-sm mt-4">
                <strong>Hours:</strong><br />
                Monday - Friday: 9:00 AM - 5:00 PM<br />
                Saturday: 9:00 AM - 2:00 PM<br />
                Sunday: Closed
              </p>
            </address>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {currentYear} Ballarat Tool Library. All rights reserved.
          </p>
          <nav aria-label="Legal links" className="flex flex-wrap justify-center md:justify-end space-x-6">
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              Terms of Service
            </Link>
            <Link 
              href="/safety" 
              className="text-sm text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm"
            >
              Safety Guidelines
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}