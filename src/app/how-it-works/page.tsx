import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export const metadata = {
  title: "How It Works",
  description: "Learn how Ballarat Tool Library works - from membership and tool browsing to borrowing and returning. Simple steps to access over 1,000 tools.",
};

export default function HowItWorksPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              How It Works
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Getting started with Ballarat Tool Library is simple. Choose your membership, 
              browse our tools, and start your next project with confidence.
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Simple Steps to Get Started
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {/* Step 1 */}
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Choose Your Membership</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Select Concession ($33/year), Individual ($55/year), or Couple ($77/year) 
                  membership. All prices are GST inclusive with full access to 1,000+ tools.
                </p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">What You&apos;ll Need:</h4>
                  <ul className="text-sm text-muted-foreground text-left space-y-1">
                    <li>• Valid photo ID</li>
                    <li>• Must be 18+ years old</li>
                    <li>• Ballarat area resident</li>
                    <li>• Payment method</li>
                  </ul>
                </div>
              </div>

              {/* Step 2 */}
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Browse & Reserve</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Search our catalog of 1,000+ tools online, check availability, 
                  and reserve items for pickup at your convenience.
                </p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Available Tools:</h4>
                  <ul className="text-sm text-muted-foreground text-left space-y-1">
                    <li>• Hand tools & power tools</li>
                    <li>• Garden equipment</li>
                    <li>• Specialized tools</li>
                    <li>• Kitchen equipment</li>
                  </ul>
                </div>
              </div>

              {/* Step 3 */}
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-2xl font-semibold mb-4">Pickup & Return</h3>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Collect your tools during operating hours and return them when 
                  your project is complete. It&apos;s that simple!
                </p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Operating Hours:</h4>
                  <ul className="text-sm text-muted-foreground text-left space-y-1">
                    <li>• Tuesday: 4:00 PM - 6:00 PM</li>
                    <li>• Saturday: 10:00 AM - 12:00 PM</li>
                    <li>• Location: Ballarat East</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Start Your Membership
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Comparison */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              Choose Your Membership Level
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Concession Membership */}
              <div className="bg-background border border-border rounded-lg p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Concession</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">$33</span>
                    <span className="text-muted-foreground ml-2">per year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">GST inclusive</p>
                  <p className="text-muted-foreground">For concession card holders</p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500/10 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Full Access to 1,000+ Tools</h4>
                      <p className="text-sm text-muted-foreground">Hand tools, power tools, garden equipment</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500/10 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">7-Day Borrowing</h4>
                      <p className="text-sm text-muted-foreground">One week borrowing period</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500/10 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Valid Concession Card Required</h4>
                      <p className="text-sm text-muted-foreground">Seniors, pension, student, health care cards</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="outline" asChild>
                  <Link href="/register?plan=concession">
                    Choose Concession
                  </Link>
                </Button>
              </div>

              {/* Individual Membership */}
              <div className="bg-primary text-primary-foreground rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Individual</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold">$55</span>
                    <span className="text-primary-foreground/80 ml-2">per year</span>
                  </div>
                  <p className="text-sm text-primary-foreground/80 mb-2">GST inclusive</p>
                  <p className="text-primary-foreground/90">For single person membership</p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-400/20 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Full Access to 1,000+ Tools</h4>
                      <p className="text-sm text-primary-foreground/80">Hand tools, power tools, garden equipment</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-400/20 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">7-Day Borrowing</h4>
                      <p className="text-sm text-primary-foreground/80">One week borrowing period</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-400/20 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Online Booking System</h4>
                      <p className="text-sm text-primary-foreground/80">Reserve tools in advance</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-400/20 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Single Person</h4>
                      <p className="text-sm text-primary-foreground/80">Individual membership only</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full bg-background text-foreground hover:bg-background/90" asChild>
                  <Link href="/register?plan=individual">
                    Choose Individual
                  </Link>
                </Button>
              </div>

              {/* Couple Membership */}
              <div className="bg-background border border-border rounded-lg p-6">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2">Couple</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-primary">$77</span>
                    <span className="text-muted-foreground ml-2">per year</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">GST inclusive</p>
                  <p className="text-muted-foreground">For two person households</p>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500/10 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Full Access to 1,000+ Tools</h4>
                      <p className="text-sm text-muted-foreground">Hand tools, power tools, garden equipment</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500/10 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">7-Day Borrowing</h4>
                      <p className="text-sm text-muted-foreground">One week borrowing period</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500/10 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Two Person Membership</h4>
                      <p className="text-sm text-muted-foreground">Both partners can borrow tools</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-green-500/10 rounded-full p-1 mt-1">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Great Value</h4>
                      <p className="text-sm text-muted-foreground">Best price per person for couples</p>
                    </div>
                  </div>
                </div>

                <Button className="w-full" variant="outline" asChild>
                  <Link href="/register?plan=couple">
                    Choose Couple
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Borrowing Process */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
              The Borrowing Process
            </h2>
            
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Search & Find Tools</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Browse our online catalog to find the tools you need. Use filters to narrow down 
                    by category, availability, or tool type. Check real-time availability status.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Reserve Your Tools</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Reserve tools online or visit during operating hours. Premium members can book 
                    in advance and get priority access. Plan your pickup time during our operating hours.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Pick Up Tools</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Visit us during operating hours (Tuesday 4-6pm, Saturday 10am-12pm) at our 
                    Ballarat East location. Bring your membership card and ID for quick checkout.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Complete Your Project</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Use the tools safely for your project. Basic members have 7 days, Premium members 
                    have 14 days. Contact us if you need an extension or have questions about tool use.
                  </p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-6">
                <div className="bg-primary/10 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Return Clean & On Time</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Return tools clean and in good condition during operating hours. Late fees are 
                    $1/day for hand tools, $5/day for power tools. Report any damage immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Policies Summary */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Important Policies
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-4 text-primary">Age & ID Requirements</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Must be 18 years or older</li>
                  <li>• Valid photo ID required</li>
                  <li>• Ballarat area residency</li>
                  <li>• Agreement to borrowing policies</li>
                </ul>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-4 text-primary">Late Fees & Damage</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Hand tools: $1 per day late</li>
                  <li>• Power tools: $5 per day late</li>
                  <li>• Report damage immediately</li>
                  <li>• Repair/replacement costs apply</li>
                </ul>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-4 text-primary">Operating Hours</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Tuesday: 4:00 PM - 6:00 PM</li>
                  <li>• Saturday: 10:00 AM - 12:00 PM</li>
                  <li>• Closed other days</li>
                  <li>• All returns during operating hours</li>
                </ul>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-4 text-primary">Safety & Care</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Use tools safely and responsibly</li>
                  <li>• Provide your own safety equipment</li>
                  <li>• Return tools clean and in good condition</li>
                  <li>• Ask for help if unsure about use</li>
                </ul>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-muted-foreground mb-6">
                For complete policies and detailed information, please visit our FAQ page.
              </p>
              <Button variant="outline" asChild>
                <Link href="/faq">
                  Read Full FAQ
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Join over 1,000 tools at your fingertips and start your next project today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Join Now - From $55/year
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/catalog">
                  Browse Our Tools
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}