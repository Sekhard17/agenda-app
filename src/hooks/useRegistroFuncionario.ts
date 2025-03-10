import { useState } from 'react'
import { validarRut, noVacio, validarEmail, formatearRut } from '../utils/validaciones'
import { AuthService } from '../services/auth.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

interface RegistroFuncionarioForm {
  rut: string
  nombreUsuario: string
  nombres: string
  appaterno: string
  apmaterno: string
  email: string
  password: string
  confirmPassword: string
}

interface RegistroFuncionarioErrors {
  rut?: string
  nombreUsuario?: string
  nombres?: string
  appaterno?: string
  email?: string
  password?: string
  confirmPassword?: string
}

interface UseRegistroFuncionarioProps {
  onRegistroSuccess?: () => void
}

export const useRegistroFuncionario = ({ onRegistroSuccess }: UseRegistroFuncionarioProps = {}) => {
  // Estados para los campos del formulario
  const [formData, setFormData] = useState<RegistroFuncionarioForm>({
    rut: '',
    nombreUsuario: '',
    nombres: '',
    appaterno: '',
    apmaterno: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<RegistroFuncionarioErrors>({})
  const navigate = useNavigate()

  // Función para actualizar campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  // Función especial para manejar el formato del RUT
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Eliminar caracteres no numéricos ni K/k
    value = value.replace(/[^0-9kK]/g, '')
    
    // Formatear RUT (12345678-9)
    if (value.length > 1) {
      const dv = value.slice(-1)
      const rutBody = value.slice(0, -1)
      value = rutBody + '-' + dv
    }
    
    setFormData(prev => ({ ...prev, rut: value }))
    
    // Validar RUT
    if (value && !validarRut(value)) {
      setErrors(prev => ({ ...prev, rut: 'RUT inválido' }))
    } else {
      setErrors(prev => ({ ...prev, rut: undefined }))
    }
  }
  
  // Función para mostrar/ocultar contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar todos los campos
    const newErrors: Record<string, string> = {}
    
    if (!noVacio(formData.nombreUsuario)) {
      newErrors.nombreUsuario = 'El nombre de usuario es obligatorio'
    } else if (formData.nombreUsuario.length < 4) {
      newErrors.nombreUsuario = 'El nombre de usuario debe tener al menos 4 caracteres'
    }
    
    if (!noVacio(formData.rut) || !validarRut(formData.rut)) {
      newErrors.rut = 'Debe ingresar un RUT válido'
    }
    
    if (!noVacio(formData.nombres)) {
      newErrors.nombres = 'Debe ingresar sus nombres'
    }
    
    if (!noVacio(formData.appaterno)) {
      newErrors.appaterno = 'Debe ingresar su apellido paterno'
    }
    
    if (!noVacio(formData.email) || !validarEmail(formData.email)) {
      newErrors.email = 'Debe ingresar un correo electrónico válido'
    }
    
    if (!noVacio(formData.password) || formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    setErrors(newErrors)
    
    // Si no hay errores, proceder con el registro
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      
      try {
        // Formatear el RUT antes de enviarlo
        const rutFormateado = formatearRut(formData.rut)
        
        // Crear el usuario en Supabase
        await AuthService.registrarUsuario(
          rutFormateado,
          formData.password,
          formData.nombreUsuario,
          formData.nombres,
          formData.appaterno,
          formData.apmaterno,
          formData.email,
          'funcionario' // Rol de funcionario
        )
        
        toast.success('¡Registro exitoso!', {
          description: 'Tu cuenta de funcionario ha sido creada correctamente'
        })
        
        if (onRegistroSuccess) {
          onRegistroSuccess()
        }
        
        // Redirigir al login después del registro exitoso
        navigate('/login')
      } catch (error: any) {
        console.error('Error al registrar:', error)
        toast.error('Error al registrar', {
          description: error.message || 'No se pudo completar el registro'
        })
      } finally {
        setLoading(false)
      }
    }
  }

  return {
    formData,
    errors,
    loading,
    showPassword,
    handleChange,
    handleRutChange,
    togglePasswordVisibility,
    handleSubmit
  }
}
