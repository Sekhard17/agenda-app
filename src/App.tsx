import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { Toaster } from 'sonner'
import Login from './components/Auth/Login'
import RegistroSupervisor from './components/Auth/RegistroSupervisor'
import RegistroFuncionario from './components/Auth/RegistroFuncionario'
import RutaProtegida from './components/Auth/RutaProtegida'
import RutaProtegidaPorRol from './components/Auth/RutaProtegidaPorRol'
import AccesoDenegado from './components/Auth/AccesoDenegado'
import Dashboard from './components/Dashboard/Dashboard'
import LayoutPrincipal from './components/Layout/LayoutPrincipal'
import Perfil from './components/Perfil/Perfil'
import ActividadesDiarias from './pages/ActividadesDiarias'
import Proyectos from './components/Proyectos/Proyectos'

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro-supervisor" element={<RegistroSupervisor />} />
        <Route path="/registro-funcionario" element={<RegistroFuncionario />} />
        <Route path="/acceso-denegado" element={<AccesoDenegado />} />
        
        {/* Rutas protegidas - requieren autenticación */}
        <Route element={<RutaProtegida />}>
          <Route element={<LayoutPrincipal />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/actividades-diarias" element={<ActividadesDiarias />} />
            <Route path="/proyectos" element={<Proyectos />} />
            <Route path="/perfil" element={<Perfil />} />
            
            {/* Rutas solo para supervisores */}
            <Route element={<RutaProtegidaPorRol rolesPermitidos={['supervisor']} />}>
              <Route path="/funcionarios" element={<div className="p-4">Funcionarios (En desarrollo)</div>} />
              <Route path="/asignaciones" element={<div className="p-4">Asignaciones (En desarrollo)</div>} />
              <Route path="/estadisticas" element={<div className="p-4">Estadísticas (En desarrollo)</div>} />
              <Route path="/configuracion" element={<div className="p-4">Configuración (En desarrollo)</div>} />
            </Route>
            
            {/* Rutas para ambos roles pero con diferente contenido */}
            <Route path="/informes" element={<div className="p-4">Informes (En desarrollo)</div>} />
          </Route>
        </Route>
        
        {/* Ruta por defecto - redirige a dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
