import React from 'react'
import { 
  FiCalendar, FiUsers, FiCheckSquare, FiBriefcase
} from 'react-icons/fi'
import DistribucionProyectos from '../Graficos/DistribucionProyectos'
import ActividadesPorSemana from '../Graficos/ActividadesPorSemana'
import { useEstadisticasDashboard } from '../../hooks/useEstadisticasDashboard'
import { useActividadesRecientes } from '../../hooks/useActividadesRecientes'

// Componente para tarjetas de resumen
interface TarjetaResumenProps {
  titulo: string
  valor: string | number
  icono: React.ReactNode
  color: string
  descripcion?: string
}

const TarjetaResumen: React.FC<TarjetaResumenProps> = ({ 
  titulo, 
  valor, 
  icono, 
  color,
  descripcion 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center">
        <div className={`flex-shrink-0 rounded-full p-3 ${color}`}>
          {icono}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{titulo}</h3>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{valor}</p>
            {descripcion && (
              <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">{descripcion}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}



// Componente para actividades recientes
interface ActividadRecienteProps {
  titulo: string;
  fecha: string;
  estado: 'borrador' | 'enviado';
  tipo: string;
  nombre_proyecto?: string;
}

const ActividadReciente: React.FC<ActividadRecienteProps> = ({ 
  titulo, 
  fecha, 
  estado, 
  tipo,
  nombre_proyecto
}) => {
  // Función para formatear la fecha
  const formatearFecha = (fechaStr: string) => {
    const fecha = new Date(fechaStr);
    return fecha.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Determinar el color y texto del estado
  let estadoColor = '';
  let estadoTexto = '';
  
  switch (estado) {
    case 'enviado':
      estadoColor = 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      estadoTexto = 'Enviado';
      break;
    case 'borrador':
      estadoColor = 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      estadoTexto = 'Borrador';
      break;
    default:
      estadoColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      estadoTexto = estado;
  }

  // Determinar el color del tipo
  let tipoColor = '';
  
  switch (tipo.toLowerCase()) {
    case 'reunión':
    case 'reunion':
      tipoColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      break;
    case 'desarrollo':
      tipoColor = 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      break;
    case 'documentación':
    case 'documentacion':
      tipoColor = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
      break;
    case 'testing':
    case 'prueba':
      tipoColor = 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300';
      break;
    default:
      tipoColor = 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">
              {titulo}
            </h4>
            <span className="text-xs text-gray-500 dark:text-gray-400 sm:ml-2">
              {formatearFecha(fecha)}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${estadoColor}`}>
              {estadoTexto}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${tipoColor}`}>
              {tipo}
            </span>
            {nombre_proyecto && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                {nombre_proyecto}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal del Dashboard
const Dashboard: React.FC = () => {
  // Obtener datos reales usando los hooks personalizados
  const { 
    actividadesRegistradas, 
    funcionariosActivos, 
    tareasCompletadas, 
    proyectosActivos,
    loading: loadingEstadisticas
  } = useEstadisticasDashboard();
  
  const { 
    actividades: actividadesRecientes, 
    loading: loadingActividades 
  } = useActividadesRecientes(5);

  // Datos para las tarjetas de resumen
  const tarjetasResumen = [
    {
      id: 1,
      titulo: 'Actividades Registradas',
      valor: actividadesRegistradas,
      icono: <FiCalendar className="h-8 w-8 text-white" />,
      color: 'bg-blue-500',
      descripcion: 'Último mes'
    },
    {
      id: 2,
      titulo: 'Funcionarios Activos',
      valor: funcionariosActivos,
      icono: <FiUsers className="h-8 w-8 text-white" />,
      color: 'bg-purple-500',
    },
    {
      id: 3,
      titulo: 'Tareas Completadas',
      valor: tareasCompletadas,
      icono: <FiCheckSquare className="h-8 w-8 text-white" />,
      color: 'bg-green-500',
      descripcion: 'Último mes'
    },
    {
      id: 4,
      titulo: 'Proyectos Activos',
      valor: proyectosActivos,
      icono: <FiBriefcase className="h-8 w-8 text-white" />,
      color: 'bg-pink-500',
    }
  ];

  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Panel de Administración</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Bienvenido al panel de administración, aquí tendrá un resumen de actividad.
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {loadingEstadisticas ? (
          // Mostrar esqueletos de carga
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-5 animate-pulse">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 mb-2"></div>
              <div className="h-6 w-12 bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))
        ) : (
          // Mostrar tarjetas con datos reales
          tarjetasResumen.map(tarjeta => (
            <TarjetaResumen
              key={tarjeta.id}
              titulo={tarjeta.titulo}
              valor={tarjeta.valor}
              icono={tarjeta.icono}
              color={tarjeta.color}
              descripcion={tarjeta.descripcion}
            />
          ))
        )}
      </div>

      {/* Gráficos y estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ActividadesPorSemana />
        
        <DistribucionProyectos />
      </div>

      {/* Actividades recientes y progreso */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Actividades Recientes</h3>
          <div>
            {loadingActividades ? (
              // Mostrar esqueletos de carga
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="mb-4 animate-pulse">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 mb-2"></div>
                  <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 mb-2"></div>
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))
            ) : actividadesRecientes.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No hay actividades recientes</p>
            ) : (
              actividadesRecientes.map(actividad => (
                <ActividadReciente 
                  key={actividad.id}
                  titulo={actividad.titulo}
                  fecha={actividad.fecha}
                  estado={actividad.estado}
                  tipo={actividad.tipo}
                  nombre_proyecto={actividad.nombre_proyecto}
                />
              ))
            )}
          </div>
          <div className="mt-4">
            <button className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
              Ver todas las actividades
            </button>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-5">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Progreso de Proyectos</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Modernización de Sistemas</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">45%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-blue-600 dark:bg-blue-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Implementación API REX</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">30%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-purple-600 dark:bg-purple-500 h-2.5 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Actualización de Interfaz</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">80%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-green-600 dark:bg-green-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
