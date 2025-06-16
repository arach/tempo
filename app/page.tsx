import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-900">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="container mx-auto px-6 py-20">
        <main className="flex max-w-5xl mx-auto flex-col items-center text-center">
          <h1 className="mb-6 text-7xl font-bold tracking-tight bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">Tempo</h1>
          <p className="mb-12 text-xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
            Plan meaningful activities for your week without the stress of time slots.
            Focus on what matters most - enrichment, connection, growth, and creativity.
          </p>
          <div className="flex gap-4">
            <Link href="/tempo">
              <Button size="lg" className="text-base px-8 py-6 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5">
                Start Planning
              </Button>
            </Link>
          </div>
          <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl">
            <div className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold">
                Life Enrichment Focus
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Break free from productivity metrics and focus on activities that truly enrich your life
              </p>
            </div>
            <div className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold">
                No Time Slots
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Stack activities naturally without rigid schedules - focus on sequence, not timing
              </p>
            </div>
            <div className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold">
                Meaningful Connections
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plan time for the people who matter - from calling grandma to coffee with friends
              </p>
            </div>
            <div className="bg-white/50 dark:bg-white/[0.02] backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 dark:border-gray-800/50 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-500/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold">
                Creative Expression
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Make space for your creative pursuits - painting, writing, music, and more
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}