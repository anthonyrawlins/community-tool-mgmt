"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useState } from "react";

export default function FAQPage() {
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  const faqSections = [
    {
      id: "membership",
      title: "Membership & Getting Started",
      questions: [
        {
          question: "How do I become a member?",
          answer: "You can join online through our registration system or visit us during operating hours (Tuesday 4-6pm, Saturday 10am-12pm) at 25-39 Barkly Street, Ballarat East. You'll need valid photo ID and must be 18 years or older."
        },
        {
          question: "What are the membership costs?",
          answer: "We offer three affordable annual memberships (all GST inclusive): Concession $33/year (requires valid concession card), Individual $55/year (single person), and Couple $77/year (two people). All memberships include access to our full range of 1,000+ tools with 7-day borrowing periods."
        },
        {
          question: "What ID do I need to join?",
          answer: "You need valid photo identification (driver's license, passport, or other government-issued ID) and must be 18 years or older. We serve the Ballarat area and surrounding communities."
        },
        {
          question: "Can I try before I commit to membership?",
          answer: "Visit us during operating hours to see our tool collection and speak with our volunteers. We're happy to show you around and explain how the library works before you decide to join."
        },
        {
          question: "Who is eligible for concession pricing?",
          answer: "Concession pricing ($33/year) is available to holders of valid concession cards including seniors cards, pension cards, student cards, health care cards, and other government-issued concession cards. You'll need to present your concession card when joining and it must remain valid for the duration of your membership."
        }
      ]
    },
    {
      id: "borrowing",
      title: "Borrowing Tools",
      questions: [
        {
          question: "How long can I borrow tools?",
          answer: "Basic members can borrow tools for 1 week (7 days). Premium members get extended borrowing periods of 2 weeks (14 days). All tools must be returned during our operating hours."
        },
        {
          question: "How many tools can I borrow at once?",
          answer: "The number of tools you can borrow depends on your membership level and the type of tools. We'll discuss borrowing limits when you join, designed to ensure fair access for all members."
        },
        {
          question: "Can I reserve tools in advance?",
          answer: "Yes! Premium members get priority booking and can reserve tools in advance. Basic members can also check tool availability and request to be notified when items become available."
        },
        {
          question: "What if I need a tool longer than the borrowing period?",
          answer: "You can request an extension if no other members have reserved the tool. Contact us or visit during operating hours to discuss extending your borrowing period."
        }
      ]
    },
    {
      id: "fees",
      title: "Late Fees & Charges",
      questions: [
        {
          question: "What are the late fees?",
          answer: "Late fees are $1 per day for hand tools and $5 per day for power tools. Fees start accruing the day after your return deadline. We understand circumstances arise, so please contact us if you're having trouble returning items on time."
        },
        {
          question: "What happens if I damage a tool?",
          answer: "Accidents happen! Please report any damage immediately. Minor wear from normal use is expected. For significant damage, we'll assess repair costs or replacement value. We're reasonable and work with members to resolve damage issues fairly."
        },
        {
          question: "Are there any other charges?",
          answer: "Your annual membership covers normal tool use. Additional charges may apply for lost tools, excessive damage beyond normal wear, or cleaning fees for tools returned in poor condition."
        },
        {
          question: "Can I pay fees online?",
          answer: "Yes, we accept online payments for membership fees and any outstanding charges through our secure payment system."
        }
      ]
    },
    {
      id: "tools",
      title: "Tools & Equipment",
      questions: [
        {
          question: "What types of tools do you have?",
          answer: "We have over 1,000 tools including hand tools, power tools, garden equipment, specialized tools, kitchen equipment, and more. Our collection includes everything from basic screwdrivers to professional-grade power tools."
        },
        {
          question: "How do I know if a tool is available?",
          answer: "You can browse our online catalog to check tool availability in real-time. Tools show as 'Available', 'On Loan', or 'Reserved' so you can plan your projects accordingly."
        },
        {
          question: "Do you provide tool instructions or safety information?",
          answer: "Yes! We provide safety information and basic usage instructions for all tools. Premium members get access to detailed guides and video tutorials. We're always happy to demonstrate tool use during your visit."
        },
        {
          question: "Can I request specific tools to be added to the collection?",
          answer: "Absolutely! We welcome suggestions from members. If there's a tool you need that we don't have, let us know. We consider member requests when expanding our collection."
        }
      ]
    },
    {
      id: "policies",
      title: "Policies & Procedures",
      questions: [
        {
          question: "What are your operating hours?",
          answer: "We're open Tuesday 4:00 PM - 6:00 PM and Saturday 10:00 AM - 12:00 PM. Please visit during these hours for tool pickup, returns, new memberships, and any assistance."
        },
        {
          question: "What if I can't return tools during operating hours?",
          answer: "All tools must be returned during operating hours when staff are present to check them in. We cannot accept after-hours returns for security and inventory reasons. Please plan accordingly or contact us about special arrangements."
        },
        {
          question: "Can someone else return tools on my behalf?",
          answer: "Tools should generally be returned by the member who borrowed them. If you need someone else to return tools for you, please contact us first to arrange this and ensure proper check-in procedures."
        },
        {
          question: "What happens if my membership expires?",
          answer: "You'll receive reminders before your membership expires. If it lapses, you'll need to renew before borrowing more tools. Any tools on loan when membership expires should still be returned on time to avoid late fees."
        }
      ]
    },
    {
      id: "safety",
      title: "Safety & Care",
      questions: [
        {
          question: "Are there age restrictions for tool use?",
          answer: "Membership is for adults 18 and over. Members are responsible for ensuring safe use of tools and compliance with any age restrictions for specific equipment. Children should always be supervised when tools are in use."
        },
        {
          question: "What safety equipment is provided?",
          answer: "Basic safety equipment is available for some tools. However, members are generally responsible for providing their own safety gear (safety glasses, gloves, hearing protection, etc.) appropriate for their projects."
        },
        {
          question: "How should I clean tools before returning?",
          answer: "Please return tools clean and in good condition. Remove any debris, clean off residue, and ensure moving parts are free of material. This helps maintain our tools for all members."
        },
        {
          question: "What if I'm unsure how to use a tool safely?",
          answer: "Please ask! Our volunteers can provide guidance on tool use and safety. We'd rather spend time explaining proper use than deal with accidents or damaged tools. Don't hesitate to request a demonstration."
        }
      ]
    }
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Find answers to common questions about membership, borrowing policies, 
              fees, and how Ballarat Tool Library works.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Navigation */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold mb-4 text-center">Jump to Section:</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {faqSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    const element = document.getElementById(section.id);
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                >
                  {section.title}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqSections.map((section) => (
              <div key={section.id} id={section.id} className="scroll-mt-24">
                <h2 className="text-3xl font-bold mb-8 text-primary border-b border-border pb-4">
                  {section.title}
                </h2>
                
                <div className="space-y-4">
                  {section.questions.map((qa, index) => (
                    <div
                      key={index}
                      className="border border-border rounded-lg bg-muted/30"
                    >
                      <button
                        onClick={() => toggleSection(`${section.id}-${index}`)}
                        className="w-full text-left p-6 hover:bg-muted/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
                        aria-expanded={openSection === `${section.id}-${index}`}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-semibold text-foreground pr-4">
                            {qa.question}
                          </h3>
                          <svg
                            className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
                              openSection === `${section.id}-${index}` ? 'rotate-180' : ''
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                      </button>
                      
                      {openSection === `${section.id}-${index}` && (
                        <div className="px-6 pb-6">
                          <div className="pt-2 border-t border-border">
                            <p className="text-muted-foreground leading-relaxed">
                              {qa.answer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Still Have Questions?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Can&apos;t find the answer you&apos;re looking for? We&apos;re here to help! 
              Visit us during operating hours or reach out online.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3">Visit In Person</h3>
                <p className="text-muted-foreground mb-4">
                  Tuesday 4-6pm & Saturday 10am-12pm<br />
                  25-39 Barkly Street, Ballarat East
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact">
                    Get Directions
                  </Link>
                </Button>
              </div>
              
              <div className="bg-background rounded-lg p-6 border border-border">
                <h3 className="text-xl font-semibold mb-3">Contact Online</h3>
                <p className="text-muted-foreground mb-4">
                  Send us a message with your questions<br />
                  and we&apos;ll get back to you soon.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact">
                    Send Message
                  </Link>
                </Button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Join Now
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

      {/* Emergency Contact */}
      <section className="py-12 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-yellow-800 dark:text-yellow-200">
                Important Notice
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                If you experience a tool-related emergency or injury, please seek immediate medical 
                attention by calling 000. For urgent tool-related issues outside operating hours, 
                please contact us through our online system and we&apos;ll respond as soon as possible.
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}