import React, { useState } from 'react'
import { FiCalendar, FiClock, FiTag, FiFlag, FiX } from 'react-icons/fi'

// Tipos
interface Actividad {
  id?: string
  titulo: string
  descripcion: string
  fecha: string
  horaInicio: string
  horaFin: string
  completada: boolean
  proyecto?: string
  prioridad: 'baja' | 'media' | 'alta'
}

interface FormularioActividadProps {
  actividad?: Actividad
  onSubmit: (actividad: Actividad) => void
  onCancel: () => void
}

const actividadInicial: Actividad = {
  titulo: '',
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0],
  horaInicio: '09:00',
  horaFin: '10:00',
  completada: false,
  prioridad: 'media'
}

const FormularioActividad: React.FC<FormularioActividadProps> = ({
  actividad = actividadInicial,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<Actividad>(actividad)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Manejar cambios en los campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo que se está editando
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.titulo.trim()) {
      newErrors.titulo = 'El título es obligatorio'
    }
    
    if (!formData.fecha) {
      newErrors.fecha = 'La fecha es obligatoria'
    }
    
    if (!formData.horaInicio) {
      newErrors.horaInicio = 'La hora de inicio es obligatoria'
    }
    
    if (!formData.horaFin) {
      newErrors.horaFin = 'La hora de fin es obligatoria'
    }
    
    // Validar que la hora de fin sea posterior a la hora de inicio
    if (formData.horaInicio && formData.horaFin && formData.horaInicio >= formData.horaFin) {
      newErrors.horaFin = 'La hora de fin debe ser posterior a la hora de inicio'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {actividad.id ? 'Editar Actividad' : 'Nueva Actividad'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
        >
          <FiX className="h-6 w-6" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        {/* Título */}
        <div className="mb-4">
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Título
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            className={`block w-full px-3 py-2 border ${
              errors.titulo ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
            } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700 text-gray-700 dark:text-white`}
            placeholder="Título de la actividad"
          />
          {errors.titulo && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.titulo}</p>
          )}
        </div>
        
        {/* Descripción */}
        <div className="mb-4">
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700 text-gray-700 dark:text-white"
            placeholder="Descripción detallada de la actividad"
          />
        </div>
        
        {/* Fecha y Horario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Fecha */}
          <div>
            <label htmlFor="fecha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.fecha ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700 text-gray-700 dark:text-white`}
              />
            </div>
            {errors.fecha && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fecha}</p>
            )}
          </div>
          
          {/* Hora Inicio */}
          <div>
            <label htmlFor="horaInicio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora Inicio
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiClock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="time"
                id="horaInicio"
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.horaInicio ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700 text-gray-700 dark:text-white`}
              />
            </div>
            {errors.horaInicio && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.horaInicio}</p>
            )}
          </div>
          
          {/* Hora Fin */}
          <div>
            <label htmlFor="horaFin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hora Fin
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiClock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="time"
                id="horaFin"
                name="horaFin"
                value={formData.horaFin}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 border ${
                  errors.horaFin ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700 text-gray-700 dark:text-white`}
              />
            </div>
            {errors.horaFin && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.horaFin}</p>
            )}
          </div>
        </div>
        
        {/* Proyecto y Prioridad */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Proyecto */}
          <div>
            <label htmlFor="proyecto" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Proyecto (opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiTag className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="proyecto"
                name="proyecto"
                value={formData.proyecto || ''}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700 text-gray-700 dark:text-white"
                placeholder="Nombre del proyecto"
              />
            </div>
          </div>
          
          {/* Prioridad */}
          <div>
            <label htmlFor="prioridad" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prioridad
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFlag className="h-5 w-5 text-gray-400" />
              </div>
              <select
                id="prioridad"
                name="prioridad"
                value={formData.prioridad}
                onChange={handleChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700 text-gray-700 dark:text-white"
              >
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Botones de acción */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-accent"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-accent"
          >
            {actividad.id ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default FormularioActividad
