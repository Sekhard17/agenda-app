export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          rut: string
          nombres: string
          appaterno: string
          apmaterno: string | null
          email: string
          rol: 'funcionario' | 'supervisor'
          id_supervisor: string | null
          fecha_creacion: string
          fecha_actualizacion: string
        }
        Insert: {
          id: string
          rut: string
          nombres: string
          appaterno: string
          apmaterno?: string | null
          email: string
          rol: 'funcionario' | 'supervisor'
          id_supervisor?: string | null
          fecha_creacion?: string
          fecha_actualizacion?: string
        }
        Update: {
          id?: string
          rut?: string
          nombres?: string
          appaterno?: string
          apmaterno?: string | null
          email?: string
          rol?: 'funcionario' | 'supervisor'
          id_supervisor?: string | null
          fecha_creacion?: string
          fecha_actualizacion?: string
        }
      }
      proyectos: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          id_supervisor: string | null
          id_externo_rex: string | null
          activo: boolean
          fecha_creacion: string
          fecha_actualizacion: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          id_supervisor?: string | null
          id_externo_rex?: string | null
          activo?: boolean
          fecha_creacion?: string
          fecha_actualizacion?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          id_supervisor?: string | null
          id_externo_rex?: string | null
          activo?: boolean
          fecha_creacion?: string
          fecha_actualizacion?: string
        }
      }
      actividades: {
        Row: {
          id: string
          id_usuario: string
          fecha: string
          hora_inicio: string
          hora_fin: string
          descripcion: string
          id_proyecto: string | null
          estado: 'borrador' | 'enviado'
          fecha_creacion: string
          fecha_actualizacion: string
        }
        Insert: {
          id?: string
          id_usuario: string
          fecha: string
          hora_inicio: string
          hora_fin: string
          descripcion: string
          id_proyecto?: string | null
          estado: 'borrador' | 'enviado'
          fecha_creacion?: string
          fecha_actualizacion?: string
        }
        Update: {
          id?: string
          id_usuario?: string
          fecha?: string
          hora_inicio?: string
          hora_fin?: string
          descripcion?: string
          id_proyecto?: string | null
          estado?: 'borrador' | 'enviado'
          fecha_creacion?: string
          fecha_actualizacion?: string
        }
      }
      documentos: {
        Row: {
          id: string
          id_actividad: string
          nombre_archivo: string
          ruta_archivo: string
          tipo_archivo: string | null
          tamaño_bytes: number | null
          fecha_creacion: string
        }
        Insert: {
          id?: string
          id_actividad: string
          nombre_archivo: string
          ruta_archivo: string
          tipo_archivo?: string | null
          tamaño_bytes?: number | null
          fecha_creacion?: string
        }
        Update: {
          id?: string
          id_actividad?: string
          nombre_archivo?: string
          ruta_archivo?: string
          tipo_archivo?: string | null
          tamaño_bytes?: number | null
          fecha_creacion?: string
        }
      }
      asignaciones_tareas: {
        Row: {
          id: string
          id_supervisor: string
          id_funcionario: string
          id_proyecto: string | null
          descripcion: string
          fecha_asignacion: string
          estado: 'pendiente' | 'en_progreso' | 'completada'
          fecha_creacion: string
          fecha_actualizacion: string
        }
        Insert: {
          id?: string
          id_supervisor: string
          id_funcionario: string
          id_proyecto?: string | null
          descripcion: string
          fecha_asignacion: string
          estado: 'pendiente' | 'en_progreso' | 'completada'
          fecha_creacion?: string
          fecha_actualizacion?: string
        }
        Update: {
          id?: string
          id_supervisor?: string
          id_funcionario?: string
          id_proyecto?: string | null
          descripcion?: string
          fecha_asignacion?: string
          estado?: 'pendiente' | 'en_progreso' | 'completada'
          fecha_creacion?: string
          fecha_actualizacion?: string
        }
      }
      notificaciones: {
        Row: {
          id: string
          id_usuario: string
          mensaje: string
          leida: boolean
          tipo: 'asignacion' | 'recordatorio' | 'sistema'
          fecha_creacion: string
        }
        Insert: {
          id?: string
          id_usuario: string
          mensaje: string
          leida?: boolean
          tipo: 'asignacion' | 'recordatorio' | 'sistema'
          fecha_creacion?: string
        }
        Update: {
          id?: string
          id_usuario?: string
          mensaje?: string
          leida?: boolean
          tipo?: 'asignacion' | 'recordatorio' | 'sistema'
          fecha_creacion?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      obtener_actividades_usuario: {
        Args: {
          p_id_usuario: string
          p_fecha_inicio: string
          p_fecha_fin: string
        }
        Returns: {
          id: string
          fecha: string
          hora_inicio: string
          hora_fin: string
          descripcion: string
          id_proyecto: string | null
          nombre_proyecto: string | null
          estado: string
          tiene_documentos: boolean
        }[]
      }
      obtener_actividades_supervisados: {
        Args: {
          p_id_supervisor: string
          p_fecha_inicio: string
          p_fecha_fin: string
        }
        Returns: {
          id: string
          fecha: string
          hora_inicio: string
          hora_fin: string
          descripcion: string
          id_proyecto: string | null
          nombre_proyecto: string | null
          estado: string
          id_usuario: string
          nombres: string
          appaterno: string
          apmaterno: string | null
          tiene_documentos: boolean
        }[]
      }
      validar_rut: {
        Args: {
          rut: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
