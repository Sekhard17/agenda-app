import React from 'react'
import { Link } from 'react-router-dom'
import { FiAlertTriangle, FiArrowLeft, FiHome } from 'react-icons/fi'

const AccesoDenegado: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-24 w-24 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <FiAlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
          Acceso Denegado
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
          No tienes permisos suficientes para acceder a esta sección. Si crees que esto es un error, contacta al administrador del sistema.
        </p>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-600 dark:bg-accent dark:hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-accent-500 transition-colors duration-200"
          >
            <FiHome className="mr-2 -ml-1 h-5 w-5" />
            Ir al Dashboard
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-5 py-3 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-accent-500 transition-colors duration-200"
          >
            <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
            Volver
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccesoDenegado
