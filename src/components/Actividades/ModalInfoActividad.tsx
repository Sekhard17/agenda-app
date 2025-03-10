import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FiX, FiCalendar, FiClock, FiUser, FiFileText, FiEdit2, FiTrash2, FiPaperclip } from 'react-icons/fi';
import { Actividad } from '../../hooks/useActividadesDiarias';
import { supabase } from '../../lib/supabase';
import ArchivosAdjuntos from './ArchivosAdjuntos';

interface Documento {
  id: string;
  id_actividad: string;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: string;
  tamaño_bytes: number;
  fecha_creacion: string;
}

interface Proyecto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  estado?: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  responsable?: {
    id: string;
    nombres: string;
    appaterno: string;
  } | null;
}

interface ModalInfoActividadProps {
  isOpen: boolean;
  onClose: () => void;
  actividad: Actividad;
  proyecto: Proyecto;
  onEditar: () => void;
  onEliminar: () => void;
}

const ModalInfoActividad: React.FC<ModalInfoActividadProps> = ({
  isOpen,
  onClose,
  actividad,
  proyecto,
  onEditar,
  onEliminar
}) => {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [cargandoDocumentos, setCargandoDocumentos] = useState(true);
  const [confirmEliminar, setConfirmEliminar] = useState(false);

  useEffect(() => {
    if (isOpen && actividad.id) {
      cargarDocumentos();
    }
  }, [isOpen, actividad.id]);

  const cargarDocumentos = async () => {
    try {
      setCargandoDocumentos(true);
      
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('id_actividad', actividad.id)
        .order('fecha_creacion', { ascending: false });
        
      if (error) throw error;
      
      setDocumentos(data || []);
    } catch (error: any) {
      console.error('Error al cargar documentos:', error.message);
    } finally {
      setCargandoDocumentos(false);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  const formatearHora = (hora: string) => {
    return hora.substring(0, 5);
  };

  const calcularDuracion = (horaInicio: string, horaFin: string) => {
    const inicio = new Date(`2000-01-01T${horaInicio}`);
    const fin = new Date(`2000-01-01T${horaFin}`);
    
    const diffMs = fin.getTime() - inicio.getTime();
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffMins = Math.round((diffMs % 3600000) / 60000);
    
    return `${diffHrs}h ${diffMins}m`;
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

  const handleEliminar = () => {
    if (confirmEliminar) {
      onEliminar();
      setConfirmEliminar(false);
    } else {
      setConfirmEliminar(true);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => {
          setConfirmEliminar(false);
          onClose();
        }}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-3xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
              <div className="flex justify-between items-start mb-4">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  Detalles de la Actividad
                </Dialog.Title>
                
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getColorEstado(actividad.estado)}`}>
                    {formatearEstado(actividad.estado)}
                  </span>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Cerrar</span>
                    <FiX className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <FiCalendar className="mr-2 text-blue-500" />
                    Fecha
                  </div>
                  <p className="text-gray-800 dark:text-white">
                    {formatearFecha(actividad.fecha)}
                  </p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <FiClock className="mr-2 text-blue-500" />
                    Horario
                  </div>
                  <p className="text-gray-800 dark:text-white">
                    {formatearHora(actividad.hora_inicio)} - {formatearHora(actividad.hora_fin)}
                    <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                      ({calcularDuracion(actividad.hora_inicio, actividad.hora_fin)})
                    </span>
                  </p>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-1">
                    <FiUser className="mr-2 text-blue-500" />
                    Registrado por
                  </div>
                  <p className="text-gray-800 dark:text-white">
                    {actividad.usuario[0]?.nombres} {actividad.usuario[0]?.appaterno}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-2">
                  <FiFileText className="mr-2 text-blue-500" />
                  Descripción
                </div>
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <p className="text-gray-800 dark:text-white whitespace-pre-line">
                    {actividad.descripcion}
                  </p>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm mb-2">
                  <FiPaperclip className="mr-2 text-blue-500" />
                  Archivos adjuntos
                  <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                    {documentos.length}
                  </span>
                </div>
                
                {cargandoDocumentos ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : documentos.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No hay archivos adjuntos para esta actividad
                    </p>
                  </div>
                ) : (
                  <ArchivosAdjuntos
                    documentos={documentos}
                    modoVisualizacion={true}
                    onActualizar={cargarDocumentos}
                  />
                )}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Proyecto: <span className="font-medium text-gray-800 dark:text-white">{proyecto.nombre}</span>
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onEditar}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                  >
                    <FiEdit2 className="mr-2 -ml-0.5 h-4 w-4" />
                    Editar
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleEliminar}
                    className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 bg-white dark:bg-gray-700 ${
                      confirmEliminar
                        ? 'border-red-300 text-white bg-red-600 hover:bg-red-700 dark:border-red-700'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    <FiTrash2 className="mr-2 -ml-0.5 h-4 w-4" />
                    {confirmEliminar ? 'Confirmar' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ModalInfoActividad;
