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
    const saved = localStorage.getItem('factoryforge-theme') as Theme | null;
    console.log('💾 Loaded theme from localStorage:', saved); // DEBUG
    return saved || 'dark';
  });
  
  const [effectiveTheme, setEffectiveTheme] = useState<EffectiveTheme>('dark');

  useEffect(() => {
    console.log('🎨 Theme changed to:', theme); // DEBUG
    console.log('📝 Saving to localStorage...'); // DEBUG
    localStorage.setItem('factoryforge-theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const updateTheme = (e: MediaQueryListEvent | MediaQueryList) => {
        const isDark = e.matches;
        console.log('💻 System theme is:', isDark ? 'dark' : 'light'); // DEBUG
        setEffectiveTheme(isDark ? 'dark' : 'light');
        
        if (isDark) {
          document.documentElement.classList.add('dark');
          console.log('✅ Added .dark class'); // DEBUG
        } else {
          document.documentElement.classList.remove('dark');
          console.log('✅ Removed .dark class'); // DEBUG
        }
      };

      updateTheme(mediaQuery);
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    } else {
      console.log('👤 Manual theme selected:', theme); // DEBUG
      setEffectiveTheme(theme);
      
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        console.log('✅ Added .dark class (manual)'); // DEBUG
      } else {
        document.documentElement.classList.remove('dark');
        console.log('✅ Removed .dark class (manual)'); // DEBUG
      }
    }
  }, [theme]);

  console.log('🔄 Current state - theme:', theme, 'effectiveTheme:', effectiveTheme); // DEBUG

  return (
    <ThemeContext.Provider value={{ theme, setTheme, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
