import { supabase } from '../lib/supabase';
import { Actividad } from '../hooks/useActividadesDiarias';

export interface Usuario {
  id: string;
  nombre_usuario: string;
  nombres: string;
  appaterno: string;
}

export interface DiaActividad {
  fecha: string;
  actividades: number;
}

/**
 * Obtiene los días que tienen actividades en un rango de fechas para un proyecto específico
 */
export const obtenerDiasConActividades = async (
  proyectoId: string,
  fechaInicio: Date,
  fechaFin: Date
): Promise<DiaActividad[]> => {
  try {
    const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
    const fechaFinStr = fechaFin.toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('actividades')
      .select('fecha, id')
      .eq('id_proyecto', proyectoId)
      .gte('fecha', fechaInicioStr)
      .lte('fecha', fechaFinStr);
      
    if (error) throw error;
    
    // Agrupar actividades por fecha
    const actividadesPorDia: Record<string, number> = {};
    
    (data || []).forEach(actividad => {
      if (actividadesPorDia[actividad.fecha]) {
        actividadesPorDia[actividad.fecha]++;
      } else {
        actividadesPorDia[actividad.fecha] = 1;
      }
    });
    
    // Convertir a array de objetos
    const diasConActividades = Object.keys(actividadesPorDia).map(fecha => ({
      fecha,
      actividades: actividadesPorDia[fecha]
    }));
    
    return diasConActividades;
  } catch (error: any) {
    console.error('Error al cargar días con actividades:', error.message);
    return [];
  }
};

/**
 * Obtiene las actividades para una fecha y proyecto específicos
 */
export const obtenerActividadesPorDia = async (
  fecha: string,
  proyectoId: string
): Promise<Actividad[]> => {
  try {
    const { data, error } = await supabase
      .from('actividades')
      .select(`
        id, 
        fecha, 
        hora_inicio, 
        hora_fin, 
        descripcion, 
        estado,
        id_usuario,
        usuario:id_usuario (
          id,
          nombre_usuario,
          nombres,
          appaterno
        ),
        proyecto:id_proyecto (
          id,
          nombre
        )
      `)
      .eq('fecha', fecha)
      .eq('id_proyecto', proyectoId);
      
    if (error) throw error;
    
    // Transformar los datos para manejar correctamente el formato de usuario
    const actividadesFormateadas = (data || []).map(actividad => {
      // Manejar el caso cuando usuario es un objeto en lugar de un array
      let usuarioFormateado: Usuario[] = [];
      
      if (actividad.usuario) {
        if (Array.isArray(actividad.usuario)) {
          usuarioFormateado = actividad.usuario.map((u: any) => ({
            id: u.id || '',
            nombre_usuario: u.nombre_usuario || '',
            nombres: u.nombres || '',
            appaterno: u.appaterno || ''
          }));
        } else {
          const u = actividad.usuario as any;
          usuarioFormateado = [{
            id: u.id || '',
            nombre_usuario: u.nombre_usuario || '',
            nombres: u.nombres || '',
            appaterno: u.appaterno || ''
          }];
        }
      }
      
      // Crear una nueva actividad con todas las propiedades necesarias
      const nuevaActividadBase = {
        id: actividad.id || '',
        fecha: actividad.fecha || '',
        hora_inicio: actividad.hora_inicio || '',
        hora_fin: actividad.hora_fin || '',
        descripcion: actividad.descripcion || '',
        estado: (actividad.estado as 'borrador' | 'enviado') || 'borrador',
        id_usuario: actividad.id_usuario || '',
        usuario: usuarioFormateado,
        proyecto: []
      };
      
      // Convertir a unknown primero y luego a Actividad para evitar errores de tipado
      const nuevaActividad = nuevaActividadBase as unknown as Actividad;
      
      // Asignar las fechas como propiedades adicionales si existen
      if ((actividad as any).fecha_creacion) {
        (nuevaActividad as any).fecha_creacion = (actividad as any).fecha_creacion;
      } else {
        (nuevaActividad as any).fecha_creacion = new Date().toISOString();
      }
      
      if ((actividad as any).fecha_actualizacion) {
        (nuevaActividad as any).fecha_actualizacion = (actividad as any).fecha_actualizacion;
      } else {
        (nuevaActividad as any).fecha_actualizacion = new Date().toISOString();
      }
      
      return nuevaActividad;
    });
    
    return actividadesFormateadas;
  } catch (error: any) {
    console.error('Error al cargar actividades por día:', error.message);
    return [];
  }
};

/**
 * Obtiene todas las actividades para un proyecto específico
 */
export const obtenerActividadesProyecto = async (
  proyectoId: string,
  fecha?: string
): Promise<Actividad[]> => {
  try {
    let query = supabase
      .from('actividades')
      .select(`
        id, 
        fecha, 
        hora_inicio, 
        hora_fin, 
        descripcion, 
        estado,
        id_usuario,
        usuario:id_usuario (
          id,
          nombre_usuario,
          nombres,
          appaterno
        ),
        proyecto:id_proyecto (
          id,
          nombre
        )
      `)
      .eq('id_proyecto', proyectoId);
    
    // Si se proporciona una fecha, filtrar por esa fecha
    if (fecha) {
      query = query.eq('fecha', fecha);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transformar los datos para manejar correctamente el formato de usuario
    const actividadesFormateadas = (data || []).map(actividad => {
      // Manejar el caso cuando usuario es un objeto en lugar de un array
      let usuarioFormateado: Usuario[] = [];
      
      if (actividad.usuario) {
        if (Array.isArray(actividad.usuario)) {
          usuarioFormateado = actividad.usuario.map((u: any) => ({
            id: u.id || '',
            nombre_usuario: u.nombre_usuario || '',
            nombres: u.nombres || '',
            appaterno: u.appaterno || ''
          }));
        } else {
          const u = actividad.usuario as any;
          usuarioFormateado = [{
            id: u.id || '',
            nombre_usuario: u.nombre_usuario || '',
            nombres: u.nombres || '',
            appaterno: u.appaterno || ''
          }];
        }
      }
      
      // Crear una nueva actividad con todas las propiedades necesarias
      const nuevaActividadBase = {
        id: actividad.id || '',
        fecha: actividad.fecha || '',
        hora_inicio: actividad.hora_inicio || '',
        hora_fin: actividad.hora_fin || '',
        descripcion: actividad.descripcion || '',
        estado: (actividad.estado as 'borrador' | 'enviado') || 'borrador',
        id_usuario: actividad.id_usuario || '',
        usuario: usuarioFormateado,
        proyecto: []
      };
      
      // Convertir a unknown primero y luego a Actividad para evitar errores de tipado
      const nuevaActividad = nuevaActividadBase as unknown as Actividad;
      
      // Asignar las fechas como propiedades adicionales si existen
      if ((actividad as any).fecha_creacion) {
        (nuevaActividad as any).fecha_creacion = (actividad as any).fecha_creacion;
      } else {
        (nuevaActividad as any).fecha_creacion = new Date().toISOString();
      }
      
      if ((actividad as any).fecha_actualizacion) {
        (nuevaActividad as any).fecha_actualizacion = (actividad as any).fecha_actualizacion;
      } else {
        (nuevaActividad as any).fecha_actualizacion = new Date().toISOString();
      }
      
      return nuevaActividad;
    });
    
    return actividadesFormateadas;
  } catch (error: any) {
    console.error('Error al cargar actividades del proyecto:', error.message);
    return [];
  }
};
