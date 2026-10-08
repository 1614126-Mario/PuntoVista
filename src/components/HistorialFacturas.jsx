import { useState, useMemo } from 'react'
import {
  FileText,
  Search,
  Filter,
  Utensils,
  Truck,
  ShoppingBag,
  Eye,
  Calendar,
  Clock,
  User,
  DollarSign,
  TrendingUp,
  Receipt,
  RotateCcw
} from 'lucide-react'

export default function HistorialFacturas({
  ventas = [],
  onVerFactura,
  onRecargar,
  onIrAlPOS
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterTipo, setFilterTipo] = useState('ALL') // 'ALL' | 'LOCAL' | 'EN_LINEA' | 'LLEVAR'

  // Filtrado de ventas
  const filteredVentas = useMemo(() => {
    return ventas.filter((v) => {
      const matchTipo = filterTipo === 'ALL' || (v.tipoPedido || 'LOCAL') === filterTipo

      const q = searchQuery.toLowerCase().trim()
      if (!q) return matchTipo

      const folio = (v.numeroFactura || v.folio || '').toLowerCase()
      const clienteNom = (v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido || ''} ${v.cliente.documento || ''}` : '').toLowerCase()
      const mesa = (v.numeroMesa || '').toLowerCase()
      const dir = (v.direccionEntrega || '').toLowerCase()

      const matchSearch = folio.includes(q) || clienteNom.includes(q) || mesa.includes(q) || dir.includes(q)
      return matchTipo && matchSearch
    })
  }, [ventas, filterTipo, searchQuery])

  // Métricas
  const totalFacturado = ventas.reduce((acc, v) => acc + Number(v.total || 0), 0)
  const pedidosLocales = ventas.filter((v) => (v.tipoPedido || 'LOCAL') === 'LOCAL').length
  const pedidosOnline = ventas.filter((v) => v.tipoPedido === 'EN_LINEA').length

  return (
    <div className="history-view-container">
      {/* TARJETAS DE RESUMEN SUPERIOR */}
      <div className="metrics-cards-grid">
        <div className="metric-card">
          <div className="metric-icon-box bg-purple-glow">
            <DollarSign size={22} color="#c084fc" />
          </div>
          <div>
            <span className="metric-label">Total Facturado</span>
            <h3 className="metric-value">${totalFacturado.toFixed(2)}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-blue-glow">
            <Receipt size={22} color="#38bdf8" />
          </div>
          <div>
            <span className="metric-label">Facturas Emitidas</span>
            <h3 className="metric-value">{ventas.length}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-emerald-glow">
            <Utensils size={22} color="#4ade80" />
          </div>
          <div>
            <span className="metric-label">Consumo en Restaurante</span>
            <h3 className="metric-value">{pedidosLocales}</h3>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box bg-amber-glow">
            <Truck size={22} color="#fbbf24" />
          </div>
          <div>
            <span className="metric-label">Pedidos en Línea</span>
            <h3 className="metric-value">{pedidosOnline}</h3>
          </div>
        </div>
      </div>

      {/* CONTROLES DE BÚSQUEDA Y FILTRADO */}
      <div className="history-controls-card">
        <div className="history-controls-top">
          <div className="search-box" style={{ flex: 1 }}>
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por folio de factura, nombre de cliente, RFC o mesa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="tab-btn"
            onClick={onRecargar}
            title="Actualizar listado de facturas"
          >
            <RotateCcw size={16} /> Actualizar
          </button>

          <button
            type="button"
            className="btn-add-product"
            onClick={onIrAlPOS}
          >
            <Utensils size={16} /> + Tomar Nuevo Pedido
          </button>
        </div>

        <div className="history-filter-tabs">
          <button
            type="button"
            className={`filter-pill ${filterTipo === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilterTipo('ALL')}
          >
            <Filter size={14} /> Todos ({ventas.length})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterTipo === 'LOCAL' ? 'active' : ''}`}
            onClick={() => setFilterTipo('LOCAL')}
          >
            <Utensils size={14} /> Consumo en Local / Comedor ({pedidosLocales})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterTipo === 'EN_LINEA' ? 'active' : ''}`}
            onClick={() => setFilterTipo('EN_LINEA')}
          >
            <Truck size={14} /> Pedidos en Línea ({pedidosOnline})
          </button>
          <button
            type="button"
            className={`filter-pill ${filterTipo === 'LLEVAR' ? 'active' : ''}`}
            onClick={() => setFilterTipo('LLEVAR')}
          >
            <ShoppingBag size={14} /> Para Llevar ({ventas.filter(v => v.tipoPedido === 'LLEVAR').length})
          </button>
        </div>
      </div>

      {/* LISTA / GRID DE FACTURAS */}
      {filteredVentas.length === 0 ? (
        <div className="empty-catalog" style={{ marginTop: '2rem' }}>
          <FileText className="empty-catalog-icon" size={48} />
          <h3>No se encontraron facturas ni pedidos</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            {ventas.length === 0
              ? 'Aún no se han cobrado pedidos en el sistema. Registra un pedido en el Punto de Venta para emitir tu primera factura.'
              : `No hay resultados para el filtro actual.`}
          </p>
          <button type="button" className="btn-add-product" onClick={onIrAlPOS}>
            Ir al Punto de Venta
          </button>
        </div>
      ) : (
        <div className="invoices-grid">
          {filteredVentas.map((venta) => {
            const isOnline = venta.tipoPedido === 'EN_LINEA'
            const isLocal = !venta.tipoPedido || venta.tipoPedido === 'LOCAL'
            const fecha = venta.fechaVenta ? new Date(venta.fechaVenta) : new Date()

            const cantItems = (venta.detalles || venta.items || []).reduce(
              (acc, it) => acc + (it.cantidad || it.quantity || 1),
              0
            )

            return (
              <div key={venta.id} className="invoice-summary-card">
                <div className="invoice-card-header">
                  <div>
                    <span className="invoice-folio-tag">
                      {venta.numeroFactura || venta.folio || `FAC-${venta.id}`}
                    </span>
                    <span
                      className={`badge-order-modality ${
                        isOnline ? 'badge-delivery' : isLocal ? 'badge-dinein' : 'badge-takeout'
                      }`}
                    >
                      {isOnline ? (
                        <>
                          <Truck size={12} /> Pedido en Línea
                        </>
                      ) : isLocal ? (
                        <>
                          <Utensils size={12} /> Consumo en Local {venta.numeroMesa ? `(${venta.numeroMesa})` : ''}
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={12} /> Para Llevar
                        </>
                      )}
                    </span>
                  </div>

                  <span className="invoice-status-badge">
                    {venta.estado || 'FACTURADO'}
                  </span>
                </div>

                <div className="invoice-card-body">
                  <div className="invoice-client-row">
                    <div className="client-avatar-mini">
                      {(venta.cliente?.nombre?.[0] || 'C').toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ color: '#fff' }}>
                        {venta.cliente ? `${venta.cliente.nombre} ${venta.cliente.apellido || ''}` : 'Consumidor Final'}
                      </strong>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                        {venta.cliente?.documento ? `RFC: ${venta.cliente.documento}` : 'RFC Genérico'}
                      </div>
                    </div>
                  </div>

                  {isOnline && (venta.direccionEntrega || venta.cliente?.direccion) && (
                    <div className="invoice-delivery-address" title={venta.direccionEntrega || venta.cliente?.direccion}>
                      <Truck size={13} color="#fbbf24" />
                      <span>{venta.direccionEntrega || venta.cliente?.direccion}</span>
                    </div>
                  )}

                  <div className="invoice-datetime-row">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} /> {fecha.toLocaleDateString('es-MX')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} /> {fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>{cantItems} art(s).</span>
                  </div>

                  {/* Previsualización rápida de platillos */}
                  <div className="invoice-items-preview">
                    {(venta.detalles || venta.items || []).slice(0, 3).map((it, i) => (
                      <span key={i} className="item-chip">
                        {it.cantidad || it.quantity || 1}x {it.nombreProducto || it.name || 'Platillo'}
                      </span>
                    ))}
                    {(venta.detalles || venta.items || []).length > 3 && (
                      <span className="item-chip-more">
                        +{(venta.detalles || venta.items || []).length - 3} más
                      </span>
                    )}
                  </div>
                </div>

                <div className="invoice-card-footer">
                  <div className="invoice-price-block">
                    <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>TOTAL FACTURADO</span>
                    <div className="invoice-total-number">
                      ${Number(venta.total || 0).toFixed(2)} <small>MXN</small>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn-view-invoice"
                    onClick={() => onVerFactura(venta)}
                  >
                    <Eye size={15} />
                    <span>Ver Factura</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
