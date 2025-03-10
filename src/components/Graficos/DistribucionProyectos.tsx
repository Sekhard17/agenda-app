import React from 'react';
import { FiPieChart } from 'react-icons/fi';
import GraficoDonaProyectos from './GraficoDonaProyectos';
import { useProyectosData } from '../../hooks/useProyectosData';

interface DistribucionProyectosProps {
  titulo?: string;
  className?: string;
}

/**
 * Componente contenedor para el gráfico de distribución de proyectos
 * Combina la lógica de datos con la visualización
 */
const DistribucionProyectos: React.FC<DistribucionProyectosProps> = ({ 
  titulo = 'Distribución de Proyectos',
  className = ''
}) => {
  const { proyectosData, loading, error } = useProyectosData();

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-5 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
        {titulo}
      </h3>
      
      <div className="h-64">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FiPieChart className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {error}
              </p>
            </div>
          </div>
        ) : proyectosData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FiPieChart className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No hay datos de proyectos disponibles
              </p>
            </div>
          </div>
        ) : (
          <GraficoDonaProyectos data={proyectosData} height={250} />
        )}
      </div>
    </div>
  );
};

export default DistribucionProyectos;
