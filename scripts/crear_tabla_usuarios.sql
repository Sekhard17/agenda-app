-- Script para crear la tabla de usuarios en Supabase

-- Primero verificamos si la tabla ya existe
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    rut VARCHAR(12) UNIQUE NOT NULL,
    nombre_usuario VARCHAR(50) UNIQUE NOT NULL,
    nombres VARCHAR(100) NOT NULL,
    appaterno VARCHAR(50) NOT NULL,
    apmaterno VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Creamos un índice para búsquedas por RUT
CREATE INDEX IF NOT EXISTS idx_usuarios_rut ON public.usuarios(rut);

-- Creamos un índice para búsquedas por nombre de usuario
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_usuario ON public.usuarios(nombre_usuario);

-- Si la tabla ya existe y solo necesitamos añadir la columna nombre_usuario
-- Puedes ejecutar este ALTER TABLE descomentándolo:
/*
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS nombre_usuario VARCHAR(50) UNIQUE;
*/

-- Configuramos RLS (Row Level Security) para la tabla usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver sus propios datos
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
ON public.usuarios 
FOR SELECT 
USING (auth.uid() = id);

-- Política para que los usuarios solo puedan actualizar sus propios datos
CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
ON public.usuarios 
FOR UPDATE 
USING (auth.uid() = id);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar el timestamp cuando se modifica un registro
DROP TRIGGER IF EXISTS set_updated_at ON public.usuarios;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Comentarios para documentar la tabla y sus columnas
COMMENT ON TABLE public.usuarios IS 'Tabla de perfiles de usuarios del sistema';
COMMENT ON COLUMN public.usuarios.id IS 'ID del usuario, referencia a auth.users';
COMMENT ON COLUMN public.usuarios.rut IS 'RUT chileno del usuario (formato: 12345678-9)';
COMMENT ON COLUMN public.usuarios.nombre_usuario IS 'Nombre de usuario único para identificación en el sistema';
COMMENT ON COLUMN public.usuarios.nombres IS 'Nombres del usuario';
COMMENT ON COLUMN public.usuarios.appaterno IS 'Apellido paterno del usuario';
COMMENT ON COLUMN public.usuarios.apmaterno IS 'Apellido materno del usuario';
