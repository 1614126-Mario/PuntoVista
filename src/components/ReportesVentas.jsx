import { useState, useEffect, useMemo } from 'react'
import './ReportesVentas.css'

const API_BASE = 'https://puntoventarect.onrender.com'

function formatFecha(fechaStr) {
  if (!fechaStr) return '—'
  const d = new Date(fechaStr)
  return d.toLocaleDateString('es-SV', { year: 'numeric', month: 'short', day: '2-digit' }) +
    ' ' + d.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })
}

function formatMoney(val) {
  return '$' + Number(val || 0).toFixed(2)
}

function getBadgeClass(estado) {
  if (!estado) return 'badge-facturado'
  const e = estado.toUpperCase()
  if (e === 'FACTURADO') return 'badge-facturado'
  if (e.includes('PENDIENTE')) return 'badge-pendiente'
  if (e === 'ANULADO') return 'badge-anulado'
  return 'badge-default'
}

function getBadgeLabel(estado) {
  if (!estado) return 'FACTURADO'
  const e = estado.toUpperCase()
  if (e === 'FACTURADO') return '✔ Facturado'
  if (e.includes('PENDIENTE')) return '⏳ Pendiente'
  if (e === 'ANULADO') return '✖ Anulado'
  return estado
}

export default function ReportesVentas({ token, ventas: ventasProp = [] }) {
  const [ventasApi, setVentasApi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [margenPct, setMargenPct] = useState(60)

  // Filtros
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')

  useEffect(() => {
    if (!token) {
      setVentasApi(null)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(`${API_BASE}/api/ventas`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(data => {
        if (!cancelled && Array.isArray(data)) {
          setVentasApi(data)
        }
      })
      .catch(() => {
        // Fallback silencioso a ventasProp si la API falla o no responde
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [token])

  const ventas = useMemo(() => {
    if (Array.isArray(ventasApi) && ventasApi.length >= ventasProp.length) {
      return ventasApi
    }
    return ventasProp
  }, [ventasApi, ventasProp])

  // ── Ventas filtradas ──────────────────────────────────────────────────────
  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      const fecha = v.fechaVenta ? new Date(v.fechaVenta) : null

      if (filtroDesde && fecha) {
        if (fecha < new Date(filtroDesde)) return false
      }
      if (filtroHasta && fecha) {
        const hasta = new Date(filtroHasta)
        hasta.setHours(23, 59, 59, 999)
        if (fecha > hasta) return false
      }
      if (filtroEstado !== 'TODOS') {
        const e = (v.estado || '').toUpperCase()
        if (filtroEstado === 'PENDIENTE_PAGO' && !e.includes('PENDIENTE')) return false
        if (filtroEstado !== 'PENDIENTE_PAGO' && e !== filtroEstado) return false
      }
      if (filtroTipo !== 'TODOS') {
        if ((v.tipoPedido || 'LOCAL').toUpperCase() !== filtroTipo) return false
      }
      return true
    })
  }, [ventas, filtroDesde, filtroHasta, filtroEstado, filtroTipo])

  // ── KPIs de Ventas y Ganancias ────────────────────────────────────────────
  const kpis = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    let totalHoy = 0, totalMes = 0, totalGeneral = 0
    let subtotalGeneral = 0, ivaGeneral = 0
    let gananciaHoy = 0, gananciaMes = 0, gananciaGeneral = 0, costoGeneral = 0
    let transacciones = 0, pendientesCount = 0, pendientesTotal = 0
    const productoMap = {}
    const metodoMap = {}
    const tipoMap = {}

    const factorMargen = margenPct / 100

    ventasFiltradas.forEach(v => {
      const fecha = v.fechaVenta ? new Date(v.fechaVenta) : null
      const total = Number(v.total || 0)
      const sub = Number(v.subtotal || (total / 1.13))
      const iva = Number(v.iva || (total - sub))
      const ganancia = sub * factorMargen
      const costo = sub - ganancia
      const estado = (v.estado || '').toUpperCase()
      const esFact = estado === 'FACTURADO' || !v.estado

      if (estado.includes('PENDIENTE')) {
        pendientesCount++
        pendientesTotal += total
      }

      if (esFact) {
        totalGeneral += total
        subtotalGeneral += sub
        ivaGeneral += iva
        gananciaGeneral += ganancia
        costoGeneral += costo
        transacciones++

        if (fecha && fecha >= hoy) {
          totalHoy += total
          gananciaHoy += ganancia
        }
        if (fecha && fecha >= inicioMes) {
          totalMes += total
          gananciaMes += ganancia
        }

        const mp = v.metodoPago || 'Efectivo'
        if (!metodoMap[mp]) metodoMap[mp] = { count: 0, total: 0, ganancia: 0 }
        metodoMap[mp].count += 1
        metodoMap[mp].total += total
        metodoMap[mp].ganancia += ganancia

        const tp = v.tipoPedido || 'LOCAL'
        if (!tipoMap[tp]) tipoMap[tp] = { count: 0, total: 0, ganancia: 0 }
        tipoMap[tp].count += 1
        tipoMap[tp].total += total
        tipoMap[tp].ganancia += ganancia
      }

      const detalles = v.detalles || v.items || []
      detalles.forEach(d => {
        const nombre = d.nombreProducto || d.name || 'Producto'
        const cant = Number(d.cantidad || d.quantity || 1)
        if (!productoMap[nombre]) productoMap[nombre] = 0
        productoMap[nombre] += cant
      })
    })

    const ticketProm = transacciones > 0 ? totalGeneral / transacciones : 0
    const mejorProducto = Object.entries(productoMap).sort((a, b) => b[1] - a[1])[0]

    return {
      totalHoy, totalMes, totalGeneral,
      subtotalGeneral, ivaGeneral,
      gananciaHoy, gananciaMes, gananciaGeneral, costoGeneral,
      transacciones, ticketProm, mejorProducto,
      pendientesCount, pendientesTotal,
      metodoMap, tipoMap
    }
  }, [ventasFiltradas, margenPct])

  // ── Top 10 productos ──────────────────────────────────────────────────────
  const topProductos = useMemo(() => {
    const map = {}
    const factorMargen = margenPct / 100
    ventasFiltradas.forEach(v => {
      const esFact = (v.estado || '').toUpperCase() === 'FACTURADO' || !v.estado
      if (!esFact) return
      const detalles = v.detalles || v.items || []
      detalles.forEach(d => {
        const nombre = d.nombreProducto || d.name || 'Producto'
        const cant = Number(d.cantidad || d.quantity || 1)
        const sub = Number(d.subtotal || (Number(d.precioUnitario || d.price || 0) * cant))
        if (!map[nombre]) map[nombre] = { cantidad: 0, ingresos: 0, ganancia: 0 }
        map[nombre].cantidad += cant
        map[nombre].ingresos += sub
        map[nombre].ganancia += sub * factorMargen
      })
    })
    return Object.entries(map)
      .map(([nombre, d]) => ({ nombre, ...d }))
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 10)
  }, [ventasFiltradas, margenPct])

  // ── Gráfico últimos 7 días ────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const days = []
    const factorMargen = margenPct / 100
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      days.push({
        date: d,
        total: 0,
        ganancia: 0,
        label: d.toLocaleDateString('es-SV', { weekday: 'short', day: '2-digit' })
      })
    }
    ventas.forEach(v => {
      const fecha = v.fechaVenta ? new Date(v.fechaVenta) : null
      if (!fecha) return
      const esFact = (v.estado || '').toUpperCase() === 'FACTURADO' || !v.estado
      if (!esFact) return
      const total = Number(v.total || 0)
      const sub = Number(v.subtotal || (total / 1.13))
      days.forEach(day => {
        const next = new Date(day.date)
        next.setDate(next.getDate() + 1)
        if (fecha >= day.date && fecha < next) {
          day.total += total
          day.ganancia += sub * factorMargen
        }
      })
    })
    return days
  }, [ventas, margenPct])

  const chartMax = useMemo(() => Math.max(...chartData.map(d => d.total), 1), [chartData])

  // ── Exportar CSV ──────────────────────────────────────────────────────────
  function exportarCSV() {
    const factorMargen = margenPct / 100
    const headers = ['Folio', 'Fecha', 'Cliente', 'Productos', 'Subtotal', 'IVA', 'Total', 'Costo Est.', 'Ganancia Est.', 'Método Pago', 'Estado', 'Tipo']
    const rows = ventasFiltradas.slice(0, 2000).map(v => {
      const productos = (v.detalles || v.items || []).map(d => `${d.nombreProducto || d.name} x${d.cantidad || d.quantity}`).join(' | ')
      const cliente = v.cliente ? `${v.cliente.nombre} ${v.cliente.apellido || ''}`.trim() : 'Consumidor Final'
      const total = Number(v.total || 0)
      const sub = Number(v.subtotal || (total / 1.13))
      const iva = Number(v.iva || (total - sub))
      const gan = sub * factorMargen
      const costo = sub - gan
      return [
        v.numeroFactura || v.folio || `FAC-${v.id}`,
        v.fechaVenta ? new Date(v.fechaVenta).toLocaleDateString('es-SV') : '',
        cliente,
        productos,
        sub.toFixed(2),
        iva.toFixed(2),
        total.toFixed(2),
        costo.toFixed(2),
        gan.toFixed(2),
        v.metodoPago || '',
        v.estado || 'FACTURADO',
        v.tipoPedido || 'LOCAL'
      ].map(f => `"${String(f).replace(/"/g, '""')}"`).join(',')
    })
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-ventas-ganancias-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="rv-container">
      {/* HEADER */}
      <div className="rv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="rv-title">📊 Reportes de Ventas y Ganancias</h2>
          <p className="rv-subtitle">
            Análisis financiero en tiempo real · {ventas.length} registro(s) en sistema
            {loading ? ' · Sincronizando...' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Margen de Ganancia:</label>
          <select
            value={margenPct}
            onChange={(e) => setMargenPct(Number(e.target.value))}
            style={{
              background: '#1e1b2e',
              color: '#e2e8f0',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '8px',
              padding: '0.4rem 0.7rem',
              fontSize: '0.85rem'
            }}
          >
            <option value={40}>40% (Conservador)</option>
            <option value={50}>50% (Moderado)</option>
            <option value={60}>60% (Estándar Restaurante)</option>
            <option value={70}>70% (Alto)</option>
          </select>
          <button type="button" className="rv-btn-export" onClick={exportarCSV}>
            ⬇ Exportar CSV
          </button>
          <button
            type="button"
            className="rv-btn-clear"
            onClick={() => window.print()}
            title="Imprimir reporte de ventas y ganancias"
          >
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* ── SECCIÓN 1: KPIs DE VENTAS Y GANANCIAS ── */}
      <div className="rv-kpi-grid">
        <div className="rv-kpi-card rv-kpi-purple">
          <div className="rv-kpi-label">💵 Ventas Totales (Facturadas)</div>
          <div className="rv-kpi-value">{formatMoney(kpis.totalGeneral)}</div>
          <div className="rv-kpi-foot">Subtotal: {formatMoney(kpis.subtotalGeneral)} · IVA: {formatMoney(kpis.ivaGeneral)}</div>
        </div>
        <div className="rv-kpi-card rv-kpi-green">
          <div className="rv-kpi-label">💰 Ganancia Neta Estimada ({margenPct}%)</div>
          <div className="rv-kpi-value">{formatMoney(kpis.gananciaGeneral)}</div>
          <div className="rv-kpi-foot">Costo insumos est.: {formatMoney(kpis.costoGeneral)}</div>
        </div>
        <div className="rv-kpi-card rv-kpi-blue">
          <div className="rv-kpi-label">📅 Ventas & Ganancia Hoy</div>
          <div className="rv-kpi-value">{formatMoney(kpis.totalHoy)}</div>
          <div className="rv-kpi-foot">Ganancia hoy: {formatMoney(kpis.gananciaHoy)}</div>
        </div>
        <div className="rv-kpi-card rv-kpi-teal">
          <div className="rv-kpi-label">🗓 Ventas & Ganancia del Mes</div>
          <div className="rv-kpi-value">{formatMoney(kpis.totalMes)}</div>
          <div className="rv-kpi-foot">Ganancia mes: {formatMoney(kpis.gananciaMes)}</div>
        </div>
        <div className="rv-kpi-card rv-kpi-amber">
          <div className="rv-kpi-label">🎯 Ticket Promedio ({kpis.transacciones} ventas)</div>
          <div className="rv-kpi-value">{formatMoney(kpis.ticketProm)}</div>
          <div className="rv-kpi-foot">Por cobrar: {formatMoney(kpis.pendientesTotal)} ({kpis.pendientesCount})</div>
        </div>
        <div className="rv-kpi-card rv-kpi-pink">
          <div className="rv-kpi-label">🏆 Producto Estrella</div>
          <div className="rv-kpi-value rv-kpi-value-sm">
            {kpis.mejorProducto ? kpis.mejorProducto[0] : '—'}
          </div>
          <div className="rv-kpi-foot">
            {kpis.mejorProducto ? `${kpis.mejorProducto[1]} unidades vendidas` : 'Sin datos'}
          </div>
        </div>
      </div>

      {/* ── DESGLOSE POR MÉTODO DE PAGO Y TIPO DE PEDIDO ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="rv-card" style={{ marginBottom: 0 }}>
          <h3 className="rv-card-title">💳 Ventas y Ganancias por Método de Pago</h3>
          {Object.keys(kpis.metodoMap).length === 0 ? (
            <p className="rv-empty">Sin ventas facturadas registradas.</p>
          ) : (
            <div className="rv-top-list">
              {Object.entries(kpis.metodoMap).map(([metodo, data]) => (
                <div key={metodo} className="rv-top-item">
                  <div className="rv-top-info">
                    <div className="rv-top-name">{metodo}</div>
                    <div className="rv-top-meta">{data.count} transacción(es) · Ganancia: {formatMoney(data.ganancia)}</div>
                  </div>
                  <div className="rv-top-ingresos">{formatMoney(data.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rv-card" style={{ marginBottom: 0 }}>
          <h3 className="rv-card-title">🛵 Ventas y Ganancias por Canal</h3>
          {Object.keys(kpis.tipoMap).length === 0 ? (
            <p className="rv-empty">Sin ventas facturadas registradas.</p>
          ) : (
            <div className="rv-top-list">
              {Object.entries(kpis.tipoMap).map(([tipo, data]) => (
                <div key={tipo} className="rv-top-item">
                  <div className="rv-top-info">
                    <div className="rv-top-name">{tipo === 'EN_LINEA' ? '🌐 Tienda En Línea' : tipo === 'LLEVAR' ? '🛍️ Para Llevar' : '🍽️ Mesa / Local'}</div>
                    <div className="rv-top-meta">{data.count} pedido(s) · Ganancia: {formatMoney(data.ganancia)}</div>
                  </div>
                  <div className="rv-top-ingresos">{formatMoney(data.total)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── SECCIÓN 3: GRÁFICO DE BARRAS ── */}
      <div className="rv-card">
        <h3 className="rv-card-title">📈 Ventas vs Ganancia Estimada — Últimos 7 Días</h3>
        <div className="rv-chart">
          {chartData.map((day, i) => {
            const heightPct = chartMax > 0 ? Math.max((day.total / chartMax) * 100, day.total > 0 ? 4 : 0) : 0
            return (
              <div key={i} className="rv-chart-col">
                <div className="rv-chart-bar-wrap">
                  <div
                    className="rv-chart-bar"
                    style={{ height: `${heightPct}%` }}
                    title={`Ventas: ${formatMoney(day.total)} | Ganancia: ${formatMoney(day.ganancia)}`}
                  />
                </div>
                <div className="rv-chart-label">{day.label}</div>
                <div className="rv-chart-amount">{formatMoney(day.total)}</div>
                <div style={{ fontSize: '0.7rem', color: '#4ade80' }}>+{formatMoney(day.ganancia)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── SECCIÓN 5: FILTROS ── */}
      <div className="rv-card rv-filters">
        <h3 className="rv-card-title">🔍 Filtros del Reporte</h3>
        <div className="rv-filters-row">
          <div className="rv-filter-group">
            <label>Desde</label>
            <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} />
          </div>
          <div className="rv-filter-group">
            <label>Hasta</label>
            <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} />
          </div>
          <div className="rv-filter-group">
            <label>Estado</label>
            <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="TODOS">Todos</option>
              <option value="FACTURADO">Facturado</option>
              <option value="PENDIENTE_PAGO">Pendiente</option>
              <option value="ANULADO">Anulado</option>
            </select>
          </div>
          <div className="rv-filter-group">
            <label>Tipo de Pedido</label>
            <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
              <option value="TODOS">Todos</option>
              <option value="LOCAL">Local</option>
              <option value="EN_LINEA">En Línea</option>
              <option value="LLEVAR">Llevar</option>
            </select>
          </div>
          <div className="rv-filter-group rv-filter-actions">
            <button
              className="rv-btn-clear"
              onClick={() => {
                setFiltroDesde(''); setFiltroHasta('')
                setFiltroEstado('TODOS'); setFiltroTipo('TODOS')
              }}
            >
              Limpiar
            </button>
          </div>
        </div>
        <p className="rv-filter-count">
          Mostrando <strong>{ventasFiltradas.length}</strong> de {ventas.length} ventas
        </p>
      </div>

      {/* ── SECCIÓN 2: TABLA DE VENTAS RECIENTES ── */}
      <div className="rv-card">
        <h3 className="rv-card-title">🧾 Detalle de Ventas y Ganancias (últimas 30)</h3>
        <div className="rv-table-wrap">
          <table className="rv-table">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Productos</th>
                <th>Subtotal</th>
                <th>IVA</th>
                <th>Total</th>
                <th>Ganancia Est.</th>
                <th>Método Pago</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ventasFiltradas.slice(0, 30).map((v, i) => {
                const cliente = v.cliente
                  ? `${v.cliente.nombre} ${v.cliente.apellido || ''}`.trim()
                  : 'Consumidor Final'
                const productos = (v.detalles || v.items || [])
                  .map(d => `${d.nombreProducto || d.name} ×${d.cantidad || d.quantity}`)
                  .join(', ') || '—'
                const total = Number(v.total || 0)
                const sub = Number(v.subtotal || (total / 1.13))
                const iva = Number(v.iva || (total - sub))
                const gan = sub * (margenPct / 100)
                return (
                  <tr key={v.id || i} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                    <td className="rv-folio">{v.numeroFactura || v.folio || `FAC-${v.id}`}</td>
                    <td className="rv-fecha">{formatFecha(v.fechaVenta)}</td>
                    <td>{cliente}</td>
                    <td className="rv-productos-cell" title={productos}>
                      <span className="rv-productos-preview">{productos}</span>
                    </td>
                    <td>{formatMoney(sub)}</td>
                    <td>{formatMoney(iva)}</td>
                    <td className="rv-total">{formatMoney(total)}</td>
                    <td style={{ color: '#4ade80', fontWeight: 600 }}>{formatMoney(gan)}</td>
                    <td>{v.metodoPago || '—'}</td>
                    <td>
                      <span className={`rv-badge ${getBadgeClass(v.estado)}`}>
                        {getBadgeLabel(v.estado)}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {ventasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={10} className="rv-empty-row">No hay ventas con los filtros aplicados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECCIÓN 4: TOP 10 PRODUCTOS ── */}
      <div className="rv-card">
        <h3 className="rv-card-title">🥇 Top 10 Productos por Ingresos y Ganancia</h3>
        {topProductos.length === 0 ? (
          <p className="rv-empty">No hay datos de productos para los filtros seleccionados.</p>
        ) : (
          <div className="rv-top-list">
            {topProductos.map((p, i) => (
              <div key={i} className="rv-top-item">
                <div className={`rv-top-rank rv-rank-${i < 3 ? i + 1 : 'rest'}`}>#{i + 1}</div>
                <div className="rv-top-info">
                  <div className="rv-top-name">{p.nombre}</div>
                  <div className="rv-top-meta">
                    {p.cantidad} unidad(es) vendida(s) · Ganancia est.: {formatMoney(p.ganancia)}
                  </div>
                </div>
                <div className="rv-top-ingresos">{formatMoney(p.ingresos)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
