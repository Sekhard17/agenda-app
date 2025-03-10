import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import SelectorProyectos from '../components/Proyectos/SelectorProyectos';
import EspacioProyecto from '../components/Proyectos/EspacioProyecto';

const ActividadesDiarias: React.FC = () => {
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<string | null>(null);

  const handleSeleccionarProyecto = (proyectoId: string) => {
    setProyectoSeleccionado(proyectoId);
  };

  const handleVolverAProyectos = () => {
    setProyectoSeleccionado(null);
  };

  return (
    <>
      <Helmet>
        <title>{proyectoSeleccionado ? 'Actividades del Proyecto' : 'Mis Proyectos'} | Agenda App</title>
      </Helmet>

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {proyectoSeleccionado ? (
          <EspacioProyecto 
            proyectoId={proyectoSeleccionado} 
            onVolver={handleVolverAProyectos} 
          />
        ) : (
          <SelectorProyectos onSelectProyecto={handleSeleccionarProyecto} />
        )}
      </div>
    </>
  );
};

export default ActividadesDiarias;
