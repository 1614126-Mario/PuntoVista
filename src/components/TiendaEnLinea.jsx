import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
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
  RotateCcw,
  LogIn,
  ClipboardList,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  LogOut,
  KeyRound,
  FileText,
  AlertCircle,
  DollarSign,
  Lock,
  ArrowRight,
  ChevronRight,
  ShoppingBag
} from 'lucide-react'
import { INITIAL_PRODUCTS } from '../data/initialProducts'
import { PAYMENT_INFO } from '../data/paymentInfo'
import PaymentDetails from './PaymentDetails'
import pedidoPublicoService from '../services/pedidoPublicoService'
import '../Tienda.css'

const IVA_RATE = 0.13

// Únicos 3 métodos de pago habilitados en la plataforma
const METODOS = [
  { key: 'cash', label: 'Efectivo', backend: 'Efectivo', icon: Banknote },
  { key: 'card', label: 'Tarjeta', backend: 'Tarjeta', icon: CreditCard },
  { key: 'transfer', label: 'Transferencia', backend: 'Transferencia', icon: Smartphone }
]

const BILLETES_RAPIDOS = [5, 10, 20, 50, 100]

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
  const formRef = useRef(null)

  const handleFloatingBuyClick = () => {
    if (cart.length === 0) {
      setCartOpen(true)
      mostrarToast('Tu pedido está vacío. Agrega platillos o bebidas para comprar.')
      return
    }

    if (!cartOpen) {
      setCartOpen(true)
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 100)
    } else {
      // Si el carrito ya está abierto, el cliente compra directamente con el botón flotante
      if (formRef.current) {
        formRef.current.requestSubmit()
      }
    }
  }

  // ── Acceso secreto al panel de empleados: 5 clics rápidos en el logo ──
  const logoClicksRef = useRef(0)
  const logoTimerRef = useRef(null)
  const handleLogoSecretClick = useCallback(() => {
    logoClicksRef.current += 1
    clearTimeout(logoTimerRef.current)
    if (logoClicksRef.current >= 5) {
      logoClicksRef.current = 0
      if (onAccesoPersonal) onAccesoPersonal()
      return
    }
    logoTimerRef.current = setTimeout(() => { logoClicksRef.current = 0 }, 1800)
  }, [onAccesoPersonal])

  // Estados específicos para pago en efectivo y cálculo de vuelto
  const [necesitaVuelto, setNecesitaVuelto] = useState(false)
  const [billeteSeleccionado, setBilleteSeleccionado] = useState(null) // 5 | 10 | 20 | 50 | 100 | 'otro'
  const [montoPersonalizado, setMontoPersonalizado] = useState('')

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
    identificador: '', // Correo o DUI para login
    password: '',
    email: '',
    nuevaPassword: ''
  })

  const [misPedidos, setMisPedidos] = useState(() => pedidoPublicoService.getPedidosLocales())
  const [estados, setEstados] = useState({})
  const [folioBusqueda, setFolioBusqueda] = useState('')
  const [errorBusqueda, setErrorBusqueda] = useState('')
  const [actualizandoFolio, setActualizandoFolio] = useState(null)

  const handleActualizarEstadoPedido = async (folio) => {
    setActualizandoFolio(folio)
    try {
      const data = await refrescarEstado(folio)
      if (data) {
        mostrarToast(`Estado de ${folio}: ${data.estado || 'Actualizado'}`, 'success')
      } else {
        mostrarToast(`Pedido ${folio} sincronizado con el restaurante.`, 'info')
      }
    } finally {
      setTimeout(() => setActualizandoFolio(null), 500)
    }
  }

  const eliminarPedidoDeMisPedidos = async (folio) => {
    try {
      await pedidoPublicoService.eliminarPedido(folio)
      setMisPedidos((prev) => prev.filter((p) => p.folio !== folio))
      mostrarToast(`Pedido ${folio} eliminado definitivamente.`, 'info')
    } catch (e) {
      console.warn('Error eliminando pedido:', e)
    }
  }

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

  const [subCategory, setSubCategory] = useState('all')
  const [displayCount, setDisplayCount] = useState(48)

  useEffect(() => {
    setDisplayCount(48)
  }, [category, subCategory, query])

  const productos = useMemo(() => {
    const q = query.toLowerCase().trim()
    return INITIAL_PRODUCTS.filter((p) => {
      const okCat = category === 'all' || p.category === category
      const n = p.name.toLowerCase()
      let okSub = true
      if (subCategory === 'hamburguesas') okSub = n.includes('hamburguesa') || n.includes('burger') || n.includes('slider')
      else if (subCategory === 'pupusas') okSub = n.includes('pupusa')
      else if (subCategory === 'tacos') okSub = n.includes('taco') || n.includes('flauta')
      else if (subCategory === 'papitas') okSub = n.includes('papita') || n.includes('salchipapa')
      else if (subCategory === 'maruchan') okSub = n.includes('maruchan') || n.includes('ramen')
      else if (subCategory === 'pizzas') okSub = n.includes('pizza') || n.includes('lasaña') || n.includes('espagueti') || n.includes('fettuccine') || n.includes('pasta')
      else if (subCategory === 'carnes') okSub = ['alita', 'pollo', 'churrasco', 'costilla', 'fajita', 'res', 'cerdo', 'cordero', 'bistec', 'lomo', 'filete', 'chuleta', 'arrachera', 'milanesa', 'brocheta', 'carne'].some(w => n.includes(w))
      else if (subCategory === 'mariscos') okSub = n.includes('camar') || n.includes('pescado') || n.includes('mojarra') || n.includes('ceviche') || n.includes('mariscos') || n.includes('mar')
      else if (subCategory === 'postres') okSub = n.includes('pastel') || n.includes('cheesecake') || n.includes('brownie') || n.includes('pancake') || n.includes('empanada') || n.includes('desayuno') || n.includes('postre')
      const okQuery = !q || n.includes(q) || p.description.toLowerCase().includes(q)
      return okCat && okSub && okQuery
    })
  }, [category, subCategory, query])

  const visibleProductos = useMemo(() => {
    return productos.slice(0, displayCount)
  }, [productos, displayCount])

  const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0)
  const iva = Number((subtotal * IVA_RATE).toFixed(2))
  const total = Number((subtotal + iva).toFixed(2))
  const totalItems = cart.reduce((acc, it) => acc + it.quantity, 0)

  // Cálculo del monto con el que paga el cliente en efectivo
  const montoPagaCon = useMemo(() => {
    if (!necesitaVuelto) return total
    if (billeteSeleccionado === 'otro') {
      const parsed = parseFloat(montoPersonalizado)
      return Number.isFinite(parsed) ? parsed : null
    }
    return billeteSeleccionado ? Number(billeteSeleccionado) : null
  }, [necesitaVuelto, billeteSeleccionado, montoPersonalizado, total])

  // Cálculo automático del vuelto
  const vueltoCalculado = useMemo(() => {
    if (!necesitaVuelto || montoPagaCon === null || montoPagaCon < total) return 0
    return Number((montoPagaCon - total).toFixed(2))
  }, [necesitaVuelto, montoPagaCon, total])

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

  // Manejo de Registro de Cliente: Solo pide Correo y Contraseña
  const handleRegistroCliente = (e) => {
    e.preventDefault()
    setAuthError('')

    const email = authForm.email.trim().toLowerCase()
    const password = authForm.nuevaPassword.trim()

    if (!email || !email.includes('@') || !email.includes('.')) {
      return setAuthError('Ingresa un correo electrónico válido (ejemplo: tu@correo.com).')
    }
    if (password.length < 4) {
      return setAuthError('Crea una contraseña de al menos 4 caracteres.')
    }

    // Obtener clientes registrados
    let registrados = []
    try {
      registrados = JSON.parse(localStorage.getItem('taberna_clientes_registrados') || '[]')
    } catch {
      registrados = []
    }

    // Comprobar si el correo ya existe
    if (registrados.some((c) => (c.email || '').toLowerCase() === email)) {
      return setAuthError('Ya existe una cuenta con este correo electrónico. Inicia sesión.')
    }

    const nuevoCliente = {
      email,
      password,
      nombre: '',
      dui: '',
      telefono: '',
      direccion: '',
      referencia: ''
    }

    registrados.push(nuevoCliente)
    localStorage.setItem('taberna_clientes_registrados', JSON.stringify(registrados))
    localStorage.setItem('taberna_cliente_activo', JSON.stringify(nuevoCliente))

    setClienteActivo(nuevoCliente)
    setAuthModalOpen(false)
    setAuthError('')
    setAuthForm({
      identificador: email,
      password: '',
      email: '',
      nuevaPassword: ''
    })
    mostrarToast('¡Cuenta creada exitosamente! Bienvenido.')
  }

  // Manejo de Login de Cliente
  const handleLoginCliente = (e) => {
    e.preventDefault()
    setAuthError('')

    const idInput = authForm.identificador.trim().toLowerCase()
    const pass = authForm.password.trim()

    if (!idInput) return setAuthError('Ingresa tu correo electrónico.')
    if (!pass) return setAuthError('Ingresa tu contraseña.')

    let registrados = []
    try {
      registrados = JSON.parse(localStorage.getItem('taberna_clientes_registrados') || '[]')
    } catch {
      registrados = []
    }

    // Buscar coincidencia por Correo o DUI (retrocompatibilidad)
    const encontrado = registrados.find((c) => {
      const matchEmail = (c.email || '').toLowerCase() === idInput
      const matchDui = c.dui && (c.dui.toLowerCase() === idInput || c.dui.replace(/-/g, '') === idInput.replace(/-/g, ''))
      return (matchEmail || matchDui) && c.password === pass
    })

    if (!encontrado) {
      return setAuthError('Correo o contraseña incorrectos.')
    }

    localStorage.setItem('taberna_cliente_activo', JSON.stringify(encontrado))
    setClienteActivo(encontrado)
    setAuthModalOpen(false)
    setAuthError('')
    mostrarToast(`¡Hola de nuevo${encontrado.nombre ? `, ${encontrado.nombre}` : ''}!`)
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
      return setError('Para realizar tu pedido debes registrarte o iniciar sesión con tu correo.')
    }

    if (!form.nombre.trim()) return setError('Indica tu nombre completo para la factura y la entrega.')
    if (!esDuiValido(form.dui)) {
      return setError('Debes ingresar tu DUI salvadoreño válido (ejemplo: 12345678-9) para que figure en la factura oficial.')
    }
    if (form.telefono.trim().length < 8) return setError('Indica un teléfono de contacto válido.')
    if (form.direccion.trim().length < 10) return setError('Indica la dirección completa a donde enviaremos tu pedido.')

    // Validación de efectivo y vuelto
    let detalleVuelto = ''
    if (metodo === 'cash') {
      if (necesitaVuelto) {
        if (montoPagaCon === null || montoPagaCon < total) {
          return setError(`Indica un billete o monto válido mayor o igual a $${total.toFixed(2)} para calcular tu vuelto.`)
        }
        detalleVuelto = `[💵 EFECTIVO: Paga con $${montoPagaCon.toFixed(2)} | Vuelto: $${vueltoCalculado.toFixed(2)}]`
      } else {
        detalleVuelto = `[💵 EFECTIVO: Pago exacto ($${total.toFixed(2)}) - No requiere vuelto]`
      }
    }

    const notasCompletas = detalleVuelto
      ? (form.notas.trim() ? `${detalleVuelto} ${form.notas.trim()}` : detalleVuelto)
      : form.notas.trim()

    setEnviando(true)
    try {
      const creado = await pedidoPublicoService.crearPedido({
        nombre: form.nombre.trim(),
        dui: form.dui.trim(),
        telefono: form.telefono.trim(),
        email: form.email.trim(),
        direccionEntrega: form.direccion.trim(),
        referencia: form.referencia.trim(),
        notas: notasCompletas,
        metodoPago: METODOS.find((m) => m.key === metodo).backend,
        items: cart.map((i) => ({ nombre: i.name, cantidad: i.quantity, precio: i.price }))
      })

      // Adjuntar la información de vuelto para la pantalla de confirmación
      creado.detalleVuelto = detalleVuelto
      creado.necesitaVuelto = necesitaVuelto
      creado.montoPagaCon = montoPagaCon
      creado.vueltoCalculado = vueltoCalculado

      // Guardar y actualizar el DUI y datos de facturación en el perfil del cliente para futuros pedidos
      if (clienteActivo) {
        const clienteActualizado = {
          ...clienteActivo,
          nombre: form.nombre.trim(),
          dui: form.dui.trim(),
          telefono: form.telefono.trim(),
          email: form.email.trim() || clienteActivo.email,
          direccion: form.direccion.trim(),
          referencia: form.referencia.trim()
        }
        setClienteActivo(clienteActualizado)
        localStorage.setItem('taberna_cliente_activo', JSON.stringify(clienteActualizado))

        try {
          const reg = JSON.parse(localStorage.getItem('taberna_clientes_registrados') || '[]')
          const idx = reg.findIndex((c) => (c.email || '').toLowerCase() === clienteActivo.email.toLowerCase())
          if (idx >= 0) {
            reg[idx] = clienteActualizado
          } else {
            reg.push(clienteActualizado)
          }
          localStorage.setItem('taberna_clientes_registrados', JSON.stringify(reg))
        } catch (err) {
          console.warn('Error guardando perfil actualizado de cliente:', err)
        }
      }

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
      {/* ═══ Fondo fantasía: orbes, llamas y partículas ═══ */}
      <div className="shop-bg-orb shop-bg-orb-1" aria-hidden="true" />
      <div className="shop-bg-orb shop-bg-orb-2" aria-hidden="true" />
      <div className="shop-bg-orb shop-bg-orb-3" aria-hidden="true" />
      <div className="shop-flame-right" aria-hidden="true" />
      {/* Partículas mágicas flotantes */}
      {[...Array(14)].map((_, i) => (
        <span
          key={i}
          className="shop-particle"
          aria-hidden="true"
          style={{
            width: `${3 + (i % 4)}px`,
            height: `${3 + (i % 4)}px`,
            left: `${(i * 7.3) % 100}%`,
            bottom: `${(i * 11) % 35}%`,
            animationDuration: `${3.5 + (i % 5)}s, ${1.8 + (i % 3)}s`,
            animationDelay: `${-(i * 0.6)}s, ${-(i * 0.4)}s`,
            opacity: 0.7 + (i % 3) * 0.1
          }}
        />
      ))}

      <header className="shop-header">
        <div className="shop-header-inner">
          <div className="shop-brand" onClick={() => setVista('menu')}>
            {/* 5 clics rápidos en el logo = acceso secreto al panel de empleados */}
            <div
              className="shop-brand-icon"
              style={{ width: 54, height: 54, padding: 0, background: 'none', borderRadius: '50%', overflow: 'hidden', border: '2px solid rgba(160, 0, 255, 0.5)', boxShadow: '0 0 14px rgba(160, 0, 255, 0.6)', cursor: 'pointer', flexShrink: 0 }}
              onClick={(e) => { e.stopPropagation(); handleLogoSecretClick() }}
              title="La Taberna de los Morenazos"
            >
              <img
                src="/logo-taberna.jpg"
                alt="La Taberna de los Morenazos"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none', pointerEvents: 'none' }}
              />
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
                  <strong>{(clienteActivo.nombre ? clienteActivo.nombre.split(' ')[0] : clienteActivo.email?.split('@')[0]) || 'Mi Cuenta'}</strong>
                  <small>{clienteActivo.dui ? `DUI: ${clienteActivo.dui}` : clienteActivo.email}</small>
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
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="shop-btn-ghost"
                          onClick={() => handleActualizarEstadoPedido(p.folio)}
                          disabled={actualizandoFolio === p.folio}
                          title="Actualizar estado del pedido en tiempo real"
                        >
                          <RotateCcw size={14} style={{ animation: actualizandoFolio === p.folio ? 'rune-spin 0.6s linear infinite' : 'none' }} />
                          <span>{actualizandoFolio === p.folio ? 'Cargando...' : 'Actualizar'}</span>
                        </button>
                        <button
                          type="button"
                          className="shop-btn-ghost"
                          style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}
                          onClick={() => eliminarPedidoDeMisPedidos(p.folio)}
                          title="Eliminar este pedido definitivamente"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
                    onClick={() => {
                      setCategory(key)
                      if (key === 'bebida') setSubCategory('all')
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {category !== 'bebida' && (
              <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {[
                  ['all', '🍽️ Todas las Comidas'],
                  ['hamburguesas', '🍔 Hamburguesas'],
                  ['pupusas', '🫓 Pupusas (Chicharrón, Queso, Jalapeño)'],
                  ['tacos', '🌮 Tacos Variados'],
                  ['papitas', '🍟 Papitas y Salchipapas'],
                  ['maruchan', '🍜 Maruchan con Elote'],
                  ['pizzas', '🍕 Pizzas y Pastas'],
                  ['carnes', '🍗 Carnes y Pollo'],
                  ['mariscos', '🦐 Mariscos'],
                  ['postres', '🍰 Postres y Desayunos']
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`shop-tab ${subCategory === key ? 'active' : ''}`}
                    style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
                    onClick={() => {
                      setCategory(key === 'all' ? category : 'comida')
                      setSubCategory(key)
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            <div className="shop-results-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.5rem 0 1rem', fontSize: '0.85rem', color: '#9ca3af' }}>
              <span>Mostrando {Math.min(displayCount, productos.length)} de {productos.length.toLocaleString()} platillos y bebidas</span>
              {productos.length === 4000 && <span style={{ color: '#c084fc', fontWeight: 'bold' }}>⭐ Catálogo completo (4,000 productos)</span>}
            </div>

            {productos.length === 0 ? (
              <div className="shop-empty">
                <Search size={42} />
                <p>No encontramos productos con esa búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="shop-grid">
                  {visibleProductos.map((p) => (
                    <article className="shop-card" key={p.id}>
                      <div className="shop-card-img">
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null
                            e.currentTarget.src = p.category === 'bebida'
                              ? 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80'
                              : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                          }}
                        />
                        {p.tag && <span className="shop-tag">{p.tag}</span>}
                      </div>
                      <div className="shop-card-body">
                        <h3>{p.name}</h3>
                        <p>{p.description}</p>
                        <div className="shop-card-foot">
                          <strong>{money(p.price)}</strong>
                          <button type="button" className="shop-btn-primary" onClick={() => agregar(p)} title="Comprar y agregar al pedido">
                            <Plus size={16} /> Agregar
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {displayCount < productos.length && (
                  <div className="shop-load-more-box" style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0' }}>
                    <button
                      type="button"
                      className="shop-btn-load-more"
                      onClick={() => setDisplayCount((prev) => prev + 48)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.75rem 1.75rem',
                        borderRadius: '9999px',
                        background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                        color: '#fff',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 15px rgba(124, 58, 237, 0.4)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Plus size={18} /> Cargar más productos ({Math.min(displayCount, productos.length)} de {productos.length.toLocaleString()})
                    </button>
                  </div>
                )}
              </>
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
              <form ref={formRef} onSubmit={enviarPedido} className="shop-form">
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
                      <strong>Inicia sesión para ordenar</strong>
                      <p>Regístrate fácilmente solo con tu correo y contraseña para realizar tu pedido.</p>
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

                {/* Campo DUI Obligatorio para Facturación Oficial */}
                <label className="shop-field">
                  <span>
                    <FileText size={13} /> DUI para la Factura (Documento Único de Identidad) *
                  </span>
                  <input
                    className="shop-input"
                    placeholder="00000000-0"
                    value={form.dui}
                    onChange={setCampo('dui')}
                    maxLength={10}
                    required
                  />
                  <small className="shop-field-tip">Requerido para emitir tu factura electrónica fiscal. Formato: 12345678-9</small>
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
                <div className="shop-pay-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
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

                {/* ===== INTERFAZ DE PAGO EN EFECTIVO CON CÁLCULO DE VUELTO ===== */}
                {metodo === 'cash' && (
                  <div className="shop-cash-vuelto-card">
                    <div className="shop-vuelto-header">
                      <DollarSign size={16} color="#34d399" />
                      <span>¿Necesitas que el repartidor lleve vuelto?</span>
                    </div>

                    <div className="shop-vuelto-toggle">
                      <button
                        type="button"
                        className={`shop-vuelto-btn ${!necesitaVuelto ? 'active' : ''}`}
                        onClick={() => {
                          setNecesitaVuelto(false)
                          setBilleteSeleccionado(null)
                          setMontoPersonalizado('')
                        }}
                      >
                        Pagaré exacto (${total.toFixed(2)})
                      </button>
                      <button
                        type="button"
                        className={`shop-vuelto-btn ${necesitaVuelto ? 'active' : ''}`}
                        onClick={() => {
                          setNecesitaVuelto(true)
                          const minBillete = BILLETES_RAPIDOS.find((b) => b >= total) || 100
                          setBilleteSeleccionado(minBillete)
                        }}
                      >
                        Sí, necesito vuelto
                      </button>
                    </div>

                    {necesitaVuelto && (
                      <div className="shop-vuelto-selector-box">
                        <label className="shop-vuelto-label">
                          Selecciona el billete con el que pagarás:
                        </label>
                        <div className="shop-billetes-grid">
                          {BILLETES_RAPIDOS.map((b) => {
                            const esMenor = b < total
                            const esSeleccionado = billeteSeleccionado === b
                            return (
                              <button
                                type="button"
                                key={b}
                                disabled={esMenor}
                                className={`shop-billete-btn ${esSeleccionado ? 'active' : ''} ${esMenor ? 'disabled' : ''}`}
                                onClick={() => {
                                  setBilleteSeleccionado(b)
                                  setMontoPersonalizado('')
                                }}
                                title={esMenor ? `El billete de $${b} es menor al total ($${total.toFixed(2)})` : `Pagar con billete de $${b}`}
                              >
                                ${b}
                              </button>
                            )
                          })}
                          <button
                            type="button"
                            className={`shop-billete-btn ${billeteSeleccionado === 'otro' ? 'active' : ''}`}
                            onClick={() => {
                              setBilleteSeleccionado('otro')
                              if (!montoPersonalizado) setMontoPersonalizado(Math.ceil(total).toString())
                            }}
                          >
                            Otro monto
                          </button>
                        </div>

                        {billeteSeleccionado === 'otro' && (
                          <div className="shop-custom-monto-box">
                            <span>Ingresa la cantidad exacta con la que pagarás:</span>
                            <div className="shop-input-prefix-box">
                              <span className="prefix">$</span>
                              <input
                                type="number"
                                step="0.01"
                                min={total}
                                className="shop-input"
                                placeholder={total.toFixed(2)}
                                value={montoPersonalizado}
                                onChange={(e) => setMontoPersonalizado(e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {/* Cálculo visual de Vuelto en Vivo */}
                        {montoPagaCon !== null && (
                          <div className={`shop-vuelto-summary ${montoPagaCon < total ? 'insuficiente' : ''}`}>
                            {montoPagaCon < total ? (
                              <div className="shop-vuelto-error">
                                <AlertCircle size={15} />
                                <span>El monto ingresado (${montoPagaCon.toFixed(2)}) es menor al total a pagar (${total.toFixed(2)}).</span>
                              </div>
                            ) : (
                              <div className="shop-vuelto-breakdown">
                                <div className="vuelto-row">
                                  <span>Pagas con billete:</span>
                                  <strong>${montoPagaCon.toFixed(2)}</strong>
                                </div>
                                <div className="vuelto-row">
                                  <span>Total del pedido:</span>
                                  <span>${total.toFixed(2)}</span>
                                </div>
                                <div className="vuelto-row highlight">
                                  <span>Tu vuelto a recibir:</span>
                                  <strong className="vuelto-amount">${vueltoCalculado.toFixed(2)}</strong>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <PaymentDetails key={metodo} method={metodo} total={total} customer />

                {error && <p className="shop-error">{error}</p>}

                {/* BOTÓN STICKY/FLOTANTE DENTRO DEL DRAWER DEL CARRITO */}
                <div className="shop-cart-floating-dock">
                  <div className="shop-dock-summary">
                    <span className="shop-dock-lbl">Total a pagar:</span>
                    <strong className="shop-dock-val">{money(total)}</strong>
                  </div>
                  <button
                    type="submit"
                    className="shop-btn-primary shop-submit shop-submit-dock-btn"
                    disabled={enviando}
                    title="Comprar y procesar pedido ahora"
                  >
                    <CheckCircle2 size={18} />
                    <span>{enviando ? 'Procesando compra...' : `COMPRAR AHORA (${money(total)})`}</span>
                  </button>
                </div>
              </form>
            )}
          </aside>

          {/* BOTÓN FLOTANTE DE COMPRAR (SIEMPRE VISIBLE PARA LOS CLIENTES EN TODAS LAS RESOLUCIONES, AUN CUANDO COMPRAN O REVISAN) */}
          <div className={`shop-floating-buy-container ${cartOpen ? 'cart-is-open' : ''}`}>
            <button
              type="button"
              className={`shop-cart-fab shop-btn-comprar-flotante ${totalItems > 0 ? 'has-items' : ''} ${cartOpen ? 'btn-buying-mode' : ''}`}
              onClick={handleFloatingBuyClick}
              disabled={enviando}
              title={cartOpen ? "Confirmar y procesar tu compra ahora" : "Comprar ahora - Ver pedido"}
            >
              <div className="shop-buy-icon-wrap">
                <ShoppingCart size={22} />
                {totalItems > 0 && <span className="shop-buy-badge">{totalItems}</span>}
              </div>
              <div className="shop-buy-info">
                <span className="shop-buy-action">
                  {cartOpen
                    ? (enviando ? 'PROCESANDO...' : 'CONFIRMAR Y COMPRAR')
                    : (totalItems > 0 ? 'COMPRAR AHORA' : 'TU PEDIDO')}
                </span>
                <span className="shop-buy-sub">
                  {totalItems === 0 ? '0 productos' : `${totalItems} prod. • ${money(total)}`}
                </span>
              </div>
              <ArrowRight size={18} className="shop-buy-arrow" />
            </button>
          </div>
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
                  ? 'Ingresa con tu correo y contraseña para continuar con tu pedido.'
                  : 'Crea tu cuenta rápidamente solo con tu correo y contraseña.'}
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
                    <Mail size={13} /> Correo Electrónico
                  </span>
                  <input
                    type="email"
                    className="shop-input"
                    placeholder="tu@correo.com"
                    value={authForm.identificador}
                    onChange={(e) => setAuthForm({ ...authForm, identificador: e.target.value })}
                    required
                    autoFocus
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
                    <Mail size={13} /> Correo electrónico *
                  </span>
                  <input
                    className="shop-input"
                    type="email"
                    placeholder="tu@correo.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                    autoFocus
                  />
                  <small className="shop-field-tip">Te enviaremos a este correo la confirmación de tus compras y tu factura.</small>
                </label>

                <label className="shop-field">
                  <span>
                    <KeyRound size={13} /> Contraseña de acceso *
                  </span>
                  <input
                    type="password"
                    className="shop-input"
                    placeholder="Crea una contraseña segura (mínimo 4 caracteres)"
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
                    Inicia sesión aquí
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

            {/* Información destacada de Vuelto si pagó en Efectivo */}
            {confirmacion.metodoPago === 'Efectivo' && (
              <div style={{
                margin: '4px 0',
                padding: '8px 12px',
                borderRadius: 10,
                background: 'rgba(52, 211, 153, 0.1)',
                border: '1px solid rgba(52, 211, 153, 0.35)',
                fontSize: '0.82rem',
                color: '#34d399',
                textAlign: 'left'
              }}>
                {confirmacion.necesitaVuelto ? (
                  <div>
                    <strong>💵 Pago en efectivo:</strong> Pagarás con billete de <strong>${confirmacion.montoPagaCon?.toFixed(2)}</strong>.
                    <br />
                    <span>🪙 El repartidor llevará tu vuelto de <strong>${confirmacion.vueltoCalculado?.toFixed(2)}</strong>.</span>
                  </div>
                ) : (
                  <div>
                    <strong>💵 Pago en efectivo:</strong> Monto exacto (${confirmacion.total ? Number(confirmacion.total).toFixed(2) : ''}).
                  </div>
                )}
              </div>
            )}

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
              return info?.details && m.key === 'transfer' ? (
                <PaymentDetails method={m.key} total={Number(confirmacion.total)} customer />
              ) : null
            })()}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
              <a
                href={`https://puntoventarect.onrender.com/api/publico/pedidos/${confirmacion.folio}/factura`}
                target="_blank"
                rel="noreferrer"
                className="shop-btn-primary"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.65rem' }}
              >
                <FileText size={16} /> Ver Factura Electrónica Oficial
              </a>

              <a
                href={`mailto:${form.email || clienteActivo?.email || ''}?subject=Factura Electrónica ${confirmacion.folio} - La Taberna de los Morenazos&body=Hola ${form.nombre || clienteActivo?.nombre}, tu pedido ${confirmacion.folio} por un total de $${confirmacion.total} ha sido registrado. Puedes consultar tu comprobante oficial aquí: https://puntoventarect.onrender.com/api/publico/pedidos/${confirmacion.folio}/factura`}
                className="shop-btn-ghost"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.65rem' }}
              >
                <Mail size={16} /> Enviar copia a mi correo personal
              </a>
            </div>

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

      {/* Pie de página */}
      <footer className="shop-footer" style={{ marginTop: '3.5rem', padding: '2rem 1rem 1.5rem', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', margin: 0 }}>
          © {new Date().getFullYear()} La Taberna de los Morenazos • Comida Gourmet & Pupusas Tradicionales
        </p>
      </footer>

      {toast && <div className="shop-toast">{toast}</div>}
    </div>
  )
}
