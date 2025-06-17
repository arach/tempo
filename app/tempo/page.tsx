import { TempoCalendar } from '@/components/tempo/TempoCalendar';
import { ActivityBankSection } from '@/components/tempo/ActivityBankSection';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TempoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <h1 className="text-5xl font-bold mb-3 tracking-tight text-gray-900 dark:text-white">Your Week</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">Plan meaningful activities without the pressure of exact times</p>
        </header>
        
        <div className="space-y-12">
          <TempoCalendar />
          
          <ActivityBankSection />
        </div>
      </div>
    </div>
  );
}