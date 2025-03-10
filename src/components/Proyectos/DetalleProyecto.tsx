import React, { useState, useEffect } from 'react';
import { 
  FiX, FiEdit2, FiCalendar, FiClock, FiDollarSign, 
  FiUser, FiCheckCircle, FiAlertCircle, FiBarChart2, 
  FiActivity, FiList
} from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import { ProyectoConResponsable } from '../../hooks/useProyectosCRUD';

interface DetalleProyectoProps {
  proyecto: ProyectoConResponsable;
  onCerrar: () => void;
  onEditar: () => void;
}

interface ActividadProyecto {
  id: string;
  descripcion: string;
  fecha: string;
  estado: string;
  usuario: {
    nombres: string;
    appaterno: string;
  } | null;
}

// Interfaz para los datos de estadísticas
interface EstadisticaActividad {
  estado: string;
}

const DetalleProyecto: React.FC<DetalleProyectoProps> = ({
  proyecto,
  onCerrar,
  onEditar
}) => {
  const [actividades, setActividades] = useState<ActividadProyecto[]>([]);
  const [porcentajeCompletado, setPorcentajeCompletado] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        
        // Obtener actividades recientes del proyecto
        const { data, error } = await supabase
          .from('actividades')
          .select(`
            id,
            descripcion,
            fecha,
            estado,
            usuario:id_usuario (
              nombres,
              appaterno
            )
          `)
          .eq('id_proyecto', proyecto.id)
          .order('fecha', { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        // Transformar los datos para que coincidan con la interfaz ActividadProyecto
        const actividadesFormateadas: ActividadProyecto[] = [];
        
        if (data) {
          for (const item of data) {
            // Verificar y formatear el campo usuario correctamente
            let usuarioFormateado = null;
            
            // Usamos una aserción de tipo para evitar problemas de tipado
            const usuarioData = item.usuario as any;
            
            if (usuarioData) {
              // Si es un array, tomamos el primer elemento
              if (Array.isArray(usuarioData)) {
                if (usuarioData.length > 0) {
                  usuarioFormateado = {
                    nombres: String(usuarioData[0]?.nombres || ''),
                    appaterno: String(usuarioData[0]?.appaterno || '')
                  };
                }
              } else {
                // Si es un objeto, lo usamos directamente
                usuarioFormateado = {
                  nombres: String(usuarioData.nombres || ''),
                  appaterno: String(usuarioData.appaterno || '')
                };
              }
            }
            
            actividadesFormateadas.push({
              id: item.id,
              descripcion: item.descripcion,
              fecha: item.fecha,
              estado: item.estado,
              usuario: usuarioFormateado
            });
          }
        }
        
        setActividades(actividadesFormateadas);
        
        // Obtener estadísticas
        const { data: statsData, error: statsError } = await supabase
          .from('actividades')
          .select('estado', { count: 'exact' })
          .eq('id_proyecto', proyecto.id);
          
        if (statsError) throw statsError;
        
        const total = statsData?.length || 0;
        const completadas = statsData?.filter((a: EstadisticaActividad) => a.estado === 'completado').length || 0;
        
        setPorcentajeCompletado(total > 0 ? Math.round((completadas / total) * 100) : 0);
        
      } catch (err) {
        console.error('Error al cargar datos del proyecto:', err);
        setError('No se pudieron cargar los datos del proyecto');
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, [proyecto.id]);

  // Formatear fechas para mostrar
  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No definida';
    return format(new Date(fecha), 'dd/MM/yyyy', { locale: es });
  };
  
  // Obtener el color según el estado
  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'planificado':
        return 'text-blue-500';
      case 'en_progreso':
        return 'text-amber-500';
      case 'completado':
        return 'text-green-500';
      case 'cancelado':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Obtener el icono según el estado
  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'planificado':
        return <FiClock className="mr-2" />;
      case 'en_progreso':
        return <FiActivity className="mr-2" />;
      case 'completado':
        return <FiCheckCircle className="mr-2" />;
      case 'cancelado':
        return <FiAlertCircle className="mr-2" />;
      default:
        return null;
    }
  };
  
  // Formatear el estado para mostrar
  const formatearEstado = (estado: string) => {
    switch (estado) {
      case 'planificado':
        return 'Planificado';
      case 'en_progreso':
        return 'En Progreso';
      case 'completado':
        return 'Completado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Encabezado */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {proyecto.nombre}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={onEditar}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Editar proyecto"
            >
              <FiEdit2 className="text-blue-500" />
            </button>
            <button
              onClick={onCerrar}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Cerrar"
            >
              <FiX className="text-gray-500" />
            </button>
          </div>
        </div>
        
        {/* Contenido */}
        <div className="p-6">
          {cargando ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <div className="space-y-6">
              {/* Información general */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <FiList className="mr-2" /> Información General
                  </h3>
                  
                  <div className="space-y-3">
                    {proyecto.descripcion && (
                      <p className="text-gray-600 dark:text-gray-400">
                        {proyecto.descripcion}
                      </p>
                    )}
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FiCalendar className="mr-2" />
                      <span className="font-medium mr-2">Fecha inicio:</span>
                      {formatearFecha(proyecto.fecha_inicio)}
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FiCalendar className="mr-2" />
                      <span className="font-medium mr-2">Fecha fin:</span>
                      {formatearFecha(proyecto.fecha_fin)}
                    </div>
                    
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <FiUser className="mr-2" />
                      <span className="font-medium mr-2">Responsable:</span>
                      {proyecto.responsable ? 
                        `${proyecto.responsable.nombres} ${proyecto.responsable.appaterno}` : 
                        'No asignado'}
                    </div>
                    
                    {proyecto.presupuesto !== null && (
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <FiDollarSign className="mr-2" />
                        <span className="font-medium mr-2">Presupuesto:</span>
                        {new Intl.NumberFormat('es-CL', { 
                          style: 'currency', 
                          currency: 'CLP' 
                        }).format(proyecto.presupuesto)}
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <span className={`flex items-center font-medium ${obtenerColorEstado(proyecto.estado)}`}>
                        {obtenerIconoEstado(proyecto.estado)}
                        {formatearEstado(proyecto.estado)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Estadísticas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                    <FiBarChart2 className="mr-2" /> Estadísticas
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Progreso
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {porcentajeCompletado}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: `${porcentajeCompletado}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Estado: <span className="font-medium">{formatearEstado(proyecto.estado)}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Activo: <span className="font-medium">{proyecto.activo ? 'Sí' : 'No'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Actividades recientes */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                  <FiActivity className="mr-2" /> Actividades Recientes
                </h3>
                
                {actividades.length > 0 ? (
                  <div className="space-y-3">
                    {actividades.map(actividad => (
                      <div 
                        key={actividad.id}
                        className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                      >
                        <div className="flex justify-between">
                          <p className="text-gray-800 dark:text-gray-200 font-medium">
                            {actividad.descripcion}
                          </p>
                          <span className={`text-sm ${obtenerColorEstado(actividad.estado)}`}>
                            {formatearEstado(actividad.estado)}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span>
                            {actividad.usuario ? 
                              `${actividad.usuario.nombres} ${actividad.usuario.appaterno}` : 
                              'Usuario desconocido'}
                          </span>
                          <span>{formatearFecha(actividad.fecha)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No hay actividades registradas para este proyecto
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Pie */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <button
            onClick={onCerrar}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetalleProyecto;
