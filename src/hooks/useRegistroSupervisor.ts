import { useState } from 'react'
import { validarRut, noVacio, validarEmail } from '../utils/validaciones'
import { AuthService } from '../services/auth.service'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

interface RegistroSupervisorForm {
  rut: string
  nombreUsuario: string
  nombres: string
  appaterno: string
  apmaterno: string
  email: string
  password: string
  confirmPassword: string
}

interface RegistroSupervisorErrors {
  rut?: string
  nombreUsuario?: string
  nombres?: string
  appaterno?: string
  email?: string
  password?: string
  confirmPassword?: string
}

interface UseRegistroSupervisorProps {
  onRegistroSuccess?: () => void
}

export const useRegistroSupervisor = ({ onRegistroSuccess }: UseRegistroSupervisorProps = {}) => {
  // Estados para los campos del formulario
  const [formData, setFormData] = useState<RegistroSupervisorForm>({
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
  const [errors, setErrors] = useState<RegistroSupervisorErrors>({})
  const navigate = useNavigate()

  // Función para actualizar campos del formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo que se está editando
    if (errors[name as keyof RegistroSupervisorErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
  }

  // Función para formatear RUT mientras se escribe
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

  // Alternar visibilidad de la contraseña
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  // Validar formulario
  const validateForm = () => {
    const newErrors: RegistroSupervisorErrors = {}
    
    // Validar RUT
    if (!formData.rut) {
      newErrors.rut = 'El RUT es obligatorio'
    } else if (!validarRut(formData.rut)) {
      newErrors.rut = 'RUT inválido'
    }
    
    // Validar nombre de usuario
    if (!formData.nombreUsuario) {
      newErrors.nombreUsuario = 'El nombre de usuario es obligatorio'
    } else if (formData.nombreUsuario.length < 4) {
      newErrors.nombreUsuario = 'El nombre de usuario debe tener al menos 4 caracteres'
    }
    
    // Validar nombres
    if (!noVacio(formData.nombres)) {
      newErrors.nombres = 'Los nombres son obligatorios'
    }
    
    // Validar apellido paterno
    if (!noVacio(formData.appaterno)) {
      newErrors.appaterno = 'El apellido paterno es obligatorio'
    }
    
    // Validar email
    if (!formData.email) {
      newErrors.email = 'El email es obligatorio'
    } else if (!validarEmail(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    
    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria'
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres'
    }
    
    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    
    try {
      await AuthService.registrarUsuario(
        formData.rut,
        formData.password,
        formData.nombreUsuario,
        formData.nombres,
        formData.appaterno,
        formData.apmaterno,
        formData.email,
        'supervisor' // Rol de supervisor
      )
      
      toast.success('¡Registro exitoso!', {
        description: 'Tu cuenta de supervisor ha sido creada correctamente'
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
