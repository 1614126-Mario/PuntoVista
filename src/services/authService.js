/**
 * Servicio de Autenticación para Punto de Venta
 * Conexión con Spring Boot Security (sesiones HTTP con JSESSIONID)
 */

// Si se ejecuta en Vite dev server, la ruta relativa aprovecha el proxy configurado en vite.config.js.
// De lo contrario, utiliza la variable de entorno VITE_API_URL.
const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '')

export const authService = {
  /**
   * Inicia sesión enviando credenciales en formato JSON al endpoint /api/auth/login
   * @param {string} username - Nombre de usuario
   * @param {string} password - Contraseña
   * @returns {Promise<{status: string, message: string, username: string, roles: string[]}>}
   */
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include', // Imprescindible para persistir la cookie JSESSIONID
        body: JSON.stringify({ username, password })
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const errorMsg = data?.message || (response.status === 401 
          ? 'Credenciales incorrectas o usuario inactivo.' 
          : `Error en el servidor (${response.status})`)
        throw new Error(errorMsg)
      }

      return data
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('No se pudo conectar con el servidor backend. Verifica que Spring Boot esté iniciado en el puerto 8081.')
      }
      throw error
    }
  },

  /**
   * Obtiene la información del usuario autenticado en la sesión actual
   * @returns {Promise<{status: string, username: string, roles: string[]}>}
   */
  async getCurrentUser() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        return null
      }

      return await response.json()
    } catch (error) {
      console.warn('Error al verificar sesión activa:', error)
      return null
    }
  },

  /**
   * Verifica si la sesión del backend sigue activa.
   * @returns {Promise<'ok'|'expirada'|'sin_conexion'>}
   */
  async verificarSesion() {
    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      })
      if (response.ok) return 'ok'
      return response.status === 401 || response.status === 403 ? 'expirada' : 'sin_conexion'
    } catch {
      return 'sin_conexion'
    }
  },

  /**
   * Cierra la sesión en el backend invalidando la sesión HTTP
   */
  async logout() {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      })
    } catch (error) {
      console.warn('Error al cerrar sesión en el servidor:', error)
    }
  }
}

export default authService
