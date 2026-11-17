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
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  LogOut,
  KeyRound,
  FileText,
  AlertCircle
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
  dui: '',
  telefono: '',
  email: '',
  direccion: '',
  referencia: '',
  notas: ''
}

// Máscara y formateo automático de DUI salvadoreño (8 dígitos + guion + 1 dígito)
const formatearDui = (valor) => {
  if (!valor) return ''
  const soloNumeros = String(valor).replace(/\D/g, '').slice(0, 9)
  if (soloNumeros.length > 8) {
    return `${soloNumeros.slice(0, 8)}-${soloNumeros.slice(8)}`
  }
  return soloNumeros
}

// Validación estricta del formato de DUI salvadoreño
const esDuiValido = (dui) => {
  return /^\d{8}-\d$/.test(dui || '')
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

  // Estado de sesión del cliente (consumidor)
  const [clienteActivo, setClienteActivo] = useState(() => {
    try {
      const guardado = localStorage.getItem('taberna_cliente_activo')
      return guardado ? JSON.parse(guardado) : null
    } catch {
      return null
    }
  })

  // Modal de inicio de sesión / registro de clientes
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authTab, setAuthTab] = useState('login') // 'login' | 'registro'
  const [authError, setAuthError] = useState('')
  const [authForm, setAuthForm] = useState({
    identificador: '', // DUI o Correo para login
    password: '',
    nombre: '',
    dui: '',
    telefono: '',
    email: '',
    direccion: '',
    referencia: '',
    nuevaPassword: ''
  })

  const [misPedidos, setMisPedidos] = useState(() => pedidoPublicoService.getPedidosLocales())
  const [estados, setEstados] = useState({})
  const [folioBusqueda, setFolioBusqueda] = useState('')
  const [errorBusqueda, setErrorBusqueda] = useState('')

  // Sincronizar datos del cliente activo en el formulario de pedido
  useEffect(() => {
    if (clienteActivo) {
      setForm((prev) => ({
        ...prev,
        nombre: clienteActivo.nombre || prev.nombre,
        dui: clienteActivo.dui || prev.dui,
        telefono: clienteActivo.telefono || prev.telefono,
        email: clienteActivo.email || prev.email,
        direccion: clienteActivo.direccion || prev.direccion,
        referencia: clienteActivo.referencia || prev.referencia
      }))
    }
  }, [clienteActivo])

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
    setTimeout(() => setToast(''), 2500)
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

  const setCampo = (campo) => (e) => {
    let valor = e.target.value
    if (campo === 'dui') valor = formatearDui(valor)
    setForm((f) => ({ ...f, [campo]: valor }))
  }

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

  // Manejo de Registro de Cliente
  const handleRegistroCliente = (e) => {
    e.preventDefault()
    setAuthError('')

    const nombre = authForm.nombre.trim()
    const dui = formatearDui(authForm.dui.trim())
    const telefono = authForm.telefono.trim()
    const email = authForm.email.trim().toLowerCase()
    const direccion = authForm.direccion.trim()
    const password = authForm.nuevaPassword.trim()

    if (!nombre) return setAuthError('Ingresa tu nombre completo.')
    if (!esDuiValido(dui)) return setAuthError('Ingresa un número de DUI salvadoreño válido (ejemplo: 12345678-9).')
    if (telefono.length < 8) return setAuthError('Ingresa un número de teléfono de contacto válido.')
    if (!email || !email.includes('@')) return setAuthError('Ingresa un correo electrónico válido.')
    if (direccion.length < 10) return setAuthError('Ingresa tu dirección completa de entrega.')
    if (password.length < 4) return setAuthError('Crea una contraseña de al menos 4 caracteres.')

    // Obtener clientes registrados
    let registrados = []
    try {
      registrados = JSON.parse(localStorage.getItem('taberna_clientes_registrados') || '[]')
    } catch {
      registrados = []
    }

    // Comprobar duplicados por DUI o correo
    if (registrados.some((c) => c.dui === dui)) {
      return setAuthError('Ya existe una cuenta registrada con este DUI. Inicia sesión.')
    }
    if (registrados.some((c) => c.email === email)) {
      return setAuthError('Ya existe una cuenta con este correo electrónico. Inicia sesión.')
    }

    const nuevoCliente = {
      nombre,
      dui,
      telefono,
      email,
      direccion,
      referencia: authForm.referencia.trim(),
      password
    }

    registrados.push(nuevoCliente)
    localStorage.setItem('taberna_clientes_registrados', JSON.stringify(registrados))
    localStorage.setItem('taberna_cliente_activo', JSON.stringify(nuevoCliente))

    setClienteActivo(nuevoCliente)
    setAuthModalOpen(false)
    setAuthError('')
    mostrarToast(`¡Bienvenido ${nuevoCliente.nombre}! Registro completado.`)
  }

  // Manejo de Login de Cliente
  const handleLoginCliente = (e) => {
    e.preventDefault()
    setAuthError('')

    const idInput = authForm.identificador.trim().toLowerCase()
    const pass = authForm.password.trim()

    if (!idInput) return setAuthError('Ingresa tu DUI o correo electrónico.')
    if (!pass) return setAuthError('Ingresa tu contraseña.')

    let registrados = []
    try {
      registrados = JSON.parse(localStorage.getItem('taberna_clientes_registrados') || '[]')
    } catch {
      registrados = []
    }

    // Buscar coincidencia por DUI o por Correo
    const encontrado = registrados.find((c) => {
      const matchDui = c.dui.toLowerCase() === idInput || c.dui.replace(/-/g, '') === idInput.replace(/-/g, '')
      const matchEmail = c.email.toLowerCase() === idInput
      return (matchDui || matchEmail) && c.password === pass
    })

    if (!encontrado) {
      return setAuthError('Credenciales incorrectas o usuario no registrado.')
    }

    localStorage.setItem('taberna_cliente_activo', JSON.stringify(encontrado))
    setClienteActivo(encontrado)
    setAuthModalOpen(false)
    setAuthError('')
    mostrarToast(`¡Hola de nuevo, ${encontrado.nombre}!`)
  }

  const cerrarSesionCliente = () => {
    localStorage.removeItem('taberna_cliente_activo')
    setClienteActivo(null)
    setForm(FORM_VACIO)
    mostrarToast('Sesión de cliente cerrada.')
  }

  // Enviar Pedido
  const enviarPedido = async (e) => {
    e.preventDefault()
    setError('')

    if (cart.length === 0) return setError('Agrega al menos un producto a tu pedido.')

    // Exigir inicio de sesión / registro del cliente para ordenar
    if (!clienteActivo) {
      setAuthTab('registro')
      setAuthModalOpen(true)
      return setError('Para realizar tu pedido debes registrarte o iniciar sesión con tus documentos oficiales.')
    }

    if (!form.nombre.trim()) return setError('Indica tu nombre completo.')
    if (!esDuiValido(form.dui)) {
      return setError('Debes ingresar un número de DUI salvadoreño válido (ejemplo: 12345678-9).')
    }
    if (form.telefono.trim().length < 8) return setError('Indica un teléfono de contacto válido.')
    if (form.direccion.trim().length < 10) return setError('Indica la dirección completa a donde enviaremos tu pedido.')

    setEnviando(true)
    try {
      const creado = await pedidoPublicoService.crearPedido({
        nombre: form.nombre.trim(),
        dui: form.dui.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        direccionEntrega: form.direccion.trim(),
        referencia: form.referencia.trim(),
        notas: form.notas.trim(),
        metodoPago: METODOS.find((m) => m.key === metodo).backend,
        items: cart.map((i) => ({ nombre: i.name, cantidad: i.quantity, precio: i.price }))
      })
      setConfirmacion(creado)
      setEstados((prev) => ({ ...prev, [creado.folio]: creado }))
      setMisPedidos(pedidoPublicoService.getPedidosLocales())
      setCart([])
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
            {/* Estado de sesión de cliente */}
            {clienteActivo ? (
              <div className="shop-client-badge">
                <div className="shop-client-badge-avatar">
                  <User size={13} />
                </div>
                <div className="shop-client-badge-text">
                  <strong>{clienteActivo.nombre.split(' ')[0]}</strong>
                  <small>DUI: {clienteActivo.dui}</small>
                </div>
                <button
                  type="button"
                  className="shop-client-logout-btn"
                  onClick={cerrarSesionCliente}
                  title="Cerrar sesión"
                >
                  <LogOut size={13} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="shop-btn-ghost"
                onClick={() => {
                  setAuthTab('login')
                  setAuthError('')
                  setAuthModalOpen(true)
                }}
              >
                <User size={15} />
                <span>Ingresar / Registro</span>
              </button>
            )}

            <button
              type="button"
              className={`shop-btn-ghost ${vista === 'pedidos' ? 'active' : ''}`}
              onClick={() => setVista(vista === 'pedidos' ? 'menu' : 'pedidos')}
            >
              <ClipboardList size={16} />
              <span>Mis pedidos</span>
              {misPedidos.length > 0 && <span className="shop-count">{misPedidos.length}</span>}
            </button>

            <button type="button" className="shop-btn-ghost" onClick={onAccesoPersonal} title="Portal para meseros y administradores">
              <LogIn size={15} />
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
              <p>Elige tus platillos, regístrate con tus datos reales y recibe tu pedido en la puerta de tu casa.</p>
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
                  ['all', 'Todo el Menú'],
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
                <p>Tu pedido está vacío. Agrega algo del menú para empezar.</p>
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
                    <span>Total a Pagar</span>
                    <span>{money(total)}</span>
                  </div>
                </div>

                {/* Banner de identificación si el cliente no ha iniciado sesión */}
                {!clienteActivo && (
                  <div className="shop-auth-callout">
                    <ShieldCheck size={22} className="shop-auth-callout-icon" />
                    <div>
                      <strong>Identificación requerida</strong>
                      <p>Para hacer tu pedido debes registrarte o iniciar sesión con tus documentos oficiales (DUI).</p>
                    </div>
                    <button
                      type="button"
                      className="shop-btn-primary"
                      onClick={() => {
                        setAuthTab('registro')
                        setAuthError('')
                        setAuthModalOpen(true)
                      }}
                    >
                      <UserCheck size={15} /> Registrarme / Iniciar sesión
                    </button>
                  </div>
                )}

                <h3 className="shop-form-title">
                  <Truck size={16} /> Datos de entrega y facturación
                </h3>

                <label className="shop-field">
                  <span>
                    <User size={13} /> Nombre completo *
                  </span>
                  <input
                    className="shop-input"
                    placeholder="Nombres y Apellidos"
                    value={form.nombre}
                    onChange={setCampo('nombre')}
                    maxLength={100}
                    required
                  />
                </label>

                {/* Campo DUI Obligatorio con formato salvadoreño */}
                <label className="shop-field">
                  <span>
                    <FileText size={13} /> DUI (Documento Único de Identidad) *
                  </span>
                  <input
                    className="shop-input"
                    placeholder="00000000-0"
                    value={form.dui}
                    onChange={setCampo('dui')}
                    maxLength={10}
                    required
                  />
                  <small className="shop-field-tip">Formato salvadoreño de 9 dígitos (ej: 01234567-8)</small>
                </label>

                <label className="shop-field">
                  <span>
                    <Phone size={13} /> Teléfono de contacto *
                  </span>
                  <input
                    className="shop-input"
                    type="tel"
                    placeholder="7000-0000"
                    value={form.telefono}
                    onChange={setCampo('telefono')}
                    maxLength={30}
                    required
                  />
                </label>

                <label className="shop-field">
                  <span>
                    <Mail size={13} /> Correo electrónico
                  </span>
                  <input
                    className="shop-input"
                    type="email"
                    placeholder="cliente@ejemplo.com"
                    value={form.email}
                    onChange={setCampo('email')}
                    maxLength={100}
                  />
                </label>

                <label className="shop-field">
                  <span>
                    <MapPin size={13} /> Dirección completa de entrega *
                  </span>
                  <textarea
                    className="shop-input"
                    rows={2}
                    placeholder="Colonia, calle, pasaje, número de casa, municipio"
                    value={form.direccion}
                    onChange={setCampo('direccion')}
                    maxLength={180}
                    required
                  />
                </label>

                <label className="shop-field">
                  <span>
                    <MapPin size={13} /> Punto de referencia
                  </span>
                  <input
                    className="shop-input"
                    placeholder="Ej: portón negro, frente al parque"
                    value={form.referencia}
                    onChange={setCampo('referencia')}
                    maxLength={60}
                  />
                </label>

                <label className="shop-field">
                  <span>
                    <MessageSquare size={13} /> Indicaciones para el restaurante
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

                <button
                  type="submit"
                  className="shop-btn-primary shop-submit"
                  disabled={enviando}
                >
                  {enviando ? 'Procesando pedido...' : `Confirmar y Pedir (${money(total)})`}
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

      {/* Modal de Autenticación / Registro de Cliente */}
      {authModalOpen && (
        <div className="shop-modal-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div className="shop-modal shop-auth-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="shop-modal-close" onClick={() => setAuthModalOpen(false)}>
              <X size={18} />
            </button>

            <div className="shop-auth-modal-header">
              <div className="shop-auth-modal-icon">
                <ShieldCheck size={26} />
              </div>
              <h2>{authTab === 'login' ? 'Iniciar Sesión' : 'Registro de Cliente'}</h2>
              <p className="shop-muted">
                {authTab === 'login'
                  ? 'Ingresa con tu DUI o correo para continuar con tu pedido.'
                  : 'Registra tus documentos y datos reales para la entrega y facturación.'}
              </p>
            </div>

            <div className="shop-auth-tabs">
              <button
                type="button"
                className={`shop-auth-tab ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => {
                  setAuthTab('login')
                  setAuthError('')
                }}
              >
                <LogIn size={15} /> Iniciar Sesión
              </button>
              <button
                type="button"
                className={`shop-auth-tab ${authTab === 'registro' ? 'active' : ''}`}
                onClick={() => {
                  setAuthTab('registro')
                  setAuthError('')
                }}
              >
                <UserCheck size={15} /> Registrarme
              </button>
            </div>

            {authError && <p className="shop-error">{authError}</p>}

            {authTab === 'login' ? (
              <form onSubmit={handleLoginCliente} className="shop-auth-form">
                <label className="shop-field">
                  <span>
                    <User size={13} /> DUI o Correo Electrónico
                  </span>
                  <input
                    className="shop-input"
                    placeholder="01234567-8 o tu@correo.com"
                    value={authForm.identificador}
                    onChange={(e) => setAuthForm({ ...authForm, identificador: e.target.value })}
                    required
                  />
                </label>

                <label className="shop-field">
                  <span>
                    <KeyRound size={13} /> Contraseña
                  </span>
                  <input
                    type="password"
                    className="shop-input"
                    placeholder="Tu contraseña"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                  />
                </label>

                <button type="submit" className="shop-btn-primary shop-submit">
                  <LogIn size={16} /> Entrar y continuar
                </button>

                <p className="shop-auth-switch">
                  ¿No tienes una cuenta aún?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('registro')
                      setAuthError('')
                    }}
                  >
                    Regístrate aquí
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegistroCliente} className="shop-auth-form">
                <label className="shop-field">
                  <span>
                    <User size={13} /> Nombre completo *
                  </span>
                  <input
                    className="shop-input"
                    placeholder="Nombres y Apellidos"
                    value={authForm.nombre}
                    onChange={(e) => setAuthForm({ ...authForm, nombre: e.target.value })}
                    required
                  />
                </label>

                <label className="shop-field">
                  <span>
                    <FileText size={13} /> DUI (Documento Único de Identidad) *
                  </span>
                  <input
                    className="shop-input"
                    placeholder="00000000-0"
                    value={authForm.dui}
                    onChange={(e) => setAuthForm({ ...authForm, dui: formatearDui(e.target.value) })}
                    maxLength={10}
                    required
                  />
                  <small className="shop-field-tip">Ingresa tu DUI oficial (ej: 01234567-8)</small>
                </label>

                <div className="shop-grid-2col">
                  <label className="shop-field">
                    <span>
                      <Phone size={13} /> Teléfono *
                    </span>
                    <input
                      className="shop-input"
                      type="tel"
                      placeholder="7000-0000"
                      value={authForm.telefono}
                      onChange={(e) => setAuthForm({ ...authForm, telefono: e.target.value })}
                      required
                    />
                  </label>
                  <label className="shop-field">
                    <span>
                      <Mail size={13} /> Correo *
                    </span>
                    <input
                      className="shop-input"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      required
                    />
                  </label>
                </div>

                <label className="shop-field">
                  <span>
                    <MapPin size={13} /> Dirección completa de entrega *
                  </span>
                  <textarea
                    className="shop-input"
                    rows={2}
                    placeholder="Colonia, calle, número de casa, municipio"
                    value={authForm.direccion}
                    onChange={(e) => setAuthForm({ ...authForm, direccion: e.target.value })}
                    required
                  />
                </label>

                <label className="shop-field">
                  <span>
                    <MapPin size={13} /> Punto de referencia
                  </span>
                  <input
                    className="shop-input"
                    placeholder="Ej: portón negro, frente al parque"
                    value={authForm.referencia}
                    onChange={(e) => setAuthForm({ ...authForm, referencia: e.target.value })}
                  />
                </label>

                <label className="shop-field">
                  <span>
                    <KeyRound size={13} /> Contraseña de acceso *
                  </span>
                  <input
                    type="password"
                    className="shop-input"
                    placeholder="Crea una contraseña segura"
                    value={authForm.nuevaPassword}
                    onChange={(e) => setAuthForm({ ...authForm, nuevaPassword: e.target.value })}
                    required
                  />
                </label>

                <button type="submit" className="shop-btn-primary shop-submit">
                  <UserCheck size={16} /> Crear cuenta y continuar
                </button>

                <p className="shop-auth-switch">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthTab('login')
                      setAuthError('')
                    }}
                  >
                    Inicia sesión
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Pedido Recibido */}
      {confirmacion && (
        <div className="shop-modal-backdrop" onClick={() => setConfirmacion(null)}>
          <div className="shop-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="shop-modal-close" onClick={() => setConfirmacion(null)}>
              <X size={18} />
            </button>
            <CheckCircle2 size={44} className="shop-ok-icon" />
            <h2>¡Pedido recibido!</h2>
            <p className="shop-muted">Tu pedido fue registrado con éxito. Guarda tu folio para el seguimiento.</p>
            <div className="shop-folio">{confirmacion.folio}</div>

            <EstadoPedido estado={estados[confirmacion.folio]?.estado || confirmacion.estado} />

            {/* Datos del titular del pedido con DUI */}
            <div className="shop-client-card-info">
              <div>
                <strong>Titular:</strong> {form.nombre || confirmacion.clienteNombre || clienteActivo?.nombre}
              </div>
              <div>
                <strong>DUI:</strong> {form.dui || confirmacion.clienteDui || clienteActivo?.dui}
              </div>
            </div>

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
