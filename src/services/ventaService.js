const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '')

const STORAGE_KEY = 'nocturna_ventas'

export const ventaService = {
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
        const data = await response.json()
        if (Array.isArray(data)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
          return data
        }
      }
    } catch (err) {
      console.warn('Backend /api/ventas no disponible, usando almacenamiento local:', err)
    }

    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  },

  /**
   * Crea una nueva venta / factura en el backend
   */
  async createVenta(ventaData) {
    try {
      const response = await fetch(`${API_BASE}/api/ventas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(ventaData)
      })

      if (response.ok) {
        const guardada = await response.json()
        this.saveLocal(guardada)
        return guardada
      }
    } catch (err) {
      console.warn('No se pudo guardar la venta en backend, persistiendo localmente:', err)
    }

    // Fallback local: generar folio y totales
    const subtotal = ventaData.detalles.reduce((acc, it) => acc + (it.precioUnitario * it.cantidad), 0)
    const iva = Number((subtotal * 0.13).toFixed(2)) // 13% IVA El Salvador
    const total = Number((subtotal + iva).toFixed(2))

    const guardadaLocal = {
      ...ventaData,
      id: Date.now(),
      fechaVenta: new Date().toISOString(),
      numeroFactura: ventaData.numeroFactura || `FAC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      subtotal,
      iva,
      total,
      estado: ventaData.estado || 'FACTURADO'
    }

    this.saveLocal(guardadaLocal)
    return guardadaLocal
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
