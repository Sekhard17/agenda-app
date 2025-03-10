import { useState, useEffect } from 'react'
import { AuthService } from '../services/auth.service'
import { toast } from 'sonner'

// Definir la interfaz para el usuario
export interface Usuario {
  id: string
  rut: string
  nombre_usuario: string
  nombres: string
  appaterno: string
  apmaterno: string
  email: string
  rol: 'funcionario' | 'supervisor'
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  
  // Verificar si hay una sesión activa al cargar el componente
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const session = await AuthService.getSession()
        setIsAuthenticated(!!session)
        
        if (session) {
          // Obtener datos del usuario
          const userData = await AuthService.getUserData(session.user.id)
          setUsuario(userData)
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  
  // Función para iniciar sesión
  const login = async (nombreUsuario: string, password: string) => {
    try {
      setLoading(true)
      const data = await AuthService.loginWithNombreUsuario(nombreUsuario, password)
      setIsAuthenticated(true)
      
      if (data.user) {
        // Obtener datos del usuario
        const userData = await AuthService.getUserData(data.user.id)
        setUsuario(userData)
      }
      
      toast.success('¡Bienvenido!', {
        description: 'Has iniciado sesión correctamente'
      })
      
      return true
    } catch (error: any) {
      console.error('Error al iniciar sesión:', error)
      
      toast.error('Error al iniciar sesión', {
        description: error.message || 'Credenciales incorrectas'
      })
      
      return false
    } finally {
      setLoading(false)
    }
  }
  
  // Función para cerrar sesión
  const logout = async (): Promise<void> => {
    try {
      setLoading(true)
      await AuthService.logout()
      setIsAuthenticated(false)
      setUsuario(null)
      
      toast.success('Sesión cerrada', {
        description: 'Has cerrado sesión correctamente'
      })
    } catch (error: any) {
      console.error('Error al cerrar sesión:', error)
      
      toast.error('Error al cerrar sesión', {
        description: error.message || 'No se pudo cerrar la sesión'
      })
    } finally {
      setLoading(false)
    }
  }
  
  return {
    isAuthenticated,
    loading,
    login,
    logout,
    usuario
  }
}
