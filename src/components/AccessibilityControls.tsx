import React from 'react';
import { useTheme } from '../lib/ThemeContext';
import { toast } from 'sonner';

const AccessibilityControls: React.FC = () => {
  const { theme, fontSize, toggleTheme, increaseFontSize, decreaseFontSize } = useTheme();

  const handleToggleTheme = () => {
    toggleTheme();
    toast.success(`Modo ${theme === 'light' ? 'oscuro' : 'claro'} activado`);
  };

  const handleIncreaseFontSize = () => {
    if (fontSize === 'large') {
      toast.info('Ya estás usando el tamaño de fuente más grande');
      return;
    }
    increaseFontSize();
    toast.success('Tamaño de fuente aumentado');
  };

  const handleDecreaseFontSize = () => {
    if (fontSize === 'small') {
      toast.info('Ya estás usando el tamaño de fuente más pequeño');
      return;
    }
    decreaseFontSize();
    toast.success('Tamaño de fuente reducido');
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Control de tema */}
      <button
        onClick={handleToggleTheme}
        className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-colors"
        aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
        title={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      >
        {theme === 'light' ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </button>

      {/* Control de tamaño de fuente */}
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecreaseFontSize}
          className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-colors"
          aria-label="Reducir tamaño de fuente"
          title="Reducir tamaño de fuente"
          disabled={fontSize === 'small'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        
        <span className={`font-medium ${
          fontSize === 'small' ? 'text-sm' : 
          fontSize === 'medium' ? 'text-base' : 'text-lg'
        } text-primary dark:text-accent`}>
          A
        </span>
        
        <button
          onClick={handleIncreaseFontSize}
          className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent transition-colors"
          aria-label="Aumentar tamaño de fuente"
          title="Aumentar tamaño de fuente"
          disabled={fontSize === 'large'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary dark:text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AccessibilityControls;
