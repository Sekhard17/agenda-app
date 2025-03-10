import { supabase } from '../lib/supabase'
import { Usuario } from '../hooks/useAuth'

/**
 * Servicio para manejar la autenticación con Supabase
 */
export const AuthService = {
  /**
   * Inicia sesión con RUT y contraseña
   * @param rut RUT del usuario
   * @param password Contraseña del usuario
   */
  async loginWithRut(rut: string, password: string) {
    try {
      // Buscamos el email asociado al RUT
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('email')
        .eq('rut', rut)
        .single()
      
      if (usuarioError) {
        throw new Error('Usuario no encontrado')
      }
      
      // Iniciamos sesión con el email encontrado
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuarioData.email,
        password
      })
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      throw error
    }
  },
  
  /**
   * Inicia sesión con nombre de usuario y contraseña
   * @param nombreUsuario Nombre de usuario
   * @param password Contraseña del usuario
   */
  async loginWithNombreUsuario(nombreUsuario: string, password: string) {
    try {
      // Primero buscamos el RUT asociado al nombre de usuario
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('email')
        .eq('nombre_usuario', nombreUsuario)
        .single()
      
      if (usuarioError) {
        throw new Error('Usuario no encontrado')
      }
      
      // Iniciamos sesión con el email encontrado
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuarioData.email,
        password
      })
      
      if (error) {
        throw error
      }
      
      return data
    } catch (error) {
      throw error
    }
  },
  
  /**
   * Obtiene los datos del usuario por su ID
   * @param userId ID del usuario
   * @returns Datos del usuario
   */
  async getUserData(userId: string): Promise<Usuario> {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error) {
        throw error
      }
      
      if (!data) {
        throw new Error('Usuario no encontrado')
      }
      
      return data as Usuario
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error)
      throw error
    }
  },
  
  /**
   * Registra un nuevo usuario
   * @param rut RUT del usuario
   * @param password Contraseña del usuario
   * @param nombreUsuario Nombre de usuario
   * @param nombres Nombres del usuario
   * @param appaterno Apellido paterno
   * @param apmaterno Apellido materno
   * @param email Correo electrónico del usuario
   * @param rol Rol del usuario (funcionario/supervisor)
   */
  async registrarUsuario(
    rut: string, 
    password: string, 
    nombreUsuario: string, 
    nombres: string, 
    appaterno: string, 
    apmaterno: string,
    email: string,
    rol: 'funcionario' | 'supervisor' = 'funcionario'
  ) {
    // Registrar usuario en Auth con emailConfirm=false para evitar verificación
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          rut,
          nombre_usuario: nombreUsuario,
          nombres,
          appaterno,
          apmaterno,
          rol
        },
        emailRedirectTo: window.location.origin + '/login',
      }
    })
    
    if (error) {
      throw error
    }
    
    // Si el registro fue exitoso, insertamos los datos en la tabla de usuarios
    if (data.user) {
      const { error: perfilError } = await supabase
        .from('usuarios')
        .insert({
          id: data.user.id,
          rut,
          nombre_usuario: nombreUsuario,
          nombres,
          appaterno,
          apmaterno,
          email,
          rol
        })
      
      if (perfilError) {
        // Si hay error al crear el perfil, intentamos eliminar el usuario auth
        await supabase.auth.admin.deleteUser(data.user.id)
        throw perfilError
      }
      
      // Intentamos iniciar sesión automáticamente para confirmar el usuario
      try {
        await this.loginWithRut(rut, password)
      } catch (loginError) {
        console.log('Auto-login después del registro falló:', loginError)
        // No propagamos este error, ya que el registro fue exitoso
      }
    }
    
    return data
  },
  
  /**
   * Cierra la sesión del usuario actual
   */
  async logout() {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
    
    return true
  },
  
  /**
   * Obtiene la sesión actual
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      throw error
    }
    
    return data.session
  },
  
  /**
   * Verifica si hay un usuario autenticado
   */
  async isAuthenticated() {
    const session = await this.getSession()
    return !!session
  }
}
