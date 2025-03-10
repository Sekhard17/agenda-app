import React from 'react';
// Importar los componentes de Nivo de forma explícita
import { ResponsiveBar } from '@nivo/bar';
import { BarDatum } from '@nivo/bar';

export interface ActividadChartData extends BarDatum {
  id: string;
  label: string;
  value: number;
  color?: string;
  [key: string]: any; // Signatura de índice para permitir propiedades dinámicas
}

interface GraficoBarrasActividadesProps {
  data: ActividadChartData[];
  height?: number;
}

/**
 * Componente de visualización para el gráfico de barras de actividades por semana
 */
const GraficoBarrasActividades: React.FC<GraficoBarrasActividadesProps> = ({ 
  data, 
  height = 300 
}) => {
  // Si no hay datos, mostrar un mensaje
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">
          No hay datos disponibles para mostrar
        </p>
      </div>
    );
  }

  return (
    <div style={{ height: height }}>
      <ResponsiveBar
        data={data}
        keys={['value']}
        indexBy="label"
        margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: 'linear' }}
        indexScale={{ type: 'band', round: true }}
        colors={{ scheme: 'blue_green' }}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 1.6]]
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Día de la semana',
          legendPosition: 'middle',
          legendOffset: 32
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Cantidad',
          legendPosition: 'middle',
          legendOffset: -40
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{
          from: 'color',
          modifiers: [['darker', 1.6]]
        }}
        animate={true}
        motionConfig="gentle"
        theme={{
          tooltip: {
            container: {
              background: '#333',
              color: '#fff',
              fontSize: 12,
              borderRadius: 4,
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }
          },
          labels: {
            text: {
              fontSize: 12,
              fontWeight: 500
            }
          }
        }}
      />
    </div>
  );
};

export default GraficoBarrasActividades;
