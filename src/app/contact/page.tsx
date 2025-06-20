import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const metadata = {
  title: "Contact Us",
  description: "Get in touch with Ballarat Tool Library. Find our location, operating hours, and contact information for all your tool lending needs.",
};

export default function ContactPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Contact Us
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Get in touch with Ballarat Tool Library for memberships, tool inquiries, 
              or general questions about our community services.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              
              {/* Contact Details */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    We&apos;re here to help with any questions about membership, tool availability, 
                    or how our tool library works. Visit us during operating hours or reach out online.
                  </p>
                </div>

                {/* Location */}
                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Visit Our Location</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        25-39 Barkly Street<br />
                        Ballarat East VIC 3350<br />
                        Australia
                      </p>
                      <Button variant="outline" className="mt-4" asChild>
                        <a 
                          href="https://maps.google.com/?q=25-39+Barkly+Street,+Ballarat+East+VIC+3350"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get Directions
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Operating Hours</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-border">
                          <span className="font-medium">Tuesday</span>
                          <span className="text-muted-foreground">4:00 PM - 6:00 PM</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-border">
                          <span className="font-medium">Saturday</span>
                          <span className="text-muted-foreground">10:00 AM - 12:00 PM</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="font-medium">Other Days</span>
                          <span className="text-muted-foreground">Closed</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-4">
                        Please visit during operating hours for tool pickup, returns, and new memberships.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Online Contact */}
                <div className="bg-muted/50 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Online Inquiries</h3>
                      <p className="text-muted-foreground mb-4">
                        For general questions, membership inquiries, or tool availability, 
                        you can reach out through our online system.
                      </p>
                      <Button asChild>
                        <Link href="/register">
                          Join Online
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-muted/30 rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6">Send Us a Message</h3>
                
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="membership">Membership Inquiry</option>
                      <option value="tool-availability">Tool Availability</option>
                      <option value="policies">Policies & Procedures</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="technical">Website Technical Issue</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      className="w-full px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
                      placeholder="Please provide details about your inquiry..."
                      required
                    ></textarea>
                  </div>
                  
                  <Button type="submit" size="lg" className="w-full">
                    Send Message
                  </Button>
                </form>
                
                <p className="text-sm text-muted-foreground mt-4 text-center">
                  We typically respond to inquiries within 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Service Area
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Ballarat Tool Library proudly serves the greater Ballarat area and surrounding communities. 
              We welcome members from all neighborhoods who can visit during our operating hours.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3 text-primary">Ballarat East</h3>
                <p className="text-muted-foreground">
                  Our home base and primary service area
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3 text-primary">Greater Ballarat</h3>
                <p className="text-muted-foreground">
                  All Ballarat suburbs and surrounding areas
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3 text-primary">Regional Victoria</h3>
                <p className="text-muted-foreground">
                  Nearby communities welcome with valid ID
                </p>
              </div>
            </div>
            
            <div className="mt-8">
              <p className="text-muted-foreground mb-6">
                <strong>Note:</strong> Membership requires valid identification and agreement to our 
                borrowing policies. All members must be 18 years or older.
              </p>
              <Button size="lg" asChild>
                <Link href="/about">
                  Learn More About Us
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8">
              Frequently Requested Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/50 rounded-lg p-6 text-left">
                <h3 className="text-xl font-semibold mb-3">New Member Information</h3>
                <p className="text-muted-foreground mb-4">
                  Learn about membership options, pricing, and getting started with Ballarat Tool Library.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/register">
                    Join Now
                  </Link>
                </Button>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-6 text-left">
                <h3 className="text-xl font-semibold mb-3">Policies & FAQ</h3>
                <p className="text-muted-foreground mb-4">
                  Find answers to common questions about borrowing, late fees, and tool care.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/faq">
                    View FAQ
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}