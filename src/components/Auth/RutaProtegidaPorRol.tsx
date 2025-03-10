import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface RutaProtegidaPorRolProps {
  rolesPermitidos: ('funcionario' | 'supervisor')[]
  redirectTo?: string
}

const RutaProtegidaPorRol: React.FC<RutaProtegidaPorRolProps> = ({ 
  rolesPermitidos,
  redirectTo = '/acceso-denegado'
}) => {
  const { usuario, loading } = useAuth()
  
  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-accent"></div>
      </div>
    )
  }
  
  // Si el usuario no tiene un rol permitido, redirigir a la página de acceso denegado
  if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to={redirectTo} replace />
  }
  
  // Renderizar el contenido protegido si el usuario tiene un rol permitido
  return <Outlet />
}

export default RutaProtegidaPorRol
