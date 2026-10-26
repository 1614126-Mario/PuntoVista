import { useState, useMemo } from 'react'
import {
  Utensils,
  Truck,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  FileText,
  Search,
  Filter,
  DollarSign,
  Plus
} from 'lucide-react'

export default function PanelMesero({
  ventas = [],
  onTomarNuevoPedido
}) {
  const [filterTab, setFilterTab] = useState('ALL') // 'ALL' | 'LOCAL' | 'EN_LINEA' | 'LLEVAR' | 'DEBEN'
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrado de pedidos
  const pedidosFiltrados = useMemo(() => {
    return ventas.filter((v) => {
      const matchTipo =
        filterTab === 'ALL'
          ? true
          : filterTab === 'DEBEN'
          ? v.estado === 'PENDIENTE_PAGO'
          : (v.tipoPedido || 'LOCAL') === filterTab

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchTipo

      const folio = (v.numeroFactura || v.folio || '').toLowerCase()
      const clienteNom = (v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido || ''}` : '').toLowerCase()
      const mesa = (v.numeroMesa || '').toLowerCase()
      const dir = (v.direccionEntrega || '').toLowerCase()

      const matchSearch = folio.includes(q) || clienteNom.includes(q) || mesa.includes(q) || dir.includes(q)
      return matchTipo && matchSearch
    })
  }, [ventas, filterTab, searchQuery])

  // Contadores y métricas para el mesero
  const totalPedidos = ventas.length
  const pedidosDeben = ventas.filter((v) => v.estado === 'PENDIENTE_PAGO').length
  const pedidosLocal = ventas.filter((v) => (v.tipoPedido || 'LOCAL') === 'LOCAL').length
  const pedidosDelivery = ventas.filter((v) => v.tipoPedido === 'EN_LINEA').length
  const pedidosLlevar = ventas.filter((v) => v.tipoPedido === 'LLEVAR').length

  return (
    <div className="waiter-panel-container">
      {/* HEADER DEL MESERO */}
      <div className="waiter-header-card">
        <div>
          <h2 className="waiter-title">
            <Utensils size={24} color="#10b981" />
            <span>Control de Comandas y Pedidos (Mesero)</span>
          </h2>
          <p className="waiter-subtitle">
            Monitorea los pedidos realizados, mesas y direcciones de entrega, y conoce cuáles están pendientes de pago.
          </p>
        </div>

        <button
          type="button"
          className="btn-add-product"
          onClick={onTomarNuevoPedido}
          style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>+ Tomar Nuevo Pedido</span>
        </button>
      </div>

      {/* TARJETAS DE CONTROL DEL MESERO */}
      <div className="waiter-kpi-grid">
        <div className="waiter-kpi-card">
          <div className="kpi-icon-box bg-purple-glow">
            <FileText size={22} color="#c084fc" />
          </div>
          <div>
            <span className="waiter-kpi-lbl">Total de Pedidos Tomados</span>
            <h3 className="waiter-kpi-val">{totalPedidos}</h3>
          </div>
        </div>

        <div className="waiter-kpi-card">
          <div className="kpi-icon-box bg-emerald-glow">
            <Utensils size={22} color="#4ade80" />
          </div>
          <div>
            <span className="waiter-kpi-lbl">Entregas en Mesa (Salón)</span>
            <h3 className="waiter-kpi-val">{pedidosLocal}</h3>
          </div>
        </div>

        <div className="waiter-kpi-card">
          <div className="kpi-icon-box bg-blue-glow">
            <Truck size={22} color="#38bdf8" />
          </div>
          <div>
            <span className="waiter-kpi-lbl">Envíos a Domicilio</span>
            <h3 className="waiter-kpi-val">{pedidosDelivery}</h3>
          </div>
        </div>

        <div className="waiter-kpi-card highlight-deben">
          <div className="kpi-icon-box bg-amber-glow">
            <AlertCircle size={22} color="#f59e0b" />
          </div>
          <div>
            <span className="waiter-kpi-lbl">Pendientes de Pago (Deben)</span>
            <h3 className="waiter-kpi-val" style={{ color: '#fbbf24' }}>{pedidosDeben}</h3>
          </div>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="history-controls-card">
        <div className="history-controls-top">
          <div className="search-box" style={{ flex: 1 }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por mesa (ej: Mesa 2), dirección de entrega o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="history-filter-tabs">
          <button
            type="button"
            className={`filter-pill ${filterTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterTab('ALL')}
          >
            Todos ({ventas.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterTab === 'LOCAL' ? 'active' : ''}`}
            onClick={() => setFilterTab('LOCAL')}
          >
            <Utensils size={14} /> En Mesas ({pedidosLocal})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterTab === 'EN_LINEA' ? 'active' : ''}`}
            onClick={() => setFilterTab('EN_LINEA')}
          >
            <Truck size={14} /> Domicilio / En Línea ({pedidosDelivery})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterTab === 'LLEVAR' ? 'active' : ''}`}
            onClick={() => setFilterTab('LLEVAR')}
          >
            <ShoppingBag size={14} /> Para Llevar ({pedidosLlevar})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterTab === 'DEBEN' ? 'active' : ''}`}
            onClick={() => setFilterTab('DEBEN')}
            style={{ color: '#fbbf24', borderColor: filterTab === 'DEBEN' ? '#f59e0b' : 'rgba(245, 158, 11, 0.3)' }}
          >
            <AlertCircle size={14} /> Por Cobrar / Deben ({pedidosDeben})
          </button>
        </div>
      </div>

      {/* LISTADO DE PEDIDOS / COMANDAS */}
      {pedidosFiltrados.length === 0 ? (
        <div className="empty-catalog" style={{ marginTop: '2rem' }}>
          <Utensils className="empty-catalog-icon" size={48} />
          <h3>No hay pedidos registrados con este filtro</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            Pulsa en "+ Tomar Nuevo Pedido" para ingresar una nueva orden al sistema.
          </p>
          <button
            type="button"
            className="btn-add-product"
            onClick={onTomarNuevoPedido}
          >
            + Tomar Pedido Ahora
          </button>
        </div>
      ) : (
        <div className="waiter-orders-grid">
          {pedidosFiltrados.map((pedido) => {
            const fecha = pedido.fechaVenta ? new Date(pedido.fechaVenta) : new Date()
            const debe = pedido.estado === 'PENDIENTE_PAGO'
            const isLocal = !pedido.tipoPedido || pedido.tipoPedido === 'LOCAL'
            const isOnline = pedido.tipoPedido === 'EN_LINEA'

            return (
              <div
                key={pedido.id}
                className={`waiter-order-card ${debe ? 'card-debe' : 'card-pagada'}`}
              >
                {/* Cabecera del pedido */}
                <div className="waiter-order-header">
                  <div>
                    <span className="waiter-order-folio">
                      {pedido.numeroFactura || pedido.folio || `ORD-${pedido.id}`}
                    </span>
                    <div style={{ fontSize: '0.74rem', color: '#9ca3af', marginTop: '2px' }}>
                      {fecha.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })} • {fecha.toLocaleDateString('es-SV')}
                    </div>
                  </div>

                  <span className={`waiter-status-badge ${debe ? 'status-debe' : 'status-ok'}`}>
                    {debe ? '⚠️ DEBEN (PENDIENTE)' : '✅ COBRADO'}
                  </span>
                </div>

                {/* DESTINO DE ENTREGA: DÓNDE TIENE QUE IR A DEJARLO */}
                <div className="waiter-destination-box">
                  <div className="destination-title">
                    <MapPin size={15} color={isOnline ? '#38bdf8' : '#4ade80'} />
                    <span>Lugar de Entrega:</span>
                  </div>
                  <div className="destination-value">
                    {isLocal && (
                      <span className="dest-mesa">
                        🍽️ {pedido.numeroMesa || 'Mesa 1 (Salón)'}
                      </span>
                    )}
                    {isOnline && (
                      <span className="dest-delivery">
                        🛵 {pedido.direccionEntrega || pedido.cliente?.direccion || 'Dirección de Entrega no especificada'}
                      </span>
                    )}
                    {pedido.tipoPedido === 'LLEVAR' && (
                      <span className="dest-takeout">
                        🛍️ Mostrador (Para Llevar)
                      </span>
                    )}
                  </div>
                </div>

                {/* CLIENTE */}
                <div className="waiter-client-row">
                  <strong>Cliente:</strong>{' '}
                  <span>
                    {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido || ''}` : 'Consumidor Final'}
                  </span>
                  {pedido.cliente?.telefono && (
                    <span style={{ color: '#9ca3af', fontSize: '0.78rem' }}> ({pedido.cliente.telefono})</span>
                  )}
                </div>

                {/* NOTAS O INSTRUCCIONES */}
                {pedido.notas && (
                  <div className="waiter-notes-box">
                    <strong>Nota:</strong> "{pedido.notas}"
                  </div>
                )}

                {/* LISTA DE PLATILLOS DE LA COMANDA */}
                <div className="waiter-items-list">
                  <span className="items-title">Platillos a servir:</span>
                  {(pedido.detalles || pedido.items || []).map((it, idx) => (
                    <div key={idx} className="waiter-item-line">
                      <span className="it-qty">{it.cantidad || it.quantity || 1}x</span>
                      <span className="it-name">{it.nombreProducto || it.name || 'Platillo'}</span>
                    </div>
                  ))}
                </div>

                {/* TOTAL */}
                <div className="waiter-order-footer">
                  <div>
                    <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>TOTAL DEL PEDIDO</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: debe ? '#fbbf24' : '#fff' }}>
                      ${Number(pedido.total || 0).toFixed(2)}
                    </div>
                  </div>

                  <span className="order-cajero-tag">
                    {debe ? 'Pendiente en Caja' : 'Facturado'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
