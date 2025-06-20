import Link from "next/link";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              Welcome to Ballarat Tool Library
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-muted-foreground leading-relaxed">
              Borrow tools, save money, build community. Access hundreds of quality tools 
              with your annual membership starting at just $55.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Join Now - $55/year
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/catalog">
                  Browse Tools
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center p-6">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Choose Your Membership</h3>
              <p className="text-muted-foreground leading-relaxed">
                Select Basic ($55) for essential tools or Premium ($70) for access to 
                specialized equipment and extended borrowing periods.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Browse & Reserve</h3>
              <p className="text-muted-foreground leading-relaxed">
                Search our catalog of tools online, check availability, and reserve 
                items for pickup at your convenience.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Pickup & Return</h3>
              <p className="text-muted-foreground leading-relaxed">
                Collect your tools during our opening hours and return them when 
                your project is complete. It&apos;s that simple!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Membership Comparison */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Membership Options
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Membership */}
            <div className="bg-background border border-border rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-4">Basic Membership</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-primary">$55</span>
                <span className="text-muted-foreground ml-2">per year</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Access to essential hand tools and basic power tools</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>7-day borrowing period</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Online catalog and booking system</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-3 mt-1">✓</span>
                  <span>Basic tool safety information</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/register?plan=basic">
                  Choose Basic
                </Link>
              </Button>
            </div>

            {/* Premium Membership */}
            <div className="bg-primary text-primary-foreground rounded-lg p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium Membership</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">$70</span>
                <span className="text-primary-foreground/80 ml-2">per year</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-green-300 mr-3 mt-1">✓</span>
                  <span>Everything in Basic membership</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-3 mt-1">✓</span>
                  <span>Access to premium tools and specialized equipment</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-3 mt-1">✓</span>
                  <span>14-day borrowing period</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-3 mt-1">✓</span>
                  <span>Priority booking and reservations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-300 mr-3 mt-1">✓</span>
                  <span>Detailed tool guides and video tutorials</span>
                </li>
              </ul>
              <Button className="w-full bg-background text-foreground hover:bg-background/90" asChild>
                <Link href="/register?plan=premium">
                  Choose Premium
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of tool sharers and start saving money on your next project today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">
                Become a Member
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/contact">
                Ask Questions
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
