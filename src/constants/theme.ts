// Constantes para el tema de la aplicación

// Colores principales
export const COLORS = {
  // Colores primarios
  primary: {
    light: '#3b82f6', // Azul
    dark: '#60a5fa'
  },
  // Colores secundarios
  secondary: {
    light: '#64748b', // Slate
    dark: '#94a3b8'
  },
  // Colores de acento
  accent: {
    light: '#0ea5e9', // Sky
    dark: '#38bdf8'
  },
  // Colores de fondo
  background: {
    light: '#ffffff',
    dark: '#1a1a1a'
  },
  // Colores de texto
  text: {
    light: '#333333',
    dark: '#f3f4f6'
  },
  // Colores de éxito
  success: {
    light: '#10b981', // Emerald
    dark: '#34d399'
  },
  // Colores de error
  error: {
    light: '#ef4444', // Red
    dark: '#f87171'
  },
  // Colores de advertencia
  warning: {
    light: '#f59e0b', // Amber
    dark: '#fbbf24'
  },
  // Colores de información
  info: {
    light: '#3b82f6', // Blue
    dark: '#60a5fa'
  }
}

// Tamaños de fuente
export const FONT_SIZES = {
  xs: '0.75rem',
  sm: '0.875rem',
  base: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem'
}

// Espaciados
export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem'
}

// Bordes redondeados
export const BORDER_RADIUS = {
  sm: '0.125rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px'
}

// Sombras
export const SHADOWS = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
}

// Transiciones
export const TRANSITIONS = {
  fast: '150ms',
  normal: '300ms',
  slow: '500ms'
}

// Nombres de las secciones
export const SECTION_NAMES = {
  actividades: 'Actividades',
  funcionarios: 'Funcionarios',
  perfil: 'Mi Perfil'
}

// Prioridades de actividades
export const PRIORIDADES = {
  baja: {
    label: 'Baja',
    color: {
      light: '#d1fae5', // Verde claro
      dark: '#065f46'   // Verde oscuro
    }
  },
  media: {
    label: 'Media',
    color: {
      light: '#fef3c7', // Amarillo claro
      dark: '#92400e'   // Amarillo oscuro
    }
  },
  alta: {
    label: 'Alta',
    color: {
      light: '#fee2e2', // Rojo claro
      dark: '#991b1b'   // Rojo oscuro
    }
  }
}
