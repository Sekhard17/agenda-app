import React from 'react'
import { useAuth } from '../../hooks/useAuth'
import { FiUser, FiMail, FiCreditCard, FiBriefcase } from 'react-icons/fi'
import TituloPagina from '../UI/TituloPagina'

const Perfil: React.FC = () => {
  const { usuario } = useAuth()

  return (
    <div className="container mx-auto">
      <TituloPagina titulo="Mi Perfil" />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Mi Perfil</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Administra tu información personal y configuraciones de cuenta.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-primary-500 dark:bg-primary-600 text-white flex items-center justify-center">
            <FiUser className="h-10 w-10" />
          </div>
          <div className="ml-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {usuario?.nombres} {usuario?.appaterno} {usuario?.apmaterno}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 capitalize">
              {usuario?.rol}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Información Personal
            </h3>
            
            <div>
              <div className="flex items-center">
                <FiUser className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre Completo</span>
              </div>
              <p className="mt-1 text-gray-900 dark:text-white pl-7">
                {usuario?.nombres} {usuario?.appaterno} {usuario?.apmaterno}
              </p>
            </div>
            
            <div>
              <div className="flex items-center">
                <FiCreditCard className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">RUT</span>
              </div>
              <p className="mt-1 text-gray-900 dark:text-white pl-7">
                {usuario?.rut}
              </p>
            </div>
            
            <div>
              <div className="flex items-center">
                <FiBriefcase className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rol</span>
              </div>
              <p className="mt-1 text-gray-900 dark:text-white pl-7 capitalize">
                {usuario?.rol}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
              Información de Contacto
            </h3>
            
            <div>
              <div className="flex items-center">
                <FiMail className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</span>
              </div>
              <p className="mt-1 text-gray-900 dark:text-white pl-7">
                {usuario?.email}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Acciones de Cuenta
          </h3>
          
          <div className="space-y-3">
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800">
              Actualizar información
            </button>
            
            <button className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800">
              Cambiar contraseña
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Perfil
