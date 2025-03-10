import React from 'react'
import { Link } from 'react-router-dom'
import { useRegistroFuncionario } from '../../hooks/useRegistroFuncionario'

// Iconos
import { FiUser, FiLock, FiEye, FiEyeOff, FiMail, FiUserPlus, FiLoader } from 'react-icons/fi'

interface RegistroFuncionarioProps {
  onRegistroSuccess?: () => void
}

const RegistroFuncionario: React.FC<RegistroFuncionarioProps> = ({ onRegistroSuccess }) => {
  const {
    formData,
    errors,
    loading,
    showPassword,
    handleChange,
    handleRutChange,
    togglePasswordVisibility,
    handleSubmit
  } = useRegistroFuncionario({ onRegistroSuccess })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary dark:bg-accent text-white mb-4">
            <FiUserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-2xl-custom font-bold text-primary dark:text-accent">Registro de Funcionario</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Crea una cuenta para gestionar tus actividades</p>
        </div>
        
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {/* Campo RUT */}
          <div className="mb-4">
            <label htmlFor="rut" className="block text-sm-custom font-medium text-gray-700 dark:text-gray-300 mb-1">
              RUT
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiUser className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="rut"
                name="rut"
                type="text"
                value={formData.rut}
                onChange={handleRutChange}
                className={`block w-full pl-10 pr-3 py-2 text-gray-700 dark:text-white border ${
                  errors.rut ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700`}
                placeholder="12.345.678-9"
              />
            </div>
            {errors.rut && <p className="mt-1 text-sm text-red-500">{errors.rut}</p>}
          </div>
          
          {/* Campo Nombre de Usuario */}
          <div className="mb-4">
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
                value={formData.nombreUsuario}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 text-gray-700 dark:text-white border ${
                  errors.nombreUsuario ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700`}
                placeholder="usuario123"
              />
            </div>
            {errors.nombreUsuario && <p className="mt-1 text-sm text-red-500">{errors.nombreUsuario}</p>}
          </div>
          
          {/* Campos Nombres y Apellidos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="nombres" className="block text-sm-custom font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombres
              </label>
              <input
                id="nombres"
                name="nombres"
                type="text"
                value={formData.nombres}
                onChange={handleChange}
                className={`block w-full px-3 py-2 text-gray-700 dark:text-white border ${
                  errors.nombres ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700`}
                placeholder="Juan Pedro"
              />
              {errors.nombres && <p className="mt-1 text-sm text-red-500">{errors.nombres}</p>}
            </div>
            <div>
              <label htmlFor="appaterno" className="block text-sm-custom font-medium text-gray-700 dark:text-gray-300 mb-1">
                Apellido Paterno
              </label>
              <input
                id="appaterno"
                name="appaterno"
                type="text"
                value={formData.appaterno}
                onChange={handleChange}
                className={`block w-full px-3 py-2 text-gray-700 dark:text-white border ${
                  errors.appaterno ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700`}
                placeholder="Pérez"
              />
              {errors.appaterno && <p className="mt-1 text-sm text-red-500">{errors.appaterno}</p>}
            </div>
          </div>
          
          {/* Campo Apellido Materno */}
          <div className="mb-4">
            <label htmlFor="apmaterno" className="block text-sm-custom font-medium text-gray-700 dark:text-gray-300 mb-1">
              Apellido Materno
            </label>
            <input
              id="apmaterno"
              name="apmaterno"
              type="text"
              value={formData.apmaterno}
              onChange={handleChange}
              className="block w-full px-3 py-2 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700"
              placeholder="González"
            />
          </div>
          
          {/* Campo Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm-custom font-medium text-gray-700 dark:text-gray-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 text-gray-700 dark:text-white border ${
                  errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700`}
                placeholder="ejemplo@correo.cl"
              />
            </div>
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>
          
          {/* Campo Contraseña */}
          <div className="mb-4">
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
                value={formData.password}
                onChange={handleChange}
                className={`block w-full pl-10 pr-10 py-2 text-gray-700 dark:text-white border ${
                  errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700`}
                placeholder="********"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none"
                >
                  {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>
          
          {/* Campo Confirmar Contraseña */}
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm-custom font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 text-gray-700 dark:text-white border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                } rounded-md shadow-sm focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent dark:bg-gray-700`}
                placeholder="********"
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>
          
          {/* Botón de registro */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm-custom font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-accent dark:hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2 h-4 w-4" />
                  Registrando...
                </>
              ) : (
                'Registrarse'
              )}
            </button>
          </div>
          
          {/* Enlaces */}
          <div className="mt-4 text-center text-sm-custom">
            <p className="text-gray-600 dark:text-gray-400">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-dark dark:text-accent dark:hover:text-accent-light">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegistroFuncionario
