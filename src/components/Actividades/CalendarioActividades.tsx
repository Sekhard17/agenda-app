import React, { useState, useEffect, memo } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus, FiInfo } from 'react-icons/fi';
import { Actividad } from '../../hooks/useActividadesDiarias';
import { obtenerDiasConActividades, obtenerActividadesPorDia, DiaActividad } from '../../services/actividadesService';
import '../Proyectos/ProyectosStyles.css';

interface CalendarioActividadesProps {
  proyectoId: string;
  onSelectFecha: (fecha: string) => void;
  onNuevaActividad: () => void;
  onVerActividad: (actividad: Actividad) => void;
}

// Componente para mostrar las actividades del día seleccionado
const ListaActividadesDia = memo(({ 
  actividades, 
  cargando, 
  fecha, 
  onNuevaActividad, 
  onVerActividad 
}: { 
  actividades: Actividad[], 
  cargando: boolean, 
  fecha: string, 
  onNuevaActividad: () => void, 
  onVerActividad: (actividad: Actividad) => void 
}) => {
  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CL');
  };

  const formatearHora = (hora: string) => {
    return hora.substring(0, 5);
  };

  const getColorEstado = (estado: string) => {
    switch (estado) {
      case 'planificado':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'en_progreso':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'completado':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'cancelado':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'borrador':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'enviado':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const formatearEstado = (estado: string) => {
    switch (estado) {
      case 'planificado': return 'Planificado';
      case 'en_progreso': return 'En progreso';
      case 'completado': return 'Completado';
      case 'cancelado': return 'Cancelado';
      case 'borrador': return 'Borrador';
      case 'enviado': return 'Enviado';
      default: return estado;
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-medium text-gray-800 dark:text-white">
          Actividades del {formatearFecha(fecha)}
        </h4>
        
        <button
          onClick={onNuevaActividad}
          className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-transparent"
        >
          <FiPlus className="mr-1" />
          Nueva actividad
        </button>
      </div>
      
      {cargando ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : actividades.length === 0 ? (
        <div className="text-center py-6">
          <FiInfo className="mx-auto text-3xl text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay actividades registradas para esta fecha
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {actividades.map(actividad => (
            <div 
              key={actividad.id}
              onClick={() => onVerActividad(actividad)}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors actividad-item"
            >
              <div className="flex justify-between items-start mb-1">
                <p className="font-medium text-gray-800 dark:text-white">
                  {formatearHora(actividad.hora_inicio)} - {formatearHora(actividad.hora_fin)}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getColorEstado(actividad.estado)}`}>
                  {formatearEstado(actividad.estado)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {actividad.descripcion}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {actividad.usuario[0]?.nombres} {actividad.usuario[0]?.appaterno}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

const CalendarioActividades: React.FC<CalendarioActividadesProps> = memo(({
  proyectoId,
  onSelectFecha,
  onNuevaActividad,
  onVerActividad
}) => {
  const [mesActual, setMesActual] = useState(new Date());
  const [diasActividades, setDiasActividades] = useState<DiaActividad[]>([]);
  const [actividadesDia, setActividadesDia] = useState<Actividad[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string | null>(null);
  const [cargandoActividades, setCargandoActividades] = useState(false);

  useEffect(() => {
    cargarDiasConActividades();
  }, [proyectoId, mesActual]);

  useEffect(() => {
    if (fechaSeleccionada) {
      cargarActividadesPorDia(fechaSeleccionada);
    }
  }, [fechaSeleccionada]);

  const cargarDiasConActividades = async () => {
    try {
      const primerDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
      const ultimoDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 0);
      
      // Usar el servicio para obtener los días con actividades
      const diasConActividades = await obtenerDiasConActividades(proyectoId, primerDiaMes, ultimoDiaMes);
      
      setDiasActividades(diasConActividades);
    } catch (error: any) {
      console.error('Error al cargar días con actividades:', error.message);
    }
  };

  const cargarActividadesPorDia = async (fecha: string) => {
    try {
      setCargandoActividades(true);
      
      // Usar el servicio para obtener las actividades por día
      const actividades = await obtenerActividadesPorDia(fecha, proyectoId);
      
      setActividadesDia(actividades);
    } catch (error: any) {
      console.error('Error al cargar actividades por día:', error.message);
    } finally {
      setCargandoActividades(false);
    }
  };

  const mesAnterior = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() - 1, 1));
    setFechaSeleccionada(null);
    setActividadesDia([]);
  };

  const mesSiguiente = () => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + 1, 1));
    setFechaSeleccionada(null);
    setActividadesDia([]);
  };

  const seleccionarDia = (fecha: string) => {
    setFechaSeleccionada(fecha);
    onSelectFecha(fecha);
  };



  const obtenerDiasCalendario = () => {
    const primerDiaMes = new Date(mesActual.getFullYear(), mesActual.getMonth(), 1);
    
    // Obtener el primer día de la semana (0 = Domingo, 1 = Lunes, etc.)
    const primerDiaSemana = primerDiaMes.getDay();
    
    // Ajustar para que la semana comience en lunes (0 = Lunes, 6 = Domingo)
    const diasAntes = primerDiaSemana === 0 ? 6 : primerDiaSemana - 1;
    
    // Fecha de inicio del calendario (puede ser del mes anterior)
    const fechaInicio = new Date(primerDiaMes);
    fechaInicio.setDate(fechaInicio.getDate() - diasAntes);
    
    // Calcular el número total de días a mostrar (42 = 6 semanas)
    const totalDias = 42;
    
    const dias = [];
    for (let i = 0; i < totalDias; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fechaInicio.getDate() + i);
      
      const esMesActual = fecha.getMonth() === mesActual.getMonth();
      const fechaStr = fecha.toISOString().split('T')[0];
      
      // Buscar si hay actividades para este día
      const diaActividad = diasActividades.find(d => d.fecha === fechaStr);
      
      dias.push({
        fecha: fechaStr,
        dia: fecha.getDate(),
        esMesActual,
        tieneActividades: !!diaActividad,
        cantidadActividades: diaActividad ? diaActividad.actividades : 0
      });
    }
    
    return dias;
  };

  const diasCalendario = obtenerDiasCalendario();
  const nombresMeses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const nombresDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={mesAnterior}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 border border-transparent"
            >
              <FiChevronLeft />
            </button>
            <h3 className="text-lg font-medium text-gray-800 dark:text-white">
              {nombresMeses[mesActual.getMonth()]} {mesActual.getFullYear()}
            </h3>
            <button
              onClick={mesSiguiente}
              className="p-1.5 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 border border-transparent"
            >
              <FiChevronRight />
            </button>
          </div>
          
          <button
            onClick={() => {
              const hoy = new Date().toISOString().split('T')[0];
              seleccionarDia(hoy);
              setMesActual(new Date());
            }}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 bg-transparent border border-transparent"
          >
            Hoy
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-px bg-gray-200 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
        {nombresDias.map((dia, index) => (
          <div
            key={index}
            className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800"
          >
            {dia}
          </div>
        ))}
        
        {diasCalendario.map((dia, index) => (
          <div
            key={index}
            onClick={() => dia.esMesActual && seleccionarDia(dia.fecha)}
            className={`
              p-2 h-24 bg-white dark:bg-gray-800 overflow-hidden calendario-dia
              ${dia.esMesActual ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700' : 'opacity-40 dia-otro-mes'}
              ${dia.fecha === fechaSeleccionada ? 'ring-2 ring-blue-500 dark:ring-blue-400 seleccionado' : 'border border-gray-200 dark:border-gray-700'}
            `}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`
                inline-flex items-center justify-center w-6 h-6 rounded-full text-sm
                ${dia.fecha === new Date().toISOString().split('T')[0]
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-900 dark:text-gray-300'}
              `}>
                {dia.dia}
              </span>
              
              {dia.tieneActividades && (
                <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full border border-transparent">
                  {dia.cantidadActividades}
                </span>
              )}
            </div>
            
            {dia.tieneActividades && dia.esMesActual && (
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                {dia.cantidadActividades === 1 ? '1 actividad' : `${dia.cantidadActividades} actividades`}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {fechaSeleccionada && (
        <ListaActividadesDia 
          actividades={actividadesDia}
          cargando={cargandoActividades}
          fecha={fechaSeleccionada}
          onNuevaActividad={onNuevaActividad}
          onVerActividad={onVerActividad}
        />
      )}
    </div>
  );
});

export default CalendarioActividades;
