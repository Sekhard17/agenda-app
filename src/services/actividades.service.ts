import { supabase } from '../lib/supabase'

// Tipos
export interface Actividad {
  id?: string
  titulo: string
  descripcion: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  completada: boolean
  proyecto?: string
  prioridad: 'baja' | 'media' | 'alta'
  id_usuario: string
  created_at?: string
  updated_at?: string
}

export interface ActividadFormData {
  titulo: string
  descripcion: string
  fecha: string
  horaInicio: string
  horaFin: string
  completada: boolean
  proyecto?: string
  prioridad: 'baja' | 'media' | 'alta'
}

export class ActividadesService {
  /**
   * Obtiene todas las actividades de un usuario
   * @param usuarioId ID del usuario
   * @returns Lista de actividades
   */
  static async obtenerActividades(usuarioId: string): Promise<Actividad[]> {
    try {
      const { data, error } = await supabase
        .from('actividades')
        .select('*')
        .eq('id_usuario', usuarioId)
        .order('fecha', { ascending: false })
        .order('hora_inicio', { ascending: true })
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error al obtener actividades:', error)
      throw error
    }
  }

  /**
   * Obtiene las actividades de un usuario para una fecha específica
   * @param usuarioId ID del usuario
   * @param fecha Fecha en formato YYYY-MM-DD
   * @returns Lista de actividades para la fecha especificada
   */
  static async obtenerActividadesPorFecha(usuarioId: string, fecha: string): Promise<Actividad[]> {
    try {
      const { data, error } = await supabase
        .from('actividades')
        .select('*')
        .eq('id_usuario', usuarioId)
        .eq('fecha', fecha)
        .order('hora_inicio', { ascending: true })
      
      if (error) {
        throw error
      }
      
      return data || []
    } catch (error) {
      console.error('Error al obtener actividades por fecha:', error)
      throw error
    }
  }

  /**
   * Crea una nueva actividad
   * @param actividad Datos de la actividad a crear
   * @param usuarioId ID del usuario que crea la actividad
   * @returns La actividad creada
   */
  static async crearActividad(actividad: ActividadFormData, usuarioId: string): Promise<Actividad> {
    try {
      const nuevaActividad: Omit<Actividad, 'id' | 'created_at' | 'updated_at'> = {
        titulo: actividad.titulo,
        descripcion: actividad.descripcion,
        fecha: actividad.fecha,
        hora_inicio: actividad.horaInicio,
        hora_fin: actividad.horaFin,
        completada: actividad.completada,
        proyecto: actividad.proyecto,
        prioridad: actividad.prioridad,
        id_usuario: usuarioId
      }
      
      const { data, error } = await supabase
        .from('actividades')
        .insert(nuevaActividad)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error al crear actividad:', error)
      throw error
    }
  }

  /**
   * Actualiza una actividad existente
   * @param id ID de la actividad a actualizar
   * @param actividad Datos actualizados de la actividad
   * @returns La actividad actualizada
   */
  static async actualizarActividad(id: string, actividad: ActividadFormData): Promise<Actividad> {
    try {
      const actividadActualizada = {
        titulo: actividad.titulo,
        descripcion: actividad.descripcion,
        fecha: actividad.fecha,
        hora_inicio: actividad.horaInicio,
        hora_fin: actividad.horaFin,
        completada: actividad.completada,
        proyecto: actividad.proyecto,
        prioridad: actividad.prioridad,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await supabase
        .from('actividades')
        .update(actividadActualizada)
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error al actualizar actividad:', error)
      throw error
    }
  }

  /**
   * Elimina una actividad
   * @param id ID de la actividad a eliminar
   * @returns true si se eliminó correctamente
   */
  static async eliminarActividad(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('actividades')
        .delete()
        .eq('id', id)
      
      if (error) {
        throw error
      }
      
      return true
    } catch (error) {
      console.error('Error al eliminar actividad:', error)
      throw error
    }
  }

  /**
   * Cambia el estado de completada de una actividad
   * @param id ID de la actividad
   * @param completada Nuevo estado de completada
   * @returns La actividad actualizada
   */
  static async cambiarEstadoCompletada(id: string, completada: boolean): Promise<Actividad> {
    try {
      const { data, error } = await supabase
        .from('actividades')
        .update({ 
          completada,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      console.error('Error al cambiar estado de actividad:', error)
      throw error
    }
  }
}
