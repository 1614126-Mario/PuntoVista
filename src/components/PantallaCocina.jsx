import React, { useState, useEffect, useMemo } from 'react'
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ChefHat,
  Maximize2,
  Minimize2,
  Search,
  Filter,
  Check,
  Utensils,
  Truck,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  MapPin,
  Bell
} from 'lucide-react'

const KITCHEN_STORAGE_KEY = 'nocturna_kds_estados'

export default function PantallaCocina({ ventas = [] }) {
  // Hora actual en tiempo real
  const [ahora, setAhora] = useState(new Date())
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('ACTIVAS') // 'ACTIVAS' | 'PENDIENTE' | 'EN_PREPARACION' | 'LISTO' | 'ENTREGADO'
  const [filtroTipo, setFiltroTipo] = useState('TODOS') // 'TODOS' | 'LOCAL' | 'EN_LINEA' | 'LLEVAR'
  const [busqueda, setBusqueda] = useState('')

  // Estados de cocina persistentes: { [pedidoId]: { estado: 'PENDIENTE'|'EN_PREPARACION'|'LISTO'|'ENTREGADO', itemsCheck: number[], iniciadoEn?: number, listoEn?: number } }
  const [kdsData, setKdsData] = useState(() => {
    try {
      const saved = localStorage.getItem(KITCHEN_STORAGE_KEY)
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Reloj digital en vivo
  useEffect(() => {
    const timer = setInterval(() => setAhora(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Guardar en localStorage cuando cambie kdsData
  const actualizarKdsData = (nuevaData) => {
    setKdsData(nuevaData)
    try {
      localStorage.setItem(KITCHEN_STORAGE_KEY, JSON.stringify(nuevaData))
    } catch (e) {
      console.error('Error guardando estados de cocina:', e)
    }
  }

  // Obtener estado de cocina de una orden
  const getEstadoOrden = (pedidoId) => {
    return kdsData[pedidoId]?.estado || 'PENDIENTE'
  }

  // Cambiar estado de una orden
  const cambiarEstadoOrden = (pedidoId, nuevoEstado) => {
    const actual = kdsData[pedidoId] || { itemsCheck: [] }
    const actualizados = {
      ...kdsData,
      [pedidoId]: {
        ...actual,
        estado: nuevoEstado,
        ...(nuevoEstado === 'EN_PREPARACION' && !actual.iniciadoEn ? { iniciadoEn: Date.now() } : {}),
        ...(nuevoEstado === 'LISTO' ? { listoEn: Date.now() } : {})
      }
    }
    actualizarKdsData(actualizados)
  }

  // Marcar/desmarcar item individual de la comanda
  const toggleItemCheck = (pedidoId, itemIndex) => {
    const actual = kdsData[pedidoId] || { estado: 'PENDIENTE', itemsCheck: [] }
    const checks = actual.itemsCheck || []
    const existe = checks.includes(itemIndex)
    const nuevosChecks = existe ? checks.filter(i => i !== itemIndex) : [...checks, itemIndex]

    const actualizados = {
      ...kdsData,
      [pedidoId]: {
        ...actual,
        itemsCheck: nuevosChecks,
        // Si marcó un item y seguía pendiente, pasa automáticamente a preparación
        estado: actual.estado === 'PENDIENTE' ? 'EN_PREPARACION' : actual.estado
      }
    }
    actualizarKdsData(actualizados)
  }

  // Modo pantalla completa
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
      setIsFullscreen(false)
    }
  }

  // Procesar pedidos y tiempos
  const pedidosCocina = useMemo(() => {
    return ventas.map(v => {
      const fecha = v.fechaVenta ? new Date(v.fechaVenta) : new Date()
      const minutosTranscurridos = Math.max(0, Math.floor((ahora - fecha) / 60000))
      const estadoCocina = getEstadoOrden(v.id)
      const checks = kdsData[v.id]?.itemsCheck || []
      const items = v.detalles || v.items || []

      return {
        ...v,
        fechaObj: fecha,
        minutosTranscurridos,
        estadoCocina,
        items,
        checks,
        todosItemsListos: items.length > 0 && checks.length === items.length
      }
    })
  }, [ventas, ahora, kdsData])

  // Filtrado de comandas
  const comandasFiltradas = useMemo(() => {
    return pedidosCocina.filter(p => {
      // Filtro por estado
      if (filtroEstado === 'ACTIVAS') {
        if (p.estadoCocina === 'ENTREGADO') return false
      } else if (p.estadoCocina !== filtroEstado) {
        return false
      }

      // Filtro por tipo
      if (filtroTipo !== 'TODOS' && (p.tipoPedido || 'LOCAL') !== filtroTipo) {
        return false
      }

      // Filtro por búsqueda
      if (busqueda.trim()) {
        const q = busqueda.toLowerCase().trim()
        const mesa = (p.numeroMesa || '').toLowerCase()
        const cliente = (p.cliente ? `${p.cliente.nombre} ${p.cliente.apellido || ''}` : '').toLowerCase()
        const folio = (p.numeroFactura || p.folio || `ORD-${p.id}`).toLowerCase()
        const notas = (p.notas || '').toLowerCase()
        const algunPlatillo = p.items.some(it => (it.nombreProducto || it.name || '').toLowerCase().includes(q))
        return mesa.includes(q) || cliente.includes(q) || folio.includes(q) || notas.includes(q) || algunPlatillo
      }

      return true
    })
  }, [pedidosCocina, filtroEstado, filtroTipo, busqueda])

  // Contadores
  const countPendientes = pedidosCocina.filter(p => p.estadoCocina === 'PENDIENTE').length
  const countCocinando = pedidosCocina.filter(p => p.estadoCocina === 'EN_PREPARACION').length
  const countListas = pedidosCocina.filter(p => p.estadoCocina === 'LISTO').length
  const countEntregadas = pedidosCocina.filter(p => p.estadoCocina === 'ENTREGADO').length

  return (
    <div style={{
      minHeight: '88vh',
      backgroundColor: '#0f172a',
      color: '#f8fafc',
      padding: '20px',
      borderRadius: '16px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* BARRA SUPERIOR DE COCINA (KDS) */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '16px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Título y estado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            backgroundColor: '#ea580c',
            color: '#fff',
            padding: '12px',
            borderRadius: '12px',
            boxShadow: '0 0 20px rgba(234, 88, 12, 0.4)'
          }}>
            <ChefHat size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
                Pantalla de Cocina (KDS)
              </h1>
              <span style={{
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
                border: '1px solid rgba(34, 197, 94, 0.4)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#4ade80', animation: 'pulse 1.5s infinite' }}></span>
                EN VIVO
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
              La Taberna de los Morenazos • Control de Comandas y Tiempos de Preparación
            </p>
          </div>
        </div>

        {/* Reloj Digital en Vivo y Botón Pantalla Completa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255,255,255,0.12)',
            padding: '8px 16px',
            borderRadius: '10px',
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'monospace', color: '#38bdf8' }}>
              {ahora.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'capitalize' }}>
              {ahora.toLocaleDateString('es-SV', { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa para cocina'}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#f8fafc',
              padding: '12px',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
          </button>
        </div>
      </div>

      {/* MÉTRICAS DE COCINA (KPIs) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        margin: '20px 0'
      }}>
        {/* Pendientes */}
        <div
          onClick={() => setFiltroEstado('PENDIENTE')}
          style={{
            backgroundColor: filtroEstado === 'PENDIENTE' ? '#451a03' : '#1e293b',
            border: `2px solid ${filtroEstado === 'PENDIENTE' ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`,
            padding: '16px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 600 }}>🕒 Por Preparar</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fef08a' }}>{countPendientes}</div>
          </div>
          <Clock size={28} color="#fbbf24" />
        </div>

        {/* En Preparación */}
        <div
          onClick={() => setFiltroEstado('EN_PREPARACION')}
          style={{
            backgroundColor: filtroEstado === 'EN_PREPARACION' ? '#431407' : '#1e293b',
            border: `2px solid ${filtroEstado === 'EN_PREPARACION' ? '#f97316' : 'rgba(255,255,255,0.08)'}`,
            padding: '16px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: '#fb923c', fontWeight: 600 }}>🔥 En el Fuego</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fed7aa' }}>{countCocinando}</div>
          </div>
          <Flame size={28} color="#f97316" />
        </div>

        {/* Listas */}
        <div
          onClick={() => setFiltroEstado('LISTO')}
          style={{
            backgroundColor: filtroEstado === 'LISTO' ? '#064e3b' : '#1e293b',
            border: `2px solid ${filtroEstado === 'LISTO' ? '#10b981' : 'rgba(255,255,255,0.08)'}`,
            padding: '16px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600 }}>✅ Listas para Servir</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#bbf7d0' }}>{countListas}</div>
          </div>
          <CheckCircle2 size={28} color="#4ade80" />
        </div>

        {/* Todas las activas */}
        <div
          onClick={() => setFiltroEstado('ACTIVAS')}
          style={{
            backgroundColor: filtroEstado === 'ACTIVAS' ? '#1e1b4b' : '#1e293b',
            border: `2px solid ${filtroEstado === 'ACTIVAS' ? '#818cf8' : 'rgba(255,255,255,0.08)'}`,
            padding: '16px',
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s'
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600 }}>📋 Todas Activas</span>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e0e7ff' }}>
              {countPendientes + countCocinando + countListas}
            </div>
          </div>
          <Utensils size={28} color="#a5b4fc" />
        </div>
      </div>

      {/* FILTROS Y BUSCADOR */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '22px'
      }}>
        {/* Filtros de origen */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'TODOS', label: 'Todos los Destinos', icon: null },
            { id: 'LOCAL', label: 'Salón (Mesas)', icon: Utensils },
            { id: 'EN_LINEA', label: 'Delivery / En Línea', icon: Truck },
            { id: 'LLEVAR', label: 'Para Llevar', icon: ShoppingBag }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroTipo(tab.id)}
              style={{
                backgroundColor: filtroTipo === tab.id ? '#3b82f6' : '#1e293b',
                color: filtroTipo === tab.id ? '#fff' : '#94a3b8',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '8px 14px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {tab.icon && <tab.icon size={14} />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Buscador de platillos o comandas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#1e293b',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '8px',
          padding: '4px 12px',
          maxWidth: '300px',
          width: '100%'
        }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar comanda o platillo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              padding: '6px 8px',
              fontSize: '0.85rem',
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* CUADRÍCULA DE COMANDAS / TICKETS DE COCINA */}
      {comandasFiltradas.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px dashed rgba(255,255,255,0.15)'
        }}>
          <ChefHat size={48} color="#64748b" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ margin: 0, color: '#e2e8f0', fontSize: '1.2rem' }}>¡Cocina al día!</h3>
          <p style={{ margin: '6px 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>
            No hay comandas pendientes con el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '18px'
        }}>
          {comandasFiltradas.map((comanda) => {
            const isLocal = !comanda.tipoPedido || comanda.tipoPedido === 'LOCAL'
            const isOnline = comanda.tipoPedido === 'EN_LINEA'
            const minutos = comanda.minutosTranscurridos

            // Color de tiempo de espera (KDS Timer Urgency)
            const urgenciaColor = minutos > 20 ? '#ef4444' : minutos > 10 ? '#f59e0b' : '#10b981'
            const urgenciaBg = minutos > 20 ? 'rgba(239, 68, 68, 0.15)' : minutos > 10 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)'

            return (
              <div
                key={comanda.id}
                style={{
                  backgroundColor: '#1e293b',
                  borderRadius: '14px',
                  border: `2px solid ${
                    comanda.estadoCocina === 'LISTO'
                      ? '#10b981'
                      : comanda.estadoCocina === 'EN_PREPARACION'
                      ? '#f97316'
                      : 'rgba(255,255,255,0.12)'
                  }`,
                  boxShadow: comanda.estadoCocina === 'EN_PREPARACION' ? '0 8px 24px rgba(249, 115, 22, 0.2)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                {/* CABECERA DEL TICKET */}
                <div style={{
                  padding: '14px 16px',
                  backgroundColor: comanda.estadoCocina === 'LISTO' ? '#064e3b' : comanda.estadoCocina === 'EN_PREPARACION' ? '#431407' : '#0f172a',
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                        {comanda.numeroFactura || comanda.folio || `ORD-${comanda.id}`}
                      </span>
                      {comanda.estadoCocina === 'LISTO' && (
                        <span style={{
                          backgroundColor: '#10b981',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          ¡LISTO!
                        </span>
                      )}
                      {comanda.estadoCocina === 'EN_PREPARACION' && (
                        <span style={{
                          backgroundColor: '#f97316',
                          color: '#fff',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <Flame size={11} /> COCINANDO
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Hora: {comanda.fechaObj.toLocaleTimeString('es-SV', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  {/* Temporizador de urgencia */}
                  <div style={{
                    backgroundColor: urgenciaBg,
                    border: `1px solid ${urgenciaColor}`,
                    color: urgenciaColor,
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <Clock size={13} />
                    <span>{minutos} min</span>
                  </div>
                </div>

                {/* DESTINO / MESA */}
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isLocal && <Utensils size={15} color="#4ade80" />}
                    {isOnline && <Truck size={15} color="#38bdf8" />}
                    {comanda.tipoPedido === 'LLEVAR' && <ShoppingBag size={15} color="#c084fc" />}
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>
                      {isLocal ? (comanda.numeroMesa || 'Mesa 1') : isOnline ? 'Envío a Domicilio' : 'Mostrador (Para Llevar)'}
                    </span>
                  </div>

                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {comanda.cliente ? `${comanda.cliente.nombre}` : 'Consumidor'}
                  </span>
                </div>

                {/* NOTAS O INSTRUCCIONES ESPECIALES DE COCINA */}
                {comanda.notas && (
                  <div style={{
                    margin: '10px 16px 4px 16px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    color: '#fbbf24',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '6px'
                  }}>
                    <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span><strong>Nota:</strong> "{comanda.notas}"</span>
                  </div>
                )}

                {/* LISTA DE PLATILLOS CON CHECKBOX INTERACTIVO */}
                <div style={{ padding: '12px 16px', flex: 1 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Platillos ({comanda.items.length}) - Toca para marcar:
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {comanda.items.map((item, idx) => {
                      const isChecked = comanda.checks.includes(idx)
                      return (
                        <div
                          key={idx}
                          onClick={() => toggleItemCheck(comanda.id, idx)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            backgroundColor: isChecked ? 'rgba(34, 197, 94, 0.1)' : 'rgba(255,255,255,0.03)',
                            border: `1px solid ${isChecked ? 'rgba(34, 197, 94, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                            borderRadius: '8px',
                            cursor: 'pointer',
                            userSelect: 'none',
                            transition: 'all 0.15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: 20,
                              height: 20,
                              borderRadius: '4px',
                              border: `2px solid ${isChecked ? '#22c55e' : '#64748b'}`,
                              backgroundColor: isChecked ? '#22c55e' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              transition: 'all 0.15s'
                            }}>
                              {isChecked && <Check size={14} strokeWidth={3} />}
                            </div>

                            <span style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: isChecked ? '#86efac' : '#fff',
                              textDecoration: isChecked ? 'line-through' : 'none'
                            }}>
                              {item.cantidad || item.quantity || 1}x {item.nombreProducto || item.name || 'Platillo'}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* BOTONES DE ACCIÓN DEL COCINERO */}
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  gap: '8px'
                }}>
                  {comanda.estadoCocina === 'PENDIENTE' && (
                    <button
                      type="button"
                      onClick={() => cambiarEstadoOrden(comanda.id, 'EN_PREPARACION')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        backgroundColor: '#ea580c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Flame size={16} />
                      <span>Empezar a Cocinar</span>
                    </button>
                  )}

                  {comanda.estadoCocina === 'EN_PREPARACION' && (
                    <button
                      type="button"
                      onClick={() => cambiarEstadoOrden(comanda.id, 'LISTO')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        backgroundColor: '#16a34a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      <span>¡Marcar Orden Lista!</span>
                    </button>
                  )}

                  {comanda.estadoCocina === 'LISTO' && (
                    <button
                      type="button"
                      onClick={() => cambiarEstadoOrden(comanda.id, 'ENTREGADO')}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        backgroundColor: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Check size={16} strokeWidth={2.5} />
                      <span>Despachar / Entregado</span>
                    </button>
                  )}

                  {/* Botón de retroceder o restablecer */}
                  {comanda.estadoCocina !== 'PENDIENTE' && (
                    <button
                      type="button"
                      onClick={() => cambiarEstadoOrden(comanda.id, 'PENDIENTE')}
                      title="Regresar orden a estado pendiente"
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        color: '#94a3b8',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <RotateCcw size={15} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
