import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Sparkles,
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  MapPin,
  User,
  Phone,
  Mail,
  MessageSquare,
  Truck,
  CheckCircle2,
  Clock,
  X,
  Banknote,
  CreditCard,
  Smartphone,
  Globe,
  RotateCcw,
  LogIn,
  ClipboardList,
  ArrowLeft
} from 'lucide-react'
import { INITIAL_PRODUCTS } from '../data/initialProducts'
import { PAYMENT_INFO } from '../data/paymentInfo'
import PaymentDetails from './PaymentDetails'
import pedidoPublicoService from '../services/pedidoPublicoService'
import '../Tienda.css'

const IVA_RATE = 0.13

const METODOS = [
  { key: 'cash', label: 'Efectivo', backend: 'Efectivo', icon: Banknote },
  { key: 'card', label: 'Tarjeta', backend: 'Tarjeta', icon: CreditCard },
  { key: 'transfer', label: 'Transferencia', backend: 'Transferencia', icon: Smartphone },
  { key: 'online', label: 'En línea', backend: 'Pago en Línea', icon: Globe }
]

const ESTADOS = {
  PENDIENTE_PAGO: { texto: 'Pedido recibido, esperando confirmación de pago', clase: 'pending', icon: Clock },
  FACTURADO: { texto: 'Pago confirmado. ¡Gracias por tu compra!', clase: 'done', icon: CheckCircle2 }
}

const FORM_VACIO = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  referencia: '',
  notas: ''
}

const money = (n) => `$${Number(n || 0).toFixed(2)}`

function EstadoPedido({ estado }) {
  const info = ESTADOS[estado] || { texto: estado || 'En proceso', clase: 'pending', icon: Clock }
  const Icon = info.icon
  return (
    <div className={`shop-status ${info.clase}`}>
      <Icon size={16} />
      <span>{info.texto}</span>
    </div>
  )
}

