import { useEffect } from 'react';

interface TituloPaginaProps {
  titulo: string;
}

/**
 * Componente que actualiza el título de la página en el navegador
 */
const TituloPagina: React.FC<TituloPaginaProps> = ({ titulo }) => {
  useEffect(() => {
    // Guardar el título original
    const tituloOriginal = document.title;
    
    // Actualizar el título con el nuevo valor
    document.title = `${titulo} | Agenda de Actividades`;
    
    // Restaurar el título original cuando el componente se desmonte
    return () => {
      document.title = tituloOriginal;
    };
  }, [titulo]);
  
  // Este componente no renderiza nada visible (actualizacion)
  return null;
};

export default TituloPagina;
