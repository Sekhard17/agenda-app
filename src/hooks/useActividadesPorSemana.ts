import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ActividadChartData } from '../components/Graficos/GraficoBarrasActividades';

/**
 * Hook personalizado para obtener datos de actividades agrupadas por día de la semana
 */
export const useActividadesPorSemana = () => {
  const [actividadesData, setActividadesData] = useState<ActividadChartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActividadesPorSemana = async () => {
      try {
        setLoading(true);
        
        // Obtener la fecha actual y la fecha de hace 7 días
        const fechaFin = new Date();
        const fechaInicio = new Date();
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        
        // Formatear fechas para la consulta
        const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
        const fechaFinStr = fechaFin.toISOString().split('T')[0];
        
        // Realizar la consulta a Supabase
        const { data, error } = await supabase
          .from('actividades')
          .select('fecha, id')
          .gte('fecha', fechaInicioStr)
          .lte('fecha', fechaFinStr);
          
        if (error) throw error;
        
        // Procesar los datos para agruparlos por día de la semana
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const contadorDias: Record<string, number> = {};
        
        // Inicializar contador para todos los días
        diasSemana.forEach(dia => {
          contadorDias[dia] = 0;
        });
        
        // Contar actividades por día
        if (data) {
          data.forEach((actividad: { fecha: string; id: string }) => {
            const fecha = new Date(actividad.fecha);
            const diaSemana = diasSemana[fecha.getDay()];
            contadorDias[diaSemana]++;
          });
        }
        
        // Transformar los datos al formato requerido por el gráfico
        const chartData: ActividadChartData[] = Object.entries(contadorDias).map(([dia, cantidad]) => ({
          id: dia,
          label: dia,
          value: cantidad
        }));
        
        // Ordenar los días de la semana correctamente (empezando por lunes)
        const ordenDias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        chartData.sort((a, b) => ordenDias.indexOf(a.label) - ordenDias.indexOf(b.label));
        
        setActividadesData(chartData);
        setError(null);
      } catch (err) {
        console.error('Error al obtener actividades por semana:', err);
        setError('No se pudieron cargar los datos de actividades');
      } finally {
        setLoading(false);
      }
    };

    fetchActividadesPorSemana();
  }, []);

  return { actividadesData, loading, error };
};