export default function TiendaEnLinea({ onAccesoPersonal }) {
  const [vista, setVista] = useState('menu') // 'menu' | 'pedidos'
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [cart, setCart] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [form, setForm] = useState(FORM_VACIO)
  const [metodo, setMetodo] = useState('cash')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')
  const [confirmacion, setConfirmacion] = useState(null)
  const [toast, setToast] = useState('')

  const [misPedidos, setMisPedidos] = useState(() => pedidoPublicoService.getPedidosLocales())
  const [estados, setEstados] = useState({})
  const [folioBusqueda, setFolioBusqueda] = useState('')
  const [errorBusqueda, setErrorBusqueda] = useState('')

  const productos = useMemo(() => {
    const q = query.toLowerCase().trim()
    return INITIAL_PRODUCTS.filter((p) => {
      const okCat = category === 'all' || p.category === category
      const okQuery = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      return okCat && okQuery
    })
  }, [category, query])

  const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0)
  const iva = Number((subtotal * IVA_RATE).toFixed(2))
  const total = Number((subtotal + iva).toFixed(2))
  const totalItems = cart.reduce((acc, it) => acc + it.quantity, 0)

  const mostrarToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const agregar = (p) => {
    setCart((prev) => {
      const ex = prev.find((i) => i.id === p.id)
      if (ex) return prev.map((i) => (i.id === p.id ? { ...i, quantity: Math.min(i.quantity + 1, 50) } : i))
      return [...prev, { ...p, quantity: 1 }]
    })
    mostrarToast(`"${p.name}" agregado a tu pedido`)
  }

  const cambiarCantidad = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: Math.min(i.quantity + delta, 50) } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  const quitar = (id) => setCart((prev) => prev.filter((i) => i.id !== id))

  const setCampo = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }))

  const refrescarEstado = useCallback(async (folio) => {
    try {
      const data = await pedidoPublicoService.consultarPedido(folio)
      setEstados((prev) => ({ ...prev, [folio]: data }))
      return data
    } catch {
      return null
    }
  }, [])

  // Mientras se ve la confirmación o la lista de pedidos, se actualiza el estado cada 20 s.
  useEffect(() => {
    const folios = []
    if (confirmacion) folios.push(confirmacion.folio)
    if (vista === 'pedidos') misPedidos.forEach((p) => folios.push(p.folio))
    if (folios.length === 0) return undefined

    const cargar = () => [...new Set(folios)].forEach(refrescarEstado)
    cargar()
    const id = setInterval(cargar, 20000)
    return () => clearInterval(id)
  }, [confirmacion, vista, misPedidos, refrescarEstado])

  const enviarPedido = async (e) => {
    e.preventDefault()
    setError('')

    if (cart.length === 0) return setError('Agrega al menos un producto a tu pedido.')
    if (!form.nombre.trim()) return setError('Indica tu nombre.')
    if (form.telefono.trim().length < 8) return setError('Indica un teléfono de contacto válido.')
    if (form.direccion.trim().length < 10) return setError('Indica la dirección completa a donde enviaremos tu pedido.')

    setEnviando(true)
    try {
      const creado = await pedidoPublicoService.crearPedido({
        nombre: form.nombre,
        telefono: form.telefono,
        email: form.email,
        direccionEntrega: form.direccion,
        referencia: form.referencia,
        notas: form.notas,
        metodoPago: METODOS.find((m) => m.key === metodo).backend,
        items: cart.map((i) => ({ nombre: i.name, cantidad: i.quantity, precio: i.price }))
      })
      setConfirmacion(creado)
      setEstados((prev) => ({ ...prev, [creado.folio]: creado }))
      setMisPedidos(pedidoPublicoService.getPedidosLocales())
      setCart([])
      setForm((f) => ({ ...FORM_VACIO, nombre: f.nombre, telefono: f.telefono, email: f.email }))
      setCartOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setEnviando(false)
    }
  }

  const buscarPorFolio = async (e) => {
    e.preventDefault()
    setErrorBusqueda('')
    const folio = folioBusqueda.trim().toUpperCase()
    if (!folio) return
    try {
      const data = await pedidoPublicoService.consultarPedido(folio)
      setEstados((prev) => ({ ...prev, [folio]: data }))
      if (!misPedidos.some((p) => p.folio === folio)) {
        pedidoPublicoService.guardarPedidoLocal(data)
        setMisPedidos(pedidoPublicoService.getPedidosLocales())
      }
      setFolioBusqueda('')
    } catch (err) {
      setErrorBusqueda(err.message)
    }
  }

  return (
    <div className="shop-page">
      <header className="shop-header">
        <div className="shop-header-inner">
          <div className="shop-brand" onClick={() => setVista('menu')}>
            <div className="shop-brand-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <h1>La Taberna de los Morenazos</h1>
              <p>Pide en línea y te lo llevamos</p>
            </div>
          </div>

          <div className="shop-header-actions">
            <button
              type="button"
              className={`shop-btn-ghost ${vista === 'pedidos' ? 'active' : ''}`}
              onClick={() => setVista(vista === 'pedidos' ? 'menu' : 'pedidos')}
            >
              <ClipboardList size={16} />
              <span>Mis pedidos</span>
              {misPedidos.length > 0 && <span className="shop-count">{misPedidos.length}</span>}
            </button>
            <button type="button" className="shop-btn-ghost" onClick={onAccesoPersonal}>
              <LogIn size={16} />
              <span>Acceso personal</span>
            </button>
          </div>
        </div>
      </header>

      {vista === 'pedidos' ? (
        <main className="shop-container">
          <button type="button" className="shop-back" onClick={() => setVista('menu')}>
            <ArrowLeft size={16} /> Volver al menú
          </button>
          <h2 className="shop-section-title">Mis pedidos</h2>

          <form className="shop-search-folio" onSubmit={buscarPorFolio}>
            <input
              className="shop-input"
              placeholder="Buscar pedido por folio (ej: WEB-2026-123456)"
              value={folioBusqueda}
              onChange={(e) => setFolioBusqueda(e.target.value)}
            />
            <button type="submit" className="shop-btn-primary">
              <Search size={16} /> Buscar
            </button>
          </form>
          {errorBusqueda && <p className="shop-error">{errorBusqueda}</p>}

          {misPedidos.length === 0 ? (
            <div className="shop-empty">
              <ClipboardList size={42} />
              <p>Aún no has hecho pedidos desde este dispositivo.</p>
            </div>
          ) : (
            <div className="shop-orders">
              {misPedidos.map((p) => {
                const det = estados[p.folio]
                return (
                  <div className="shop-order-card" key={p.folio}>
                    <div className="shop-order-head">
                      <strong>{p.folio}</strong>
                      <span>{p.fecha ? new Date(p.fecha).toLocaleString('es-SV') : ''}</span>
                    </div>
                    {det ? <EstadoPedido estado={det.estado} /> : <p className="shop-muted">Consultando estado...</p>}
                    {p.direccionEntrega && (
                      <div className="shop-destination">
                        <MapPin size={15} />
                        <span>Se entrega en: {p.direccionEntrega}</span>
                      </div>
                    )}
                    {det?.items && (
                      <ul className="shop-order-items">
                        {det.items.map((it, i) => (
                          <li key={i}>
                            {it.cantidad}x {it.nombre}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="shop-order-foot">
                      <strong>{money(det?.total ?? p.total)}</strong>
                      <button type="button" className="shop-btn-ghost" onClick={() => refrescarEstado(p.folio)}>
                        <RotateCcw size={14} /> Actualizar
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </main>
      ) : (
        <main className="shop-container shop-layout">
          <section className="shop-catalog">
            <div className="shop-hero">
              <h2>¿Qué se te antoja hoy?</h2>
              <p>Elige tus platillos, indica a dónde los llevamos y paga como prefieras.</p>
            </div>

            <div className="shop-controls">
              <div className="shop-search">
                <Search size={18} />
                <input
                  placeholder="Buscar platillos o bebidas..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="shop-tabs">
                {[
                  ['all', 'Todo'],
                  ['comida', 'Comidas'],
                  ['bebida', 'Bebidas']
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`shop-tab ${category === key ? 'active' : ''}`}
                    onClick={() => setCategory(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {productos.length === 0 ? (
              <div className="shop-empty">
                <Search size={42} />
                <p>No encontramos productos con esa búsqueda.</p>
              </div>
            ) : (
              <div className="shop-grid">
                {productos.map((p) => (
                  <article className="shop-card" key={p.id}>
                    <div className="shop-card-img">
                      <img src={p.image} alt={p.name} loading="lazy" />
                      {p.tag && <span className="shop-tag">{p.tag}</span>}
                    </div>
                    <div className="shop-card-body">
                      <h3>{p.name}</h3>
                      <p>{p.description}</p>
                      <div className="shop-card-foot">
                        <strong>{money(p.price)}</strong>
                        <button type="button" className="shop-btn-primary" onClick={() => agregar(p)}>
                          <Plus size={16} /> Agregar
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <aside className={`shop-cart ${cartOpen ? 'open' : ''}`}>
            <div className="shop-cart-head">
              <h2>
                <ShoppingCart size={18} /> Tu pedido
              </h2>
              <button type="button" className="shop-cart-close" onClick={() => setCartOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="shop-empty small">
                <ShoppingCart size={34} />
                <p>Tu pedido está vacío. Agrega algo del menú.</p>
              </div>
            ) : (
              <form onSubmit={enviarPedido} className="shop-form">
                <ul className="shop-cart-items">
                  {cart.map((i) => (
                    <li key={i.id}>
                      <div className="shop-cart-item-info">
                        <span>{i.name}</span>
                        <small>{money(i.price)} c/u</small>
                      </div>
                      <div className="shop-qty">
                        <button type="button" onClick={() => cambiarCantidad(i.id, -1)} aria-label="Quitar uno">
                          <Minus size={14} />
                        </button>
                        <span>{i.quantity}</span>
                        <button type="button" onClick={() => cambiarCantidad(i.id, 1)} aria-label="Agregar uno">
                          <Plus size={14} />
                        </button>
                        <button type="button" className="danger" onClick={() => quitar(i.id)} aria-label="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="shop-totals">
                  <div>
                    <span>Subtotal</span>
                    <span>{money(subtotal)}</span>
                  </div>
                  <div>
                    <span>IVA (13%)</span>
                    <span>{money(iva)}</span>
                  </div>
                  <div className="grand">
                    <span>Total</span>
                    <span>{money(total)}</span>
                  </div>
                </div>

                <h3 className="shop-form-title">
                  <Truck size={16} /> ¿A dónde lo llevamos?
                </h3>

                <label className="shop-field">
                  <span>
                    <User size={13} /> Nombre *
                  </span>
                  <input className="shop-input" value={form.nombre} onChange={setCampo('nombre')} maxLength={100} />
                </label>
                <label className="shop-field">
                  <span>
                    <Phone size={13} /> Teléfono *
                  </span>
                  <input
                    className="shop-input"
                    type="tel"
                    placeholder="+503 7000-0000"
                    value={form.telefono}
                    onChange={setCampo('telefono')}
                    maxLength={30}
                  />
                </label>
                <label className="shop-field">
                  <span>
                    <Mail size={13} /> Correo (opcional)
                  </span>
                  <input
                    className="shop-input"
                    type="email"
                    value={form.email}
                    onChange={setCampo('email')}
                    maxLength={100}
                  />
                </label>
                <label className="shop-field">
                  <span>
                    <MapPin size={13} /> Dirección de entrega *
                  </span>
                  <textarea
                    className="shop-input"
                    rows={2}
                    placeholder="Colonia, calle, número de casa, municipio, departamento"
                    value={form.direccion}
                    onChange={setCampo('direccion')}
                    maxLength={180}
                  />
                </label>
                <label className="shop-field">
                  <span>
                    <MapPin size={13} /> Punto de referencia
                  </span>
                  <input
                    className="shop-input"
                    placeholder="Ej: portón negro, frente a la farmacia"
                    value={form.referencia}
                    onChange={setCampo('referencia')}
                    maxLength={60}
                  />
                </label>
                <label className="shop-field">
                  <span>
                    <MessageSquare size={13} /> Notas para el pedido
                  </span>
                  <input
                    className="shop-input"
                    placeholder="Sin cebolla, extra salsa..."
                    value={form.notas}
                    onChange={setCampo('notas')}
                    maxLength={400}
                  />
                </label>

                <h3 className="shop-form-title">Forma de pago</h3>
                <div className="shop-pay-grid">
                  {METODOS.map((m) => {
                    const Icon = m.icon
                    return (
                      <button
                        type="button"
                        key={m.key}
                        className={`shop-pay-btn ${metodo === m.key ? 'active' : ''}`}
                        onClick={() => setMetodo(m.key)}
                      >
                        <Icon size={16} />
                        <span>{m.label}</span>
                      </button>
                    )
                  })}
                </div>
                <PaymentDetails key={metodo} method={metodo} total={total} customer />

                {error && <p className="shop-error">{error}</p>}

                <button type="submit" className="shop-btn-primary shop-submit" disabled={enviando}>
                  {enviando ? 'Enviando pedido...' : `Hacer pedido (${money(total)})`}
                </button>
              </form>
            )}
          </aside>

          {!cartOpen && (
            <button type="button" className="shop-cart-fab" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={18} />
              <span>{totalItems === 0 ? 'Tu pedido' : `${totalItems} producto(s)`}</span>
              <strong>{money(total)}</strong>
            </button>
          )}
        </main>
      )}

      {confirmacion && (
        <div className="shop-modal-backdrop" onClick={() => setConfirmacion(null)}>
          <div className="shop-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="shop-modal-close" onClick={() => setConfirmacion(null)}>
              <X size={18} />
            </button>
            <CheckCircle2 size={44} className="shop-ok-icon" />
            <h2>¡Pedido recibido!</h2>
            <p className="shop-muted">Guarda tu folio para consultar el estado de tu pedido.</p>
            <div className="shop-folio">{confirmacion.folio}</div>

            <EstadoPedido estado={estados[confirmacion.folio]?.estado || confirmacion.estado} />

            <div className="shop-destination">
              <MapPin size={15} />
              <span>
                Se entrega en: <strong>{confirmacion.direccionEntrega}</strong>
              </span>
            </div>

            <ul className="shop-order-items">
              {confirmacion.items.map((it, i) => (
                <li key={i}>
                  {it.cantidad}x {it.nombre}
                </li>
              ))}
            </ul>

            <div className="shop-order-foot">
              <span>Pago: {confirmacion.metodoPago}</span>
              <strong>{money(confirmacion.total)}</strong>
            </div>

            {(() => {
              const m = METODOS.find((x) => x.backend === confirmacion.metodoPago)
              const info = m && PAYMENT_INFO[m.key]
              return info?.details && (m.key === 'transfer' || m.key === 'online') ? (
                <PaymentDetails method={m.key} total={Number(confirmacion.total)} customer />
              ) : null
            })()}

            <button
              type="button"
              className="shop-btn-primary shop-submit"
              onClick={() => {
                setConfirmacion(null)
                setVista('pedidos')
              }}
            >
              Ver mis pedidos
            </button>
          </div>
        </div>
      )}

      {toast && <div className="shop-toast">{toast}</div>}
    </div>
  )
}
