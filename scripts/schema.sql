-- Script de creación de base de datos para Agenda de Actividades
-- Adaptado para Chile con RUT y estructura de nombres específica

-- Habilitar la extensión UUID si no está habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  rut TEXT UNIQUE NOT NULL,
  nombre_usuario TEXT UNIQUE NOT NULL,
  nombres TEXT NOT NULL,
  appaterno TEXT NOT NULL,
  apmaterno TEXT,
  email TEXT UNIQUE NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('funcionario', 'supervisor')),
  id_supervisor UUID REFERENCES usuarios(id),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de proyectos
CREATE TABLE proyectos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  id_supervisor UUID REFERENCES usuarios(id),
  id_externo_rex TEXT, -- Para integración con API REX
  activo BOOLEAN DEFAULT TRUE,
  estado TEXT DEFAULT 'planificado' CHECK (estado IN ('planificado', 'en_progreso', 'completado', 'cancelado')),
  fecha_inicio DATE,
  fecha_fin DATE,
  responsable_id UUID REFERENCES usuarios(id),
  presupuesto NUMERIC(12,2),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de actividades
CREATE TABLE actividades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES usuarios(id) NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  descripcion TEXT NOT NULL,
  id_proyecto UUID REFERENCES proyectos(id),
  estado TEXT NOT NULL CHECK (estado IN ('borrador', 'enviado')),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Restricción para evitar superposición de horarios
  CONSTRAINT no_superposicion UNIQUE (id_usuario, fecha, hora_inicio, hora_fin),
  -- Restricción para no permitir actividades en días anteriores al actual
  CONSTRAINT no_dias_anteriores CHECK (fecha >= CURRENT_DATE)
);

-- Tabla de documentos adjuntos
CREATE TABLE documentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_actividad UUID REFERENCES actividades(id) NOT NULL,
  nombre_archivo TEXT NOT NULL,
  ruta_archivo TEXT NOT NULL,
  tipo_archivo TEXT,
  tamaño_bytes INTEGER,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asignaciones de tareas
CREATE TABLE asignaciones_tareas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_supervisor UUID REFERENCES usuarios(id) NOT NULL,
  id_funcionario UUID REFERENCES usuarios(id) NOT NULL,
  id_proyecto UUID REFERENCES proyectos(id),
  descripcion TEXT NOT NULL,
  fecha_asignacion DATE NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'en_progreso', 'completada')),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  id_usuario UUID REFERENCES usuarios(id) NOT NULL,
  mensaje TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  tipo TEXT NOT NULL CHECK (tipo IN ('asignacion', 'recordatorio', 'sistema')),
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para validar RUT chileno
CREATE OR REPLACE FUNCTION validar_rut(rut TEXT) 
RETURNS BOOLEAN AS $$
DECLARE
  rutLimpio TEXT;
  dv CHAR;
  suma INTEGER := 0;
  multiplo INTEGER := 2;
  dvCalculado CHAR;
BEGIN
  -- Limpiar RUT (quitar puntos y guión)
  rutLimpio := regexp_replace(rut, '[^0-9kK]', '', 'g');
  
  -- Separar dígito verificador
  dv := upper(right(rutLimpio, 1));
  rutLimpio := left(rutLimpio, length(rutLimpio) - 1);
  
  -- Calcular dígito verificador
  FOR i IN REVERSE char_length(rutLimpio)..1 LOOP
    suma := suma + (CAST(substring(rutLimpio FROM i FOR 1) AS INTEGER) * multiplo);
    multiplo := multiplo + 1;
    IF multiplo > 7 THEN
      multiplo := 2;
    END IF;
  END LOOP;
  
  dvCalculado := CAST(11 - (suma % 11) AS TEXT);
  
  IF dvCalculado = '11' THEN
    dvCalculado := '0';
  ELSIF dvCalculado = '10' THEN
    dvCalculado := 'K';
  END IF;
  
  RETURN dv = dvCalculado;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar RUT antes de insertar o actualizar
CREATE OR REPLACE FUNCTION trigger_validar_rut()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT validar_rut(NEW.rut) THEN
    RAISE EXCEPTION 'RUT inválido: %', NEW.rut;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validar_rut_trigger
BEFORE INSERT OR UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION trigger_validar_rut();

-- Función para validar superposición de horarios
CREATE OR REPLACE FUNCTION check_horario_superposicion()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM actividades
    WHERE id_usuario = NEW.id_usuario
    AND fecha = NEW.fecha
    AND id != NEW.id
    AND (
      (hora_inicio <= NEW.hora_inicio AND hora_fin > NEW.hora_inicio) OR
      (hora_inicio < NEW.hora_fin AND hora_fin >= NEW.hora_fin) OR
      (hora_inicio >= NEW.hora_inicio AND hora_fin <= NEW.hora_fin)
    )
  ) THEN
    RAISE EXCEPTION 'Existe superposición de horarios con otra actividad';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_horario_superposicion_trigger
