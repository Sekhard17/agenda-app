import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Link, useNavigate } from 'react-router-dom'
import TituloPagina from '../UI/TituloPagina'

// Iconos
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi'

interface LoginProps {
  onLoginSuccess?: () => void
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  // Estados para los campos del formulario
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ nombreUsuario?: string, password?: string }>({})
  
  // Usar el hook de autenticación y navegación
  const { login, loading } = useAuth()
  const navigate = useNavigate()

  // Validar formulario
  const validateForm = () => {
    const newErrors: { nombreUsuario?: string, password?: string } = {}
    
    if (!nombreUsuario) {
      newErrors.nombreUsuario = 'El nombre de usuario es obligatorio'
    }
    
    if (!password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const success = await login(nombreUsuario, password)
    
    if (success) {
      if (onLoginSuccess) {
        onLoginSuccess()
      }
      // Redirigir al dashboard
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <TituloPagina titulo="Iniciar Sesión" />
      <div className="max-w-md w-full space-y-8">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary dark:bg-accent text-white mb-4">
            <FiUser className="w-8 h-8" />
          </div>
          <h1 className="text-2xl-custom font-bold text-primary dark:text-accent">Agenda de Actividades</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Inicia sesión para continuar</p>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Campo Nombre de Usuario */}
          <div className="mb-6">
            <label htmlFor="nombreUsuario" className="block text-sm-custom font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="nombreUsuario"
                name="nombreUsuario"
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="usuario123"
                className={`block w-full pl-10 pr-3 py-2 text-gray-700 dark:text-white border ${
                  errors.nombreUsuario ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700`}
              />
            </div>
            {errors.nombreUsuario && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombreUsuario}</p>
            )}
          </div>
          
          {/* Campo Contraseña */}
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm-custom font-medium text-gray-700 dark:text-gray-300 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className={`block w-full pl-10 pr-10 py-2 text-gray-700 dark:text-white border ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700`}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
            )}
          </div>
          
          {/* Recordarme y Olvidé mi contraseña */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary dark:text-accent focus:ring-primary dark:focus:ring-accent border-gray-300 dark:border-gray-600 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                Recordarme
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-primary dark:text-accent hover:text-primary/80 dark:hover:text-accent/80">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>
          
          {/* Botón de inicio de sesión */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary hover:bg-primary/90 dark:bg-accent dark:hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <FiLogIn className="mr-2" />
              )}
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </div>
          
          {/* Enlaces de registro */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ¿Eres supervisor y necesitas una cuenta?{' '}
              <Link to="/registro-supervisor" className="font-medium text-primary dark:text-accent hover:text-primary/80 dark:hover:text-accent/80">
                Registrarse como supervisor
              </Link>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              ¿Eres funcionario y necesitas una cuenta?{' '}
              <Link to="/registro-funcionario" className="font-medium text-primary dark:text-accent hover:text-primary/80 dark:hover:text-accent/80">
                Registrarse como funcionario
              </Link>
            </p>
          </div>
        </form>
        
        {/* Pie de página */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p> {new Date().getFullYear()} Agenda de Actividades - Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  )
}

export default Login
