import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full bg-maximus-surface-dark dark:bg-maximus-surface-light text-maximus-text-dark dark:text-maximus-text-light hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-maximus-primary"
      aria-label="Toggle Dark Mode"
    >
      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
  );
}
