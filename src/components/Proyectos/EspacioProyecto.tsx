import React, { useState, useEffect } from 'react';
import { FiArrowLeft, FiCalendar, FiClock, FiUsers, FiPieChart, FiInfo, FiPlus, FiList } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';
import { Actividad } from '../../hooks/useActividadesDiarias';
// Las importaciones de date-fns se han eliminado ya que no se utilizan
import ModalActividad from '../Actividades/ModalActividad';
import ModalInfoActividad from '../Actividades/ModalInfoActividad';
import CalendarioActividades from '../Actividades/CalendarioActividades';
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
}

interface EspacioProyectoProps {
  proyectoId: string;
  onVolver: () => void;
}

const EspacioProyecto: React.FC<EspacioProyectoProps> = ({ proyectoId, onVolver }) => {
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [cargando, setCargando] = useState(true);
  const [cargandoActividades, setCargandoActividades] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [modalActividadAbierto, setModalActividadAbierto] = useState(false);
  const [modalInfoAbierto, setModalInfoAbierto] = useState(false);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null);
  const [vistaCalendario, setVistaCalendario] = useState(false);

  useEffect(() => {
    if (proyectoId) {
      cargarProyecto();
      cargarActividades();
    }
  }, [proyectoId, fechaSeleccionada]);

  const cargarProyecto = async () => {
    try {
      setCargando(true);
      
      const { data, error } = await supabase
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
        .eq('id', proyectoId)
        .single();
        
      if (error) throw error;
      
      // Verificar y formatear el responsable
      let responsableFormateado = null;
      
      if (data.responsable) {
        // Si es un array, tomar el primer elemento
        if (Array.isArray(data.responsable) && data.responsable.length > 0) {
          const resp = data.responsable[0];
          responsableFormateado = {
            id: resp?.id || '',
            nombres: resp?.nombres || '',
            appaterno: resp?.appaterno || ''
          };
        } 
        // Si es un objeto, usarlo directamente
        else if (typeof data.responsable === 'object' && data.responsable !== null) {
          const resp = data.responsable as any;
          responsableFormateado = {
            id: resp?.id || '',
            nombres: resp?.nombres || '',
            appaterno: resp?.appaterno || ''
          };
        }
      }
      
      const proyectoFormateado: Proyecto = {
        id: data.id || '',
        nombre: data.nombre || '',
        descripcion: data.descripcion,
        estado: data.estado || '',
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        responsable: responsableFormateado
      };
      
      setProyecto(proyectoFormateado);
    } catch (error: any) {
      console.error('Error al cargar proyecto:', error.message);
    } finally {
      setCargando(false);
    }
  };

  const cargarActividades = async () => {
    try {
      setCargandoActividades(true);
      
      const { data, error } = await supabase
        .from('actividades')
        .select(`
          id, 
          fecha, 
          hora_inicio, 
          hora_fin, 
          descripcion, 
          estado,
          id_usuario,
          usuario:usuarios(id, nombre_usuario, nombres, appaterno)
        `)
        .eq('id_proyecto', proyectoId)
        .eq('fecha', fechaSeleccionada)
        .order('hora_inicio');
        
      if (error) throw error;
      
      // Transformar los datos para manejar los arrays de usuario
      const actividadesTransformadas = (data || []).map(actividad => {
        // Definir la interfaz para el usuario
        interface Usuario {
          id: string;
          nombre_usuario: string;
          nombres: string;
          appaterno: string;
        }
        
        // Asegurarse de que usuario sea un array de objetos, no un array de arrays
        let usuarioFormateado: Usuario[] = [];
        
        if (actividad.usuario) {
          // Verificar si actividad.usuario es un array
          if (Array.isArray(actividad.usuario)) {
            usuarioFormateado = actividad.usuario.map((u: any) => ({
              id: u.id || '',
              nombre_usuario: u.nombre_usuario || '',
              nombres: u.nombres || '',
              appaterno: u.appaterno || ''
            }));
          } else {
            // Si no es un array, tratarlo como un objeto individual
            const u: any = actividad.usuario;
            usuarioFormateado = [{
              id: u.id || '',
              nombre_usuario: u.nombre_usuario || '',
              nombres: u.nombres || '',
              appaterno: u.appaterno || ''
            }];
          }
        }
        
        // Crear una nueva actividad con todas las propiedades necesarias
        const nuevaActividadBase = {
          id: actividad.id || '',
          fecha: actividad.fecha || '',
          hora_inicio: actividad.hora_inicio || '',
          hora_fin: actividad.hora_fin || '',
          descripcion: actividad.descripcion || '',
          estado: (actividad.estado as 'borrador' | 'enviado') || 'borrador',
          id_usuario: actividad.id_usuario || '',
          usuario: usuarioFormateado,
          proyecto: []
        };
        
        // Convertir a unknown primero y luego a Actividad para evitar errores de tipado
        const nuevaActividad = nuevaActividadBase as unknown as Actividad;
        
        // Asignar las fechas como propiedades adicionales si existen
        if ((actividad as any).fecha_creacion) {
          (nuevaActividad as any).fecha_creacion = (actividad as any).fecha_creacion;
        } else {
          (nuevaActividad as any).fecha_creacion = new Date().toISOString();
        }
        
        if ((actividad as any).fecha_actualizacion) {
          (nuevaActividad as any).fecha_actualizacion = (actividad as any).fecha_actualizacion;
        } else {
          (nuevaActividad as any).fecha_actualizacion = new Date().toISOString();
        }
        
        return nuevaActividad;
      });
      
      setActividades(actividadesTransformadas);
    } catch (error: any) {
      console.error('Error al cargar actividades:', error.message);
    } finally {
      setCargandoActividades(false);
    }
  };

  const handleNuevaActividad = () => {
    setActividadSeleccionada(null);
    setModalActividadAbierto(true);
  };

  const handleVerActividad = (actividad: Actividad) => {
    setActividadSeleccionada(actividad);
    setModalInfoAbierto(true);
  };

  const handleCambioFecha = (fecha: string) => {
    setFechaSeleccionada(fecha);
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No definida';
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  const formatearHora = (hora: string) => {
    return hora.substring(0, 5);
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
      case 'borrador':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'enviado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
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
      case 'borrador':
        return 'Borrador';
      case 'enviado':
        return 'Enviado';
      default:
        return estado;
    }
  };

  if (cargando) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!proyecto) {
    return (
      <div className="text-center py-12">
        <FiInfo className="mx-auto text-4xl text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
          Proyecto no encontrado
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
          No se pudo encontrar el proyecto solicitado o no tienes permisos para acceder a él.
        </p>
        <button
          onClick={onVolver}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
        >
          Volver a mis proyectos
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={onVolver}
        className="flex items-center px-3 py-1.5 rounded-md bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Volver a mis proyectos
      </button>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {proyecto.nombre}
            </h1>
            <span className={`text-xs px-2 py-1 rounded-full ${getColorEstado(proyecto.estado)}`}>
              {formatearEstado(proyecto.estado)}
            </span>
          </div>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {proyecto.descripcion || 'Sin descripción'}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiCalendar className="mr-2 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Período</p>
                <p>{formatearFecha(proyecto.fecha_inicio)} - {formatearFecha(proyecto.fecha_fin)}</p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiUsers className="mr-2 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Responsable</p>
                <p>
                  {proyecto.responsable 
                    ? `${proyecto.responsable.nombres} ${proyecto.responsable.appaterno}`
                    : 'Sin responsable asignado'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <FiPieChart className="mr-2 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                <p>{formatearEstado(proyecto.estado)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Actividades
          </h2>
          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => setVistaCalendario(false)}
              className={`p-1.5 rounded-md ${
                !vistaCalendario 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              } transition-colors`}
              title="Vista de lista"
            >
              <FiList />
            </button>
            <button
              onClick={() => setVistaCalendario(true)}
              className={`p-1.5 rounded-md ${
                vistaCalendario 
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                  : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              } transition-colors`}
              title="Vista de calendario"
            >
              <FiCalendar />
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {!vistaCalendario && (
            <div className="flex items-center">
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => handleCambioFecha(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}
          
          <button
            onClick={handleNuevaActividad}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors boton-accion"
          >
            <FiPlus className="mr-2" />
            Nueva actividad
          </button>
        </div>
      </div>
      
      {vistaCalendario ? (
        <CalendarioActividades 
          proyectoId={proyectoId}
          onSelectFecha={handleCambioFecha}
          onNuevaActividad={handleNuevaActividad}
          onVerActividad={handleVerActividad}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          {cargandoActividades ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : actividades.length === 0 ? (
            <div className="text-center py-12">
              <FiClock className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                No hay actividades para esta fecha
              </h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                No se encontraron actividades registradas para el {new Date(fechaSeleccionada).toLocaleDateString('es-CL')}.
              </p>
              <button
                onClick={handleNuevaActividad}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
              >
                Registrar actividad
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {actividades.map(actividad => (
                <div 
                  key={actividad.id}
                  onClick={() => handleVerActividad(actividad)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors actividad-item"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                      <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 p-2 rounded-lg mr-4">
                        <FiClock />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {formatearHora(actividad.hora_inicio)} - {formatearHora(actividad.hora_fin)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {actividad.usuario[0]?.nombres} {actividad.usuario[0]?.appaterno}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getColorEstado(actividad.estado)}`}>
                      {formatearEstado(actividad.estado)}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 ml-14 line-clamp-2">
                    {actividad.descripcion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {modalActividadAbierto && (
        <ModalActividad
          isOpen={modalActividadAbierto}
          onClose={() => setModalActividadAbierto(false)}
          onSubmit={() => {
            // Aquí implementar la lógica para guardar la actividad
            // y luego recargar las actividades
            setModalActividadAbierto(false);
            cargarActividades();
          }}
          actividad={{
            fecha: fechaSeleccionada,
            hora_inicio: '',
            hora_fin: '',
            id_proyecto: proyectoId,
            descripcion: ''
          }}
          proyectos={[{id: proyectoId, nombre: proyecto.nombre}]}
          titulo="Nueva Actividad"
          modo="crear"
        />
      )}
      
      {modalInfoAbierto && actividadSeleccionada && (
        <ModalInfoActividad
          isOpen={modalInfoAbierto}
          onClose={() => setModalInfoAbierto(false)}
          actividad={actividadSeleccionada}
          proyecto={proyecto}
          onEditar={() => {
            setModalInfoAbierto(false);
            // Aquí implementar la lógica para abrir el modal de edición
          }}
          onEliminar={() => {
            // Aquí implementar la lógica para eliminar la actividad
            setModalInfoAbierto(false);
            cargarActividades();
          }}
        />
      )}
    </div>
  );
};

export default EspacioProyecto;
