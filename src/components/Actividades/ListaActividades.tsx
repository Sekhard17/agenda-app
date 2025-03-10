import React, { useState } from 'react'
import { FiPlus, FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiEdit, FiTrash2, FiFilter } from 'react-icons/fi'
import { Actividad } from '../../services/actividades.service'

interface ListaActividadesProps {
  actividades: Actividad[]
  fechaActual: string
  onCambioFecha: (fecha: string) => void
  onNuevaActividad: () => void
  onEditarActividad: (id: string) => void
  onEliminarActividad: (id: string) => void
  onCambioEstadoCompletada: (id: string, completada: boolean) => void
}

const ListaActividades: React.FC<ListaActividadesProps> = ({
  actividades,
  fechaActual,
  onCambioFecha,
  onNuevaActividad,
  onEditarActividad,
  onEliminarActividad,
  onCambioEstadoCompletada
}) => {
  const [filtro, setFiltro] = useState<'todas' | 'pendientes' | 'completadas'>('todas')

  // Filtrar actividades según los criterios seleccionados
  const actividadesFiltradas = actividades.filter(actividad => {
    // Filtrar por estado (completada/pendiente)
    if (filtro === 'pendientes') {
      return !actividad.completada
    } else if (filtro === 'completadas') {
      return actividad.completada
    }
    return true
  })

  // Obtener color según prioridad
  const getColorPrioridad = (prioridad: 'baja' | 'media' | 'alta') => {
    switch (prioridad) {
      case 'baja': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'alta': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-0">
          Actividades
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Filtro de fecha */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiCalendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="date"
              value={fechaActual}
              onChange={(e) => onCambioFecha(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700 text-gray-700 dark:text-white"
            />
          </div>
          
          {/* Filtro de estado */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value as 'todas' | 'pendientes' | 'completadas')}
              className="pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700 text-gray-700 dark:text-white"
            >
              <option value="todas">Todas</option>
              <option value="pendientes">Pendientes</option>
              <option value="completadas">Completadas</option>
            </select>
          </div>
          
          {/* Botón para agregar actividad */}
          <button
            onClick={onNuevaActividad}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-accent"
          >
            <FiPlus className="mr-2 -ml-1 h-5 w-5" />
            Nueva Actividad
          </button>
        </div>
      </div>
      
      {/* Lista de actividades */}
      {actividadesFiltradas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No hay actividades para mostrar en esta fecha.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {actividadesFiltradas.map((actividad) => (
            <div 
              key={actividad.id}
              className={`border ${actividad.completada ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/30' : 'border-gray-200 dark:border-gray-700'} rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {/* Checkbox para marcar como completada */}
                  <button
                    onClick={() => onCambioEstadoCompletada(actividad.id!, !actividad.completada)}
                    className={`mt-1 flex-shrink-0 ${actividad.completada ? 'text-green-500 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'} hover:text-green-600 dark:hover:text-green-300 transition-colors`}
                  >
                    {actividad.completada ? (
                      <FiCheckCircle className="h-5 w-5" />
                    ) : (
                      <FiXCircle className="h-5 w-5" />
                    )}
                  </button>
                  
                  {/* Contenido de la actividad */}
                  <div className={`${actividad.completada ? 'text-gray-500 dark:text-gray-400' : ''}`}>
                    <h3 className={`text-lg font-medium ${actividad.completada ? 'line-through' : ''}`}>
                      {actividad.titulo}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {actividad.descripcion}
                    </p>
                    
                    {/* Metadatos de la actividad */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {/* Horario */}
                      <div className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <FiClock className="mr-1" />
                        {actividad.hora_inicio} - {actividad.hora_fin}
                      </div>
                      
                      {/* Proyecto (si existe) */}
                      {actividad.proyecto && (
                        <div className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {actividad.proyecto}
                        </div>
                      )}
                      
                      {/* Prioridad */}
                      <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getColorPrioridad(actividad.prioridad)}`}>
                        {actividad.prioridad.charAt(0).toUpperCase() + actividad.prioridad.slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Acciones */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEditarActividad(actividad.id!)}
                    className="text-gray-400 hover:text-primary dark:hover:text-accent"
                    title="Editar"
                  >
                    <FiEdit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => onEliminarActividad(actividad.id!)}
                    className="text-gray-400 hover:text-red-500"
                    title="Eliminar"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ListaActividades
