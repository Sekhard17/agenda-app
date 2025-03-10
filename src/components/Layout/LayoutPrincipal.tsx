import React, { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { 
  FiMenu, FiX, FiUser, FiLogOut, FiCalendar, FiUsers,
  FiMoon, FiSun, FiChevronLeft, FiChevronRight, 
  FiSettings, FiFileText, FiPieChart,
  FiCheckSquare, FiBriefcase, FiHome, FiType
} from 'react-icons/fi'
import Logo from '../UI/Logo'
import NavItem from '../UI/NavItem'
import NavCategory from '../UI/NavCategory'
import { Outlet, useLocation } from 'react-router-dom'
import TituloPagina from '../UI/TituloPagina'

const LayoutPrincipal: React.FC = () => {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Verificar preferencia guardada para la sidebar colapsada
    const savedState = localStorage.getItem('sidebarCollapsed')
    return savedState === 'true'
  })
  
  const [darkMode, setDarkMode] = useState(() => {
    // Verificar preferencia guardada para el modo oscuro
    const savedMode = localStorage.getItem('darkMode')
    return savedMode === 'true' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })
  
  const [largeFont, setLargeFont] = useState(() => {
    // Verificar preferencia guardada para el tamaño de fuente
    const savedFontSize = localStorage.getItem('largeFont')
    return savedFontSize === 'true'
  })
  
  const [seccionActiva, setSeccionActiva] = useState<'dashboard' | 'actividades' | 'actividades-diarias' | 'proyectos' | 'informes' | 'funcionarios' | 'asignaciones' | 'perfil' | 'configuracion' | 'estadisticas'>('dashboard')

  // Actualizar la sección activa basada en la ruta actual
  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    setSeccionActiva(path as any);
  }, [location.pathname]);

  // Alternar modo oscuro
  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', String(newMode))
    
    // Aplicar clase al documento
    if (newMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  // Alternar tamaño de fuente
  const toggleFontSize = () => {
    const newSize = !largeFont
    setLargeFont(newSize)
    localStorage.setItem('largeFont', String(newSize))
    
    // Aplicar clase al documento
    if (newSize) {
      document.documentElement.classList.add('large-font')
    } else {
      document.documentElement.classList.remove('large-font')
    }
  }

  // Alternar estado de la sidebar
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem('sidebarCollapsed', String(newState))
  }

  // Aplicar modo oscuro y tamaño de fuente al cargar
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    if (largeFont) {
      document.documentElement.classList.add('large-font')
    } else {
      document.documentElement.classList.remove('large-font')
    }
  }, [darkMode, largeFont])

  // Cerrar sesión
  const handleLogout = async () => {
    await logout()
  }

  // Renderizar el contenido del sidebar
  const renderSidebarContent = () => {
    const esSupervisor = usuario?.rol === 'supervisor'
    
    return (
      <>
        {/* Logo y título */}
        <div className="flex items-center justify-center px-4 h-14 border-b border-gray-200 dark:border-gray-700">
          {sidebarCollapsed ? (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
              aria-label="Expandir sidebar"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          ) : (
            <div className="flex items-center">
              <Logo size="md" showText={true} />
            </div>
          )}
        </div>
        
        {/* Navegación */}
        <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {/* Categoría: Agenda */}
          <NavCategory title="Agenda" isCollapsed={sidebarCollapsed}>
            <NavItem
              to="/dashboard"
              icon={<FiHome className="h-6 w-6" />}
              label="Dashboard"
              isCollapsed={sidebarCollapsed}
              onClick={() => setSeccionActiva('dashboard')}
              isActive={seccionActiva === 'dashboard'}
            />
            <NavItem
              to="/actividades-diarias"
              icon={<FiCalendar className="h-6 w-6" />}
              label="Actividades Diarias"
              isCollapsed={sidebarCollapsed}
              onClick={() => setSeccionActiva('actividades-diarias')}
              isActive={seccionActiva === 'actividades-diarias'}
            />
            <NavItem
              to="/proyectos"
              icon={<FiBriefcase className="h-6 w-6" />}
              label="Proyectos"
              isCollapsed={sidebarCollapsed}
              onClick={() => setSeccionActiva('proyectos')}
              isActive={seccionActiva === 'proyectos'}
            />
          </NavCategory>
          
          {/* Categoría: Gestión - Solo visible para supervisores */}
          {esSupervisor && (
            <NavCategory title="Gestión" isCollapsed={sidebarCollapsed}>
              <NavItem
                to="/funcionarios"
                icon={<FiUsers className="h-6 w-6" />}
                label="Funcionarios"
                isCollapsed={sidebarCollapsed}
                onClick={() => setSeccionActiva('funcionarios')}
                isActive={seccionActiva === 'funcionarios'}
              />
              <NavItem
                to="/asignaciones"
                icon={<FiCheckSquare className="h-6 w-6" />}
                label="Asignaciones"
                isCollapsed={sidebarCollapsed}
                onClick={() => setSeccionActiva('asignaciones')}
                isActive={seccionActiva === 'asignaciones'}
              />
            </NavCategory>
          )}

          {/* Categoría: Reportes */}
          <NavCategory title="Reportes" isCollapsed={sidebarCollapsed}>
            {/* Informes - Visible para todos, pero con diferentes permisos */}
            <NavItem
              to="/informes"
              icon={<FiFileText className="h-6 w-6" />}
              label="Informes"
              isCollapsed={sidebarCollapsed}
              onClick={() => setSeccionActiva('informes')}
              isActive={seccionActiva === 'informes'}
            />
            {/* Estadísticas - Solo visible para supervisores */}
            {esSupervisor && (
              <NavItem
                to="/estadisticas"
                icon={<FiPieChart className="h-6 w-6" />}
                label="Estadísticas"
                isCollapsed={sidebarCollapsed}
                onClick={() => setSeccionActiva('estadisticas')}
                isActive={seccionActiva === 'estadisticas'}
              />
            )}
          </NavCategory>

          {/* Categoría: Usuario */}
          <NavCategory title="Usuario" isCollapsed={sidebarCollapsed}>
            <NavItem
              to="/perfil"
              icon={<FiUser className="h-6 w-6" />}
              label="Mi Perfil"
              isCollapsed={sidebarCollapsed}
              onClick={() => setSeccionActiva('perfil')}
              isActive={seccionActiva === 'perfil'}
            />
            {/* Configuración - Solo visible para supervisores */}
            {esSupervisor && (
              <NavItem
                to="/configuracion"
                icon={<FiSettings className="h-6 w-6" />}
                label="Configuración"
                isCollapsed={sidebarCollapsed}
                onClick={() => setSeccionActiva('configuracion')}
                isActive={seccionActiva === 'configuracion'}
              />
            )}
          </NavCategory>
        </div>
        
        {/* Perfil de usuario en la parte inferior */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 pb-4 px-4">
          {!sidebarCollapsed ? (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
              <div className="flex flex-col">
                <div className="flex items-center mb-2">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-primary-500 dark:bg-primary-600 text-white flex items-center justify-center">
                      <FiUser className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {usuario?.nombres} {usuario?.appaterno}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">
                      {usuario?.rol}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-1 py-1.5 px-2 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors duration-200 text-sm flex items-center justify-center"
                >
                  <FiLogOut className="h-4 w-4 mr-2" />
                  <span>Cerrar sesión</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 transition-colors duration-200"
                aria-label="Cerrar sesión"
              >
                <FiLogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Título por defecto para el Layout */}
      <TituloPagina titulo="Agenda App" />
      
      {/* Sidebar para móvil */}
      <div className={`
        md:hidden fixed inset-0 z-40 flex transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Overlay oscuro */}
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        ></div>
        
        {/* Contenido del sidebar */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Cerrar sidebar</span>
              <FiX className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto flex flex-col">
            {renderSidebarContent()}
          </div>
        </div>
      </div>
      
      {/* Sidebar para desktop */}
      <div className={`
        hidden md:flex md:flex-shrink-0 transition-all duration-300 ease-in-out relative
        ${sidebarCollapsed ? 'md:w-16' : 'md:w-72'}
      `}>
        <div className="flex flex-col w-full h-screen border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex-1 flex flex-col h-full overflow-y-auto">
            {renderSidebarContent()}
          </div>
        </div>
      </div>
      
      {/* Contenido principal con header */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Barra superior */}
        <header className="bg-white dark:bg-gray-800 shadow-sm z-10 relative">
          <div className="mx-auto px-6">
            <div className="flex justify-between h-14">
              <div className="flex items-center">
                {/* Botón móvil */}
                <div className="flex-shrink-0 flex items-center">
                  <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 dark:focus:ring-primary-400 md:hidden"
                  >
                    <span className="sr-only">Abrir menú</span>
                    <FiMenu className="block h-6 w-6" />
                  </button>
                </div>
                
                {/* Logo en la navbar cuando sidebar está minimizada */}
                {sidebarCollapsed ? (
                  <div className="hidden md:flex md:ml-2 items-center">
                    <Logo size="sm" showText={true} />
                  </div>
                ) : (
                  <div className="hidden md:flex md:ml-2 items-center">
                    <button
                      onClick={toggleSidebar}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                      aria-label="Colapsar sidebar"
                    >
                      <FiChevronLeft className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
              
              {/* Controles de usuario */}
              <div className="flex items-center space-x-3">
                {/* Botón tamaño de fuente */}
                <button
                  onClick={toggleFontSize}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-primary-500 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                  aria-label={largeFont ? "Reducir tamaño de fuente" : "Aumentar tamaño de fuente"}
                >
                  <FiType className="h-5 w-5" />
                  <span className="sr-only">{largeFont ? "Reducir tamaño de fuente" : "Aumentar tamaño de fuente"}</span>
                </button>
                
                {/* Botón modo oscuro/claro */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-amber-500 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                  aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
                >
                  {darkMode ? <FiSun className="h-5 w-5" /> : <FiMoon className="h-5 w-5" />}
                </button>
                
                {/* Información de usuario (solo visible en móvil) */}
                <div className="ml-3 relative flex items-center md:hidden">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary-500 dark:bg-primary-600 text-white flex items-center justify-center">
                      <FiUser className="h-5 w-5" />
                    </div>
                    <div className="ml-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {usuario?.nombres} {usuario?.appaterno}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {usuario?.rol}
                      </div>
                    </div>
                  </div>
                  
                  {/* Botón de cerrar sesión (solo visible en móvil) */}
                  <button
                    onClick={handleLogout}
                    className="ml-4 p-1 rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-primary-400 transition-colors duration-200"
                    aria-label="Cerrar sesión"
                  >
                    <FiLogOut className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default LayoutPrincipal
