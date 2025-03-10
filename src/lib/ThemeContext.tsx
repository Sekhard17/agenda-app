import React, { createContext, useContext, useEffect, useState } from 'react';
import { Toaster } from 'sonner';

// Definimos los tipos para nuestro contexto
type Theme = 'light' | 'dark';
type FontSize = 'small' | 'medium' | 'large';

interface ThemeContextType {
  theme: Theme;
  fontSize: FontSize;
  toggleTheme: () => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
}

// Creamos el contexto
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Valores por defecto para las variables CSS de tamaño de fuente
const fontSizeValues = {
  small: {
    '--font-size-xs': '0.65rem',
    '--font-size-sm': '0.775rem',
    '--font-size-base': '0.9rem',
    '--font-size-lg': '1.025rem',
    '--font-size-xl': '1.15rem',
    '--font-size-2xl': '1.4rem',
    '--font-size-3xl': '1.775rem',
    '--font-size-4xl': '2.15rem',
  },
  medium: {
    '--font-size-xs': '0.75rem',
    '--font-size-sm': '0.875rem',
    '--font-size-base': '1rem',
    '--font-size-lg': '1.125rem',
    '--font-size-xl': '1.25rem',
    '--font-size-2xl': '1.5rem',
    '--font-size-3xl': '1.875rem',
    '--font-size-4xl': '2.25rem',
  },
  large: {
    '--font-size-xs': '0.85rem',
    '--font-size-sm': '0.975rem',
    '--font-size-base': '1.1rem',
    '--font-size-lg': '1.225rem',
    '--font-size-xl': '1.35rem',
    '--font-size-2xl': '1.6rem',
    '--font-size-3xl': '1.975rem',
    '--font-size-4xl': '2.35rem',
  },
};

// Proveedor del contexto
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Inicializamos los estados con los valores guardados en localStorage, o valores por defecto
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as Theme) || 'light';
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const savedFontSize = localStorage.getItem('fontSize');
    return (savedFontSize as FontSize) || 'medium';
  });

  // Efecto para aplicar el tema y tamaño de fuente al cargar la página
  useEffect(() => {
    // Aplicar tema
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Guardar en localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Efecto para aplicar el tamaño de fuente
  useEffect(() => {
    // Aplicar variables CSS para el tamaño de fuente
    const fontSizeCSS = fontSizeValues[fontSize];
    Object.entries(fontSizeCSS).forEach(([property, value]) => {
      document.documentElement.style.setProperty(property, value);
    });
    
    // Guardar en localStorage
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  // Función para alternar entre temas
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Función para aumentar el tamaño de fuente
  const increaseFontSize = () => {
    setFontSize(prevSize => {
      if (prevSize === 'small') return 'medium';
      if (prevSize === 'medium') return 'large';
      return prevSize;
    });
  };

  // Función para disminuir el tamaño de fuente
  const decreaseFontSize = () => {
    setFontSize(prevSize => {
      if (prevSize === 'large') return 'medium';
      if (prevSize === 'medium') return 'small';
      return prevSize;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, fontSize, toggleTheme, increaseFontSize, decreaseFontSize }}>
      {children}
      <Toaster 
        position="top-right" 
        theme={theme} 
        closeButton
        richColors
      />
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};
