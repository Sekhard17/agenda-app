import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface ActividadReciente {
  id: string;
  titulo: string;
  fecha: string;
  estado: 'borrador' | 'enviado';
  tipo: string;
  nombre_proyecto?: string;
}

// Interfaz para los datos que devuelve Supabase
interface ActividadSupabase {
  id: string;
  descripcion: string;
  fecha: string;
  estado: string;
  proyectos: { 
    nombre: string;
  }[] | null;
}

/**
 * Hook para obtener las actividades recientes
 */
export const useActividadesRecientes = (limite: number = 5) => {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actividades, setActividades] = useState<ActividadReciente[]>([]);

  useEffect(() => {
    const fetchActividades = async () => {
      if (!usuario) return;
      
      try {
        setLoading(true);
        
        // Obtener actividades recientes
        const { data, error: actividadesError } = await supabase
          .from('actividades')
          .select(`
            id,
            descripcion,
            fecha,
            estado,
            proyectos (
              nombre
            )
          `)
          .order('fecha', { ascending: false })
          .limit(limite);
        
        if (actividadesError) throw actividadesError;
        
        if (data) {
          // Usamos unknown como paso intermedio para evitar el error de TypeScript
          const actividadesFormateadas: ActividadReciente[] = (data as unknown as ActividadSupabase[]).map((actividad) => {
            // Extraer el tipo de actividad de la descripción (primeras palabras hasta el primer espacio)
            const tipo = actividad.descripcion.split(' ')[0];
            
            return {
              id: actividad.id,
              titulo: actividad.descripcion,
              fecha: actividad.fecha,
              estado: actividad.estado as 'borrador' | 'enviado',
              tipo: tipo,
              nombre_proyecto: actividad.proyectos && actividad.proyectos.length > 0 ? actividad.proyectos[0].nombre : undefined
            };
          });
          
          setActividades(actividadesFormateadas);
        }
      } catch (err) {
        console.error('Error al obtener actividades recientes:', err);
        setError('No se pudieron cargar las actividades recientes');
      } finally {
        setLoading(false);
      }
    };
    
    fetchActividades();
  }, [usuario, limite]);
  
  return {
    actividades,
    loading,
    error
  };
};
