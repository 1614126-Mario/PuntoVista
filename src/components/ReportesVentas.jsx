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

export default function ReportesVentas({ token, ventas: ventasProp = [], products = [] }) {
  const [ventasApi, setVentasApi] = useState(null)
  const [loading, setLoading] = useState(false)
  const [margenPct, setMargenPct] = useState(60)
  const [tab, setTab] = useState('resumen') // 'resumen' | 'pedidos' | 'inventario' | 'flujo'

  // Filtros de ventas
  const [filtroDesde, setFiltroDesde] = useState('')
  const [filtroHasta, setFiltroHasta] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')
  const [filtroTipo, setFiltroTipo] = useState('TODOS')

  // Filtros de pedidos por cliente
  const [busquedaPedidos, setBusquedaPedidos] = useState('')

  // Filtros de inventario (comidas y bebidas)
  const [invCat, setInvCat] = useState('all')
  const [invSearch, setInvSearch] = useState('')
  const [invPage, setInvPage] = useState(1)
  const INV_PER_PAGE = 40

  // Entradas y salidas manuales (persistidas en localStorage)
  const [movimientos, setMovimientos] = useState(() => {
    try {
      const saved = localStorage.getItem(MOVIMIENTOS_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [nuevoMov, setNuevoMov] = useState({
    tipo: 'SALIDA',
    categoria: 'Compra de Insumos',
    descripcion: '',
    monto: ''
  })

  useEffect(() => {
    try {
      localStorage.setItem(MOVIMIENTOS_KEY, JSON.stringify(movimientos))
    } catch {
      // ignore storage quota errors
    }
  }, [movimientos])

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
      .catch(() => {})
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

  // ── KPIs de Entradas, Salidas, Ganancias y Pérdidas ─────────────────────────
  const kpis = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1)

    let totalHoy = 0, totalMes = 0, totalGeneral = 0
    let subtotalGeneral = 0, ivaGeneral = 0
    let gananciaBrutaVentas = 0, costoInsumosVentas = 0
    let gananciaHoy = 0, gananciaMes = 0
    let transacciones = 0, pendientesCount = 0, pendientesTotal = 0
    let anuladasCount = 0, perdidasAnuladas = 0
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

    const entradasExtra = movimientos
      .filter(m => m.tipo === 'ENTRADA')
      .reduce((acc, m) => acc + Number(m.monto || 0), 0)
    const salidasOperativas = movimientos
      .filter(m => m.tipo === 'SALIDA')
      .reduce((acc, m) => acc + Number(m.monto || 0), 0)
    const perdidasMerma = movimientos
      .filter(m => m.tipo === 'PERDIDA')
      .reduce((acc, m) => acc + Number(m.monto || 0), 0)

    const totalEntradas = totalGeneral + entradasExtra
    const totalSalidas = costoInsumosVentas + salidasOperativas + perdidasMerma + perdidasAnuladas
    const resultadoNeto = (gananciaBrutaVentas + entradasExtra) - (salidasOperativas + perdidasMerma)
    const esGanancia = resultadoNeto >= 0

    const ticketProm = transacciones > 0 ? totalGeneral / transacciones : 0
    const mejorProducto = Object.entries(productoMap).sort((a, b) => b[1] - a[1])[0]

    return {
      totalHoy, totalMes, totalGeneral,
      subtotalGeneral, ivaGeneral,
      gananciaBrutaVentas, costoInsumosVentas,
      gananciaHoy, gananciaMes,
      transacciones, ticketProm, mejorProducto,
      pendientesCount, pendientesTotal,
      anuladasCount, perdidasAnuladas,
      entradasExtra, salidasOperativas, perdidasMerma,
      totalEntradas, totalSalidas, resultadoNeto, esGanancia,
      metodoMap, tipoMap
    }
  }, [ventasFiltradas, movimientos, margenPct])

  // ── Detalle producto por producto pedido por cada cliente ─────────────────
  const pedidosClientesRows = useMemo(() => {
    const rows = []
    ventasFiltradas.forEach(v => {
      const cliente = v.cliente
        ? `${v.cliente.nombre || ''} ${v.cliente.apellido || ''}`.trim() || 'Consumidor Final'
        : 'Consumidor Final'
      const folio = v.numeroFactura || v.folio || `FAC-${v.id}`
      const fecha = v.fechaVenta
      const estado = v.estado || 'FACTURADO'
      const canal = v.tipoPedido || 'LOCAL'
      const detalles = v.detalles || v.items || []
      detalles.forEach(d => {
        const nombre = d.nombreProducto || d.name || 'Producto'
        const cant = Number(d.cantidad || d.quantity || 1)
        const precio = Number(d.precioUnitario || d.price || 0)
        const sub = Number(d.subtotal || (precio * cant))
        rows.push({
          folio,
          fecha,
          cliente,
          producto: nombre,
          cantidad: cant,
          precio,
          subtotal: sub,
          canal,
          estado
        })
      })
    })
    const q = busquedaPedidos.toLowerCase().trim()
    if (!q) return rows
    return rows.filter(r =>
      r.cliente.toLowerCase().includes(q) ||
      r.producto.toLowerCase().includes(q) ||
      r.folio.toLowerCase().includes(q)
    )
  }, [ventasFiltradas, busquedaPedidos])

  // ── Inventario de Comidas y Bebidas ───────────────────────────────────────
  const invStats = useMemo(() => {
    const comidas = products.filter(p => p.category === 'comida')
    const bebidas = products.filter(p => p.category === 'bebida')
    const valorComidas = comidas.reduce((a, p) => a + Number(p.price || 0), 0)
    const valorBebidas = bebidas.reduce((a, p) => a + Number(p.price || 0), 0)
    return {
      total: products.length,
      comidasCount: comidas.length,
      bebidasCount: bebidas.length,
      valorComidas,
      valorBebidas
    }
  }, [products])

  const invFiltered = useMemo(() => {
    const q = invSearch.toLowerCase().trim()
    return products.filter(p => {
      if (invCat !== 'all' && p.category !== invCat) return false
      if (!q) return true
      return p.name.toLowerCase().includes(q) || (p.tag && p.tag.toLowerCase().includes(q))
    })
  }, [products, invCat, invSearch])

  const invTotalPages = Math.max(1, Math.ceil(invFiltered.length / INV_PER_PAGE))
  const invPageItems = useMemo(() => {
    const start = (invPage - 1) * INV_PER_PAGE
    return invFiltered.slice(start, start + INV_PER_PAGE)
  }, [invFiltered, invPage])

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

  // ── Agregar / Eliminar Movimiento de Caja (Entradas / Salidas / Pérdidas) ─
  function handleAgregarMovimiento(e) {
    e.preventDefault()
    const montoNum = parseFloat(nuevoMov.monto)
    if (!nuevoMov.descripcion.trim() || isNaN(montoNum) || montoNum <= 0) return
    const item = {
      id: Date.now().toString(),
      fecha: new Date().toISOString(),
      tipo: nuevoMov.tipo, // 'ENTRADA' | 'SALIDA' | 'PERDIDA'
      categoria: nuevoMov.categoria,
      descripcion: nuevoMov.descripcion.trim(),
      monto: montoNum
    }
    setMovimientos(prev => [item, ...prev])
    setNuevoMov(prev => ({ ...prev, descripcion: '', monto: '' }))
  }

  function handleEliminarMovimiento(id) {
    setMovimientos(prev => prev.filter(m => m.id !== id))
  }

  // ── Exportaciones CSV ─────────────────────────────────────────────────────
  function exportarReporteCompleto() {
    const fechaHoy = new Date().toISOString().slice(0, 10)
    const headers = ['Sección', 'Fecha', 'Referencia / Cliente', 'Detalle / Producto', 'Cantidad / Categoría', 'Entrada ($)', 'Salida / Costo ($)', 'Ganancia / Neto ($)', 'Estado']
    const rows = []

    // 1. Resumen Estado de Resultados
    rows.push(['RESUMEN', fechaHoy, 'Entradas por Ventas Facturadas', `${kpis.transacciones} transacciones`, '-', kpis.totalGeneral.toFixed(2), '0.00', kpis.gananciaBrutaVentas.toFixed(2), 'OK'])
    rows.push(['RESUMEN', fechaHoy, 'Entradas Extra Registradas', 'Caja / Otros ingresos', '-', kpis.entradasExtra.toFixed(2), '0.00', kpis.entradasExtra.toFixed(2), 'OK'])
    rows.push(['RESUMEN', fechaHoy, 'Costo Estimado de Insumos', `Margen ${margenPct}%`, '-', '0.00', kpis.costoInsumosVentas.toFixed(2), (-kpis.costoInsumosVentas).toFixed(2), 'COSTO'])
    rows.push(['RESUMEN', fechaHoy, 'Salidas / Gastos Operativos', 'Gastos registrados', '-', '0.00', kpis.salidasOperativas.toFixed(2), (-kpis.salidasOperativas).toFixed(2), 'SALIDA'])
    rows.push(['RESUMEN', fechaHoy, 'Pérdidas (Mermas + Anulaciones)', `${kpis.anuladasCount} anuladas`, '-', '0.00', (kpis.perdidasMerma + kpis.perdidasAnuladas).toFixed(2), (-(kpis.perdidasMerma + kpis.perdidasAnuladas)).toFixed(2), 'PERDIDA'])
    rows.push(['RESUMEN', fechaHoy, 'RESULTADO NETO FINAL', kpis.esGanancia ? 'GANANCIA NETA' : 'PÉRDIDA NETA', '-', kpis.totalEntradas.toFixed(2), kpis.totalSalidas.toFixed(2), kpis.resultadoNeto.toFixed(2), kpis.esGanancia ? 'GANANCIA' : 'PERDIDA'])

    // 2. Pedidos por Cliente
    pedidosClientesRows.forEach(r => {
      const gan = r.estado === 'ANULADO' ? 0 : r.subtotal * (margenPct / 100)
      const per = r.estado === 'ANULADO' ? r.subtotal : 0
      rows.push(['PEDIDO CLIENTE', r.fecha ? new Date(r.fecha).toLocaleDateString('es-SV') : '', `${r.folio} - ${r.cliente}`, r.producto, `${r.cantidad} (${r.canal})`, r.subtotal.toFixed(2), per.toFixed(2), gan.toFixed(2), r.estado])
    })

    // 3. Entradas y Salidas Manuales
    movimientos.forEach(m => {
      const ent = m.tipo === 'ENTRADA' ? m.monto : 0
      const sal = m.tipo !== 'ENTRADA' ? m.monto : 0
      rows.push([`FLUJO ${m.tipo}`, new Date(m.fecha).toLocaleDateString('es-SV'), m.categoria, m.descripcion, '1', ent.toFixed(2), sal.toFixed(2), (ent - sal).toFixed(2), m.tipo])
    })

    // 4. Inventario Resumen
    rows.push(['INVENTARIO', fechaHoy, 'Comidas Disponibles', `${invStats.comidasCount} platillos`, 'comida', invStats.valorComidas.toFixed(2), '0.00', '-', 'ACTIVO'])
    rows.push(['INVENTARIO', fechaHoy, 'Bebidas Disponibles', `${invStats.bebidasCount} bebidas`, 'bebida', invStats.valorBebidas.toFixed(2), '0.00', '-', 'ACTIVO'])

    downloadCSV(`reporte-completo-admin-${fechaHoy}.csv`, headers, rows)
  }

  function exportarPedidosClientesCSV() {
    downloadCSV(
      `reporte-pedidos-clientes-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Folio', 'Fecha', 'Cliente', 'Producto Pedido', 'Cantidad', 'Precio Unit.', 'Subtotal', 'Canal', 'Estado'],
      pedidosClientesRows.map(r => [
        r.folio,
        r.fecha ? new Date(r.fecha).toLocaleString('es-SV') : '',
        r.cliente,
        r.producto,
        r.cantidad,
        r.precio.toFixed(2),
        r.subtotal.toFixed(2),
        r.canal,
        r.estado
      ])
    )
  }

  function exportarInventarioCSV() {
    downloadCSV(
      `reporte-comidas-bebidas-${new Date().toISOString().slice(0, 10)}.csv`,
      ['ID', 'Nombre', 'Categoría', 'Etiqueta', 'Precio Venta ($)'],
      invFiltered.map(p => [p.id, p.name, p.category === 'comida' ? 'Comida' : 'Bebida', p.tag || '', Number(p.price || 0).toFixed(2)])
    )
  }

  return (
    <div className="rv-container">
      {/* HEADER SOLO ADMINISTRADOR */}
      <div className="rv-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="rv-title">📊 Centro de Reportes del Administrador</h2>
          <p className="rv-subtitle">
            Acceso exclusivo de Administrador · Ventas, Ganancias, Pérdidas, Entradas/Salidas, Pedidos y Existencias
            {loading ? ' · Sincronizando...' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>Margen:</label>
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
            <option value={40}>40%</option>
            <option value={50}>50%</option>
            <option value={60}>60% (Estándar)</option>
            <option value={70}>70%</option>
          </select>
          <button type="button" className="rv-btn-export" onClick={exportarReporteCompleto}>
            ⬇ Reporte Completo (CSV)
          </button>
          <button type="button" className="rv-btn-clear" onClick={() => window.print()}>
            🖨️ Imprimir
          </button>
        </div>
      </div>

      {/* PESTAÑAS DEL CENTRO DE REPORTES */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        {[
          ['resumen', '💰 Ganancias, Pérdidas y Ventas'],
          ['pedidos', `🧾 Pedidos de Clientes (${pedidosClientesRows.length})`],
          ['inventario', `🍽️ Comidas y Bebidas (${products.length.toLocaleString()})`],
          ['flujo', `💸 Entradas y Salidas (${movimientos.length})`]
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              border: tab === key ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.12)',
              background: tab === key ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : '#1a1628',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.86rem'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* TAB 1: RESUMEN, GANANCIAS, PÉRDIDAS Y VENTAS                     */}
      {/* ================================================================ */}
      {tab === 'resumen' && (
        <>
          <div className="rv-kpi-grid">
            <div className="rv-kpi-card rv-kpi-purple">
              <div className="rv-kpi-label">💵 Entradas Totales (Ventas + Extras)</div>
              <div className="rv-kpi-value">{formatMoney(kpis.totalEntradas)}</div>
              <div className="rv-kpi-foot">Ventas: {formatMoney(kpis.totalGeneral)} · Extras: {formatMoney(kpis.entradasExtra)}</div>
            </div>
            <div className="rv-kpi-card rv-kpi-amber">
              <div className="rv-kpi-label">📤 Salidas y Pérdidas Totales</div>
              <div className="rv-kpi-value">{formatMoney(kpis.totalSalidas)}</div>
              <div className="rv-kpi-foot">Costos: {formatMoney(kpis.costoInsumosVentas)} · Gastos/Pérd.: {formatMoney(kpis.salidasOperativas + kpis.perdidasMerma + kpis.perdidasAnuladas)}</div>
            </div>
            <div className={`rv-kpi-card ${kpis.esGanancia ? 'rv-kpi-green' : 'rv-kpi-pink'}`}>
              <div className="rv-kpi-label">{kpis.esGanancia ? '📈 Ganancia Neta Real' : '📉 Pérdida Neta'}</div>
              <div className="rv-kpi-value" style={{ color: kpis.esGanancia ? '#4ade80' : '#f87171' }}>
                {kpis.esGanancia ? '+' : '-'}{formatMoney(Math.abs(kpis.resultadoNeto))}
              </div>
              <div className="rv-kpi-foot">Margen {margenPct}% menos gastos y mermas</div>
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
            <div className="rv-kpi-card rv-kpi-pink">
              <div className="rv-kpi-label">🏆 Producto Más Pedido</div>
              <div className="rv-kpi-value rv-kpi-value-sm">
                {kpis.mejorProducto ? kpis.mejorProducto[0] : '—'}
              </div>
              <div className="rv-kpi-foot">
                {kpis.mejorProducto ? `${kpis.mejorProducto[1]} unidades vendidas` : 'Sin datos'}
              </div>
            </div>
          </div>

          {/* ESTADO DE RESULTADOS: GANANCIAS VS PÉRDIDAS */}
          <div className="rv-card">
            <h3 className="rv-card-title">⚖️ Estado de Resultados — Ganancias y Pérdidas</h3>
            <div className="rv-table-wrap">
              <table className="rv-table">
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Tipo</th>
                    <th style={{ textAlign: 'right' }}>Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ingresos por Ventas Facturadas ({kpis.transacciones} ventas · IVA incluido: {formatMoney(kpis.ivaGeneral)})</td>
                    <td><span className="rv-badge badge-facturado">Entrada</span></td>
                    <td style={{ textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>+{formatMoney(kpis.totalGeneral)}</td>
                  </tr>
                  <tr className="rv-row-alt">
                    <td>Otras Entradas de Caja Registradas</td>
                    <td><span className="rv-badge badge-facturado">Entrada</span></td>
                    <td style={{ textAlign: 'right', color: '#4ade80', fontWeight: 700 }}>+{formatMoney(kpis.entradasExtra)}</td>
                  </tr>
                  <tr>
                    <td>Costo Estimado de Insumos ({100 - margenPct}% sobre subtotal neto)</td>
                    <td><span className="rv-badge badge-pendiente">Salida / Costo</span></td>
                    <td style={{ textAlign: 'right', color: '#fbbf24', fontWeight: 600 }}>-{formatMoney(kpis.costoInsumosVentas)}</td>
                  </tr>
                  <tr className="rv-row-alt">
                    <td>Salidas y Gastos Operativos Registrados</td>
                    <td><span className="rv-badge badge-pendiente">Salida</span></td>
                    <td style={{ textAlign: 'right', color: '#fbbf24', fontWeight: 600 }}>-{formatMoney(kpis.salidasOperativas)}</td>
                  </tr>
                  <tr>
                    <td>Pérdidas por Mermas / Desperdicios / Devoluciones</td>
                    <td><span className="rv-badge badge-anulado">Pérdida</span></td>
                    <td style={{ textAlign: 'right', color: '#f87171', fontWeight: 600 }}>-{formatMoney(kpis.perdidasMerma)}</td>
                  </tr>
                  <tr className="rv-row-alt">
                    <td>Ventas Anuladas ({kpis.anuladasCount} factura(s))</td>
                    <td><span className="rv-badge badge-anulado">Pérdida / Anulado</span></td>
                    <td style={{ textAlign: 'right', color: '#f87171', fontWeight: 600 }}>-{formatMoney(kpis.perdidasAnuladas)}</td>
                  </tr>
                  <tr>
                    <td><strong>{kpis.esGanancia ? 'RESULTADO NETO: GANANCIA' : 'RESULTADO NETO: PÉRDIDA'}</strong></td>
                    <td>
                      <span className={`rv-badge ${kpis.esGanancia ? 'badge-facturado' : 'badge-anulado'}`}>
                        {kpis.esGanancia ? 'Ganancia' : 'Pérdida'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 800, color: kpis.esGanancia ? '#4ade80' : '#f87171' }}>
                      {kpis.esGanancia ? '+' : '-'}{formatMoney(Math.abs(kpis.resultadoNeto))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* GRÁFICO 7 DÍAS */}
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

          {/* TOP 10 PRODUCTOS Y MÉTODOS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
            <div className="rv-card" style={{ marginBottom: 0 }}>
              <h3 className="rv-card-title">💳 Por Método de Pago</h3>
              {Object.keys(kpis.metodoMap).length === 0 ? (
                <p className="rv-empty">Sin ventas facturadas.</p>
              ) : (
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
              <h3 className="rv-card-title">🥇 Top 10 Productos</h3>
              {topProductos.length === 0 ? (
                <p className="rv-empty">Sin productos vendidos aún.</p>
              ) : (
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
        </>
      )}

      {/* ================================================================ */}
      {/* TAB 2: CADA PRODUCTO QUE UN CLIENTE PIDE                         */}
      {/* ================================================================ */}
      {tab === 'pedidos' && (
        <div className="rv-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <h3 className="rv-card-title" style={{ marginBottom: '0.2rem' }}>🧾 Reporte de Productos Pedidos por Cliente</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#9ca3af' }}>Detalle exacto de cada comida o bebida solicitada por cada cliente</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Buscar cliente, producto o folio..."
                value={busquedaPedidos}
                onChange={(e) => setBusquedaPedidos(e.target.value)}
                style={{
                  background: '#120f1d',
                  color: '#fff',
                  border: '1px solid rgba(168,85,247,0.35)',
                  borderRadius: '8px',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              />
              <button type="button" className="rv-btn-export" onClick={exportarPedidosClientesCSV}>
                ⬇ Exportar Pedidos (CSV)
              </button>
            </div>
          </div>

          <div className="rv-table-wrap">
            <table className="rv-table">
              <thead>
                <tr>
                  <th>Folio</th>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Producto Pedido</th>
                  <th>Cant.</th>
                  <th>Precio Unit.</th>
                  <th>Subtotal</th>
                  <th>Canal</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {pedidosClientesRows.slice(0, 100).map((r, i) => (
                  <tr key={i} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                    <td className="rv-folio">{r.folio}</td>
                    <td className="rv-fecha">{formatFecha(r.fecha)}</td>
                    <td>{r.cliente}</td>
                    <td><strong>{r.producto}</strong></td>
                    <td>×{r.cantidad}</td>
                    <td>{formatMoney(r.precio)}</td>
                    <td className="rv-total">{formatMoney(r.subtotal)}</td>
                    <td>{r.canal === 'EN_LINEA' ? '🌐 En Línea' : r.canal === 'LLEVAR' ? '🛍️ Llevar' : '🍽️ Local'}</td>
                    <td><span className={`rv-badge ${getBadgeClass(r.estado)}`}>{getBadgeLabel(r.estado)}</span></td>
                  </tr>
                ))}
                {pedidosClientesRows.length === 0 && (
                  <tr>
                    <td colSpan={9} className="rv-empty-row">No hay productos pedidos que coincidan con la búsqueda.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 3: LA COMIDA Y BEBIDAS QUE HAY                               */}
      {/* ================================================================ */}
      {tab === 'inventario' && (
        <div className="rv-card">
          <div className="rv-kpi-grid" style={{ marginBottom: '1rem' }}>
            <div className="rv-kpi-card rv-kpi-purple">
              <div className="rv-kpi-label">🍽️ Total Productos en Carta</div>
              <div className="rv-kpi-value">{invStats.total.toLocaleString()}</div>
              <div className="rv-kpi-foot">Catálogo activo en tienda y POS</div>
            </div>
            <div className="rv-kpi-card rv-kpi-amber">
              <div className="rv-kpi-label">🍔 Comidas Disponibles</div>
              <div className="rv-kpi-value">{invStats.comidasCount.toLocaleString()}</div>
              <div className="rv-kpi-foot">Suma de precios carta: {formatMoney(invStats.valorComidas)}</div>
            </div>
            <div className="rv-kpi-card rv-kpi-blue">
              <div className="rv-kpi-label">🥤 Bebidas Disponibles</div>
              <div className="rv-kpi-value">{invStats.bebidasCount.toLocaleString()}</div>
              <div className="rv-kpi-foot">Suma de precios carta: {formatMoney(invStats.valorBebidas)}</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {[
                ['all', `Todos (${invStats.total})`],
                ['comida', `Comidas (${invStats.comidasCount})`],
                ['bebida', `Bebidas (${invStats.bebidasCount})`]
              ].map(([k, lbl]) => (
                <button
                  key={k}
                  type="button"
                  className={invCat === k ? 'rv-btn-export' : 'rv-btn-clear'}
                  onClick={() => { setInvCat(k); setInvPage(1) }}
                >
                  {lbl}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Buscar comida o bebida..."
                value={invSearch}
                onChange={(e) => { setInvSearch(e.target.value); setInvPage(1) }}
                style={{
                  background: '#120f1d',
                  color: '#fff',
                  border: '1px solid rgba(168,85,247,0.35)',
                  borderRadius: '8px',
                  padding: '0.45rem 0.75rem',
                  fontSize: '0.85rem'
                }}
              />
              <button type="button" className="rv-btn-export" onClick={exportarInventarioCSV}>
                ⬇ Exportar Catálogo (CSV)
              </button>
            </div>
          </div>

          <div className="rv-table-wrap">
            <table className="rv-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Especialidad / Tag</th>
                  <th style={{ textAlign: 'right' }}>Precio Venta</th>
                </tr>
              </thead>
              <tbody>
                {invPageItems.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                    <td className="rv-folio">{p.id}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category === 'comida' ? '🍔 Comida' : '🥤 Bebida'}</td>
                    <td>{p.tag || '—'}</td>
                    <td style={{ textAlign: 'right' }} className="rv-total">{formatMoney(p.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <span>Página {invPage} de {invTotalPages} ({invFiltered.length.toLocaleString()} resultados)</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="rv-btn-clear" disabled={invPage <= 1} onClick={() => setInvPage(p => Math.max(1, p - 1))}>Anterior</button>
              <button type="button" className="rv-btn-clear" disabled={invPage >= invTotalPages} onClick={() => setInvPage(p => Math.min(invTotalPages, p + 1))}>Siguiente</button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* TAB 4: ENTRADAS, SALIDAS Y PÉRDIDAS MANUALES                     */}
      {/* ================================================================ */}
      {tab === 'flujo' && (
        <div className="rv-card">
          <h3 className="rv-card-title">💸 Registro de Entradas, Salidas y Pérdidas</h3>
          <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1rem' }}>
            Registra compras de insumos, gastos operativos, mermas/pérdidas o entradas adicionales de caja. Todo se suma automáticamente al Estado de Resultados y al Reporte Completo.
          </p>

          <form onSubmit={handleAgregarMovimiento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <select
              value={nuevoMov.tipo}
              onChange={(e) => setNuevoMov({ ...nuevoMov, tipo: e.target.value })}
              style={{ background: '#120f1d', color: '#fff', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '8px', padding: '0.5rem' }}
            >
              <option value="ENTRADA">➕ Entrada de Caja</option>
              <option value="SALIDA">➖ Salida / Gasto</option>
              <option value="PERDIDA">⚠️ Pérdida / Merma</option>
            </select>

            <input
              type="text"
              placeholder="Categoría (ej. Insumos, Gas, Merma)"
              value={nuevoMov.categoria}
              onChange={(e) => setNuevoMov({ ...nuevoMov, categoria: e.target.value })}
              style={{ background: '#120f1d', color: '#fff', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '8px', padding: '0.5rem' }}
            />

            <input
              type="text"
              placeholder="Descripción del movimiento..."
              required
              value={nuevoMov.descripcion}
              onChange={(e) => setNuevoMov({ ...nuevoMov, descripcion: e.target.value })}
              style={{ background: '#120f1d', color: '#fff', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '8px', padding: '0.5rem' }}
            />

            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Monto ($)"
              required
              value={nuevoMov.monto}
              onChange={(e) => setNuevoMov({ ...nuevoMov, monto: e.target.value })}
              style={{ background: '#120f1d', color: '#fff', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '8px', padding: '0.5rem' }}
            />

            <button type="submit" className="rv-btn-export">
              + Registrar Movimiento
            </button>
          </form>

          <div className="rv-table-wrap">
            <table className="rv-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Tipo</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th style={{ textAlign: 'right' }}>Monto</th>
                  <th style={{ textAlign: 'center' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.map((m, i) => (
                  <tr key={m.id} className={i % 2 === 1 ? 'rv-row-alt' : ''}>
                    <td className="rv-fecha">{formatFecha(m.fecha)}</td>
                    <td>
                      <span className={`rv-badge ${m.tipo === 'ENTRADA' ? 'badge-facturado' : m.tipo === 'SALIDA' ? 'badge-pendiente' : 'badge-anulado'}`}>
                        {m.tipo}
                      </span>
                    </td>
                    <td>{m.categoria}</td>
                    <td>{m.descripcion}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: m.tipo === 'ENTRADA' ? '#4ade80' : m.tipo === 'SALIDA' ? '#fbbf24' : '#f87171' }}>
                      {m.tipo === 'ENTRADA' ? '+' : '-'}{formatMoney(m.monto)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button type="button" className="rv-btn-clear" onClick={() => handleEliminarMovimiento(m.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {movimientos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="rv-empty-row">Aún no hay entradas o salidas manuales registradas.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
