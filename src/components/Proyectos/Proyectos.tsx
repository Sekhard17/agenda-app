import React, { useEffect, useState } from 'react';
import { 
  FiPlus, FiSearch, FiFilter, FiEye, FiEdit2, FiTrash2, 
  FiCheckCircle, FiClock, FiAlertCircle, FiXCircle
} from 'react-icons/fi';
import { useProyectosCRUD, ProyectoConResponsable } from '../../hooks/useProyectosCRUD';
import TituloPagina from '../UI/TituloPagina';
import DetalleProyecto from './DetalleProyecto';
import ModalProyecto from './ModalProyecto';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ModalConfirmacion from '../UI/ModalConfirmacion';

// Componente para mostrar el estado del proyecto con un icono y color apropiado
const EstadoProyecto: React.FC<{ estado: string }> = ({ estado }) => {
  let color = '';
  let Icon = FiClock;
  let label = '';

  switch (estado) {
    case 'planificado':
      color = 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
      Icon = FiClock;
      label = 'Planificado';
      break;
    case 'en_progreso':
      color = 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/30';
      Icon = FiClock;
      label = 'En Progreso';
      break;
    case 'completado':
      color = 'text-green-500 bg-green-100 dark:bg-green-900/30';
      Icon = FiCheckCircle;
      label = 'Completado';
      break;
    case 'cancelado':
      color = 'text-red-500 bg-red-100 dark:bg-red-900/30';
      Icon = FiXCircle;
      label = 'Cancelado';
      break;
    default:
      color = 'text-gray-500 bg-gray-100 dark:bg-gray-800';
      Icon = FiAlertCircle;
      label = 'Desconocido';
  }

  return (
    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon className="mr-1" size={12} />
      {label}
    </div>
  );
};

