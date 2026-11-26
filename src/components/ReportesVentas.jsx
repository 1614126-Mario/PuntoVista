import { useState, useEffect, useMemo } from 'react'
import './ReportesVentas.css'

const API_BASE = 'https://puntoventarect.onrender.com'
const MOVIMIENTOS_KEY = 'taberna_movimientos_caja_v1'

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

function downloadCSV(filename, headers, rows) {
  const csv = [
    headers.join(','),
    ...rows.map(r => r.map(f => `"${String(f ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ── Componente reutilizable: cabecera de sección ──────────────────────────────
function SectionHeader({ icon, title, subtitle, children }) {
  return (
    <div className="rv-section-header">
      <div>
        <h3 className="rv-section-title">{icon} {title}</h3>
        {subtitle && <p className="rv-section-sub">{subtitle}</p>}
      </div>
      <div className="rv-section-actions">{children}</div>
    </div>
  )
}

// ── Componente reutilizable: KPI card ─────────────────────────────────────────
function KpiCard({ label, value, foot, colorClass }) {
  return (
    <div className={`rv-kpi-card ${colorClass || ''}`}>
      <div className="rv-kpi-label">{label}</div>
      <div className="rv-kpi-value">{value}</div>
      {foot && <div className="rv-kpi-foot">{foot}</div>}
    </div>
  )
}

// ── Paginador simple ──────────────────────────────────────────────────────────
function Paginator({ page, totalPages, total, onPrev, onNext }) {
  return (
    <div className="rv-paginator">
      <span>Página {page} de {totalPages} ({total.toLocaleString()} resultados)</span>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" className="rv-btn-clear" disabled={page <= 1} onClick={onPrev}>◀ Anterior</button>
        <button type="button" className="rv-btn-clear" disabled={page >= totalPages} onClick={onNext}>Siguiente ▶</button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
export default function ReportesVentas({ token, ventas: ventasProp = [], products = [] }) {
  const [ventasApi, setVentasApi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [margenPct, setMargenPct] = useState(60)
  // Navegación entre los 7 reportes
  const [reporte, setReporte] = useState('comidas')

  // Filtros globales de ventas (aplican a Ingresos, Ganancias, Pérdidas)
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')

  // Inventario comidas
  const [comSearch, setComSearch] = useState('')
  const [comPage, setComPage] = useState(1)
  // Inventario bebidas
  const [bebSearch, setBebSearch] = useState('')
  const [bebPage, setBebPage] = useState(1)
  // Productos que faltan
  const [faltSearch, setFaltSearch] = useState('')
  const [faltPage, setFaltPage] = useState(1)
  // Ingresos
  const [ingPage, setIngPage] = useState(1)
  // Ganancias — busqueda pedidos
  const [busquedaPedidos, setBusquedaPedidos] = useState('')

  const PER_PAGE = 40
  const ING_PER_PAGE = 50

  // Movimientos manuales (Salidas / Pérdidas / Entradas extra)
  const [movimientos, setMovimientos] = useState(() => {
    try {
      const saved = localStorage.getItem(MOVIMIENTOS_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [nuevoMov, setNuevoMov] = useState({ tipo: 'SALIDA', categoria: 'Compra de Insumos', descripcion: '', monto: '' })

  useEffect(() => {
    try {
      localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify(movimientos))
    } catch { /* ignore quota */ }
  }, [movimientos])

  // ── Cargar ventas de la API ───────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const apiBase = import.meta.env.VITE_API_URL || API_BASE
    fetch(`${apiBase}/api/ventas`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json() })
      .then(data => { if (!cancelled && Array.isArray(data)) setVentasApi(data) })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [token])

  const ventas = useMemo(() => {
    if (Array.isArray(ventasApi) && ventasApi.length >= ventasProp.length) return ventasApi
    return ventasProp
  }, [ventasApi, ventasProp])

  // ── Ventas filtradas ──────────────────────────────────────────────────────
  const ventasFiltradas = useMemo(() => {
    return ventas.filter(v => {
      const fecha = v.fechaVenta ? new Date(v.fechaVenta) : null
      if (filtroDesde && fecha && fecha < new Date(filtroDesde)) return false
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

  // ── KPIs calculados ───────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0)
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
    const factorMargen = margenPct / 100

    let totalHoy = 0, totalMes = 0, totalGeneral = 0
    let subtotalGeneral = 0, ivaGeneral = 0
    let gananciaBrutaVentas = 0, costoInsumosVentas = 0
    let gananciaHoy = 0, gananciaMes = 0
    let transacciones = 0, anuladasCount = 0, perdidasAnuladas = 0
    let pendientesCount = 0, pendientesTotal = 0
    const productoMap = {}
    const metodoMap = {}
    const tipoMap = {}

    ventasFiltradas.forEach(v => {
      const fecha = v.fechaVenta ? new Date(v.fechaVenta) : null
      const total = Number(v.total || 0)
      const sub = Number(v.subtotal || (total / 1.13))
      const iva = Number(v.iva || (total - sub))
      const ganancia = sub * factorMargen
      const costo = sub - ganancia
      const estado = (v.estado || '').toUpperCase()

      if (estado === 'ANULADO') {
        anuladasCount++
        perdidasAnuladas += total
      } else if (estado.includes('PENDIENTE')) {
        pendientesCount++
        pendientesTotal += total
      } else {
        totalGeneral += total
        subtotalGeneral += sub
        ivaGeneral += iva
        gananciaBrutaVentas += ganancia
        costoInsumosVentas += costo
        transacciones++

        if (fecha && fecha >= hoy) { totalHoy += total; gananciaHoy += ganancia }
        if (fecha && fecha >= inicioMes) { totalMes += total; gananciaMes += ganancia }

        const mp = v.metodoPago || 'Efectivo'
        if (!metodoMap[mp]) metodoMap[mp] = { count: 0, total: 0, ganancia: 0 }
        metodoMap[mp].count += 1; metodoMap[mp].total += total; metodoMap[mp].ganancia += ganancia

        const tp = v.tipoPedido || 'LOCAL'
        if (!tipoMap[tp]) tipoMap[tp] = { count: 0, total: 0, ganancia: 0 }
        tipoMap[tp].count += 1; tipoMap[tp].total += total; tipoMap[tp].ganancia += ganancia
      }

      const detalles = v.detalles || v.items || []
      detalles.forEach(d => {
        const nombre = d.nombreProducto || d.name || 'Producto'
        const cant = Number(d.cantidad || d.quantity || 1)
        if (!productoMap[nombre]) productoMap[nombre] = 0
        productoMap[nombre] += cant
      })
    })

    const entradasExtra = movimientos.filter(m => m.tipo === 'ENTRADA').reduce((a, m) => a + Number(m.monto || 0), 0)
    const salidasOperativas = movimientos.filter(m => m.tipo === 'SALIDA').reduce((a, m) => a + Number(m.monto || 0), 0)
    const perdidasMerma = movimientos.filter(m => m.tipo === 'PERDIDA').reduce((a, m) => a + Number(m.monto || 0), 0)

    const totalEntradas = totalGeneral + entradasExtra
    const totalSalidas = costoInsumosVentas + salidasOperativas + perdidasMerma + perdidasAnuladas
    const resultadoNeto = (gananciaBrutaVentas + entradasExtra) - (salidasOperativas + perdidasMerma)
    const esGanancia = resultadoNeto >= 0
    const ticketProm = transacciones > 0 ? totalGeneral / transacciones : 0
    const mejorProducto = Object.entries(productoMap).sort((a, b) => b[1] - a[1])[0]

    return {
      totalHoy, totalMes, totalGeneral, subtotalGeneral, ivaGeneral,
      gananciaBrutaVentas, costoInsumosVentas, gananciaHoy, gananciaMes,
      transacciones, ticketProm, mejorProducto,
      pendientesCount, pendientesTotal,
      anuladasCount, perdidasAnuladas,
      entradasExtra, salidasOperativas, perdidasMerma,
      totalEntradas, totalSalidas, resultadoNeto, esGanancia,
      metodoMap, tipoMap
    }
  }, [ventasFiltradas, movimientos, margenPct])

  // ── Top 10 productos ──────────────────────────────────────────────────────
  const topProductos = useMemo(() => {
    const map = {}
    const f = margenPct / 100
    ventasFiltradas.forEach(v => {
      if ((v.estado || '').toUpperCase() !== 'FACTURADO' && v.estado) return
      const detalles = v.detalles || v.items || []
      detalles.forEach(d => {
        const nombre = d.nombreProducto || d.name || 'Producto'
        const cant = Number(d.cantidad || d.quantity || 1)
        const sub = Number(d.subtotal || (Number(d.precioUnitario || d.price || 0) * cant))
        if (!map[nombre]) map[nombre] = { cantidad: 0, ingresos: 0, ganancia: 0 }
        map[nombre].cantidad += cant
        map[nombre].ingresos += sub
        map[nombre].ganancia += sub * f
      })
    })
    return Object.entries(map).map(([nombre, d]) => ({ nombre, ...d }))
      .sort((a, b) => b.ingresos - a.ingresos).slice(0, 10)
  }, [ventasFiltradas, margenPct])

  // ── Chart últimos 7 días ──────────────────────────────────────────────────
  const chartData = useMemo(() => {
    const days = []
    const f = margenPct / 100
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i); d.setHours(0, 0, 0, 0)
      days.push({ date: d, total: 0, ganancia: 0, label: d.toLocaleDateString('es-SV', { weekday: 'short', day: '2-digit' }) })
    }
    ventas.forEach(v => {
      const fecha = v.fechaVenta ? new Date(v.fechaVenta) : null
      if (!fecha) return
      if ((v.estado || '').toUpperCase() !== 'FACTURADO' && v.estado) return
      const total = Number(v.total || 0)
      const sub = Number(v.subtotal || (total / 1.13))
      days.forEach(day => {
        const next = new Date(day.date); next.setDate(next.getDate() + 1)
        if (fecha >= day.date && fecha < next) { day.total += total; day.ganancia += sub * f }
      })
    })
    return days
  }, [ventas, margenPct])
  const chartMax = useMemo(() => Math.max(...chartData.map(d => d.total), 1), [chartData])

  // ── Inventario: Comidas ───────────────────────────────────────────────────
  const comidas = useMemo(() => products.filter(p => p.category === 'comida'), [products])
  const comidasFiltered = useMemo(() => {
    const q = comSearch.toLowerCase().trim()
    if (!q) return comidas
    return comidas.filter(p => p.name.toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q))
  }, [comidas, comSearch])
  const comTotalPages = Math.max(1, Math.ceil(comidasFiltered.length / PER_PAGE))
  const comPageItems = useMemo(() => comidasFiltered.slice((comPage - 1) * PER_PAGE, comPage * PER_PAGE), [comidasFiltered, comPage])

  // ── Inventario: Bebidas ───────────────────────────────────────────────────
  const bebidas = useMemo(() => products.filter(p => p.category === 'bebida'), [products])
  const bebidasFiltered = useMemo(() => {
    const q = bebSearch.toLowerCase().trim()
    if (!q) return bebidas
    return bebidas.filter(p => p.name.toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q))
  }, [bebidas, bebSearch])
  const bebTotalPages = Math.max(1, Math.ceil(bebidasFiltered.length / PER_PAGE))
  const bebPageItems = useMemo(() => bebidasFiltered.slice((bebPage - 1) * PER_PAGE, bebPage * PER_PAGE), [bebidasFiltered, bebPage])

  // ── Productos que Faltan (0 ventas en el período) ─────────────────────────
  const productosVendidosSet = useMemo(() => {
    const s = new Set()
    ventasFiltradas.forEach(v => {
      (v.detalles || v.items || []).forEach(d => {
        s.add((d.nombreProducto || d.name || '').trim())
      })
    })
    return s
  }, [ventasFiltradas])

  const productosFaltantes = useMemo(() => {
    return products.filter(p => !productosVendidosSet.has(p.name.trim()))
  }, [products, productosVendidosSet])

  const faltFiltered = useMemo(() => {
    const q = faltSearch.toLowerCase().trim()
    if (!q) return productosFaltantes
    return productosFaltantes.filter(p => p.name.toLowerCase().includes(q) || (p.tag || '').toLowerCase().includes(q))
  }, [productosFaltantes, faltSearch])
  const faltTotalPages = Math.max(1, Math.ceil(faltFiltered.length / PER_PAGE))
  const faltPageItems = useMemo(() => faltFiltered.slice((faltPage - 1) * PER_PAGE, faltPage * PER_PAGE), [faltFiltered, faltPage])

  // ── Ingresos: tabla de ventas facturadas ──────────────────────────────────
  const ventasFacturadas = useMemo(() => ventasFiltradas.filter(v => {
    const e = (v.estado || '').toUpperCase()
    return e === 'FACTURADO' || !v.estado
  }), [ventasFiltradas])
  const ingTotalPages = Math.max(1, Math.ceil(ventasFacturadas.length / ING_PER_PAGE))
  const ingPageItems = useMemo(() => ventasFacturadas.slice((ingPage - 1) * ING_PER_PAGE, ingPage * ING_PER_PAGE), [ventasFacturadas, ingPage])

  // ── Movimientos de caja ───────────────────────────────────────────────────
  const salidas = useMemo(() => movimientos.filter(m => m.tipo === 'SALIDA'), [movimientos])
  const perdidas = useMemo(() => movimientos.filter(m => m.tipo === 'PERDIDA'), [movimientos])
  const ventasAnuladas = useMemo(() => ventasFiltradas.filter(v => (v.estado || '').toUpperCase() === 'ANULADO'), [ventasFiltradas])

  function handleAgregarMovimiento(e) {
    e.preventDefault()
    const montoNum = parseFloat(nuevoMov.monto)
    if (!nuevoMov.descripcion.trim() || isNaN(montoNum) || montoNum <= 0) return
    setMovimientos(prev => [{ id: Date.now().toString(), fecha: new Date().toISOString(), ...nuevoMov, monto: montoNum }, ...prev])
    setNuevoMov(prev => ({ ...prev, descripcion: '', monto: '' }))
  }

  function handleEliminarMovimiento(id) {
    setMovimientos(prev => prev.filter(m => m.id !== id))
  }

  // ── Filtros globales UI ───────────────────────────────────────────────────
  const FiltrosGlobales = () => (
    <div className="rv-filtros">
      <div className="rv-filtro-grupo">
        <label>Desde</label>
        <input type="date" value={filtroDesde} onChange={e => setFiltroDesde(e.target.value)} className="rv-input" />
      </div>
      <div className="rv-filtro-grupo">
        <label>Hasta</label>
        <input type="date" value={filtroHasta} onChange={e => setFiltroHasta(e.target.value)} className="rv-input" />
      </div>
      <div className="rv-filtro-grupo">
        <label>Estado</label>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="rv-select">
          <option value="TODOS">Todos</option>
          <option value="FACTURADO">Facturado</option>
          <option value="PENDIENTE_PAGO">Pendiente</option>
          <option value="ANULADO">Anulado</option>
        </select>
      </div>
      <div className="rv-filtro-grupo">
        <label>Canal</label>
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="rv-select">
          <option value="TODOS">Todos</option>
          <option value="LOCAL">Local</option>
          <option value="EN_LINEA">En Línea</option>
          <option value="LLEVAR">Llevar</option>
        </select>
      </div>
      {(filtroDesde || filtroHasta || filtroEstado !== 'TODOS' || filtroTipo !== 'TODOS') && (
        <button type="button" className="rv-btn-clear" onClick={() => { setFiltroDesde(''); setFiltroHasta(''); setFiltroEstado('TODOS'); setFiltroTipo('TODOS') }}>
          ✕ Limpiar
        </button>
      )}
    </div>
  )

  // ── Nav: definición de los 7 reportes ─────────────────────────────────────
  const NAV = [
    { key: 'comidas',   icon: '🍽️',  label: 'Comidas que Hay' },
    { key: 'bebidas',   icon: '🥤',  label: 'Bebidas que Hay' },
    { key: 'ingresos',  icon: '💵',  label: 'Ingresos' },
    { key: 'ganancias', icon: '💰',  label: 'Ganancias' },
    { key: 'salidas',   icon: '📤',  label: 'Salidas / Gastos' },
    { key: 'perdidas',  icon: '📉',  label: 'Pérdidas' },
    { key: 'faltan',    icon: '⚠️',  label: 'Productos que Faltan' }
  ]

  return (
    <div className="rv-container">
      {/* CABECERA */}
      <div className="rv-header">
        <div>
          <h2 className="rv-title">📊 Centro de Reportes — Administrador</h2>
          <p className="rv-subtitle">
            Acceso exclusivo · 7 Reportes separados: Inventario, Ventas, Finanzas y Alertas
            {loading ? ' · Sincronizando con servidor...' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Margen ganancia:</label>
          <select value={margenPct} onChange={(e) => setMargenPct(Number(e.target.value))} className="rv-select">
            <option value={40}>40%</option>
            <option value={50}>50%</option>
            <option value={60}>60% (Estándar)</option>
            <option value={70}>70%</option>
          </select>
          <button type="button" className="rv-btn-clear" onClick={() => window.print()}>🖨️ Imprimir</button>
        </div>
      </div>

      {/* NAV: 7 REPORTES */}
      <nav className="rv-nav">
        {NAV.map(({ key, icon, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setReporte(key)}
            className={`rv-nav-btn ${reporte === key ? 'rv-nav-active' : ''}`}
          >
            <span className="rv-nav-icon">{icon}</span>
            <span className="rv-nav-label">{label}</span>
          </button>
        ))}
      </nav>

      {/* ================================================================== */}
      {/* REPORTE 1: 🍽️ COMIDAS QUE HAY                                     */}
      {/* ================================================================== */}
      {reporte === 'comidas' && (
        <div className="rv-report-panel">
          <SectionHeader
            icon="🍽️"
            title="Comidas Disponibles en Carta"
            subtitle={`Catálogo completo de platillos · ${comidas.length.toLocaleString()} productos activos`}
          >
            <button type="button" className="rv-btn-export" onClick={() =>
              downloadCSV(`comidas-${new Date().toISOString().slice(0,10)}.csv`,
                ['ID','Nombre','Especialidad/Tag','Precio Venta'],
                comidasFiltered.map(p => [p.id, p.name, p.tag || '', Number(p.price||0).toFixed(2)])
              )
            }>⬇ Exportar CSV</button>
          </SectionHeader>

          <div className="rv-kpi-grid">
            <KpiCard label="🍔 Total Comidas" value={comidas.length.toLocaleString()} foot="Platillos en carta" colorClass="rv-kpi-purple" />
            <KpiCard label="💲 Precio Promedio" value={formatMoney(comidas.length ? comidas.reduce((a,p)=>a+Number(p.price||0),0)/comidas.length : 0)} foot="Precio promedio del menú" colorClass="rv-kpi-blue" />
            <KpiCard label="⬇ Precio Mínimo" value={formatMoney(comidas.length ? Math.min(...comidas.map(p=>Number(p.price||0))) : 0)} foot="Comida más económica" colorClass="rv-kpi-teal" />
            <KpiCard label="⬆ Precio Máximo" value={formatMoney(comidas.length ? Math.max(...comidas.map(p=>Number(p.price||0))) : 0)} foot="Comida más costosa" colorClass="rv-kpi-amber" />
          </div>

          <div className="rv-card">
            <div className="rv-search-row">
              <input
                type="text"
                placeholder="🔍 Buscar comida por nombre o especialidad..."
                value={comSearch}
                onChange={e => { setComSearch(e.target.value); setComPage(1) }}
                className="rv-input rv-input-wide"
              />
              <span className="rv-result-count">{comidasFiltered.length.toLocaleString()} resultados</span>
            </div>
            <div className="rv-table-wrap">
              <table className="rv-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre del Platillo</th>
                    <th>Especialidad / Tag</th>
                    <th style={{ textAlign: 'right' }}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {comPageItems.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                      <td className="rv-folio">{(comPage - 1) * PER_PAGE + i + 1}</td>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="rv-tag">{p.tag || '—'}</span></td>
                      <td className="rv-total" style={{ textAlign: 'right' }}>{formatMoney(p.price)}</td>
                    </tr>
                  ))}
                  {comPageItems.length === 0 && (
                    <tr><td colSpan={4} className="rv-empty-row">No se encontraron comidas con ese criterio.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Paginator page={comPage} totalPages={comTotalPages} total={comidasFiltered.length}
              onPrev={() => setComPage(p => Math.max(1, p - 1))}
              onNext={() => setComPage(p => Math.min(comTotalPages, p + 1))}
            />
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* REPORTE 2: 🥤 BEBIDAS QUE HAY                                      */}
      {/* ================================================================== */}
      {reporte === 'bebidas' && (
        <div className="rv-report-panel">
          <SectionHeader
            icon="🥤"
            title="Bebidas Disponibles en Carta"
            subtitle={`Catálogo completo de bebidas · ${bebidas.length.toLocaleString()} bebidas activas`}
          >
            <button type="button" className="rv-btn-export" onClick={() =>
              downloadCSV(`bebidas-${new Date().toISOString().slice(0,10)}.csv`,
                ['ID','Nombre','Tipo/Tag','Precio Venta'],
                bebidasFiltered.map(p => [p.id, p.name, p.tag || '', Number(p.price||0).toFixed(2)])
              )
            }>⬇ Exportar CSV</button>
          </SectionHeader>

          <div className="rv-kpi-grid">
            <KpiCard label="🥤 Total Bebidas" value={bebidas.length.toLocaleString()} foot="Bebidas en carta" colorClass="rv-kpi-blue" />
            <KpiCard label="💲 Precio Promedio" value={formatMoney(bebidas.length ? bebidas.reduce((a,p)=>a+Number(p.price||0),0)/bebidas.length : 0)} foot="Precio promedio bebidas" colorClass="rv-kpi-purple" />
            <KpiCard label="⬇ Precio Mínimo" value={formatMoney(bebidas.length ? Math.min(...bebidas.map(p=>Number(p.price||0))) : 0)} foot="Bebida más económica" colorClass="rv-kpi-teal" />
            <KpiCard label="⬆ Precio Máximo" value={formatMoney(bebidas.length ? Math.max(...bebidas.map(p=>Number(p.price||0))) : 0)} foot="Bebida más costosa" colorClass="rv-kpi-amber" />
          </div>

          <div className="rv-card">
            <div className="rv-search-row">
              <input
                type="text"
                placeholder="🔍 Buscar bebida por nombre o tipo..."
                value={bebSearch}
                onChange={e => { setBebSearch(e.target.value); setBebPage(1) }}
                className="rv-input rv-input-wide"
              />
              <span className="rv-result-count">{bebidasFiltered.length.toLocaleString()} resultados</span>
            </div>
            <div className="rv-table-wrap">
              <table className="rv-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre de la Bebida</th>
                    <th>Tipo / Tag</th>
                    <th style={{ textAlign: 'right' }}>Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {bebPageItems.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                      <td className="rv-folio">{(bebPage - 1) * PER_PAGE + i + 1}</td>
                      <td><strong>{p.name}</strong></td>
                      <td><span className="rv-tag">{p.tag || '—'}</span></td>
                      <td className="rv-total" style={{ textAlign: 'right' }}>{formatMoney(p.price)}</td>
                    </tr>
                  ))}
                  {bebPageItems.length === 0 && (
                    <tr><td colSpan={4} className="rv-empty-row">No se encontraron bebidas con ese criterio.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Paginator page={bebPage} totalPages={bebTotalPages} total={bebidasFiltered.length}
              onPrev={() => setBebPage(p => Math.max(1, p - 1))}
              onNext={() => setBebPage(p => Math.min(bebTotalPages, p + 1))}
            />
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* REPORTE 3: 💵 INGRESOS                                             */}
      {/* ================================================================== */}
      {reporte === 'ingresos' && (
        <div className="rv-report-panel">
          <SectionHeader
            icon="💵"
            title="Reporte de Ingresos — Ventas Facturadas"
            subtitle="Todas las ventas facturadas en el período seleccionado"
          >
            <button type="button" className="rv-btn-export" onClick={() =>
              downloadCSV(`ingresos-${new Date().toISOString().slice(0,10)}.csv`,
                ['Folio','Fecha','Cliente','Método Pago','Canal','Subtotal','IVA','Total','Estado'],
                ventasFacturadas.map(v => {
                  const total = Number(v.total||0)
                  const sub = Number(v.subtotal||(total/1.13))
                  const iva = total - sub
                  const cliente = v.cliente ? `${v.cliente.nombre||''} ${v.cliente.apellido||''}`.trim() : 'Consumidor Final'
                  return [v.numeroFactura||v.folio||`FAC-${v.id}`, v.fechaVenta?new Date(v.fechaVenta).toLocaleString('es-SV'):'', cliente, v.metodoPago||'Efectivo', v.tipoPedido||'LOCAL', sub.toFixed(2), iva.toFixed(2), total.toFixed(2), v.estado||'FACTURADO']
                })
              )
            }>⬇ Exportar CSV</button>
          </SectionHeader>

          <FiltrosGlobales />

          <div className="rv-kpi-grid">
            <KpiCard label="💵 Ingresos Hoy" value={formatMoney(kpis.totalHoy)} foot="Ventas facturadas hoy" colorClass="rv-kpi-green" />
            <KpiCard label="📅 Ingresos del Mes" value={formatMoney(kpis.totalMes)} foot="Mes actual" colorClass="rv-kpi-teal" />
            <KpiCard label="📊 Ingresos Totales" value={formatMoney(kpis.totalGeneral)} foot={`${kpis.transacciones} transacciones`} colorClass="rv-kpi-purple" />
            <KpiCard label="🏦 IVA Recaudado" value={formatMoney(kpis.ivaGeneral)} foot="13% sobre subtotal" colorClass="rv-kpi-blue" />
            <KpiCard label="🧾 Ticket Promedio" value={formatMoney(kpis.ticketProm)} foot="Venta promedio por cliente" colorClass="rv-kpi-amber" />
            <KpiCard label="🏆 Producto Estrella" value={kpis.mejorProducto?kpis.mejorProducto[0]:'—'} foot={kpis.mejorProducto?`${kpis.mejorProducto[1]} unidades`:'Sin datos'} colorClass="rv-kpi-pink" />
          </div>

          {/* Gráfico barras 7 días */}
          <div className="rv-card">
            <h4 className="rv-card-title">📈 Ventas por Día — Últimos 7 Días</h4>
            <div className="rv-chart">
              {chartData.map((day, i) => {
                const h = chartMax > 0 ? Math.max((day.total / chartMax) * 100, day.total > 0 ? 4 : 0) : 0
                return (
                  <div key={i} className="rv-chart-col">
                    <div className="rv-chart-bar-wrap">
                      <div className="rv-chart-bar" style={{ height: `${h}%` }}
                        title={`Ventas: ${formatMoney(day.total)}`} />
                    </div>
                    <div className="rv-chart-label">{day.label}</div>
                    <div className="rv-chart-amount">{formatMoney(day.total)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rv-card">
            <h4 className="rv-card-title">🧾 Detalle de Ventas Facturadas ({ventasFacturadas.length.toLocaleString()})</h4>
            <div className="rv-table-wrap">
              <table className="rv-table">
                <thead>
                  <tr>
                    <th>Folio</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Método Pago</th>
                    <th>Canal</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                    <th style={{ textAlign: 'right' }}>IVA</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ingPageItems.map((v, i) => {
                    const total = Number(v.total || 0)
                    const sub = Number(v.subtotal || (total / 1.13))
                    const iva = total - sub
                    const cliente = v.cliente ? `${v.cliente.nombre || ''} ${v.cliente.apellido || ''}`.trim() : 'Consumidor Final'
                    return (
                      <tr key={v.id || i} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                        <td className="rv-folio">{v.numeroFactura || v.folio || `FAC-${v.id}`}</td>
                        <td className="rv-fecha">{formatFecha(v.fechaVenta)}</td>
                        <td>{cliente || 'Consumidor Final'}</td>
                        <td>{v.metodoPago || 'Efectivo'}</td>
                        <td>{v.tipoPedido === 'EN_LINEA' ? '🌐 En Línea' : v.tipoPedido === 'LLEVAR' ? '🛍️ Llevar' : '🍽️ Local'}</td>
                        <td className="rv-total" style={{ textAlign: 'right' }}>{formatMoney(sub)}</td>
                        <td style={{ textAlign: 'right', color: '#94a3b8' }}>{formatMoney(iva)}</td>
                        <td className="rv-total" style={{ textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>{formatMoney(total)}</td>
                        <td><span className={`rv-badge ${getBadgeClass(v.estado)}`}>{getBadgeLabel(v.estado)}</span></td>
                      </tr>
                    )
                  })}
                  {ingPageItems.length === 0 && (
                    <tr><td colSpan={9} className="rv-empty-row">No hay ventas facturadas en el período seleccionado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Paginator page={ingPage} totalPages={ingTotalPages} total={ventasFacturadas.length}
              onPrev={() => setIngPage(p => Math.max(1, p - 1))}
              onNext={() => setIngPage(p => Math.min(ingTotalPages, p + 1))}
            />
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* REPORTE 4: 💰 GANANCIAS                                            */}
      {/* ================================================================== */}
      {reporte === 'ganancias' && (
        <div className="rv-report-panel">
          <SectionHeader
            icon="💰"
            title="Reporte de Ganancias"
            subtitle={`Margen configurado: ${margenPct}% · Ganancia estimada sobre ventas facturadas`}
          >
            <button type="button" className="rv-btn-export" onClick={() =>
              downloadCSV(`ganancias-${new Date().toISOString().slice(0,10)}.csv`,
                ['Concepto','Monto'],
                [
                  ['Ingresos por Ventas Facturadas', kpis.totalGeneral.toFixed(2)],
                  ['Costo Estimado de Insumos', (-kpis.costoInsumosVentas).toFixed(2)],
                  ['Ganancia Bruta de Ventas', kpis.gananciaBrutaVentas.toFixed(2)],
                  ['Entradas Extra de Caja', kpis.entradasExtra.toFixed(2)],
                  ['Salidas y Gastos Registrados', (-kpis.salidasOperativas).toFixed(2)],
                  ['Pérdidas por Merma', (-kpis.perdidasMerma).toFixed(2)],
                  ['Resultado Neto Final', kpis.resultadoNeto.toFixed(2)]
                ]
              )
            }>⬇ Exportar CSV</button>
          </SectionHeader>

          <FiltrosGlobales />

          <div className="rv-kpi-grid">
            <KpiCard label="💰 Ganancia Hoy" value={formatMoney(kpis.gananciaHoy)} foot="Ganancia estimada del día" colorClass="rv-kpi-green" />
            <KpiCard label="📅 Ganancia del Mes" value={formatMoney(kpis.gananciaMes)} foot="Mes actual" colorClass="rv-kpi-teal" />
            <KpiCard label="📊 Ganancia Bruta Total" value={formatMoney(kpis.gananciaBrutaVentas)} foot={`${margenPct}% sobre subtotales`} colorClass="rv-kpi-purple" />
            <KpiCard
              label={kpis.esGanancia ? '📈 Resultado Neto: GANANCIA' : '📉 Resultado Neto: PÉRDIDA'}
              value={(kpis.esGanancia ? '+' : '-') + formatMoney(Math.abs(kpis.resultadoNeto))}
              foot="Ganancia bruta menos gastos y mermas"
              colorClass={kpis.esGanancia ? 'rv-kpi-green' : 'rv-kpi-pink'}
            />
          </div>

          {/* Estado de Resultados */}
          <div className="rv-card">
            <h4 className="rv-card-title">⚖️ Estado de Resultados</h4>
            <div className="rv-table-wrap">
              <table className="rv-table">
                <thead>
                  <tr><th>Concepto</th><th>Tipo</th><th style={{ textAlign: 'right' }}>Monto</th></tr>
                </thead>
                <tbody>
                  {[
                    { concepto: `Ingresos por Ventas Facturadas (${kpis.transacciones} ventas · IVA: ${formatMoney(kpis.ivaGeneral)})`, tipo: 'Entrada', badge: 'badge-facturado', monto: kpis.totalGeneral, pos: true },
                    { concepto: 'Otras Entradas de Caja Registradas', tipo: 'Entrada', badge: 'badge-facturado', monto: kpis.entradasExtra, pos: true },
                    { concepto: `Costo Estimado de Insumos (${100 - margenPct}% sobre subtotal)`, tipo: 'Costo', badge: 'badge-pendiente', monto: kpis.costoInsumosVentas, pos: false },
                    { concepto: 'Salidas y Gastos Operativos', tipo: 'Salida', badge: 'badge-pendiente', monto: kpis.salidasOperativas, pos: false },
                    { concepto: 'Pérdidas por Mermas / Devoluciones', tipo: 'Pérdida', badge: 'badge-anulado', monto: kpis.perdidasMerma, pos: false },
                    { concepto: `Ventas Anuladas (${kpis.anuladasCount} facturas)`, tipo: 'Pérdida', badge: 'badge-anulado', monto: kpis.perdidasAnuladas, pos: false },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                      <td>{row.concepto}</td>
                      <td><span className={`rv-badge ${row.badge}`}>{row.tipo}</span></td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: row.pos ? '#4ade80' : '#fbbf24' }}>
                        {row.pos ? '+' : '-'}{formatMoney(row.monto)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: '2px solid rgba(168,85,247,0.4)' }}>
                    <td><strong>{kpis.esGanancia ? '✅ RESULTADO NETO: GANANCIA' : '❌ RESULTADO NETO: PÉRDIDA'}</strong></td>
                    <td><span className={`rv-badge ${kpis.esGanancia ? 'badge-facturado' : 'badge-anulado'}`}>{kpis.esGanancia ? 'Ganancia' : 'Pérdida'}</span></td>
                    <td style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 800, color: kpis.esGanancia ? '#4ade80' : '#f87171' }}>
                      {kpis.esGanancia ? '+' : '-'}{formatMoney(Math.abs(kpis.resultadoNeto))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Gráfico 7 días */}
          <div className="rv-card">
            <h4 className="rv-card-title">📈 Ventas vs Ganancia Estimada — Últimos 7 Días</h4>
            <div className="rv-chart">
              {chartData.map((day, i) => {
                const h = chartMax > 0 ? Math.max((day.total / chartMax) * 100, day.total > 0 ? 4 : 0) : 0
                return (
                  <div key={i} className="rv-chart-col">
                    <div className="rv-chart-bar-wrap">
                      <div className="rv-chart-bar" style={{ height: `${h}%` }}
                        title={`Ventas: ${formatMoney(day.total)} | Ganancia: ${formatMoney(day.ganancia)}`} />
                    </div>
                    <div className="rv-chart-label">{day.label}</div>
                    <div className="rv-chart-amount">{formatMoney(day.total)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#4ade80' }}>+{formatMoney(day.ganancia)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Desglose por método de pago y canal */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="rv-card" style={{ marginBottom: 0 }}>
              <h4 className="rv-card-title">💳 Por Método de Pago</h4>
              {Object.keys(kpis.metodoMap).length === 0 ? <p className="rv-empty">Sin ventas facturadas.</p> : (
                <div className="rv-top-list">
                  {Object.entries(kpis.metodoMap).map(([metodo, data]) => (
                    <div key={metodo} className="rv-top-item">
                      <div className="rv-top-info">
                        <div className="rv-top-name">{metodo}</div>
                        <div className="rv-top-meta">{data.count} ventas · Ganancia: {formatMoney(data.ganancia)}</div>
                      </div>
                      <div className="rv-top-ingresos">{formatMoney(data.total)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="rv-card" style={{ marginBottom: 0 }}>
              <h4 className="rv-card-title">🥇 Top 10 Productos Rentables</h4>
              {topProductos.length === 0 ? <p className="rv-empty">Sin productos vendidos aún.</p> : (
                <div className="rv-top-list">
                  {topProductos.map((p, i) => (
                    <div key={i} className="rv-top-item">
                      <div className={`rv-top-rank rv-rank-${i < 3 ? i + 1 : 'rest'}`}>#{i + 1}</div>
                      <div className="rv-top-info">
                        <div className="rv-top-name">{p.nombre}</div>
                        <div className="rv-top-meta">{p.cantidad} uds · Ganancia: {formatMoney(p.ganancia)}</div>
                      </div>
                      <div className="rv-top-ingresos">{formatMoney(p.ingresos)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* REPORTE 5: 📤 SALIDAS / GASTOS                                     */}
      {/* ================================================================== */}
      {reporte === 'salidas' && (
        <div className="rv-report-panel">
          <SectionHeader
            icon="📤"
            title="Reporte de Salidas y Gastos"
            subtitle="Registro de compras de insumos, gastos operativos y otras salidas de caja"
          >
            <button type="button" className="rv-btn-export" onClick={() =>
              downloadCSV(`salidas-${new Date().toISOString().slice(0,10)}.csv`,
                ['Fecha','Categoría','Descripción','Monto'],
                salidas.map(m => [new Date(m.fecha).toLocaleString('es-SV'), m.categoria, m.descripcion, Number(m.monto).toFixed(2)])
              )
            }>⬇ Exportar CSV</button>
          </SectionHeader>

          <div className="rv-kpi-grid">
            <KpiCard label="📤 Total Salidas Registradas" value={formatMoney(kpis.salidasOperativas)} foot={`${salidas.length} movimientos`} colorClass="rv-kpi-amber" />
            <KpiCard label="🧾 Costo Estimado de Insumos" value={formatMoney(kpis.costoInsumosVentas)} foot={`${100 - margenPct}% sobre ventas facturadas`} colorClass="rv-kpi-pink" />
            <KpiCard label="💸 Total Egresos (Salidas + Costos)" value={formatMoney(kpis.salidasOperativas + kpis.costoInsumosVentas)} foot="Suma de gastos reales + costos estimados" colorClass="rv-kpi-purple" />
          </div>

          {/* Formulario registrar salida */}
          <div className="rv-card">
            <h4 className="rv-card-title">➕ Registrar Nueva Salida / Gasto</h4>
            <form onSubmit={(e) => { setNuevoMov(m => ({ ...m, tipo: 'SALIDA' })); handleAgregarMovimiento(e) }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Categoría (Insumos, Gas, Agua...)" value={nuevoMov.categoria}
                onChange={e => setNuevoMov({ ...nuevoMov, tipo: 'SALIDA', categoria: e.target.value })} className="rv-input" />
              <input type="text" placeholder="Descripción del gasto..." required value={nuevoMov.descripcion}
                onChange={e => setNuevoMov({ ...nuevoMov, tipo: 'SALIDA', descripcion: e.target.value })} className="rv-input" />
              <input type="number" step="0.01" min="0.01" placeholder="Monto ($)" required value={nuevoMov.monto}
                onChange={e => setNuevoMov({ ...nuevoMov, tipo: 'SALIDA', monto: e.target.value })} className="rv-input" />
              <button type="submit" className="rv-btn-export">📤 Registrar Salida</button>
            </form>

            <div className="rv-table-wrap">
              <table className="rv-table">
                <thead>
                  <tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th style={{ textAlign: 'right' }}>Monto</th><th>Acción</th></tr>
                </thead>
                <tbody>
                  {salidas.map((m, i) => (
                    <tr key={m.id} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                      <td className="rv-fecha">{formatFecha(m.fecha)}</td>
                      <td><span className="rv-tag">{m.categoria}</span></td>
                      <td>{m.descripcion}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#fbbf24' }}>-{formatMoney(m.monto)}</td>
                      <td><button type="button" className="rv-btn-clear rv-btn-danger" onClick={() => handleEliminarMovimiento(m.id)}>✕ Eliminar</button></td>
                    </tr>
                  ))}
                  {salidas.length === 0 && (
                    <tr><td colSpan={5} className="rv-empty-row">No hay salidas registradas aún. Usa el formulario de arriba para agregar.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* REPORTE 6: 📉 PÉRDIDAS                                             */}
      {/* ================================================================== */}
      {reporte === 'perdidas' && (
        <div className="rv-report-panel">
          <SectionHeader
            icon="📉"
            title="Reporte de Pérdidas"
            subtitle="Mermas, desperdicios, devoluciones y ventas anuladas"
          >
            <button type="button" className="rv-btn-export" onClick={() =>
              downloadCSV(`perdidas-${new Date().toISOString().slice(0,10)}.csv`,
                ['Tipo','Fecha','Referencia','Descripción','Monto'],
                [
                  ...perdidas.map(m => ['MERMA/PERDIDA', new Date(m.fecha).toLocaleString('es-SV'), m.categoria, m.descripcion, Number(m.monto).toFixed(2)]),
                  ...ventasAnuladas.map(v => ['VENTA ANULADA', v.fechaVenta ? new Date(v.fechaVenta).toLocaleString('es-SV') : '', v.numeroFactura || `FAC-${v.id}`, `Cliente: ${v.cliente ? `${v.cliente.nombre||''} ${v.cliente.apellido||''}`.trim() : 'Consumidor Final'}`, Number(v.total||0).toFixed(2)])
                ]
              )
            }>⬇ Exportar CSV</button>
          </SectionHeader>

          <FiltrosGlobales />

          <div className="rv-kpi-grid">
            <KpiCard label="⚠️ Pérdidas por Merma" value={formatMoney(kpis.perdidasMerma)} foot={`${perdidas.length} registros`} colorClass="rv-kpi-pink" />
            <KpiCard label="✖ Ventas Anuladas" value={formatMoney(kpis.perdidasAnuladas)} foot={`${kpis.anuladasCount} facturas anuladas`} colorClass="rv-kpi-amber" />
            <KpiCard label="📉 Total Pérdidas" value={formatMoney(kpis.perdidasMerma + kpis.perdidasAnuladas)} foot="Mermas + Anulaciones" colorClass="rv-kpi-purple" />
          </div>

          {/* Formulario registrar pérdida */}
          <div className="rv-card">
            <h4 className="rv-card-title">➕ Registrar Nueva Pérdida / Merma</h4>
            <form onSubmit={(e) => { setNuevoMov(m => ({ ...m, tipo: 'PERDIDA' })); handleAgregarMovimiento(e) }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.6rem', marginBottom: '1rem' }}>
              <input type="text" placeholder="Categoría (Merma, Vencimiento, Rotura...)" value={nuevoMov.categoria}
                onChange={e => setNuevoMov({ ...nuevoMov, tipo: 'PERDIDA', categoria: e.target.value })} className="rv-input" />
              <input type="text" placeholder="Descripción de la pérdida..." required value={nuevoMov.descripcion}
                onChange={e => setNuevoMov({ ...nuevoMov, tipo: 'PERDIDA', descripcion: e.target.value })} className="rv-input" />
              <input type="number" step="0.01" min="0.01" placeholder="Monto ($)" required value={nuevoMov.monto}
                onChange={e => setNuevoMov({ ...nuevoMov, tipo: 'PERDIDA', monto: e.target.value })} className="rv-input" />
              <button type="submit" className="rv-btn-export" style={{ background: 'linear-gradient(135deg,#dc2626,#f87171)' }}>📉 Registrar Pérdida</button>
            </form>
          </div>

          {/* Pérdidas manuales */}
          {perdidas.length > 0 && (
            <div className="rv-card">
              <h4 className="rv-card-title">⚠️ Pérdidas / Mermas Registradas ({perdidas.length})</h4>
              <div className="rv-table-wrap">
                <table className="rv-table">
                  <thead>
                    <tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th style={{ textAlign: 'right' }}>Monto</th><th>Acción</th></tr>
                  </thead>
                  <tbody>
                    {perdidas.map((m, i) => (
                      <tr key={m.id} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                        <td className="rv-fecha">{formatFecha(m.fecha)}</td>
                        <td><span className="rv-tag rv-tag-red">{m.categoria}</span></td>
                        <td>{m.descripcion}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#f87171' }}>-{formatMoney(m.monto)}</td>
                        <td><button type="button" className="rv-btn-clear rv-btn-danger" onClick={() => handleEliminarMovimiento(m.id)}>✕ Eliminar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ventas anuladas */}
          <div className="rv-card">
            <h4 className="rv-card-title">✖ Ventas Anuladas ({ventasAnuladas.length})</h4>
            <div className="rv-table-wrap">
              <table className="rv-table">
                <thead>
                  <tr><th>Folio</th><th>Fecha</th><th>Cliente</th><th>Método Pago</th><th style={{ textAlign: 'right' }}>Total Perdido</th><th>Estado</th></tr>
                </thead>
                <tbody>
                  {ventasAnuladas.map((v, i) => {
                    const cliente = v.cliente ? `${v.cliente.nombre || ''} ${v.cliente.apellido || ''}`.trim() : 'Consumidor Final'
                    return (
                      <tr key={v.id || i} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                        <td className="rv-folio">{v.numeroFactura || v.folio || `FAC-${v.id}`}</td>
                        <td className="rv-fecha">{formatFecha(v.fechaVenta)}</td>
                        <td>{cliente}</td>
                        <td>{v.metodoPago || '—'}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: '#f87171' }}>-{formatMoney(v.total)}</td>
                        <td><span className="rv-badge badge-anulado">✖ Anulado</span></td>
                      </tr>
                    )
                  })}
                  {ventasAnuladas.length === 0 && (
                    <tr><td colSpan={6} className="rv-empty-row">✅ No hay ventas anuladas en el período seleccionado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* REPORTE 7: ⚠️ PRODUCTOS QUE FALTAN                                 */}
      {/* ================================================================== */}
      {reporte === 'faltan' && (
        <div className="rv-report-panel">
          <SectionHeader
            icon="⚠️"
            title="Productos que Faltan — Sin Pedidos"
            subtitle="Productos disponibles en carta que no han recibido ningún pedido en el período seleccionado"
          >
            <button type="button" className="rv-btn-export" onClick={() =>
              downloadCSV(`productos-sin-pedidos-${new Date().toISOString().slice(0,10)}.csv`,
                ['ID','Nombre','Categoría','Especialidad/Tag','Precio','Veces Pedido'],
                faltFiltered.map(p => [p.id, p.name, p.category === 'comida' ? 'Comida' : 'Bebida', p.tag || '', Number(p.price||0).toFixed(2), '0'])
              )
            }>⬇ Exportar CSV</button>
          </SectionHeader>

          <FiltrosGlobales />

          <div className="rv-alert-box">
            <span className="rv-alert-icon">ℹ️</span>
            <span>Los productos listados aquí son los que están en carta pero <strong>no aparecen en ninguna venta</strong> del período filtrado. Pueden estar sin rotación, fuera de visibilidad para clientes, o simplemente no solicitados aún.</span>
          </div>

          <div className="rv-kpi-grid">
            <KpiCard label="📦 Total Productos en Carta" value={products.length.toLocaleString()} foot="Catálogo completo activo" colorClass="rv-kpi-purple" />
            <KpiCard label="✅ Con Pedidos en Período" value={(products.length - productosFaltantes.length).toLocaleString()} foot="Productos que sí se pidieron" colorClass="rv-kpi-green" />
            <KpiCard label="⚠️ Sin Pedidos (Posible Falta)" value={productosFaltantes.length.toLocaleString()} foot="No aparecen en ventas del período" colorClass="rv-kpi-pink" />
          </div>

          <div className="rv-card">
            <div className="rv-search-row">
              <input
                type="text"
                placeholder="🔍 Buscar producto sin pedidos..."
                value={faltSearch}
                onChange={e => { setFaltSearch(e.target.value); setFaltPage(1) }}
                className="rv-input rv-input-wide"
              />
              <span className="rv-result-count">{faltFiltered.length.toLocaleString()} productos sin pedidos</span>
            </div>
            <div className="rv-table-wrap">
              <table className="rv-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Nombre del Producto</th>
                    <th>Categoría</th>
                    <th>Especialidad / Tag</th>
                    <th style={{ textAlign: 'right' }}>Precio</th>
                    <th style={{ textAlign: 'center' }}>Veces Pedido</th>
                  </tr>
                </thead>
                <tbody>
                  {faltPageItems.map((p, i) => (
                    <tr key={p.id} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                      <td className="rv-folio">{(faltPage - 1) * PER_PAGE + i + 1}</td>
                      <td><strong>{p.name}</strong></td>
                      <td>{p.category === 'comida' ? '🍔 Comida' : '🥤 Bebida'}</td>
                      <td><span className="rv-tag">{p.tag || '—'}</span></td>
                      <td className="rv-total" style={{ textAlign: 'right' }}>{formatMoney(p.price)}</td>
                      <td style={{ textAlign: 'center' }}><span className="rv-badge badge-anulado">0 pedidos</span></td>
                    </tr>
                  ))}
                  {faltPageItems.length === 0 && (
                    <tr><td colSpan={6} className="rv-empty-row">✅ ¡Excelente! Todos los productos han sido pedidos al menos una vez en el período seleccionado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <Paginator page={faltPage} totalPages={faltTotalPages} total={faltFiltered.length}
              onPrev={() => setFaltPage(p => Math.max(1, p - 1))}
              onNext={() => setFaltPage(p => Math.min(faltTotalPages, p + 1))}
            />
          </div>
        </div>
      )}
    </div>
  )
}
