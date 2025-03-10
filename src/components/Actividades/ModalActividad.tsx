import React, { useEffect, useState } from 'react';
import { FiCalendar, FiClock, FiBriefcase, FiAlignLeft, FiX, FiCheck, FiAlertCircle, FiInfo, FiPaperclip, FiHelpCircle } from 'react-icons/fi';
import { NuevaActividad } from '../../hooks/useActividadesDiarias';
// Importaciones de FilePond
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

// Registrar plugins de FilePond
registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

interface ModalActividadProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (actividad: Omit<NuevaActividad, 'id_usuario'>) => void;
  actividad: Omit<NuevaActividad, 'id_usuario'>;
  proyectos: any[];
  titulo?: string;
  modo?: 'crear' | 'editar';
}

const ModalActividad: React.FC<ModalActividadProps> = ({
  isOpen,
  onClose,
  onSubmit,
  actividad: actividadInicial,
  proyectos,
  titulo = 'Nueva Actividad',
  modo = 'crear'
}) => {
  const [actividad, setActividad] = useState<Omit<NuevaActividad, 'id_usuario'>>({
    ...actividadInicial,
    archivos_adjuntos: actividadInicial.archivos_adjuntos || []
  });
  const [errores, setErrores] = useState<{[key: string]: string}>({});
  const [animateIn, setAnimateIn] = useState(false);
  const [duracion, setDuracion] = useState('');
  const [mostrarTips, setMostrarTips] = useState(false);
  const [files, setFiles] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true);
      setActividad({
        ...actividadInicial,
        archivos_adjuntos: actividadInicial.archivos_adjuntos || []
      });
      calcularDuracion();
    } else {
      setAnimateIn(false);
    }
  }, [isOpen, actividadInicial]);

  useEffect(() => {
    calcularDuracion();
  }, [actividad.hora_inicio, actividad.hora_fin]);

  const calcularDuracion = () => {
    if (!actividad.hora_inicio || !actividad.hora_fin) {
      setDuracion('');
      return;
    }

    try {
      const inicio = new Date(`2000-01-01T${actividad.hora_inicio}`);
      const fin = new Date(`2000-01-01T${actividad.hora_fin}`);
      
      if (fin < inicio) {
        setDuracion('Hora fin debe ser posterior a hora inicio');
        return;
      }
      
      const diff = (fin.getTime() - inicio.getTime()) / (1000 * 60);
      const horas = Math.floor(diff / 60);
      const minutos = Math.floor(diff % 60);
      
      setDuracion(`${horas} h ${minutos} min`);
    } catch (error) {
      setDuracion('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setActividad(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error cuando se modifica el campo
    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: {[key: string]: string} = {};
    
    if (!actividad.fecha) {
      nuevosErrores.fecha = 'La fecha es requerida';
    }
    
    if (!actividad.hora_inicio) {
      nuevosErrores.hora_inicio = 'La hora de inicio es requerida';
    }
    
    if (!actividad.hora_fin) {
      nuevosErrores.hora_fin = 'La hora de fin es requerida';
    } else if (actividad.hora_inicio && actividad.hora_fin) {
      const inicio = new Date(`2000-01-01T${actividad.hora_inicio}`);
      const fin = new Date(`2000-01-01T${actividad.hora_fin}`);
      
      if (fin <= inicio) {
        nuevosErrores.hora_fin = 'La hora de fin debe ser posterior a la hora de inicio';
      }
    }
    
    if (!actividad.descripcion) {
      nuevosErrores.descripcion = 'La descripción es requerida';
    } else if (actividad.descripcion.length < 5) {
      nuevosErrores.descripcion = 'La descripción debe tener al menos 5 caracteres';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validarFormulario()) {
      // Convertir los archivos de FilePond al formato esperado por la API
      const actividadConArchivos = {
        ...actividad,
        archivos_adjuntos: files.map(fileItem => fileItem.file)
      };
      
      onSubmit(actividadConArchivos);
      handleClose();
    }
  };

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      onClose();
      setErrores({});
      setFiles([]);
    }, 300);
  };

  const toggleTips = () => {
    setMostrarTips(!mostrarTips);
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 z-50 flex items-center justify-center p-4 ${
        animateIn ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl transform transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <FiX className="text-xl" />
          </button>

          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              {modo === 'crear' ? (
                <FiCalendar className="text-blue-500" />
              ) : (
                <FiCheck className="text-green-500" />
              )}
              {titulo}
              
              <button 
                onClick={toggleTips}
                className="ml-auto text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                aria-label="Mostrar consejos"
              >
                <FiHelpCircle className="text-lg" />
              </button>
            </h2>
            
            {mostrarTips && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                <h3 className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-2 mb-2">
                  <FiInfo className="text-blue-500" /> Consejos para registrar actividades
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 ml-6 list-disc">
                  <li>Sé específico en la descripción de la actividad realizada.</li>
                  <li>Asigna la actividad a un proyecto para mejor organización.</li>
                  <li>Adjunta capturas de pantalla o documentos que evidencien tu trabajo.</li>
                  <li>Registra las actividades el mismo día que las realizas para mayor precisión.</li>
                  <li>Verifica que no haya superposición con otras actividades.</li>
                </ul>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                    <FiCalendar className="text-blue-500" />
                    <span>Fecha</span>
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={actividad.fecha}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errores.fecha ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errores.fecha && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <FiAlertCircle /> {errores.fecha}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                    <FiBriefcase className="text-blue-500" />
                    <span>Proyecto</span>
                  </label>
                  {proyectos.length > 0 ? (
                    <>
                      <select
                        name="id_proyecto"
                        value={actividad.id_proyecto || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <option value="">Seleccionar proyecto</option>
                        {proyectos.map(proyecto => (
                          <option key={proyecto.id} value={proyecto.id}>
                            {proyecto.nombre}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Solo se muestran los proyectos asignados a ti o donde eres responsable.
                      </p>
                    </>
                  ) : (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                        <FiAlertCircle className="text-yellow-500" />
                        No tienes proyectos asignados. Contacta a tu supervisor para que te asigne a un proyecto.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                    <FiClock className="text-blue-500" />
                    <span>Hora inicio</span>
                  </label>
                  <input
                    type="time"
                    name="hora_inicio"
                    value={actividad.hora_inicio}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errores.hora_inicio ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errores.hora_inicio && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <FiAlertCircle /> {errores.hora_inicio}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                    <FiClock className="text-blue-500" />
                    <span>Hora fin</span>
                  </label>
                  <input
                    type="time"
                    name="hora_fin"
                    value={actividad.hora_fin}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errores.hora_fin ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {errores.hora_fin && (
                    <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                      <FiAlertCircle /> {errores.hora_fin}
                    </p>
                  )}
                </div>
              </div>
              
              {duracion && (
                <div className={`text-sm ${duracion.includes('debe') ? 'text-red-500' : 'text-blue-500 dark:text-blue-400'} font-medium flex items-center gap-1`}>
                  <FiInfo /> Duración: {duracion}
                </div>
              )}
              
              <div>
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                  <FiAlignLeft className="text-blue-500" />
                  <span>Descripción</span>
                </label>
                <textarea
                  name="descripcion"
                  value={actividad.descripcion}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errores.descripcion ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  rows={3}
                  placeholder="Describe la actividad realizada..."
                />
                {errores.descripcion && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <FiAlertCircle /> {errores.descripcion}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {actividad.descripcion.length} / 500 caracteres
                </p>
              </div>
              
              <div>
                <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-1">
                  <FiPaperclip className="text-blue-500" />
                  <span>Archivos adjuntos</span>
                </label>
                <FilePond
                  files={files}
                  onupdatefiles={setFiles}
                  allowMultiple={true}
                  maxFiles={5}
                  name="archivos"
                  labelIdle='Arrastra y suelta archivos aquí o <span class="filepond--label-action">Examinar</span>'
                  acceptedFileTypes={['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                  maxFileSize="5MB"
                  credits={false}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Puedes adjuntar hasta 5 archivos (imágenes, PDF, documentos). Máximo 5MB por archivo.
                </p>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                >
                  {modo === 'crear' ? 'Crear actividad' : 'Actualizar actividad'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalActividad;
