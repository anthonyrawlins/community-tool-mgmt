import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const metadata = {
  title: "About Us",
  description: "Learn about Ballarat Tool Library - a community-focused tool lending service making tools accessible for everyone in the Ballarat area.",
};

export default function AboutPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              About Ballarat Tool Library
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              A community initiative making quality tools accessible to everyone 
              in the Ballarat area through affordable membership and sustainable sharing.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  The Ballarat Tool Library exists to strengthen our community by providing 
                  affordable access to quality tools and equipment. We believe that everyone 
                  should have the opportunity to create, repair, and maintain their homes and 
                  projects without the financial burden of purchasing expensive tools.
                </p>
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  Our approach promotes sustainability by reducing waste, encouraging skill 
                  development, and fostering connections within the Ballarat community.
                </p>
                <Button size="lg" asChild>
                  <Link href="/register">
                    Join Our Community
                  </Link>
                </Button>
              </div>
              <div className="bg-muted/50 rounded-lg p-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Community Focused</h3>
                      <p className="text-muted-foreground">
                        Serving the Ballarat area with tools and support for all skill levels and ages.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Environmentally Conscious</h3>
                      <p className="text-muted-foreground">
                        Reducing waste through sharing and promoting sustainable consumption practices.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary/10 rounded-full p-3 flex-shrink-0">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">Skill Building</h3>
                      <p className="text-muted-foreground">
                        Empowering community members to learn new skills and tackle projects with confidence.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How We Started */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              How We Started
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Ballarat Tool Library began as a grassroots community initiative, recognizing 
              that many residents needed access to tools for home maintenance, creative projects, 
              and repairs but couldn&apos;t justify purchasing expensive equipment for occasional use.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              What started as a small collection of shared tools has grown into a comprehensive 
              library with over <strong>1,000 tools and equipment items</strong>, serving community 
              members with everything from basic hand tools to specialized power equipment.
            </p>
          </div>
        </div>
      </section>

      {/* Community Impact */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Community Impact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">1000+</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Tools Available</h3>
                <p className="text-muted-foreground">
                  From hand tools to power equipment, garden tools to specialty items
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">$33</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Annual Membership</h3>
                <p className="text-muted-foreground">
                  Affordable access from just $33/year (concession) to $77/year (couple)
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl font-bold text-primary">18+</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Age Requirement</h3>
                <p className="text-muted-foreground">
                  Open to adults 18 and over with valid identification
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Our Values
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-4 text-primary">Accessibility</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We believe quality tools should be accessible to everyone, regardless of 
                  economic circumstances. Our affordable membership structure ensures tools 
                  are available to the entire Ballarat community.
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-4 text-primary">Community</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We foster connections between neighbors, encourage skill sharing, and 
                  create opportunities for community members to help and learn from each other.
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-4 text-primary">Sustainability</h3>
                <p className="text-muted-foreground leading-relaxed">
                  By sharing tools instead of everyone purchasing their own, we reduce 
                  waste, minimize environmental impact, and promote conscious consumption.
                </p>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-4 text-primary">Education</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We provide tool safety information, usage instructions, and support to 
                  help community members use tools safely and effectively.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Location & Access */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Visit Us in Ballarat East
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Located conveniently in Ballarat East, we serve the greater Ballarat area 
              with regular operating hours and a welcoming, accessible space for all 
              community members.
            </p>
            <div className="bg-muted/50 rounded-lg p-8 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Operating Hours</h3>
                  <p className="text-muted-foreground mb-2">
                    <strong>Tuesday:</strong> 4:00 PM - 6:00 PM
                  </p>
                  <p className="text-muted-foreground">
                    <strong>Saturday:</strong> 10:00 AM - 12:00 PM
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-3">Location</h3>
                  <p className="text-muted-foreground">
                    25-39 Barkly Street<br />
                    Ballarat East VIC 3350<br />
                    Australia
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/contact">
                  Get Directions
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/register">
                  Become a Member
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}