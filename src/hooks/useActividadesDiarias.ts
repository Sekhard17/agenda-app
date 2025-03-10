import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { toast } from 'sonner'
import { format } from 'date-fns'

// Interfaces
export interface Actividad {
  id: string
  fecha: string
  hora_inicio: string
  hora_fin: string
  id_proyecto?: string | null
  proyecto: {
    id: string
    nombre: string
  }[]
  descripcion: string
  estado: 'borrador' | 'enviado'
  id_usuario: string
  usuario: {
    id: string
    nombre_usuario: string
    nombres: string
    appaterno: string
  }[]
  fecha_creacion: string
  fecha_actualizacion: string
}

export interface NuevaActividad {
  fecha: string
  hora_inicio: string
  hora_fin: string
  id_proyecto?: string | null
  descripcion: string
  estado?: 'borrador'
  id_usuario: string
  archivos_adjuntos?: File[] // Archivos adjuntos para subir
}

export interface ActualizarActividad {
  id: string
  hora_inicio?: string
  hora_fin?: string
  id_proyecto?: string | null
  descripcion?: string
  estado?: 'borrador' | 'enviado'
}

export const useActividadesDiarias = () => {
  const { usuario } = useAuth()
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [proyectos, setProyectos] = useState<{id: string, nombre: string}[]>([])
  const [funcionarios, setFuncionarios] = useState<{id: string, nombre_usuario: string, nombres: string, appaterno: string}[]>([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  )
  const [funcionarioSeleccionado, setFuncionarioSeleccionado] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)
  const [enviandoAgenda, setEnviandoAgenda] = useState(false)
  
  const esSupervisor = usuario?.rol === 'supervisor'
  
  // Cargar proyectos
  useEffect(() => {
    const cargarProyectos = async () => {
      try {
        if (!usuario) return;
        
        console.log('Cargando proyectos para usuario:', usuario.id, 'Rol:', usuario.rol);
        
        let query = supabase
          .from('proyectos')
          .select('id, nombre')
          .eq('activo', true);
        
        // Si es funcionario, solo cargar proyectos asignados a él
        if (usuario.rol === 'funcionario') {
          // Obtenemos los IDs de proyectos asignados al funcionario a través de asignaciones_tareas
          const { data: asignaciones, error: errorAsignaciones } = await supabase
            .from('asignaciones_tareas')
            .select('id_proyecto')
            .eq('id_funcionario', usuario.id)
            .not('id_proyecto', 'is', null);
          
          console.log('Asignaciones encontradas:', asignaciones);
          
          if (errorAsignaciones) {
            console.error('Error al obtener asignaciones:', errorAsignaciones);
            throw errorAsignaciones;
          }
          
          // También obtenemos proyectos donde el funcionario es responsable o supervisor
          const { data: proyectosResponsable, error: errorProyectos } = await supabase
            .from('proyectos')
            .select('id')
            .or(`id_supervisor.eq.${usuario.id},responsable_id.eq.${usuario.id}`);
            
          console.log('Proyectos donde es responsable o supervisor:', proyectosResponsable);
          
          if (errorProyectos) {
            console.error('Error al obtener proyectos responsable:', errorProyectos);
            throw errorProyectos;
          }
          
          // Combinamos los IDs de proyectos de ambas fuentes
          const proyectosIds = [
            ...(asignaciones?.map(a => a.id_proyecto) || []),
            ...(proyectosResponsable?.map(p => p.id) || [])
          ].filter(Boolean); // Filtramos valores nulos o undefined
          
          console.log('IDs de proyectos combinados:', proyectosIds);
          
          if (proyectosIds.length > 0) {
            // Eliminamos duplicados
            const uniqueIds = [...new Set(proyectosIds)];
            console.log('IDs únicos de proyectos:', uniqueIds);
            query = query.in('id', uniqueIds);
          } else {
            // Si no tiene proyectos asignados, mostrar lista vacía
            console.log('No se encontraron proyectos asignados');
            setProyectos([]);
            return;
          }
        }
        
        const { data, error } = await query.order('nombre');
        
        if (error) {
          console.error('Error al obtener proyectos:', error);
          throw error;
        }
        
        console.log('Proyectos obtenidos:', data);
        setProyectos(data || []);
      } catch (error: any) {
        console.error('Error al cargar proyectos:', error.message);
        toast.error('Error al cargar proyectos');
      }
    };
    
    cargarProyectos();
  }, [usuario]);
  
  // Cargar funcionarios (solo para supervisores)
  useEffect(() => {
    if (!esSupervisor || !usuario) return
    
    const cargarFuncionarios = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, nombre_usuario, nombres, appaterno')
          .eq('rol', 'funcionario')
          .order('appaterno')
        
        if (error) throw error
        
        setFuncionarios(data || [])
      } catch (error: any) {
        console.error('Error al cargar funcionarios:', error.message)
        toast.error('Error al cargar funcionarios')
      }
    }
    
    cargarFuncionarios()
  }, [esSupervisor, usuario])
  
  // Cargar actividades
  useEffect(() => {
    if (!usuario) return
    
    const cargarActividades = async () => {
      setCargando(true)
      try {
        let query = supabase
          .from('actividades')
          .select(`
            id, 
            fecha, 
            hora_inicio, 
            hora_fin, 
            id_proyecto,
            proyecto:proyectos(id, nombre), 
            descripcion, 
            estado, 
            id_usuario, 
            usuario:usuarios(id, nombre_usuario, nombres, appaterno),
            fecha_creacion,
            fecha_actualizacion
          `)
          .eq('fecha', fechaSeleccionada)
        
        // Si es funcionario, solo ver sus actividades
        if (!esSupervisor) {
          query = query.eq('id_usuario', usuario.id)
        } 
        // Si es supervisor y ha seleccionado un funcionario
        else if (funcionarioSeleccionado) {
          query = query.eq('id_usuario', funcionarioSeleccionado)
        }
        
        const { data, error } = await query.order('hora_inicio')
        
        if (error) throw error
        
        // Transformar los datos para manejar los arrays de proyecto y usuario
        const actividadesTransformadas = data?.map(actividad => ({
          ...actividad,
          proyecto: actividad.proyecto?.[0] ? [actividad.proyecto[0]] : [],
          usuario: actividad.usuario?.[0] ? [actividad.usuario[0]] : []
        })) || []
        
        setActividades(actividadesTransformadas)
      } catch (error: any) {
        console.error('Error al cargar actividades:', error.message)
        toast.error('Error al cargar actividades')
      } finally {
        setCargando(false)
      }
    }
    
    cargarActividades()
  }, [usuario, fechaSeleccionada, funcionarioSeleccionado, esSupervisor])
  
  // Verificar si un usuario tiene acceso a un proyecto específico
  const verificarAccesoProyecto = async (idProyecto: string, idUsuario: string): Promise<boolean> => {
    try {
      // Verificar si el usuario es supervisor o responsable del proyecto
      const { data: proyecto, error: errorProyecto } = await supabase
        .from('proyectos')
        .select('id')
        .eq('id', idProyecto)
        .or(`id_supervisor.eq.${idUsuario},responsable_id.eq.${idUsuario}`)
        .single();
      
      if (errorProyecto && errorProyecto.code !== 'PGRST116') { // No es error si no encuentra resultados
        throw errorProyecto;
      }
      
      // Si es supervisor o responsable del proyecto, tiene acceso
      if (proyecto) {
        console.log('Usuario tiene acceso como supervisor o responsable');
        return true;
      }
      
      // Verificar si el usuario tiene asignación al proyecto
      const { data: asignacion, error: errorAsignacion } = await supabase
        .from('asignaciones_tareas')
        .select('id')
        .eq('id_funcionario', idUsuario)
        .eq('id_proyecto', idProyecto)
        .limit(1);
      
      if (errorAsignacion) {
        throw errorAsignacion;
      }
      
      // Si tiene asignación al proyecto, tiene acceso
      const tieneAcceso = asignacion && asignacion.length > 0;
      console.log('Usuario tiene acceso por asignación:', tieneAcceso);
      return tieneAcceso;
    } catch (error: any) {
      console.error('Error al verificar acceso a proyecto:', error.message);
      return false;
    }
  };

  // Agregar actividad
  const agregarActividad = async (nuevaActividad: Omit<NuevaActividad, 'id_usuario'>) => {
    if (!usuario) return null
    
    try {
      // Validar que la hora de fin sea posterior a la hora de inicio
      if (nuevaActividad.hora_inicio >= nuevaActividad.hora_fin) {
        toast.error('La hora de fin debe ser posterior a la hora de inicio')
        return null
      }
      
      // Validar que no haya superposición con otras actividades
      const superposicion = actividades.some(act => {
        return (
          (nuevaActividad.hora_inicio >= act.hora_inicio && nuevaActividad.hora_inicio < act.hora_fin) ||
          (nuevaActividad.hora_fin > act.hora_inicio && nuevaActividad.hora_fin <= act.hora_fin) ||
          (nuevaActividad.hora_inicio <= act.hora_inicio && nuevaActividad.hora_fin >= act.hora_fin)
        )
      })
      
      if (superposicion) {
        toast.error('La actividad se superpone con otra existente')
        return null
      }
      
      // Si se seleccionó un proyecto, verificar que el usuario tenga acceso
      if (nuevaActividad.id_proyecto && !esSupervisor) {
        const tieneAcceso = await verificarAccesoProyecto(
          nuevaActividad.id_proyecto, 
          funcionarioSeleccionado && esSupervisor ? funcionarioSeleccionado : usuario.id
        );
        
        if (!tieneAcceso) {
          toast.error('No tienes acceso a este proyecto');
          return null;
        }
      }
      
      const actividadCompleta: NuevaActividad = {
        ...nuevaActividad,
        id_usuario: funcionarioSeleccionado && esSupervisor ? funcionarioSeleccionado : usuario.id,
        estado: 'borrador' // Aseguramos que siempre tenga estado borrador
      }
      
      // Excluir archivos_adjuntos antes de insertar en la tabla actividades
      const { archivos_adjuntos, ...actividadSinArchivos } = actividadCompleta;
      
      // Insertar la actividad en la base de datos
      const { data, error } = await supabase
        .from('actividades')
        .insert(actividadSinArchivos)
        .select(`
          id, 
          fecha, 
          hora_inicio, 
          hora_fin, 
          id_proyecto,
          proyecto:proyectos(id, nombre), 
          descripcion, 
          estado, 
          id_usuario, 
          usuario:usuarios(id, nombre_usuario, nombres, appaterno),
          fecha_creacion,
          fecha_actualizacion
        `)
        .single()
      
      if (error) throw error
      
      // Subir archivos adjuntos si existen
      if (archivos_adjuntos && archivos_adjuntos.length > 0) {
        for (const archivo of archivos_adjuntos) {
          const fileExt = archivo.name.split('.').pop();
          const fileName = `${data.id}_${Date.now()}.${fileExt}`;
          const filePath = `documentos/${data.id}/${fileName}`;
          
          // Subir archivo a Storage
          const { error: uploadError } = await supabase.storage
            .from('documentos')
            .upload(filePath, archivo);
            
          if (uploadError) {
            console.error('Error al subir archivo:', uploadError);
            toast.error(`Error al subir archivo: ${archivo.name}`);
            continue;
          }
          
          // Obtener URL pública del archivo
          const { data: urlData } = supabase.storage
            .from('documentos')
            .getPublicUrl(filePath);
            
          // Guardar referencia en la tabla documentos
          const { error: docError } = await supabase
            .from('documentos')
            .insert({
              id_actividad: data.id,
              nombre_archivo: archivo.name,
              ruta_archivo: filePath,
              tipo_archivo: archivo.type,
              tamaño_bytes: archivo.size
            });
            
          if (docError) {
            console.error('Error al guardar referencia de documento:', docError);
          }
        }
      }
      
      // Transformar los datos para manejar los arrays de proyecto y usuario
      const actividadTransformada = {
        ...data,
        proyecto: data.proyecto?.[0] ? [data.proyecto[0]] : [],
        usuario: data.usuario?.[0] ? [data.usuario[0]] : []
      }
      
      setActividades(prev => [...prev, actividadTransformada])
      toast.success('Actividad agregada correctamente')
      return actividadTransformada
    } catch (error: any) {
      console.error('Error al agregar actividad:', error.message)
      toast.error('Error al agregar actividad')
      return null
    }
  }
  
  // Actualizar actividad
  const actualizarActividad = async (actividad: ActualizarActividad) => {
    try {
      // Si se están actualizando las horas, validar que no haya superposición
      if (actividad.hora_inicio || actividad.hora_fin) {
        const actividadActual = actividades.find(a => a.id === actividad.id)
        if (!actividadActual) return null
        
        const horaInicio = actividad.hora_inicio || actividadActual.hora_inicio
        const horaFin = actividad.hora_fin || actividadActual.hora_fin
        
        // Validar que la hora de fin sea posterior a la hora de inicio
        if (horaInicio >= horaFin) {
          toast.error('La hora de fin debe ser posterior a la hora de inicio')
          return null
        }
        
        // Validar que no haya superposición con otras actividades
        const superposicion = actividades.some(act => {
          if (act.id === actividad.id) return false // Excluir la actividad actual
          
          return (
            (horaInicio >= act.hora_inicio && horaInicio < act.hora_fin) ||
            (horaFin > act.hora_inicio && horaFin <= act.hora_fin) ||
            (horaInicio <= act.hora_inicio && horaFin >= act.hora_fin)
          )
        })
        
        if (superposicion) {
          toast.error('La actividad se superpone con otra existente')
          return null
        }
      }
      
      const { data, error } = await supabase
        .from('actividades')
        .update({
          ...actividad,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id', actividad.id)
        .select(`
          id, 
          fecha, 
          hora_inicio, 
          hora_fin, 
          id_proyecto,
          proyecto:proyectos(id, nombre), 
          descripcion, 
          estado, 
          id_usuario, 
          usuario:usuarios(id, nombre_usuario, nombres, appaterno),
          fecha_creacion,
          fecha_actualizacion
        `)
        .single()
      
      if (error) throw error
      
      // Transformar los datos para manejar los arrays de proyecto y usuario
      const actividadTransformada = {
        ...data,
        proyecto: data.proyecto?.[0] ? [data.proyecto[0]] : [],
        usuario: data.usuario?.[0] ? [data.usuario[0]] : []
      }
      
      setActividades(prev => 
        prev.map(act => act.id === actividad.id ? actividadTransformada : act)
      )
      
      toast.success('Actividad actualizada correctamente')
      return actividadTransformada
    } catch (error: any) {
      console.error('Error al actualizar actividad:', error.message)
      toast.error('Error al actualizar actividad')
      return null
    }
  }
  
  // Eliminar actividad
  const eliminarActividad = async (id: string) => {
    try {
      const { error } = await supabase
        .from('actividades')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setActividades(prev => prev.filter(act => act.id !== id))
      toast.success('Actividad eliminada correctamente')
      return true
    } catch (error: any) {
      console.error('Error al eliminar actividad:', error.message)
      toast.error('Error al eliminar actividad')
      return false
    }
  }
  
  // Enviar agenda (marcar todas las actividades como enviadas)
  const enviarAgenda = async () => {
    if (!usuario) return false
    
    try {
      setEnviandoAgenda(true)
      
      // Obtener IDs de las actividades a enviar
      const actividadesUsuario = actividades.filter(act => 
        act.id_usuario === (funcionarioSeleccionado || usuario.id)
      )
      
      if (actividadesUsuario.length === 0) {
        toast.error('No hay actividades para enviar')
        return false
      }
      
      const actividadesIds = actividadesUsuario.map(act => act.id)
      
      // Actualizar estado de las actividades
      const { error } = await supabase
        .from('actividades')
        .update({ estado: 'enviado', fecha_actualizacion: new Date().toISOString() })
        .in('id', actividadesIds)
      
      if (error) throw error
      
      // Actualizar estado local
      setActividades(prev => 
        prev.map(act => 
          actividadesIds.includes(act.id) 
            ? { ...act, estado: 'enviado' } 
            : act
        )
      )
      
      // Aquí se podría implementar el envío de correo al supervisor
      
      toast.success('Agenda enviada correctamente')
      return true
    } catch (error: any) {
      console.error('Error al enviar agenda:', error.message)
      toast.error('Error al enviar agenda')
      return false
    } finally {
      setEnviandoAgenda(false)
    }
  }
  
  // Calcular horas totales trabajadas
  const calcularHorasTotales = () => {
    return actividades.reduce((total, actividad) => {
      if (actividad.estado === 'enviado') {
        const inicio = new Date(`2000-01-01T${actividad.hora_inicio}`);
        const fin = new Date(`2000-01-01T${actividad.hora_fin}`);
        const diff = (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60);
        return total + diff;
      }
      return total;
    }, 0);
  }
  
  return {
    actividades,
    proyectos,
    funcionarios,
    fechaSeleccionada,
    setFechaSeleccionada,
    funcionarioSeleccionado,
    setFuncionarioSeleccionado,
    cargando,
    enviandoAgenda,
    esSupervisor,
    agregarActividad,
    actualizarActividad,
    eliminarActividad,
    enviarAgenda,
    calcularHorasTotales
  }
}