BEFORE INSERT OR UPDATE ON actividades
FOR EACH ROW EXECUTE FUNCTION check_horario_superposicion();

-- Función para notificar al supervisor cuando se envía una agenda
CREATE OR REPLACE FUNCTION notificar_supervisor_agenda()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'enviado' AND (OLD.estado IS NULL OR OLD.estado = 'borrador') THEN
    INSERT INTO notificaciones (id_usuario, mensaje, tipo)
    SELECT 
      u.id_supervisor, 
      'El funcionario ' || (SELECT nombres || ' ' || appaterno || ' ' || apmaterno FROM usuarios WHERE id = NEW.id_usuario) || 
      ' ha enviado su agenda del día ' || to_char(NEW.fecha, 'DD/MM/YYYY'),
      'sistema'
    FROM usuarios u
    WHERE u.id = NEW.id_usuario AND u.id_supervisor IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notificar_supervisor_agenda_trigger
AFTER INSERT OR UPDATE ON actividades
FOR EACH ROW EXECUTE FUNCTION notificar_supervisor_agenda();

-- Índices para mejorar el rendimiento
CREATE INDEX idx_actividades_id_usuario ON actividades(id_usuario);
CREATE INDEX idx_actividades_fecha ON actividades(fecha);
CREATE INDEX idx_actividades_id_proyecto ON actividades(id_proyecto);
CREATE INDEX idx_documentos_id_actividad ON documentos(id_actividad);
CREATE INDEX idx_usuarios_id_supervisor ON usuarios(id_supervisor);
CREATE INDEX idx_usuarios_nombre_usuario ON usuarios(nombre_usuario);
CREATE INDEX idx_proyectos_id_supervisor ON proyectos(id_supervisor);
CREATE INDEX idx_notificaciones_id_usuario ON notificaciones(id_usuario);

-- Función para obtener actividades de un usuario en un rango de fechas
CREATE OR REPLACE FUNCTION obtener_actividades_usuario(
  p_id_usuario UUID,
  p_fecha_inicio DATE,
  p_fecha_fin DATE
) 
RETURNS TABLE (
  id UUID,
  fecha DATE,
  hora_inicio TIME,
  hora_fin TIME,
  descripcion TEXT,
  id_proyecto UUID,
  nombre_proyecto TEXT,
  estado TEXT,
  tiene_documentos BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.fecha,
    a.hora_inicio,
    a.hora_fin,
    a.descripcion,
    a.id_proyecto,
    p.nombre AS nombre_proyecto,
    a.estado,
    EXISTS (SELECT 1 FROM documentos d WHERE d.id_actividad = a.id) AS tiene_documentos
  FROM 
    actividades a
  LEFT JOIN 
    proyectos p ON a.id_proyecto = p.id
  WHERE 
    a.id_usuario = p_id_usuario
    AND a.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
  ORDER BY 
    a.fecha DESC, a.hora_inicio ASC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener actividades de supervisados
CREATE OR REPLACE FUNCTION obtener_actividades_supervisados(
  p_id_supervisor UUID,
  p_fecha_inicio DATE,
  p_fecha_fin DATE
) 
RETURNS TABLE (
  id UUID,
  fecha DATE,
  hora_inicio TIME,
  hora_fin TIME,
  descripcion TEXT,
  id_proyecto UUID,
  nombre_proyecto TEXT,
  estado TEXT,
  id_usuario UUID,
  nombres TEXT,
  appaterno TEXT,
  apmaterno TEXT,
  tiene_documentos BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.fecha,
    a.hora_inicio,
    a.hora_fin,
    a.descripcion,
    a.id_proyecto,
    p.nombre AS nombre_proyecto,
    a.estado,
    u.id AS id_usuario,
    u.nombres,
    u.appaterno,
    u.apmaterno,
    EXISTS (SELECT 1 FROM documentos d WHERE d.id_actividad = a.id) AS tiene_documentos
  FROM 
    actividades a
  JOIN 
    usuarios u ON a.id_usuario = u.id
  LEFT JOIN 
    proyectos p ON a.id_proyecto = p.id
  WHERE 
    u.id_supervisor = p_id_supervisor
    AND a.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
  ORDER BY 
    u.appaterno, u.apmaterno, u.nombres, a.fecha DESC, a.hora_inicio ASC;
END;
$$ LANGUAGE plpgsql;
