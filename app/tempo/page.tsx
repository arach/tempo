import { TempoCalendar } from '@/components/tempo/TempoCalendar';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TempoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-black dark:to-gray-900">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-5xl font-bold mb-3 tracking-tight">Your Week</h1>
          <p className="text-lg text-muted-foreground font-medium">Plan meaningful activities without the pressure of exact times</p>
        </header>
        
        <TempoCalendar />
      </div>
    </div>
  );
}