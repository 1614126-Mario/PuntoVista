import { INITIAL_CLIENTS } from '../data/initialClients'

const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '')

const STORAGE_KEY = 'nocturna_clientes'

export const clienteService = {
  /**
   * Obtiene la lista de clientes (desde el backend /api/clientes o fallback a localStorage)
   */
  async getClientes() {
    try {
      const response = await fetch(`${API_BASE}/api/clientes`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          return data
        }
      }
    } catch (err) {
      console.warn('Backend /api/clientes no disponible, usando almacenamiento local:', err)
    }

    // Fallback: localStorage o clientes iniciales
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        return JSON.parse(cached)
      }
    } catch (e) {
      console.error('Error leyendo clientes locales:', e)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS))
    return INITIAL_CLIENTS
  },

  /**
   * Registra un nuevo cliente (en backend y sincroniza localmente)
   */
  async createCliente(clienteData) {
    try {
      const response = await fetch(`${API_BASE}/api/clientes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(clienteData)
      })

      if (response.ok) {
        const nuevo = await response.json()
        this.saveLocal(nuevo)
        return nuevo
      }
    } catch (err) {
      console.warn('No se pudo guardar en backend, guardando localmente:', err)
    }

    // Generar ID local si no se conectó al backend
    const nuevoLocal = {
      ...clienteData,
      id: Date.now()
    }
    this.saveLocal(nuevoLocal)
    return nuevoLocal
  },

  /**
   * Guarda o actualiza un cliente en localStorage
   */
  saveLocal(cliente) {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      const list = cached ? JSON.parse(cached) : [...INITIAL_CLIENTS]
      const index = list.findIndex(c => c.id === cliente.id)
      if (index >= 0) {
        list[index] = cliente
      } else {
        list.push(cliente)
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch (e) {
      console.error('Error guardando cliente localmente:', e)
    }
  }
}

export default clienteService
