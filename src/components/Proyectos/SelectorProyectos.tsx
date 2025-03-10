import React, { useState, useEffect } from 'react';
import { FiBriefcase, FiClock, FiUsers, FiCalendar, FiSearch } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import './ProyectosStyles.css';

interface Proyecto {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: string;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  responsable: {
    id: string;
    nombres: string;
    appaterno: string;
  } | null;
  actividades_recientes?: number;
}

interface SelectorProyectosProps {
  onSelectProyecto: (proyectoId: string) => void;
}

const SelectorProyectos: React.FC<SelectorProyectosProps> = ({ onSelectProyecto }) => {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [proyectosFiltrados, setProyectosFiltrados] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const { usuario } = useAuth();

  useEffect(() => {
    if (usuario) {
      cargarProyectos();
    }
  }, [usuario]);

  useEffect(() => {
    if (busqueda.trim() === '') {
      setProyectosFiltrados(proyectos);
    } else {
      const termino = busqueda.toLowerCase();
      setProyectosFiltrados(
        proyectos.filter(
          proyecto => 
            proyecto.nombre.toLowerCase().includes(termino) || 
            (proyecto.descripcion && proyecto.descripcion.toLowerCase().includes(termino))
        )
      );
    }
  }, [busqueda, proyectos]);

  const cargarProyectos = async () => {
    try {
      setCargando(true);
      
      let query = supabase
        .from('proyectos')
        .select(`
          id, 
          nombre, 
          descripcion, 
          estado,
          fecha_inicio,
          fecha_fin,
          responsable:usuarios!responsable_id(id, nombres, appaterno)
        `)
        .eq('activo', true);
      
      // Si el usuario es funcionario, solo mostrar proyectos asignados
      if (usuario?.rol === 'funcionario') {
        // Obtener proyectos donde el usuario es responsable
        const { data: proyectosResponsable, error: errorResponsable } = await supabase
          .from('proyectos')
          .select('id')
          .or(`id_supervisor.eq.${usuario.id},responsable_id.eq.${usuario.id}`);
          
        if (errorResponsable) throw errorResponsable;
        
        // Obtener proyectos asignados al usuario
        const { data: asignaciones, error: errorAsignaciones } = await supabase
          .from('asignaciones_tareas')
          .select('id_proyecto')
          .eq('id_funcionario', usuario.id)
          .not('id_proyecto', 'is', null);
          
        if (errorAsignaciones) throw errorAsignaciones;
        
        // Combinar IDs de proyectos
        const proyectosIds = [
          ...(proyectosResponsable?.map(p => p.id) || []),
          ...(asignaciones?.map(a => a.id_proyecto) || [])
        ].filter(Boolean);
        
        // Eliminar duplicados
        const uniqueIds = [...new Set(proyectosIds)];
        
        if (uniqueIds.length > 0) {
          query = query.in('id', uniqueIds);
        } else {
          setProyectos([]);
          setProyectosFiltrados([]);
          setCargando(false);
          return;
        }
      }
      
      const { data, error } = await query.order('nombre');
      
      if (error) throw error;
      
      // Para cada proyecto, obtener el número de actividades recientes (últimos 30 días)
      const proyectosConActividades = await Promise.all(
        (data || []).map(async (proyecto) => {
          const fechaInicio = new Date();
          fechaInicio.setDate(fechaInicio.getDate() - 30);
          
          const { count, error: countError } = await supabase
            .from('actividades')
            .select('id', { count: 'exact' })
            .eq('id_proyecto', proyecto.id)
            .gte('fecha', fechaInicio.toISOString().split('T')[0]);
            
          if (countError) {
            console.error('Error al contar actividades:', countError);
            return {
              ...proyecto,
              actividades_recientes: 0
            };
          }
          
          return {
            ...proyecto,
            actividades_recientes: count || 0
          };
        })
      );
      
      // Asegurarse de que los proyectos tengan la estructura correcta
      const proyectosFormateados: Proyecto[] = proyectosConActividades.map(p => {
        // Asegurarse de que el responsable sea un objeto y no un array
        const responsableObj = p.responsable && Array.isArray(p.responsable) && p.responsable.length > 0 
          ? {
              id: p.responsable[0].id || '',
              nombres: p.responsable[0].nombres || '',
              appaterno: p.responsable[0].appaterno || ''
            }
          : p.responsable && !Array.isArray(p.responsable)
            ? {
                id: p.responsable.id || '',
                nombres: p.responsable.nombres || '',
                appaterno: p.responsable.appaterno || ''
              }
            : null;
            
        return {
          id: p.id || '',
          nombre: p.nombre || '',
          descripcion: p.descripcion,
          estado: p.estado || '',
          fecha_inicio: p.fecha_inicio,
          fecha_fin: p.fecha_fin,
          responsable: responsableObj,
          actividades_recientes: p.actividades_recientes
        };
      });
      
      setProyectos(proyectosFormateados);
      setProyectosFiltrados(proyectosFormateados);
    } catch (error: any) {
      console.error('Error al cargar proyectos:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No definida';
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'planificado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'en_progreso':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completado':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatearEstado = (estado: string) => {
    switch (estado) {
      case 'planificado':
        return 'Planificado';
      case 'en_progreso':
        return 'En progreso';
      case 'completado':
        return 'Completado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Mis Proyectos
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Selecciona un proyecto para ver sus actividades y detalles
        </p>
      </div>
      
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Buscar proyectos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>
      
      {cargando ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : proyectosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <FiBriefcase className="mx-auto text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            No se encontraron proyectos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {busqueda 
              ? 'No hay proyectos que coincidan con tu búsqueda. Intenta con otros términos.' 
              : 'No tienes proyectos asignados. Contacta a tu supervisor para que te asigne a un proyecto.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {proyectosFiltrados.map(proyecto => (
            <div 
              key={proyecto.id}
              onClick={() => onSelectProyecto(proyecto.id)}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700 proyecto-card"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    {proyecto.nombre}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${getColorEstado(proyecto.estado)}`}>
                    {formatearEstado(proyecto.estado)}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                  {proyecto.descripcion || 'Sin descripción'}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FiCalendar className="mr-2" />
                    <span>
                      {formatearFecha(proyecto.fecha_inicio)} - {formatearFecha(proyecto.fecha_fin)}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FiUsers className="mr-2" />
                    <span>
                      {proyecto.responsable 
                        ? `${proyecto.responsable.nombres} ${proyecto.responsable.appaterno}`
                        : 'Sin responsable asignado'}
                    </span>
                  </div>
                  
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FiClock className="mr-2" />
                    <span>
                      {proyecto.actividades_recientes} actividades recientes
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 text-sm text-blue-600 dark:text-blue-400 font-medium">
                Ver actividades
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectorProyectos;
