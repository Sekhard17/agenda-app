import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// Definición de tipos
export interface Proyecto {
  id?: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  responsable_id: string | null;
  presupuesto: number | null;
  estado: 'planificado' | 'en_progreso' | 'completado' | 'cancelado';
}

export interface ProyectoConResponsable extends Proyecto {
  responsable?: {
    nombres: string;
    appaterno: string;
    apmaterno: string;
  } | null;
}

export interface UseProyectosCRUDResult {
  proyectos: ProyectoConResponsable[];
  loading: boolean;
  error: string | null;
  crearProyecto: (proyecto: Proyecto) => Promise<string | null>;
  actualizarProyecto: (id: string, proyecto: Partial<Proyecto>) => Promise<boolean>;
  eliminarProyecto: (id: string) => Promise<boolean>;
  obtenerProyecto: (id: string) => Promise<ProyectoConResponsable | null>;
  obtenerProyectos: (incluirInactivos?: boolean) => Promise<void>;
}

/**
 * Hook personalizado para gestionar operaciones CRUD de proyectos
 */
export const useProyectosCRUD = (): UseProyectosCRUDResult => {
  const [proyectos, setProyectos] = useState<ProyectoConResponsable[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene la lista de proyectos
   */
  const obtenerProyectos = async (incluirInactivos: boolean = false): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('proyectos')
        .select(`
          *,
          responsable:responsable_id(
            nombres,
            appaterno,
            apmaterno
          )
        `)
        .order('nombre');

      // Si no se incluyen inactivos, filtrar solo por activos
      if (!incluirInactivos) {
        query = query.eq('activo', true);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) throw supabaseError;

      setProyectos(data || []);
    } catch (err: any) {
      console.error('Error al obtener proyectos:', err);
      setError('No se pudieron cargar los proyectos');
      toast.error('Error al cargar proyectos', {
        description: err.message || 'Ocurrió un error al obtener los proyectos'
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtiene un proyecto específico por ID
   */
  const obtenerProyecto = async (id: string): Promise<ProyectoConResponsable | null> => {
    try {
      setLoading(true);
      
      const { data, error: supabaseError } = await supabase
        .from('proyectos')
        .select(`
          *,
          responsable:responsable_id(
            nombres,
            appaterno,
            apmaterno
          )
        `)
        .eq('id', id)
        .single();

      if (supabaseError) throw supabaseError;

      return data;
    } catch (err: any) {
      console.error('Error al obtener proyecto:', err);
      toast.error('Error al cargar el proyecto', {
        description: err.message || 'Ocurrió un error al obtener el proyecto'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crea un nuevo proyecto
   * @returns ID del proyecto creado o null si hubo error
   */
  const crearProyecto = async (proyecto: Proyecto): Promise<string | null> => {
    try {
      setLoading(true);
      
      const { data, error: supabaseError } = await supabase
        .from('proyectos')
        .insert(proyecto)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Actualizar la lista de proyectos
      await obtenerProyectos();
      
      toast.success('Proyecto creado', {
        description: `El proyecto "${proyecto.nombre}" ha sido creado exitosamente`
      });
      
      return data?.id || null;
    } catch (err: any) {
      console.error('Error al crear proyecto:', err);
      toast.error('Error al crear proyecto', {
        description: err.message || 'No se pudo crear el proyecto'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualiza un proyecto existente
   */
  const actualizarProyecto = async (id: string, proyecto: Partial<Proyecto>): Promise<boolean> => {
    try {
      setLoading(true);
      
      const { error: supabaseError } = await supabase
        .from('proyectos')
        .update(proyecto)
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      // Actualizar la lista de proyectos
      await obtenerProyectos();
      
      toast.success('Proyecto actualizado', {
        description: 'Los cambios han sido guardados exitosamente'
      });
      
      return true;
    } catch (err: any) {
      console.error(`Error al actualizar proyecto con ID ${id}:`, err);
      toast.error('Error al actualizar proyecto', {
        description: err.message || 'No se pudo actualizar el proyecto'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Elimina un proyecto (marcándolo como inactivo)
   */
  const eliminarProyecto = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      // En lugar de eliminar físicamente, marcamos como inactivo
      const { error: supabaseError } = await supabase
        .from('proyectos')
        .update({ activo: false })
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      // Actualizar la lista de proyectos
      await obtenerProyectos();
      
      toast.success('Proyecto eliminado', {
        description: 'El proyecto ha sido eliminado exitosamente'
      });
      
      return true;
    } catch (err: any) {
      console.error(`Error al eliminar proyecto con ID ${id}:`, err);
      toast.error('Error al eliminar proyecto', {
        description: err.message || 'No se pudo eliminar el proyecto'
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    proyectos,
    loading,
    error,
    crearProyecto,
    actualizarProyecto,
    eliminarProyecto,
    obtenerProyecto,
    obtenerProyectos
  };
};
