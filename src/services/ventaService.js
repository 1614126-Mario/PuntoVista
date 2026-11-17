const API_BASE = import.meta.env.VITE_API_URL || ''

const STORAGE_KEY = 'nocturna_ventas'

export const ventaService = {
  /**
   * Estado de la última comunicación con el backend:
   * 'ok' | 'sin_sesion' (401/403) | 'sin_conexion'
   */
  estadoServidor: 'ok',

  /**
   * Obtiene la lista de todas las ventas / facturas realizadas (siempre datos frescos sin caché)
   */
  async getVentas() {
    try {
      const url = `${API_BASE}/api/ventas?_t=${Date.now()}`
      const response = await fetch(url, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
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
   * Actualiza el estado o datos de una venta en backend y almacenamiento local
   */
  async updateVenta(ventaId, datos) {
    this.saveLocal({ ...datos, id: ventaId })
    try {
      const response = await fetch(`${API_BASE}/api/ventas/${encodeURIComponent(ventaId)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(datos)
      })
      if (response.ok) {
        const data = await response.json()
        this.saveLocal(data)
        return data
      }
    } catch (err) {
      console.warn('Error actualizando venta en backend:', err)
    }
    return null
  },

  /**
   * Elimina definitivamente una venta del backend y del almacenamiento local
   */
  async deleteVenta(ventaOrId) {
    const id = typeof ventaOrId === 'object' ? ventaOrId?.id : ventaOrId
    const folio = typeof ventaOrId === 'object' ? (ventaOrId?.numeroFactura || ventaOrId?.folio) : null
    const param = id != null ? id : folio

    // Siempre eliminar de cache local inmediatamente para que nunca reaparezca
    this.removeLocal(id, folio)

    try {
      let response = await fetch(`${API_BASE}/api/ventas/${encodeURIComponent(param)}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      // Si no encontró por ID numérico pero tenemos el folio, intentar eliminar por folio
      if (!response.ok && folio && String(folio) !== String(id)) {
        response = await fetch(`${API_BASE}/api/ventas/${encodeURIComponent(folio)}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      }

      if (response.ok || response.status === 204 || response.status === 404) {
        this.estadoServidor = 'ok'
        return true
      }
      if (response.status === 401 || response.status === 403) {
        this.estadoServidor = 'sin_sesion'
      }
    } catch (err) {
      console.warn('No se pudo eliminar la venta en el backend, se eliminó del almacenamiento local:', err)
    }
    return true
  },

  /**
   * Elimina una venta del localStorage por ID o por folio
   */
  removeLocal(ventaId, numeroFactura) {
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (!cached) return
      const list = JSON.parse(cached).filter(v => {
        const matchesId = ventaId != null && String(v.id) === String(ventaId)
        const matchesFolio = numeroFactura && (v.numeroFactura === numeroFactura || v.folio === numeroFactura)
        return !matchesId && !matchesFolio
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
    } catch (e) {
      console.error('Error eliminando venta local:', e)
    }
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
