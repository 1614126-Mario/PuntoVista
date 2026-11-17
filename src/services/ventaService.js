const API_BASE = import.meta.env.VITE_API_URL || ''

const STORAGE_KEY = 'nocturna_ventas'

export const ventaService = {
  /**
   * Estado de la última comunicación con el backend:
   * 'ok' | 'sin_sesion' (401/403) | 'sin_conexion'
   */
  estadoServidor: 'ok',

  /**
   * Obtiene la lista de todas las ventas / facturas realizadas
   */
  async getVentas() {
    try {
      const response = await fetch(`${API_BASE}/api/ventas`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      })

      if (response.ok) {
        this.estadoServidor = 'ok'
        const data = await response.json()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        return data
      }

      if (response.status === 401 || response.status === 403) {
        this.estadoServidor = 'sin_sesion'
      } else {
        this.estadoServidor = 'sin_conexion'
      }
    } catch (err) {
      this.estadoServidor = 'sin_conexion'
      console.warn('Backend /api/ventas no disponible, usando almacenamiento local:', err)
    }

    const cached = localStorage.getItem(STORAGE_KEY)
    return cached ? JSON.parse(cached) : []
  },

  /**
   * Registra una nueva venta / factura en el backend (o respaldo local)
   */
  async createVenta(venta) {
    try {
      const response = await fetch(`${API_BASE}/api/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(venta)
      })

      if (response.ok) {
        this.estadoServidor = 'ok'
        const data = await response.json()
        this.saveLocal(data)
        return data
      }

      if (response.status === 401 || response.status === 403) {
        this.estadoServidor = 'sin_sesion'
      } else {
        this.estadoServidor = 'sin_conexion'
      }
    } catch (err) {
      this.estadoServidor = 'sin_conexion'
      console.warn('Backend /api/ventas no disponible al crear venta, guardando localmente:', err)
    }

    const guardadaLocal = {
      ...venta,
      id: Date.now(),
      numeroFactura: venta.numeroFactura || `FAC-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      fechaVenta: new Date().toISOString()
    }

    this.saveLocal(guardadaLocal)
    return guardadaLocal
  },

  /**
   * Marca un pedido pendiente como cobrado en el backend y envía la factura electrónica por correo.
   */
  async cobrar(venta, metodoPago, email) {
    try {
      const emailFinal = email || venta.cliente?.email || ''
      const response = await fetch(`${API_BASE}/api/ventas/${venta.id}/cobro`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ metodoPago, email: emailFinal })
      })
      if (response.ok) return await response.json()
    } catch (err) {
      console.warn('No se pudo registrar el cobro en el backend:', err)
    }
    return null
  },

  /**
   * Reenvía la factura electrónica por correo al cliente.
   */
  async enviarFacturaEmail(ventaId, email) {
    try {
      const response = await fetch(`${API_BASE}/api/ventas/${ventaId}/enviar-factura`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email })
      })
      if (response.ok) return await response.json()
    } catch (err) {
      console.warn('No se pudo enviar la factura por correo:', err)
    }
    return null
  },

  /**
   * Guarda o actualiza venta en localStorage
   */
  saveLocal(venta) {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      const list = cached ? JSON.parse(cached) : []
      const index = list.findIndex(v => v.id === venta.id)
      if (index >= 0) {
        list[index] = venta
      } else {
        list.unshift(venta)
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch (e) {
      console.error('Error guardando venta localmente:', e)
    }
  }
}

export default ventaService
