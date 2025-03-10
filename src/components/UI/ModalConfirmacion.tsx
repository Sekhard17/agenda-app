import React, { useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiInfo, FiX, FiHelpCircle } from 'react-icons/fi';

interface ModalConfirmacionProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  titulo: string;
  mensaje: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
  tipo?: 'info' | 'warning' | 'success' | 'danger' | 'question';
  mostrarIcono?: boolean;
  descripcion?: string;
  validacionRequerida?: boolean;
  textoValidacion?: string;
}

const ModalConfirmacion: React.FC<ModalConfirmacionProps> = ({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  mensaje,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonClass,
  tipo = 'info',
  mostrarIcono = true,
  descripcion,
  validacionRequerida = false,
  textoValidacion = 'confirmar'
}) => {
  const [animateIn, setAnimateIn] = useState(false);
  const [textoIngresado, setTextoIngresado] = useState('');
  const [validacionCorrecta, setValidacionCorrecta] = useState(!validacionRequerida);

  useEffect(() => {
    if (isOpen) {
      setAnimateIn(true);
    } else {
      setAnimateIn(false);
      setTextoIngresado('');
      setValidacionCorrecta(!validacionRequerida);
    }
  }, [isOpen, validacionRequerida]);

  useEffect(() => {
    if (validacionRequerida) {
      setValidacionCorrecta(textoIngresado.toLowerCase() === textoValidacion.toLowerCase());
    }
  }, [textoIngresado, textoValidacion, validacionRequerida]);

  const handleClose = () => {
    setAnimateIn(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleConfirm = () => {
    if (validacionRequerida && !validacionCorrecta) return;
    
    onConfirm();
    handleClose();
  };

  const getIcono = () => {
    switch (tipo) {
      case 'warning':
        return <FiAlertTriangle className="text-yellow-500 text-4xl" />;
      case 'success':
        return <FiCheckCircle className="text-green-500 text-4xl" />;
      case 'danger':
        return <FiAlertTriangle className="text-red-500 text-4xl" />;
      case 'question':
        return <FiHelpCircle className="text-blue-500 text-4xl" />;
      default:
        return <FiInfo className="text-blue-500 text-4xl" />;
    }
  };

  const getConfirmButtonClass = () => {
    if (confirmButtonClass) return confirmButtonClass;
    
    switch (tipo) {
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700';
      case 'question':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 z-50 flex items-center justify-center p-4 ${
        animateIn ? 'bg-opacity-50' : 'bg-opacity-0 pointer-events-none'
      }`}
      onClick={handleClose}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300 ${
          animateIn ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Cerrar"
          >
            <FiX className="text-xl" />
          </button>

          <div className="p-6">
            <div className="flex items-center gap-4 mb-4">
              {mostrarIcono && (
                <div className="flex-shrink-0">
                  {getIcono()}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">{titulo}</h2>
                {descripcion && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{descripcion}</p>
                )}
              </div>
            </div>
            
            <div className="mt-2 mb-6">
              <p className="text-gray-600 dark:text-gray-300">{mensaje}</p>
              
              {validacionRequerida && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Para confirmar, escribe "{textoValidacion}"
                  </label>
                  <input
                    type="text"
                    value={textoIngresado}
                    onChange={(e) => setTextoIngresado(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Escribe "${textoValidacion}" para confirmar`}
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                {cancelText}
              </button>
              <button
                onClick={handleConfirm}
                disabled={validacionRequerida && !validacionCorrecta}
                className={`px-4 py-2 ${getConfirmButtonClass()} text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  validacionRequerida && !validacionCorrecta ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalConfirmacion;
