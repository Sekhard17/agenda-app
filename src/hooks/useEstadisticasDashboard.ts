import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface EstadisticasDashboard {
  actividadesRegistradas: number;
  funcionariosActivos: number;
  tareasCompletadas: number;
  proyectosActivos: number;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para obtener estadísticas generales para el dashboard
 */
export const useEstadisticasDashboard = (): EstadisticasDashboard => {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [estadisticas, setEstadisticas] = useState<{
    actividadesRegistradas: number;
    funcionariosActivos: number;
    tareasCompletadas: number;
    proyectosActivos: number;
  }>({
    actividadesRegistradas: 0,
    funcionariosActivos: 0,
    tareasCompletadas: 0,
    proyectosActivos: 0
  });

  useEffect(() => {
    const fetchEstadisticas = async () => {
      if (!usuario) return;
      
      try {
        setLoading(true);
        
        // Obtener fecha de hace un mes
        const fechaUnMesAtras = new Date();
        fechaUnMesAtras.setMonth(fechaUnMesAtras.getMonth() - 1);
        const fechaUnMesAtrasStr = fechaUnMesAtras.toISOString().split('T')[0];
        
        // 1. Actividades registradas en el último mes
        const { count: actividadesCount, error: actividadesError } = await supabase
          .from('actividades')
          .select('*', { count: 'exact', head: true })
          .gte('fecha_creacion', fechaUnMesAtrasStr);
        
        if (actividadesError) throw actividadesError;
        
        // 2. Funcionarios activos
        const { count: funcionariosCount, error: funcionariosError } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('rol', 'funcionario');
        
        if (funcionariosError) throw funcionariosError;
        
        // 3. Tareas completadas
        const { count: tareasCount, error: tareasError } = await supabase
          .from('asignaciones_tareas')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'completada')
          .gte('fecha_actualizacion', fechaUnMesAtrasStr);
        
        if (tareasError) throw tareasError;
        
        // 4. Proyectos activos
        const { count: proyectosCount, error: proyectosError } = await supabase
          .from('proyectos')
          .select('*', { count: 'exact', head: true })
          .eq('activo', true);
        
        if (proyectosError) throw proyectosError;
        
        setEstadisticas({
          actividadesRegistradas: actividadesCount || 0,
          funcionariosActivos: funcionariosCount || 0,
          tareasCompletadas: tareasCount || 0,
          proyectosActivos: proyectosCount || 0
        });
      } catch (err) {
        console.error('Error al obtener estadísticas:', err);
        setError('No se pudieron cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEstadisticas();
  }, [usuario]);
  
  return {
    ...estadisticas,
    loading,
    error
  };
};
