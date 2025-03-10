import React from 'react';
import { FiBarChart2 } from 'react-icons/fi';
import GraficoBarrasActividades from './GraficoBarrasActividades';
import { useActividadesPorSemana } from '../../hooks/useActividadesPorSemana';

interface ActividadesPorSemanaProps {
  titulo?: string;
  className?: string;
}

/**
 * Componente contenedor para el gráfico de actividades por semana
 * Combina la lógica de datos con la visualización
 */
const ActividadesPorSemana: React.FC<ActividadesPorSemanaProps> = ({ 
  titulo = 'Actividades por Semana',
  className = ''
}) => {
  const { actividadesData, loading, error } = useActividadesPorSemana();

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
              <FiBarChart2 className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                {error}
              </p>
            </div>
          </div>
        ) : actividadesData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FiBarChart2 className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No hay datos de actividades disponibles
              </p>
            </div>
          </div>
        ) : (
          <GraficoBarrasActividades data={actividadesData} height={250} />
        )}
      </div>
    </div>
  );
};

export default ActividadesPorSemana;
