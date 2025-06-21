import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CalendarPreview } from "@/components/landing/CalendarPreview";
import { ArrowRight, Sparkles, Heart, Quote } from "lucide-react";

// Import signature font
import { Kalam } from 'next/font/google';

const kalam = Kalam({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
});

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <span className="text-xl font-bold text-foreground">Tempo</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-6 text-6xl sm:text-7xl font-bold tracking-tight text-foreground">
            Life enrichment
            <br />
            <span className="text-purple-600 dark:text-purple-400">without time pressure</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Break free from rigid time grids. Stack meaningful activities naturally, 
            focus on what enriches your life, and create days that truly matter.
          </p>
          <div className="flex justify-center">
            <Link href="/tempo">
              <Button size="lg" className="text-base px-8 py-4 rounded-xl font-semibold 
                shadow-lg hover:shadow-xl transition-all duration-200 group gap-1
                bg-gray-900/80 text-white hover:bg-gray-900
                dark:text-gray-300 dark:border dark:border-gray-600 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800
                dark:hover:text-white dark:hover:border-gray-500 dark:hover:from-gray-800 dark:hover:to-gray-800
                dark:hover:bg-gray-800">
                <span>Start Planning</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Calendar Preview Section */}
      <section className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              See Tempo in action
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Activities flow naturally in vertical stacks. No time constraints, 
              just meaningful moments arranged by what matters most.
            </p>
          </div>
          <CalendarPreview />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="border-t border-border/50">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                A different approach to planning
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Built from the belief that life is about enrichment, not efficiency
              </p>
            </div>
            
            <section className="relative z-10 w-full max-w-4xl mx-auto mt-16">
              <div className="bg-card border border-border rounded-2xl p-8 md:p-12 group hover:bg-card/80 transition-all duration-300 cursor-pointer">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 relative [transform-style:preserve-3d]">
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:[transform:rotateY(180deg)] [backface-visibility:hidden]">
                      <Quote className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 [transform:rotateY(-180deg)] group-hover:[transform:rotateY(0deg)] [backface-visibility:hidden]">
                      <Heart className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <blockquote className="text-lg md:text-xl text-foreground leading-relaxed">
                    &ldquo;Every calendar app has been designed for work life — meetings, deadlines, productivity. 
                    But shouldn&rsquo;t we use something different for the fulfillment side of our lives? 
                    Why should &lsquo;Call grandma&rsquo; compete with conference calls for calendar space? 
                    I built Tempo because life&rsquo;s most meaningful activities deserve their own approach — 
                    one focused on enrichment, not efficiency.&rdquo;
                  </blockquote>
                </div>
                
                <div className="flex items-center justify-end">
                  <div className="text-right">
                    <div className={`${kalam.className} text-4xl text-purple-600 dark:text-purple-400 mb-2`}>
                      Arach T.
                    </div>
                    <p className="text-muted-foreground text-sm">Founder, Tempo</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="bg-card border-border border rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Enrichment First</h3>
                <p className="text-sm text-muted-foreground">
                  Activities that feed your mind, body, and soul take priority over productivity metrics
                </p>
              </div>
              <div className="bg-card border-border border rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">💝</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Natural Flow</h3>
                <p className="text-sm text-muted-foreground">
                  Stack activities in the order that feels right, without time pressure or rigid constraints
                </p>
              </div>
              <div className="bg-card border-border border rounded-2xl p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="font-semibold text-foreground mb-2">Meaningful Moments</h3>
                <p className="text-sm text-muted-foreground">
                  Focus on activities that create lasting memories and genuine personal growth
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/50 bg-muted/30">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to enrich your week?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the movement away from time-pressured planning toward 
              life-enriching activity design.
            </p>
            <Link href="/tempo">
              <Button size="lg" className="text-base px-8 py-4 rounded-xl font-semibold bg-gray-900/80 dark:bg-gray-100/80 hover:bg-gray-900/80 dark:hover:bg-gray-100/80 hover:shadow-xl text-white dark:text-gray-900 shadow-lg transition-all duration-200 group">
                Start Your First Week
                <ArrowRight className="ml-8 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="h-4 w-4 mx-1 text-red-500" />
            <span>for meaningful living</span>
          </div>
        </div>
      </footer>
    </div>
  );
}