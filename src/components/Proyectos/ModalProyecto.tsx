import React, { useEffect, useState } from 'react';
import { 
  FiX, FiSave, FiCalendar, FiBriefcase, FiUser, 
  FiDollarSign, FiAlertCircle, FiCheck, FiClipboard
} from 'react-icons/fi';
import { ProyectoConResponsable } from '../../hooks/useProyectosCRUD';
import { supabase } from '../../lib/supabase';

interface Usuario {
  id: string;
  nombres: string;
  appaterno: string;
  apmaterno: string;
}

interface ModalProyectoProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (proyecto: ProyectoConResponsable) => Promise<void>;
  proyecto: ProyectoConResponsable | null;
  modo: 'crear' | 'editar';
}

const ModalProyecto: React.FC<ModalProyectoProps> = ({
  isOpen,
  onClose,
  onSubmit,
  proyecto: proyectoInicial,
  modo
}) => {
  const [proyecto, setProyecto] = useState<ProyectoConResponsable>({
    nombre: '',
    descripcion: '',
    activo: true,
    fecha_inicio: null,
    fecha_fin: null,
    responsable_id: null,
    presupuesto: null,
    estado: 'planificado'
  });
  
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  
  // Cargar datos del proyecto si estamos en modo edición
  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true);
      if (proyectoInicial) {
        setProyecto(proyectoInicial);
      } else {
        // Valores por defecto para nuevo proyecto
        setProyecto({
          nombre: '',
          descripcion: '',
          activo: true,
          fecha_inicio: null,
          fecha_fin: null,
          responsable_id: null,
          presupuesto: null,
          estado: 'planificado'
        });
      }
    } else {
      setAnimateIn(false);
    }
  }, [isOpen, proyectoInicial]);
  
  // Cargar lista de usuarios para el selector de responsable
  useEffect(() => {
    if (!isOpen) return;
    
    const cargarUsuarios = async () => {
      setCargandoUsuarios(true);
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombres, appaterno, apmaterno')
          .eq('rol', 'funcionario')  // Filtrar solo funcionarios
          .order('appaterno');
          
        if (error) throw error;
        
        setUsuarios(data || []);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
      } finally {
        setCargandoUsuarios(false);
      }
    };
    
    cargarUsuarios();
  }, [isOpen]);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Manejar diferentes tipos de campos
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProyecto(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'presupuesto') {
      // Convertir a número o null si está vacío
      const numValue = value === '' ? null : parseFloat(value);
      setProyecto(prev => ({ ...prev, [name]: numValue }));
    } else {
      setProyecto(prev => ({ ...prev, [name]: value === '' ? null : value }));
    }
    
    // Limpiar error del campo si existe
    if (errores[name]) {
      setErrores(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Validar formulario antes de enviar
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    
    // Validar nombre (obligatorio)
    if (!proyecto.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del proyecto es obligatorio';
    }
    
    // Validar fechas (fecha fin debe ser posterior a fecha inicio)
    if (proyecto.fecha_inicio && proyecto.fecha_fin) {
      const inicio = new Date(proyecto.fecha_inicio);
      const fin = new Date(proyecto.fecha_fin);
      
      if (fin < inicio) {
        nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    // Validar presupuesto (debe ser un número positivo si se proporciona)
    if (proyecto.presupuesto !== null && proyecto.presupuesto < 0) {
      nuevosErrores.presupuesto = 'El presupuesto debe ser un valor positivo';
    }
    
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };
  
  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      return;
    }
    
    setEnviando(true);
    try {
      await onSubmit(proyecto);
      handleClose();
    } catch (error) {
      console.error('Error al guardar el proyecto:', error);
    } finally {
      setEnviando(false);
    }
  };

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      onClose();
      setErrores({});
    }, 300);
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
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FiBriefcase className="text-blue-500" />
            {modo === 'editar' ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none transition-colors"
            aria-label="Cerrar"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del proyecto */}
            <div>
              <label htmlFor="nombre" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiBriefcase className="text-blue-500" />
                Nombre del proyecto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={proyecto.nombre}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errores.nombre ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ingrese el nombre del proyecto"
                required
              />
              {errores.nombre && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <FiAlertCircle /> {errores.nombre}
                </p>
              )}
            </div>
            
            {/* Descripción */}
            <div>
              <label htmlFor="descripcion" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiClipboard className="text-blue-500" />
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={3}
                value={proyecto.descripcion || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Descripción detallada del proyecto"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {(proyecto.descripcion?.length || 0)} / 500 caracteres
              </p>
            </div>
            
            {/* Estado */}
            <div>
              <label htmlFor="estado" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiCheck className="text-blue-500" />
                Estado
              </label>
              <select
                id="estado"
                name="estado"
                value={proyecto.estado}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="planificado">Planificado</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            
            {/* Fechas (grid de 2 columnas) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fecha_inicio" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FiCalendar className="text-blue-500" />
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  id="fecha_inicio"
                  name="fecha_inicio"
                  value={proyecto.fecha_inicio || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="fecha_fin" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <FiCalendar className="text-blue-500" />
                  Fecha de fin
                </label>
                <input
                  type="date"
                  id="fecha_fin"
                  name="fecha_fin"
                  value={proyecto.fecha_fin || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errores.fecha_fin ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {errores.fecha_fin && (
                  <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                    <FiAlertCircle /> {errores.fecha_fin}
                  </p>
                )}
              </div>
            </div>
            
            {/* Responsable */}
            <div>
              <label htmlFor="responsable_id" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiUser className="text-blue-500" />
                Responsable
              </label>
              <select
                id="responsable_id"
                name="responsable_id"
                value={proyecto.responsable_id || ''}
                onChange={handleChange}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={cargandoUsuarios}
              >
                <option value="">Sin responsable asignado</option>
                {usuarios.map(usuario => (
                  <option key={usuario.id} value={usuario.id}>
                    {`${usuario.nombres} ${usuario.appaterno} ${usuario.apmaterno || ''}`}
                  </option>
                ))}
              </select>
              {cargandoUsuarios && (
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
              )}
            </div>
            
            {/* Presupuesto */}
            <div>
              <label htmlFor="presupuesto" className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <FiDollarSign className="text-blue-500" />
                Presupuesto
              </label>
              <input
                type="number"
                id="presupuesto"
                name="presupuesto"
                value={proyecto.presupuesto === null ? '' : proyecto.presupuesto}
                onChange={handleChange}
                className={`mt-1 block w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errores.presupuesto ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Presupuesto asignado"
                min="0"
                step="0.01"
              />
              {errores.presupuesto && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <FiAlertCircle /> {errores.presupuesto}
                </p>
              )}
            </div>
            
            {/* Activo (checkbox) */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="activo"
                name="activo"
                checked={proyecto.activo}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="activo" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Proyecto activo
              </label>
            </div>
            
            {/* Botones de acción */}
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {enviando ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  <>
                    <FiSave />
                    {modo === 'crear' ? 'Crear Proyecto' : 'Guardar Cambios'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalProyecto;
