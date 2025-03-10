import React, { useState, useEffect } from 'react';
import { FiX, FiSave, FiCalendar } from 'react-icons/fi';
import { ProyectoConResponsable } from '../../hooks/useProyectosCRUD';
import { supabase } from '../../lib/supabase';

interface FormularioProyectoProps {
  proyecto: ProyectoConResponsable | null;
  esEdicion: boolean;
  onGuardar: (proyecto: ProyectoConResponsable) => Promise<void>;
  onCancelar: () => void;
}

interface Usuario {
  id: string;
  nombres: string;
  appaterno: string;
  apmaterno: string;
}

const FormularioProyecto: React.FC<FormularioProyectoProps> = ({
  proyecto,
  esEdicion,
  onGuardar,
  onCancelar
}) => {
  const [formData, setFormData] = useState<ProyectoConResponsable>({
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
  
  // Cargar datos del proyecto si estamos en modo edición
  useEffect(() => {
    if (proyecto) {
      setFormData(proyecto);
    }
  }, [proyecto]);
  
  // Cargar lista de usuarios para el selector de responsable
  useEffect(() => {
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
  }, []);
  
  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Manejar diferentes tipos de campos
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'presupuesto') {
      // Convertir a número o null si está vacío
      const numValue = value === '' ? null : parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre del proyecto es obligatorio';
    }
    
    // Validar fechas (fecha fin debe ser posterior a fecha inicio)
    if (formData.fecha_inicio && formData.fecha_fin) {
      const inicio = new Date(formData.fecha_inicio);
      const fin = new Date(formData.fecha_fin);
      
      if (fin < inicio) {
        nuevosErrores.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }
    
    // Validar presupuesto (debe ser un número positivo si se proporciona)
    if (formData.presupuesto !== null && formData.presupuesto < 0) {
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
      await onGuardar(formData);
    } finally {
      setEnviando(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {esEdicion ? 'Editar Proyecto' : 'Nuevo Proyecto'}
          </h2>
          <button
            onClick={onCancelar}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-130px)]">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Nombre del proyecto */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nombre del proyecto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${
                    errores.nombre ? 'border-red-500' : ''
                  }`}
                  placeholder="Ingrese el nombre del proyecto"
                  required
                />
                {errores.nombre && (
                  <p className="mt-1 text-sm text-red-500">{errores.nombre}</p>
                )}
              </div>
              
              {/* Descripción */}
              <div>
                <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Descripción
                </label>
                <textarea
                  id="descripcion"
                  name="descripcion"
                  rows={3}
                  value={formData.descripcion || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  placeholder="Descripción detallada del proyecto"
                />
              </div>
              
              {/* Estado */}
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  required
                >
                  <option value="planificado">Planificado</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              
              {/* Fechas (inicio y fin) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fecha_inicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha de inicio
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="fecha_inicio"
                      name="fecha_inicio"
                      value={formData.fecha_inicio || ''}
                      onChange={handleChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="fecha_fin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Fecha de fin
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiCalendar className="text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="fecha_fin"
                      name="fecha_fin"
                      value={formData.fecha_fin || ''}
                      onChange={handleChange}
                      className={`pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${
                        errores.fecha_fin ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errores.fecha_fin && (
                    <p className="mt-1 text-sm text-red-500">{errores.fecha_fin}</p>
                  )}
                </div>
              </div>
              
              {/* Responsable */}
              <div>
                <label htmlFor="responsable_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Responsable
                </label>
                <select
                  id="responsable_id"
                  name="responsable_id"
                  value={formData.responsable_id || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                  disabled={cargandoUsuarios}
                >
                  <option value="">Seleccione un responsable</option>
                  {usuarios.map((usuario) => (
                    <option key={usuario.id} value={usuario.id}>
                      {`${usuario.nombres} ${usuario.appaterno} ${usuario.apmaterno}`}
                    </option>
                  ))}
                </select>
                {cargandoUsuarios && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Cargando usuarios...</p>
                )}
              </div>
              
              {/* Presupuesto */}
              <div>
                <label htmlFor="presupuesto" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Presupuesto
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    id="presupuesto"
                    name="presupuesto"
                    value={formData.presupuesto === null ? '' : formData.presupuesto}
                    onChange={handleChange}
                    className={`pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm ${
                      errores.presupuesto ? 'border-red-500' : ''
                    }`}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
                {errores.presupuesto && (
                  <p className="mt-1 text-sm text-red-500">{errores.presupuesto}</p>
                )}
              </div>
              
              {/* Activo (checkbox) */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="activo"
                  name="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData(prev => ({ ...prev, activo: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
                  Proyecto activo
                </label>
              </div>
            </div>
          </form>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancelar}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
            disabled={enviando}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={enviando}
          >
            {enviando ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </span>
            ) : (
              <span className="flex items-center">
                <FiSave className="mr-2" />
                Guardar
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FormularioProyecto;
