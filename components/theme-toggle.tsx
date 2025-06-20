'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme-provider';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return <Monitor className="h-4 w-4" />;
    }
    return resolvedTheme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  const getTooltipText = () => {
    if (theme === 'light') return 'Switch to dark mode';
    if (theme === 'dark') return 'Switch to system mode';
    return 'Switch to light mode';
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="h-9 w-9"
      title={getTooltipText()}
    >
      {getIcon()}
      <span className="sr-only">{getTooltipText()}</span>
    </Button>
  );
}