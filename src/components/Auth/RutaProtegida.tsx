import React, { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

const RutaProtegida: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession()
      setIsAuthenticated(!!data.session)
    }
    
    checkAuth()
    
    // Suscribirse a cambios en la autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  // Mostrar un indicador de carga mientras se verifica la autenticación
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary dark:border-accent"></div>
      </div>
    )
  }

  // Redirigir a la página de inicio de sesión si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Renderizar el contenido protegido si está autenticado
  return <Outlet />
}

export default RutaProtegida