const Proyectos: React.FC = () => {
  const { 
    proyectos, 
    loading, 
    error, 
    obtenerProyectos, 
    crearProyecto, 
    actualizarProyecto, 
    eliminarProyecto,
    obtenerProyecto
  } = useProyectosCRUD();
  
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [modalDetalleAbierto, setModalDetalleAbierto] = useState(false);
  const [proyectoActual, setProyectoActual] = useState<ProyectoConResponsable | null>(null);
  const [modoEdicion, setModoEdicion] = useState<'crear' | 'editar'>('crear');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [mostrarInactivos, setMostrarInactivos] = useState(false);
  const [modalEliminar, setModalEliminar] = useState(false);
  const [proyectoAEliminar, setProyectoAEliminar] = useState<{id: string, nombre: string} | null>(null);
  
  // Cargar proyectos al montar el componente
  useEffect(() => {
    obtenerProyectos(mostrarInactivos);
  }, [mostrarInactivos]);
  
  // Filtrar proyectos según búsqueda y filtros
  const proyectosFiltrados = proyectos.filter(proyecto => {
    const coincideBusqueda = 
      proyecto.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
      (proyecto.descripcion?.toLowerCase().includes(busqueda.toLowerCase()) || false);
    
    const coincideEstado = filtroEstado === 'todos' || proyecto.estado === filtroEstado;
    
    return coincideBusqueda && coincideEstado;
  });
  
  // Abrir modal para crear nuevo proyecto
  const abrirModalCrear = () => {
    setProyectoActual(null);
    setModoEdicion('crear');
    setModalFormularioAbierto(true);
  };
  
  // Abrir modal para editar proyecto
  const abrirModalEditar = (proyecto: ProyectoConResponsable) => {
    setProyectoActual(proyecto);
    setModoEdicion('editar');
    setModalFormularioAbierto(true);
  };
  
  // Abrir modal para ver detalles del proyecto
  const abrirModalDetalle = async (id: string) => {
    const proyecto = await obtenerProyecto(id);
    if (proyecto) {
      setProyectoActual(proyecto);
      setModalDetalleAbierto(true);
    }
  };
  
  // Confirmar eliminación de proyecto
  const confirmarEliminar = (id: string, nombre: string) => {
    setProyectoAEliminar({ id, nombre });
    setModalEliminar(true);
  };
  
  // Ejecutar eliminación de proyecto
  const ejecutarEliminar = async () => {
    if (proyectoAEliminar) {
      await eliminarProyecto(proyectoAEliminar.id);
      setModalEliminar(false);
      setProyectoAEliminar(null);
    }
  };

  // Manejar guardado de proyecto (crear o actualizar)
  const handleGuardarProyecto = async (proyecto: ProyectoConResponsable) => {
    if (modoEdicion === 'editar' && proyecto.id) {
      await actualizarProyecto(proyecto.id, proyecto);
    } else {
      await crearProyecto(proyecto);
    }
    setModalFormularioAbierto(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <TituloPagina
        titulo="Gestión de Proyectos"
      />
      
      {/* Barra de acciones */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex-1 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar proyectos..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiFilter className="text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="planificado">Planificado</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="mostrarInactivos"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              checked={mostrarInactivos}
              onChange={(e) => setMostrarInactivos(e.target.checked)}
            />
            <label htmlFor="mostrarInactivos" className="ml-2 block text-sm text-gray-900 dark:text-gray-200">
              Mostrar inactivos
            </label>
          </div>
          
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={abrirModalCrear}
          >
            <FiPlus className="mr-2" />
            Nuevo Proyecto
          </button>
        </div>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 dark:bg-red-900/30 dark:text-red-300" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      {/* Tabla de proyectos */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nombre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Responsable
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Activo
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                // Esqueleto de carga
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`skeleton-${index}`} className="animate-pulse">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-2/3"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/4"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full"></div>
                    </td>
                  </tr>
                ))
              ) : proyectosFiltrados.length === 0 ? (
                // Mensaje de no hay resultados
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No se encontraron proyectos que coincidan con los criterios de búsqueda.
                  </td>
                </tr>
              ) : (
                // Datos de proyectos
                proyectosFiltrados.map((proyecto) => (
                  <tr 
                    key={proyecto.id} 
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!proyecto.activo ? 'opacity-60' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{proyecto.nombre}</div>
                      {proyecto.descripcion && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {proyecto.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <EstadoProyecto estado={proyecto.estado} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {proyecto.responsable ? (
                        <div className="text-sm text-gray-900 dark:text-white">
                          {`${proyecto.responsable.nombres} ${proyecto.responsable.appaterno} ${proyecto.responsable.apmaterno}`}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {proyecto.fecha_inicio ? (
                        <div className="text-sm text-gray-900 dark:text-white">
                          {format(new Date(proyecto.fecha_inicio), 'dd/MM/yyyy', { locale: es })}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">No definida</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        proyecto.activo 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {proyecto.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => abrirModalDetalle(proyecto.id!)}
                          className="p-1.5 rounded-md bg-white dark:bg-gray-800 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 border border-gray-200 dark:border-gray-700 transition-colors"
                          title="Ver detalles"
                        >
                          <FiEye size={18} />
                        </button>
                        <button
                          onClick={() => abrirModalEditar(proyecto)}
                          className="p-1.5 rounded-md bg-white dark:bg-gray-800 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 transition-colors"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </button>
                        <button
                          onClick={() => confirmarEliminar(proyecto.id!, proyecto.nombre)}
                          className="p-1.5 rounded-md bg-white dark:bg-gray-800 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 transition-colors"
                          title="Eliminar"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal de formulario */}
      <ModalProyecto
        isOpen={modalFormularioAbierto}
        onClose={() => setModalFormularioAbierto(false)}
        onSubmit={handleGuardarProyecto}
        proyecto={proyectoActual}
        modo={modoEdicion}
      />
      
      {/* Modal de detalle */}
      {modalDetalleAbierto && proyectoActual && (
        <DetalleProyecto
          proyecto={proyectoActual}
          onCerrar={() => setModalDetalleAbierto(false)}
          onEditar={() => {
            setModalDetalleAbierto(false);
            abrirModalEditar(proyectoActual);
          }}
        />
      )}
      
      {/* Modal de confirmación para eliminar */}
      <ModalConfirmacion
        isOpen={modalEliminar}
        onClose={() => setModalEliminar(false)}
        onConfirm={ejecutarEliminar}
        titulo="Eliminar proyecto"
        mensaje={`¿Estás seguro de que deseas eliminar el proyecto "${proyectoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
};

export default Proyectos;
