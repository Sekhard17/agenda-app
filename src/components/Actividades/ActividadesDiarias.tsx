import React, { useState } from 'react';
import { FiCalendar, FiClock, FiBriefcase, FiCheck, FiPlus, FiTrash2, FiSend, FiUser } from 'react-icons/fi';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import TituloPagina from '../UI/TituloPagina';
import { useActividadesDiarias, NuevaActividad, Actividad } from '../../hooks/useActividadesDiarias';
import Spinner from '../UI/Spinner';
import ModalConfirmacion from '../UI/ModalConfirmacion';
import ModalActividad from './ModalActividad';

const ActividadesDiarias: React.FC = () => {
  const {
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
  } = useActividadesDiarias();

  // Estados para el modal de nueva actividad
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevaActividad, setNuevaActividad] = useState<Omit<NuevaActividad, 'id_usuario'>>({
    fecha: fechaSeleccionada,
    hora_inicio: '09:00',
    hora_fin: '10:00',
    id_proyecto: '',
    descripcion: '',
    estado: 'borrador' as 'borrador'
  });

  // Estado para edición de actividad
  const [modoEdicion, setModoEdicion] = useState(false);
  const [actividadEnEdicion, setActividadEnEdicion] = useState<string | null>(null);

  // Estado para modal de confirmación de eliminación
  const [modalEliminar, setModalEliminar] = useState(false);
  const [actividadAEliminar, setActividadAEliminar] = useState<string | null>(null);

  // Estado para modal de confirmación de envío
  const [modalEnviar, setModalEnviar] = useState(false);

  // Manejar envío del formulario de nueva actividad
  const handleSubmit = async (actividadData: typeof nuevaActividad) => {
    if (modoEdicion && actividadEnEdicion) {
      // Editar actividad existente
      const resultado = await actualizarActividad({
        id: actividadEnEdicion,
        hora_inicio: actividadData.hora_inicio,
        hora_fin: actividadData.hora_fin,
        id_proyecto: actividadData.id_proyecto,
        descripcion: actividadData.descripcion
      });
      
      if (resultado) {
        setModoEdicion(false);
        setActividadEnEdicion(null);
      }
    } else {
      // Crear nueva actividad
      const resultado = await agregarActividad(actividadData);
      
      if (resultado) {
        resetearFormulario();
      }
    }
  };

  // Resetear formulario
  const resetearFormulario = () => {
    setNuevaActividad({
      fecha: fechaSeleccionada,
      hora_inicio: '09:00',
      hora_fin: '10:00',
      id_proyecto: '',
      descripcion: '',
      estado: 'borrador'
    });
    setModoEdicion(false);
    setActividadEnEdicion(null);
  };

  // Manejar cambio de estado de actividad
  const handleToggleEstado = async (id: string, estadoActual: string) => {
    if (estadoActual === 'enviado' && !esSupervisor) {
      toast.error('No puedes modificar una actividad ya enviada');
      return;
    }
    
    await actualizarActividad({
      id,
      estado: estadoActual === 'borrador' ? 'enviado' : 'borrador'
    });
  };

  // Manejar eliminación de actividad
  const handleEliminar = (id: string) => {
    setActividadAEliminar(id);
    setModalEliminar(true);
  };

  // Confirmar eliminación
  const confirmarEliminar = async () => {
    if (actividadAEliminar) {
      await eliminarActividad(actividadAEliminar);
      setModalEliminar(false);
      setActividadAEliminar(null);
    }
  };

  // Confirmar envío de agenda
  const confirmarEnviarAgenda = async () => {
    await enviarAgenda();
    setModalEnviar(false);
  };

  // Iniciar edición de actividad
  const handleEditar = (actividad: Actividad) => {
    if (actividad.estado === 'enviado' && !esSupervisor) {
      toast.error('No puedes modificar una actividad ya enviada');
      return;
    }
    
    setNuevaActividad({
      fecha: actividad.fecha,
      hora_inicio: actividad.hora_inicio,
      hora_fin: actividad.hora_fin,
      id_proyecto: actividad.id_proyecto || '',
      descripcion: actividad.descripcion,
      estado: 'borrador'
    });
    
    setModoEdicion(true);
    setActividadEnEdicion(actividad.id);
    setMostrarModal(true);
  };

  // Formatear hora para mostrar
  const formatearHora = (hora: string) => {
    return hora.substring(0, 5);
  };

  // Calcular horas totales
  const horasTotales = calcularHorasTotales();

  return (
    <div className="container mx-auto px-4 py-6">
      <TituloPagina titulo="Actividades Diarias" />
      
      {/* Encabezado y controles */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Actividades Diarias</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Registro y seguimiento de tus actividades diarias
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          
          {esSupervisor && (
            <div className="relative w-full sm:w-auto">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={funcionarioSeleccionado || ''}
                onChange={(e) => setFuncionarioSeleccionado(e.target.value || null)}
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="">Todos los funcionarios</option>
                {funcionarios.map(func => (
                  <option key={func.id} value={func.id}>
                    {func.appaterno}, {func.nombres}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
      
      {/* Resumen de horas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Resumen del día</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {format(new Date(fechaSeleccionada), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Horas registradas</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {horasTotales.toFixed(1)}h
            </p>
          </div>
        </div>
      </div>
      
      {/* Botones de acción */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => {
            resetearFormulario();
            setMostrarModal(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <FiPlus /> Nueva Actividad
        </button>
        
        <button
          onClick={() => setModalEnviar(true)}
          disabled={enviandoAgenda || actividades.length === 0}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <FiSend /> {enviandoAgenda ? 'Enviando...' : 'Enviar Agenda'}
        </button>
      </div>
      
      {/* Lista de actividades */}
      {cargando ? (
        <div className="flex justify-center items-center py-12">
          <Spinner />
        </div>
      ) : actividades.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No hay actividades registradas para este día</p>
          <button
            onClick={() => {
              resetearFormulario();
              setMostrarModal(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <FiPlus /> Agregar Actividad
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {actividades.map((actividad) => (
            <div
              key={actividad.id}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 border-l-4 ${
                actividad.estado === 'enviado'
                  ? 'border-green-500'
                  : actividad.estado === 'borrador'
                  ? 'border-yellow-500'
                  : 'border-blue-500'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FiClock className="text-gray-500" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {formatearHora(actividad.hora_inicio)} - {formatearHora(actividad.hora_fin)}
                    </span>
                  </div>
                  
                  {actividad.proyecto && actividad.proyecto.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <FiBriefcase className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {actividad.proyecto[0].nombre}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-gray-800 dark:text-white font-medium mb-2">
                    {actividad.descripcion}
                  </p>
                  
                  {esSupervisor && actividad.usuario && actividad.usuario.length > 0 && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Funcionario: {actividad.usuario[0].nombres} {actividad.usuario[0].appaterno}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 mt-3 sm:mt-0">
                  {actividad.estado === 'borrador' ? (
                    <span className="text-yellow-500 dark:text-yellow-400 flex items-center gap-1">
                      <FiClock /> Borrador
                    </span>
                  ) : (
                    <span className="text-green-500 dark:text-green-400 flex items-center gap-1">
                      <FiCheck /> Enviado
                    </span>
                  )}
                  
                  <button
                    onClick={() => handleToggleEstado(actividad.id, actividad.estado)}
                    disabled={actividad.estado === 'enviado' && !esSupervisor}
                    className={`p-2 rounded-full ${
                      actividad.estado === 'enviado'
                        ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                    } hover:bg-opacity-80 transition-colors ${
                      actividad.estado === 'enviado' && !esSupervisor ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title={actividad.estado === 'enviado' ? 'Marcar como borrador' : 'Marcar como enviado'}
                  >
                    <FiCheck className={actividad.estado === 'enviado' ? 'text-green-600 dark:text-green-300' : ''} />
                  </button>
                  
                  <button
                    onClick={() => handleEditar(actividad)}
                    className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    title="Editar"
                  >
                    <FiClock />
                  </button>
                  
                  <button
                    onClick={() => handleEliminar(actividad.id)}
                    disabled={actividad.estado === 'enviado' && !esSupervisor}
                    className={`p-2 rounded-full bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300 hover:bg-opacity-80 transition-colors ${
                      actividad.estado === 'enviado' && !esSupervisor ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Eliminar actividad"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Modal de nueva actividad */}
      <ModalActividad
        isOpen={mostrarModal}
        onClose={() => setMostrarModal(false)}
        onSubmit={handleSubmit}
        actividad={nuevaActividad}
        proyectos={proyectos}
        titulo={modoEdicion ? 'Editar Actividad' : 'Nueva Actividad'}
        modo={modoEdicion ? 'editar' : 'crear'}
      />
      
      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        onConfirm={confirmarEliminar}
        titulo="Eliminar actividad"
        mensaje="¿Estás seguro de que deseas eliminar esta actividad? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
      
      {/* Modal de confirmación para enviar agenda */}
      <ModalConfirmacion
        isOpen={modalEnviar}
        onClose={() => setModalEnviar(false)}
        onConfirm={confirmarEnviarAgenda}
        titulo="Enviar agenda"
        mensaje="¿Estás seguro de que deseas enviar tu agenda? Las actividades enviadas no podrán ser modificadas posteriormente."
        confirmText="Enviar"
        cancelText="Cancelar"
        confirmButtonClass="bg-green-600 hover:bg-green-700"
      />
    </div>
  );
};

export default ActividadesDiarias;
