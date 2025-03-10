import React, { useState } from 'react'
import ListaActividades from './ListaActividades'
import FormularioActividad from './FormularioActividad'
import { useActividades } from '../../hooks/useActividades'
import { ActividadFormData } from '../../services/actividades.service'

const GestionActividades: React.FC = () => {
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [actividadEditar, setActividadEditar] = useState<ActividadFormData & { id?: string } | null>(null)
  
  const { 
    actividades, 
    fechaActual,
    cambiarFecha,
    crearActividad,
    actualizarActividad,
    eliminarActividad,
    cambiarEstadoCompletada,
    convertirAFormatoFormulario
  } = useActividades()

  // Abrir formulario para crear nueva actividad
  const abrirFormularioNuevo = () => {
    setActividadEditar(null)
    setMostrarFormulario(true)
  }

  // Abrir formulario para editar actividad existente
  const abrirFormularioEditar = (id: string) => {
    const actividad = actividades.find(act => act.id === id)
    if (actividad) {
      const formData = convertirAFormatoFormulario(actividad)
      // Añadir el id al objeto formData para poder identificar la actividad al actualizar
      setActividadEditar({ ...formData, id: actividad.id })
      setMostrarFormulario(true)
    }
  }

  // Cerrar formulario
  const cerrarFormulario = () => {
    setMostrarFormulario(false)
    setActividadEditar(null)
  }

  // Manejar envío del formulario
  const handleSubmitActividad = async (formData: ActividadFormData) => {
    if (actividadEditar && actividadEditar.id) {
      // Actualizar actividad existente
      await actualizarActividad(actividadEditar.id, formData)
    } else {
      // Crear nueva actividad
      await crearActividad(formData)
    }
    
    cerrarFormulario()
  }

  // Manejar cambio de fecha
  const handleCambioFecha = (fecha: string) => {
    cambiarFecha(fecha)
  }

  // Manejar eliminación de actividad
  const handleEliminarActividad = async (id: string) => {
    await eliminarActividad(id)
  }

  // Manejar cambio de estado completada
  const handleCambioEstadoCompletada = async (id: string, completada: boolean) => {
    await cambiarEstadoCompletada(id, completada)
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {mostrarFormulario ? (
        <FormularioActividad
          actividad={actividadEditar || undefined}
          onSubmit={handleSubmitActividad}
          onCancel={cerrarFormulario}
        />
      ) : (
        <ListaActividades
          actividades={actividades}
          fechaActual={fechaActual}
          onCambioFecha={handleCambioFecha}
          onNuevaActividad={abrirFormularioNuevo}
          onEditarActividad={abrirFormularioEditar}
          onEliminarActividad={handleEliminarActividad}
          onCambioEstadoCompletada={handleCambioEstadoCompletada}
        />
      )}
    </div>
  )
}

export default GestionActividades
