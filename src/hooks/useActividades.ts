import { useState, useEffect } from 'react'
import { ActividadesService, Actividad, ActividadFormData } from '../services/actividades.service'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

interface UseActividadesProps {
  fechaInicial?: string
}

export const useActividades = ({ fechaInicial }: UseActividadesProps = {}) => {
  const { usuario } = useAuth()
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fechaActual, setFechaActual] = useState<string>(
    fechaInicial || new Date().toISOString().split('T')[0]
  )

  // Cargar actividades
  const cargarActividades = async () => {
    if (!usuario || !usuario.id) return
    
    setLoading(true)
    setError(null)
    
    try {
      const data = await ActividadesService.obtenerActividadesPorFecha(usuario.id, fechaActual)
      setActividades(data)
    } catch (err: any) {
      console.error('Error al cargar actividades:', err)
      setError(err.message || 'Error al cargar actividades')
      toast.error('Error al cargar actividades', {
        description: err.message || 'No se pudieron cargar las actividades'
      })
    } finally {
      setLoading(false)
    }
  }

  // Cargar actividades al iniciar o cambiar la fecha
  useEffect(() => {
    if (usuario && usuario.id) {
      cargarActividades()
    }
  }, [usuario, fechaActual])

  // Cambiar fecha
  const cambiarFecha = (fecha: string) => {
    setFechaActual(fecha)
  }

  // Crear actividad
  const crearActividad = async (actividad: ActividadFormData) => {
    if (!usuario || !usuario.id) return null
    
    setLoading(true)
    
    try {
      const nuevaActividad = await ActividadesService.crearActividad(actividad, usuario.id)
      
      // Actualizar la lista de actividades solo si la fecha coincide con la actual
      if (nuevaActividad.fecha === fechaActual) {
        setActividades(prev => [...prev, nuevaActividad])
      }
      
      toast.success('Actividad creada', {
        description: 'La actividad se ha creado correctamente'
      })
      
      return nuevaActividad
    } catch (err: any) {
      console.error('Error al crear actividad:', err)
      toast.error('Error al crear actividad', {
        description: err.message || 'No se pudo crear la actividad'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  // Actualizar actividad
  const actualizarActividad = async (id: string, actividad: ActividadFormData) => {
    setLoading(true)
    
    try {
      const actividadActualizada = await ActividadesService.actualizarActividad(id, actividad)
      
      // Si la fecha cambió y ya no coincide con la fecha actual, eliminarla de la lista
      if (actividadActualizada.fecha !== fechaActual) {
        setActividades(prev => prev.filter(act => act.id !== id))
      } else {
        // Actualizar la actividad en la lista
        setActividades(prev => 
          prev.map(act => act.id === id ? actividadActualizada : act)
        )
      }
      
      toast.success('Actividad actualizada', {
        description: 'La actividad se ha actualizado correctamente'
      })
      
      return actividadActualizada
    } catch (err: any) {
      console.error('Error al actualizar actividad:', err)
      toast.error('Error al actualizar actividad', {
        description: err.message || 'No se pudo actualizar la actividad'
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  // Eliminar actividad
  const eliminarActividad = async (id: string) => {
    setLoading(true)
    
    try {
      await ActividadesService.eliminarActividad(id)
      
      // Eliminar la actividad de la lista
      setActividades(prev => prev.filter(act => act.id !== id))
      
      toast.success('Actividad eliminada', {
        description: 'La actividad se ha eliminado correctamente'
      })
      
      return true
    } catch (err: any) {
      console.error('Error al eliminar actividad:', err)
      toast.error('Error al eliminar actividad', {
        description: err.message || 'No se pudo eliminar la actividad'
      })
      return false
    } finally {
      setLoading(false)
    }
  }

  // Cambiar estado de completada
  const cambiarEstadoCompletada = async (id: string, completada: boolean) => {
    try {
      const actividadActualizada = await ActividadesService.cambiarEstadoCompletada(id, completada)
      
      // Actualizar la actividad en la lista
      setActividades(prev => 
        prev.map(act => act.id === id ? actividadActualizada : act)
      )
      
      return actividadActualizada
    } catch (err: any) {
      console.error('Error al cambiar estado de actividad:', err)
      toast.error('Error al cambiar estado', {
        description: err.message || 'No se pudo cambiar el estado de la actividad'
      })
      return null
    }
  }

  // Convertir formato de actividad de la API al formato del formulario
  const convertirAFormatoFormulario = (actividad: Actividad): ActividadFormData => {
    return {
      titulo: actividad.titulo,
      descripcion: actividad.descripcion,
      fecha: actividad.fecha,
      horaInicio: actividad.hora_inicio,
      horaFin: actividad.hora_fin,
      completada: actividad.completada,
      proyecto: actividad.proyecto,
      prioridad: actividad.prioridad
    }
  }

  return {
    actividades,
    loading,
    error,
    fechaActual,
    cambiarFecha,
    cargarActividades,
    crearActividad,
    actualizarActividad,
    eliminarActividad,
    cambiarEstadoCompletada,
    convertirAFormatoFormulario
  }
}
