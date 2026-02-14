import { createContext, useContext, useEffect, type ReactNode } from 'react';

type Theme = 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: () => void; // No-op
  effectiveTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
  effectiveTheme: 'dark'
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  
  useEffect(() => {
    // FORCE DARK MODE
    document.documentElement.classList.add('dark');
    localStorage.setItem('factoryforge-theme', 'dark');
    console.log('🔒 Theme locked to: Dark (Industrial Standard)');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'dark', setTheme: () => {}, effectiveTheme: 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
