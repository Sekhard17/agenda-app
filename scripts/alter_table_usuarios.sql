-- Script para añadir la columna nombre_usuario a la tabla usuarios existente

-- Añadir columna nombre_usuario si no existe
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS nombre_usuario VARCHAR(50);

-- Hacer la columna única después de añadirla
-- (lo hacemos en un paso separado para evitar errores si ya hay datos)
ALTER TABLE public.usuarios 
ADD CONSTRAINT usuarios_nombre_usuario_key UNIQUE (nombre_usuario);

-- Crear índice para búsquedas por nombre de usuario
CREATE INDEX IF NOT EXISTS idx_usuarios_nombre_usuario ON public.usuarios(nombre_usuario);

-- Añadir comentario a la columna
COMMENT ON COLUMN public.usuarios.nombre_usuario IS 'Nombre de usuario único para identificación en el sistema';
