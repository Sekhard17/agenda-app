import React from 'react';
import { ResponsivePie } from '@nivo/pie';
import { ProyectoChartData } from '../../hooks/useProyectosData';

interface GraficoDonaProyectosProps {
  data: ProyectoChartData[];
  height?: number;
}

/**
 * Componente de visualización para el gráfico de dona de proyectos
 */
const GraficoDonaProyectos: React.FC<GraficoDonaProyectosProps> = ({ 
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
      <ResponsivePie
        data={data}
        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
        innerRadius={0.5}
        padAngle={0.7}
        cornerRadius={3}
        activeOuterRadiusOffset={8}
        colors={{ scheme: 'purple_blue' }}
        borderWidth={1}
        borderColor={{
          from: 'color',
          modifiers: [['darker', 0.2]]
        }}
        arcLinkLabelsSkipAngle={10}
        arcLinkLabelsTextColor={{ from: 'color', modifiers: [] }}
        arcLinkLabelsThickness={2}
        arcLinkLabelsColor={{ from: 'color' }}
        arcLabelsSkipAngle={10}
        arcLabelsTextColor={{
          from: 'color',
          modifiers: [['darker', 2]]
        }}
        defs={[
          {
            id: 'dots',
            type: 'patternDots',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            size: 4,
            padding: 1,
            stagger: true
          },
          {
            id: 'lines',
            type: 'patternLines',
            background: 'inherit',
            color: 'rgba(255, 255, 255, 0.3)',
            rotation: -45,
            lineWidth: 6,
            spacing: 10
          }
        ]}
        fill={[
          { match: { id: 'Modernización de Sistemas' }, id: 'dots' },
          { match: { id: 'Implementación API REX' }, id: 'lines' }
        ]}
        legends={[
          {
            anchor: 'right',
            direction: 'column',
            justify: false,
            translateX: 0,
            translateY: 0,
            itemsSpacing: 0,
            itemWidth: 100,
            itemHeight: 18,
            itemTextColor: '#999',
            itemDirection: 'left-to-right',
            itemOpacity: 1,
            symbolSize: 18,
            symbolShape: 'circle',
            effects: [
              {
                on: 'hover',
                style: {
                  itemTextColor: '#000'
                }
              }
            ]
          }
        ]}
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

export default GraficoDonaProyectos;
