import { useState, useMemo } from 'react'
import {
  DollarSign,
  TrendingUp,
  Package,
  Receipt,
  Search,
  Filter,
  Calendar,
  Utensils,
  Truck,
  ShoppingBag,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react'

export default function PanelAdministrador({
  ventas = [],
  products = [],
  onVerFactura,
  onVerCatalogo
}) {
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos') // 'todos' | 'hoy' | 'semana'
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrado de ventas por período
  const ventasFiltradas = useMemo(() => {
    const hoy = new Date().toDateString()
    const ahora = new Date().getTime()
    const unaSemanaAtras = ahora - 7 * 24 * 60 * 60 * 1000

    return ventas.filter((v) => {
      const fechaVenta = v.fechaVenta ? new Date(v.fechaVenta) : new Date()

      if (filtroPeriodo === 'hoy') {
        if (fechaVenta.toDateString() !== hoy) return false
      } else if (filtroPeriodo === 'semana') {
        if (fechaVenta.getTime() < unaSemanaAtras) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const folio = (v.numeroFactura || v.folio || '').toLowerCase()
        const clienteNom = (v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido || ''}` : '').toLowerCase()
        return folio.includes(q) || clienteNom.includes(q)
      }

      return true
    })
  }, [ventas, filtroPeriodo, searchQuery])

  // Cálculos financieros
  // Consideramos las ventas cobradas / facturadas
  const ventasCobradas = ventasFiltradas.filter(v => v.estado === 'FACTURADO' || !v.estado)

  const ingresosTotales = ventasCobradas.reduce((acc, v) => acc + Number(v.total || 0), 0)
  const subtotalNeto = ventasCobradas.reduce((acc, v) => acc + Number(v.subtotal || 0), 0)
  const ivaRecaudado = ventasCobradas.reduce((acc, v) => acc + Number(v.iva || 0), 0)

  // Estimación de ganancia bruta (margen del 60% sobre el subtotal neto de venta en alimentos y bebidas)
  const margenEstimadoPorcentaje = 60
  const gananciaEstimada = subtotalNeto * (margenEstimadoPorcentaje / 100)

  // Ventas pendientes de cobro
  const ventasPendientes = ventas.filter(v => v.estado === 'PENDIENTE_PAGO')
  const totalPorCobrar = ventasPendientes.reduce((acc, v) => acc + Number(v.total || 0), 0)

  // Desglose de productos vendidos
  const productosVendidosMap = {}
  ventasCobradas.forEach((v) => {
    const items = v.detalles || v.items || []
    items.forEach((it) => {
      const nombre = it.nombreProducto || it.name || 'Producto'
      const cant = Number(it.cantidad || it.quantity || 1)
      const sub = Number(it.subtotal || (it.precioUnitario || it.price || 0) * cant)
      if (!productosVendidosMap[nombre]) {
        productosVendidosMap[nombre] = { cantidad: 0, total: 0 }
      }
      productosVendidosMap[nombre].cantidad += cant
      productosVendidosMap[nombre].total += sub
    })
  })

  const rankingProductos = Object.entries(productosVendidosMap)
    .map(([nombre, data]) => ({ nombre, ...data }))
    .sort((a, b) => b.cantidad - a.cantidad)

  const totalComidas = products.filter(p => p.category === 'comida').length
  const totalBebidas = products.filter(p => p.category === 'bebida').length

  return (
    <div className="admin-panel-container">
      {/* HEADER DEL PANEL */}
      <div className="admin-header-card">
        <div>
          <h2 className="admin-title">
            <TrendingUp size={24} color="#a855f7" />
            <span>Panel de Administración y Finanzas</span>
          </h2>
          <p className="admin-subtitle">
            Monitoreo en tiempo real de ingresos, margen de ganancias, inventario y ventas registradas.
          </p>
        </div>

        <div className="admin-periodo-selector">
          <button
            type="button"
            className={`btn-periodo ${filtroPeriodo === 'todos' ? 'active' : ''}`}
            onClick={() => setFiltroPeriodo('todos')}
          >
            Histórico Total
          </button>
          <button
            type="button"
            className={`btn-periodo ${filtroPeriodo === 'semana' ? 'active' : ''}`}
            onClick={() => setFiltroPeriodo('semana')}
          >
            Últimos 7 Días
          </button>
          <button
            type="button"
            className={`btn-periodo ${filtroPeriodo === 'hoy' ? 'active' : ''}`}
            onClick={() => setFiltroPeriodo('hoy')}
          >
            Hoy
          </button>
        </div>
      </div>

      {/* METRICAS PRINCIPALES: INGRESOS, GANANCIA ESTIMADA, INVENTARIO Y POR COBRAR */}
      <div className="admin-kpi-grid">
        {/* KPI 1: Ingresos Totales */}
        <div className="admin-kpi-card kpi-purple">
          <div className="kpi-top">
            <span className="kpi-label">Ingresos Totales (Cobradas)</span>
            <div className="kpi-icon-badge">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="kpi-value">${ingresosTotales.toFixed(2)}</div>
          <div className="kpi-foot">
            <span>Subtotal: ${subtotalNeto.toFixed(2)} | IVA: ${ivaRecaudado.toFixed(2)}</span>
          </div>
        </div>

        {/* KPI 2: Ganancia Estimada */}
        <div className="admin-kpi-card kpi-emerald">
          <div className="kpi-top">
            <span className="kpi-label">Ganancia Bruta Estimada (~60%)</span>
            <div className="kpi-icon-badge">
              <ArrowUpRight size={20} />
            </div>
          </div>
          <div className="kpi-value">${gananciaEstimada.toFixed(2)}</div>
          <div className="kpi-foot">
            <span style={{ color: '#4ade80' }}>Margen comercial sobre ventas netas</span>
          </div>
        </div>

        {/* KPI 3: Productos Disponibles en Menú */}
        <div className="admin-kpi-card kpi-blue">
          <div className="kpi-top">
            <span className="kpi-label">Catálogo de Productos</span>
            <div className="kpi-icon-badge">
              <Package size={20} />
            </div>
          </div>
          <div className="kpi-value">{products.length} platillos/bebidas</div>
          <div className="kpi-foot">
            <span>{totalComidas} Comidas • {totalBebidas} Bebidas</span>
          </div>
        </div>

        {/* KPI 4: Ventas Por Cobrar / Pendientes */}
        <div className="admin-kpi-card kpi-amber">
          <div className="kpi-top">
            <span className="kpi-label">Pedidos Por Cobrar</span>
            <div className="kpi-icon-badge">
              <Clock size={20} />
            </div>
          </div>
          <div className="kpi-value">${totalPorCobrar.toFixed(2)}</div>
          <div className="kpi-foot">
            <span>{ventasPendientes.length} pedido(s) pendientes de caja</span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DOBLE: CATÁLOGO DE PRODUCTOS DISPONIBLES & TOP PRODUCTOS VENDIDOS */}
      <div className="admin-split-grid">
        {/* Catálogo de Productos Disponibles */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <div>
              <h3 className="panel-card-title">
                <Package size={18} color="#38bdf8" />
                <span>Productos en Catálogo ({products.length})</span>
              </h3>
              <p className="panel-card-desc">Platillos y bebidas dados de alta en el sistema</p>
            </div>
          </div>

          <div className="admin-products-table-box">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th style={{ textAlign: 'right' }}>Precio Venta</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-product-cell">
                        <img src={p.image} alt={p.name} className="admin-product-thumb" />
                        <div>
                          <strong>{p.name}</strong>
                          <div style={{ fontSize: '0.74rem', color: '#9ca3af' }}>{p.tag || 'Activo'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-cat-pill ${p.category === 'comida' ? 'cat-comida' : 'cat-bebida'}`}>
                        {p.category === 'comida' ? 'Comida' : 'Bebida'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td>
                      <span className="admin-status-available">En Menú</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Ranking de Productos Más Vendidos */}
        <div className="admin-panel-card">
          <div className="panel-card-header">
            <div>
              <h3 className="panel-card-title">
                <TrendingUp size={18} color="#4ade80" />
                <span>Platillos y Bebidas Más Vendidos</span>
              </h3>
              <p className="panel-card-desc">Ranking por volumen de órdenes cerradas</p>
            </div>
          </div>

          <div className="admin-products-table-box">
            {rankingProductos.length === 0 ? (
              <div className="empty-catalog" style={{ padding: '2rem' }}>
                <p>Aún no hay ventas cobradas registradas.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th style={{ textAlign: 'center' }}>Unidades</th>
                    <th style={{ textAlign: 'right' }}>Monto Recaudado</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingProductos.slice(0, 10).map((it, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 'bold', color: '#c084fc' }}>#{idx + 1}</td>
                      <td>
                        <strong>{it.nombre}</strong>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="chip-unidades">{it.cantidad} pzas</span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#4ade80' }}>
                        ${it.total.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* HISTORIAL COMPLETO DE VENTAS REALIZADAS */}
      <div className="admin-panel-card" style={{ marginTop: '1.5rem' }}>
        <div className="panel-card-header">
          <div>
            <h3 className="panel-card-title">
              <Receipt size={18} color="#c084fc" />
              <span>Registro de Facturas y Ventas del Sistema ({ventasFiltradas.length})</span>
            </h3>
            <p className="panel-card-desc">Consulta el detalle financiero de cada transacción realizada</p>
          </div>

          <div className="search-box" style={{ maxWidth: '320px' }}>
            <Search className="search-icon" size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por folio o cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="admin-products-table-box">
          {ventasFiltradas.length === 0 ? (
            <div className="empty-catalog" style={{ padding: '2rem' }}>
              <p>No se encontraron registros de ventas con el filtro aplicado.</p>
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Folio / Factura</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Modalidad</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                  <th style={{ textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((v) => {
                  const fecha = v.fechaVenta ? new Date(v.fechaVenta) : new Date()
                  const isPagado = v.estado === 'FACTURADO' || !v.estado
                  return (
                    <tr key={v.id}>
                      <td>
                        <strong className="monospace" style={{ color: '#c084fc' }}>
                          {v.numeroFactura || v.folio || `FAC-${v.id}`}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{fecha.toLocaleDateString('es-SV')}</div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                          {fecha.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td>
                        <div>{v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido || ''}` : 'Consumidor Final'}</div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{v.cliente?.documento || 'DUI: 00000000-0'}</div>
                      </td>
                      <td>
                        <span className="badge-modality-small">
                          {v.tipoPedido === 'EN_LINEA' ? 'En Línea' : v.tipoPedido === 'LOCAL' ? (v.numeroMesa || 'Local') : 'Llevar'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${isPagado ? 'status-paid' : 'status-pending'}`}>
                          {isPagado ? 'Cobrado' : 'Por Cobrar'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '0.95rem' }}>
                        ${Number(v.total || 0).toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn-table-action"
                          onClick={() => onVerFactura(v)}
                          title="Ver detalle de factura"
                        >
                          <Eye size={15} /> Ver
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
