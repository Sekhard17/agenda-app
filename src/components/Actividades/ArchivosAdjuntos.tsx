import React, { useEffect, useState } from 'react';
import { FiFile, FiDownload, FiImage, FiFileText, FiFilm, FiX } from 'react-icons/fi';
import { supabase } from '../../lib/supabase';

interface Documento {
  id: string;
  nombre_archivo: string;
  ruta_archivo: string;
  tipo_archivo: string;
  tamaño_bytes: number;
}

interface ArchivosAdjuntosProps {
  idActividad?: string;
  documentos?: Documento[];
  onDelete?: (idDocumento: string) => Promise<void>;
  modoVisualizacion?: boolean;
  onActualizar?: () => Promise<void>;
}

const ArchivosAdjuntos: React.FC<ArchivosAdjuntosProps> = ({ 
  idActividad, 
  documentos,
  onDelete,
  modoVisualizacion = false,
  onActualizar
}) => {
  const [documentosState, setDocumentos] = useState<Documento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (idActividad) {
      cargarDocumentos();
    } else if (documentos) {
      setDocumentos(documentos);
      setCargando(false);
    }
  }, [idActividad, documentos]);

  const cargarDocumentos = async () => {
    try {
      setCargando(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('documentos')
        .select('*')
        .eq('id_actividad', idActividad);
        
      if (error) throw error;
      
      setDocumentos(data || []);
    } catch (err: any) {
      console.error('Error al cargar documentos:', err.message);
      setError('No se pudieron cargar los documentos adjuntos');
    } finally {
      setCargando(false);
    }
  };

  const descargarArchivo = async (documento: Documento) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos')
        .download(documento.ruta_archivo);
        
      if (error) throw error;
      
      // Crear un objeto URL para el archivo descargado
      const url = URL.createObjectURL(data);
      
      // Crear un enlace temporal y hacer clic en él para descargar
      const a = document.createElement('a');
      a.href = url;
      a.download = documento.nombre_archivo;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error al descargar archivo:', err.message);
    }
  };

  const eliminarArchivo = async (documento: Documento) => {
    if (!onDelete || !window.confirm(`¿Estás seguro de eliminar el archivo "${documento.nombre_archivo}"?`)) {
      return;
    }
    
    try {
      // Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from('documentos')
        .remove([documento.ruta_archivo]);
        
      if (storageError) throw storageError;
      
      // Eliminar registro de la base de datos
      const { error: dbError } = await supabase
        .from('documentos')
        .delete()
        .eq('id', documento.id);
        
      if (dbError) throw dbError;
      
      // Actualizar la lista de documentos
      setDocumentos(prev => prev.filter(doc => doc.id !== documento.id));
      
      // Llamar al callback si existe
      if (onDelete) {
        await onDelete(documento.id);
      }
      
      // Llamar al callback de actualización si existe
      if (onActualizar) {
        await onActualizar();
      }
    } catch (err: any) {
      console.error('Error al eliminar archivo:', err.message);
    }
  };

  const getIconoTipo = (tipoArchivo: string) => {
    if (tipoArchivo.startsWith('image/')) {
      return <FiImage className="text-green-500" />;
    } else if (tipoArchivo.startsWith('video/')) {
      return <FiFilm className="text-purple-500" />;
    } else if (tipoArchivo.includes('pdf') || tipoArchivo.includes('word') || tipoArchivo.includes('document')) {
      return <FiFileText className="text-blue-500" />;
    } else {
      return <FiFile className="text-gray-500" />;
    }
  };

  const formatearTamaño = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (cargando) {
    return (
      <div className="py-3 text-center text-gray-500 dark:text-gray-400">
        Cargando archivos adjuntos...
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-3 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (documentosState.length === 0) {
    return (
      <div className="py-3 text-center text-gray-500 dark:text-gray-400">
        No hay archivos adjuntos para esta actividad.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documentosState.map(documento => (
        <div 
          key={documento.id}
          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
        >
          <div className="flex items-center gap-3">
            <div className="text-xl">
              {getIconoTipo(documento.tipo_archivo)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {documento.nombre_archivo}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatearTamaño(documento.tamaño_bytes)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => descargarArchivo(documento)}
              className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
              title="Descargar archivo"
            >
              <FiDownload />
            </button>
            
            {!modoVisualizacion && onDelete && (
              <button
                onClick={() => eliminarArchivo(documento)}
                className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                title="Eliminar archivo"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArchivosAdjuntos;
