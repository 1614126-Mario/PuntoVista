const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '')

const STORAGE_KEY = 'taberna_mis_pedidos'

async function leerError(response) {
  const data = await response.json().catch(() => null)
  return data?.message || `Error del servidor (${response.status})`
}

export const pedidoPublicoService = {
  /**
   * Envía un pedido en línea. No hay respaldo local: si el servidor no responde
   * el pedido no llegaría al personal, así que se informa el error al cliente.
   */
  async crearPedido(pedido) {
    let response
    try {
      response = await fetch(`${API_BASE}/api/publico/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(pedido)
      })
    } catch {
      throw new Error('No pudimos conectar con el restaurante. Revisa tu conexión e inténtalo de nuevo.')
    }

    if (!response.ok) throw new Error(await leerError(response))

    const creado = await response.json()
    this.guardarPedidoLocal(creado)
    return creado
  },

  /** Consulta el estado actual de un pedido por su folio. */
  async consultarPedido(folio) {
    let response
    try {
      response = await fetch(`${API_BASE}/api/publico/pedidos/${encodeURIComponent(folio)}`, {
        headers: { Accept: 'application/json' }
      })
    } catch {
      throw new Error('No pudimos conectar con el restaurante.')
    }
    if (!response.ok) throw new Error(await leerError(response))
    return response.json()
  },

  /** Pedidos hechos desde este dispositivo. */
  getPedidosLocales() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
      return Array.isArray(data) ? data : []
    } catch {
      return []
    }
  },

  guardarPedidoLocal(pedido) {
    const lista = this.getPedidosLocales().filter((p) => p.folio !== pedido.folio)
    lista.unshift({
      folio: pedido.folio,
      fecha: pedido.fecha,
      total: pedido.total,
      direccionEntrega: pedido.direccionEntrega
    })
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista.slice(0, 20)))
  }
}

export default pedidoPublicoService
