import { useState } from 'react'
import {
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  HelpCircle,
  CheckCircle2,
  Zap,
  Coffee
} from 'lucide-react'
import authService from './services/authService'
import './Login.css'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('cajero')
  const [password, setPassword] = useState('cajero123')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('cajero') // 'cajero' | 'admin' | 'mesero'
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [forgotModalOpen, setForgotModalOpen] = useState(false)

  // Cuentas demo preconfiguradas
  const demoAccounts = {
    cajero: {
      username: 'cajero',
      password: 'cajero123',
      name: 'Carlos Vega',
      roleLabel: 'Cajero Principal',
      avatar: 'CV'
    },
    admin: {
      username: 'admin',
      password: 'admin123',
      name: 'Diana Mendoza',
      roleLabel: 'Gerente General',
      avatar: 'DM'
    },
    mesero: {
      username: 'mesero',
      password: 'mesero123',
      name: 'Andrea Soto',
      roleLabel: 'Mesera de Turno',
      avatar: 'AS'
    }
  }

  // Cambio de pestañas de rol
  const handleSelectRole = (selectedRole) => {
    setRole(selectedRole)
    setErrorMessage('')
    const acc = demoAccounts[selectedRole]
    if (acc) {
      setUsername(acc.username)
      setPassword(acc.password)
    }
  }

  // Manejo de Login con Backend Spring Boot
  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    if (!username.trim()) {
      setErrorMessage('Por favor ingresa tu usuario o correo.')
      return
    }

    if (!password) {
      setErrorMessage('Por favor ingresa tu contraseña de acceso.')
      return
    }

    setIsLoading(true)

    try {
      // Llamada real al backend Spring Boot /api/auth/login
      const data = await authService.login(username.trim(), password)

      const roles = data.roles || []
      const isAdmin = roles.some(r => r.toUpperCase().includes('ADMIN'))
      const isCajero = roles.some(r => r.toUpperCase().includes('CAJERO'))

      // Determinamos el perfil del usuario autenticado
      let userProfile = null
      if (isAdmin) {
        userProfile = {
          username: data.username || username.trim(),
          name: demoAccounts.admin.name,
          role: 'admin',
          roleLabel: 'Administrador',
          avatar: 'DM',
          roles: roles
        }
      } else if (isCajero) {
        userProfile = {
          username: data.username || username.trim(),
          name: demoAccounts.cajero.name,
          role: 'cajero',
          roleLabel: 'Cajero Principal',
          avatar: 'CV',
          roles: roles
        }
      } else {
        userProfile = {
          username: data.username || username.trim(),
          name: data.username || 'Usuario',
          role: 'usuario',
          roleLabel: 'Usuario del Sistema',
          avatar: (data.username || 'US').slice(0, 2).toUpperCase(),
          roles: roles
        }
      }

      onLogin(userProfile, rememberMe)
    } catch (error) {
      setErrorMessage(error.message || 'Error al autenticar credenciales en el servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-page">
      {/* Fondo con luces y orbes morados neón */}
      <div className="login-bg-glow glow-top-left" />
      <div className="login-bg-glow glow-bottom-right" />
      <div className="login-bg-glow glow-center" />
      <div className="login-grid-overlay" />

      {/* Contenedor de la tarjeta de Login */}
      <div className="login-container">
        <div className="login-card">
          {/* Logo y Encabezado */}
          <div className="login-header">
            <div className="login-brand-icon">
              <Sparkles size={32} className="pulse-icon" />
            </div>
            <h1 className="login-title">
              <span className="login-purple-gradient">La Taberna de los Morenazos</span>
            </h1>
            <p className="login-subtitle">
              Ingresa tus credenciales para acceder al sistema
            </p>
          </div>

          {/* Selector de Rol / Perfil */}
          <div className="login-roles-selector">
            <button
              type="button"
              className={`role-chip ${role === 'cajero' ? 'active' : ''}`}
              onClick={() => handleSelectRole('cajero')}
            >
              <Zap size={14} />
              <span>Cajero</span>
            </button>
            <button
              type="button"
              className={`role-chip ${role === 'admin' ? 'active' : ''}`}
              onClick={() => handleSelectRole('admin')}
            >
              <ShieldCheck size={14} />
              <span>Administrador</span>
            </button>
            <button
              type="button"
              className={`role-chip ${role === 'mesero' ? 'active' : ''}`}
              onClick={() => handleSelectRole('mesero')}
            >
              <Coffee size={14} />
              <span>Mesero</span>
            </button>
          </div>

          {/* Mensaje de error si falla validación */}
          {errorMessage && (
            <div className="login-error-banner">
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Input Usuario */}
            <div className="login-field-group">
              <label htmlFor="login-username" className="login-label">
                Usuario / Correo
              </label>
              <div className="login-input-wrapper">
                <User size={18} className="login-input-icon" />
                <input
                  id="login-username"
                  type="text"
                  className="login-input"
                  placeholder="Ej: cajero o admin"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    setErrorMessage('')
                  }}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="login-field-group">
              <div className="login-label-row">
                <label htmlFor="login-password" className="login-label">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="login-forgot-btn"
                  onClick={() => setForgotModalOpen(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="login-input-wrapper">
                <Lock size={18} className="login-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Ingresa tu clave secreta"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setErrorMessage('')
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Checkbox Recordar Sesión */}
            <div className="login-options-row">
              <label className="login-checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="login-checkbox"
                />
                <span className="custom-checkmark" />
                <span>Mantener sesión iniciada</span>
              </label>
            </div>

            {/* Botón Principal de Inicio de Sesión */}
            <button
              type="submit"
              className="login-submit-btn"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="login-spinner" />
                  <span>Autenticando acceso...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Iniciar Sesión en La Taberna</span>
                </>
              )}
            </button>
          </form>

          {/* Accesos Rápidos Demo */}
          <div className="login-quick-access">
            <span className="quick-access-title">Cuentas rápidas de prueba:</span>
            <div className="quick-access-buttons">
              <button
                type="button"
                className="quick-btn"
                onClick={() => {
                  handleSelectRole('cajero')
                }}
              >
                <div className="quick-badge">Cajero</div>
                <div className="quick-meta">
                  <strong>cajero</strong> / cajero123
                </div>
              </button>
              <button
                type="button"
                className="quick-btn"
                onClick={() => {
                  handleSelectRole('admin')
                }}
              >
                <div className="quick-badge admin-badge">Admin</div>
                <div className="quick-meta">
                  <strong>admin</strong> / admin123
                </div>
              </button>
            </div>
          </div>

          {/* Pie de seguridad */}
          <div className="login-footer">
            <div className="security-tag">
              <ShieldCheck size={15} color="#a855f7" />
              <span>Conexión protegida SSL • La Taberna de los Morenazos POS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Ayuda / Olvidé mi Contraseña */}
      {forgotModalOpen && (
        <div className="login-modal-overlay" onClick={() => setForgotModalOpen(false)}>
          <div className="login-modal" onClick={(e) => e.stopPropagation()}>
            <div className="login-modal-header">
              <div className="login-modal-icon">
                <KeyRound size={24} color="#c084fc" />
              </div>
              <h3 className="login-modal-title">Recuperación de Acceso</h3>
            </div>
            <div className="login-modal-body">
              <p>
                Por razones de seguridad del Punto de Venta <strong>La Taberna de los Morenazos</strong>, las contraseñas son administradas por el Gerente del sistema.
              </p>
              <div className="login-modal-info-box">
                <div className="info-item">
                  <strong>Cajero:</strong> usuario <code>cajero</code> | clave <code>cajero123</code>
                </div>
                <div className="info-item">
                  <strong>Administrador:</strong> usuario <code>admin</code> | clave <code>admin123</code>
                </div>
                <div className="info-item">
                  <strong>Mesero:</strong> usuario <code>mesero</code> | clave <code>mesero123</code>
                </div>
              </div>
              <p className="login-modal-note">
                Puedes dar clic en cualquiera de las cuentas de prueba para ingresar de inmediato.
              </p>
            </div>
            <div className="login-modal-actions">
              <button
                type="button"
                className="login-modal-close-btn"
                onClick={() => setForgotModalOpen(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
