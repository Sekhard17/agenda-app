import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Definición de tipos
export interface ProyectoData {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  cantidad: number;
}

export interface ProyectoChartData {
  id: string;
  label: string;
  value: number;
  color?: string;
}

// Tipo para los datos que vienen de Supabase
interface ProyectoSupabase {
  id: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  actividades: Array<{ count: number }>;
}

// Colores predefinidos para los proyectos
const COLORES_PROYECTOS = [
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f43f5e', // rose-500
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#3b82f6', // blue-500
];

/**
 * Hook personalizado para obtener datos de proyectos para gráficos
 */
export const useProyectosData = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [proyectosData, setProyectosData] = useState<ProyectoChartData[]>([]);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        setLoading(true);
        
        // Consulta para obtener proyectos con conteo de actividades
        const { data, error } = await supabase
          .from('proyectos')
          .select(`
            id,
            nombre,
            descripcion,
            activo,
            actividades:actividades(count)
          `)
          .eq('activo', true);

        if (error) throw error;

        // Transformar los datos para el gráfico
        const formattedData: ProyectoChartData[] = (data as ProyectoSupabase[]).map((proyecto: ProyectoSupabase, index: number) => ({
          id: proyecto.nombre,
          label: proyecto.nombre,
          value: proyecto.actividades[0]?.count || 0,
          color: COLORES_PROYECTOS[index % COLORES_PROYECTOS.length]
        }));

        // Filtrar proyectos sin actividades y ordenar por cantidad
        const filteredData = formattedData
          .filter(item => item.value > 0)
          .sort((a, b) => b.value - a.value);
        
        setProyectosData(filteredData);
      } catch (err) {
        console.error('Error al obtener datos de proyectos:', err);
        setError('No se pudieron cargar los datos de proyectos');
      } finally {
        setLoading(false);
      }
    };

    fetchProyectos();
  }, []);

  return { proyectosData, loading, error };
};
