import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: EffectiveTheme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  effectiveTheme: 'dark'
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Load from localStorage on initial mount
    const saved = localStorage.getItem('factoryforge-theme') as Theme | null;
    return saved || 'dark';
  });
  
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('dark');

  useEffect(() => {
    // Save to localStorage whenever theme changes
    localStorage.setItem('factoryforge-theme', theme);

    if (theme === 'system') {
      // Use system preference
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
        const isDark = e.matches;
        setEffectiveTheme(isDark ? 'dark' : 'light');
        
        // Apply to document
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      };

      // Initial check
      updateTheme(mediaQuery);

      // Listen for changes
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    } else {
      // Use manual selection
      setEffectiveTheme(theme);
      
      // Apply to document
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
