import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Plus,
  Minus,
  Trash2,
  Utensils,
  CupSoda,
  ShoppingBag,
  Receipt,
  Search,
  CheckCircle2,
  X,
  Sparkles,
  CreditCard,
  Banknote,
  RotateCcw,
  LayoutGrid,
  Percent,
  LogOut,
  Users,
  UserPlus,
  Truck,
  FileText,
  Globe,
  MapPin,
  Phone,
  TrendingUp,
  Package,
  ChevronRight,
  ShoppingCart
} from 'lucide-react'
import { INITIAL_PRODUCTS } from './data/initialProducts'
import { PAYMENT_LABELS } from './data/paymentInfo'
import PaymentDetails from './components/PaymentDetails'
import Login from './Login'
import TiendaEnLinea from './components/TiendaEnLinea'
import CobroModal from './components/CobroModal'
import authService from './services/authService'
import clienteService from './services/clienteService'
import ventaService from './services/ventaService'
import ClienteModal from './components/ClienteModal'
import FacturaModal from './components/FacturaModal'
import HistorialFacturas from './components/HistorialFacturas'
import DirectorioClientes from './components/DirectorioClientes'
import PanelAdministrador from './components/PanelAdministrador'
import PanelMesero from './components/PanelMesero'
import './App.css'

export default function App() {
  // Estado de usuario autenticado
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('nocturna_user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Sin sesión: se muestra la tienda pública; el personal entra con #/login
  const [showLogin, setShowLogin] = useState(() => window.location.hash === '#/login')
  const pedidosOnlineVistos = useRef(null)

  // Cobro de pedidos pendientes (modal) y filtro con el que se abre el historial
  const [pedidoACobrar, setPedidoACobrar] = useState(null)
  const [historialFiltro, setHistorialFiltro] = useState('ALL')

  const irALogin = () => {
    window.location.hash = '#/login'
    setShowLogin(true)
  }

  const irATienda = () => {
    history.replaceState(null, '', window.location.pathname + window.location.search)
    setShowLogin(false)
  }

  // Vista activa de la aplicación: 'pos' (Punto de venta) | 'historial' (Facturas & Pedidos) | 'admin' (Finanzas) | 'mesero' (Comandas) | 'clientes'
  const [activeView, setActiveView] = useState(() => {
    try {
      const saved = localStorage.getItem('nocturna_user')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.role === 'admin') return 'admin'
        if (parsed.role === 'mesero') return 'mesero'
      }
      return 'pos'
    } catch {
      return 'pos'
    }
  })

  // Estado de productos en catálogo (persiste cambios locales)
  const [products, setProducts] = useState(INITIAL_PRODUCTS)

  // Estado del Carrito / Orden actual
  const [cart, setCart] = useState([])

  // Clientes y selección de cliente para la orden
  const [clientes, setClientes] = useState([])
  const [selectedCliente, setSelectedCliente] = useState(null)
  const [isClienteModalOpen, setIsClienteModalOpen] = useState(false)

  // Modalidad de Consumo / Pedido:
  // 'LOCAL' (Consumo en Restaurante / Comedor) | 'EN_LINEA' (Pedido en Línea / Delivery) | 'LLEVAR' (Para Llevar)
  const [orderType, setOrderType] = useState('LOCAL')
  const [tableNumber, setTableNumber] = useState('Mesa 1')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [orderNotes, setOrderNotes] = useState('')

  // Historial de Ventas / Facturas
  const [ventas, setVentas] = useState([])
  const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false)
  const [activeFactura, setActiveFactura] = useState(null)

  // Filtros y Búsqueda de Productos
  const [activeCategory, setActiveCategory] = useState('all') // 'all' | 'comida' | 'bebida'
  const [searchQuery, setSearchQuery] = useState('')

  // Método de pago: 'cash' | 'card' | 'transfer' | 'online'
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Modales adicionales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false)

  // Notificación Toast
  const [toast, setToast] = useState(null)

  // Estado de la conexión con el backend: 'ok' | 'sin_sesion' | 'sin_conexion'
  const [servidorEstado, setServidorEstado] = useState('ok')

  // Formulario para nuevo producto
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'comida',
    price: '',
    description: '',
    image: '',
    tag: 'Nuevo'
  })

  // Función para mostrar notificaciones rápidas
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast(null)
    }, 2800)
  }

  // Carga inicial de Clientes y Ventas desde backend o cache local
  useEffect(() => {
    async function loadInitialData() {
      try {
        const clientList = await clienteService.getClientes()
        setClientes(clientList)
        if (clientList.length > 0 && !selectedCliente) {
          // Asigna por defecto al cliente consumidor final o primer cliente
          const consumidorFinal = clientList.find(c => c.nombre === 'Consumidor') || clientList[0]
          setSelectedCliente(consumidorFinal)
          if (consumidorFinal?.direccion && consumidorFinal.nombre !== 'Consumidor') {
            setDeliveryAddress(consumidorFinal.direccion)
          }
        }
      } catch (err) {
        console.warn('Error cargando clientes:', err)
      }

      try {
        const salesList = await ventaService.getVentas()
        setVentas(salesList)
        setServidorEstado(ventaService.estadoServidor)
      } catch (err) {
        console.warn('Error cargando ventas:', err)
      }
    }

    if (currentUser) {
      loadInitialData()
    }
  }, [currentUser])

  // El filtro del historial solo aplica una vez, al llegar desde el botón "Por cobrar"
  useEffect(() => {
    if (activeView !== 'historial') setHistorialFiltro('ALL')
  }, [activeView])

  // Si el navegador recordaba al usuario pero el backend ya no tiene su sesión (p. ej. se reinició),
  // se pide volver a ingresar para que los pedidos sí lleguen al servidor y a caja.
  useEffect(() => {
    if (!currentUser) return
    authService.verificarSesion().then((estado) => {
      if (estado === 'expirada') {
        localStorage.removeItem('nocturna_user')
        setCurrentUser(null)
        setShowLogin(true)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Actualiza las ventas cada 10 s para que lleguen los pedidos hechos desde la tienda pública
  useEffect(() => {
    if (!currentUser) {
      pedidosOnlineVistos.current = null
      return undefined
    }

    const refrescar = async () => {
      try {
        const lista = await ventaService.getVentas()
        setVentas(lista)
        setServidorEstado(ventaService.estadoServidor)

        const pendientes = lista
          .filter((v) => v.tipoPedido === 'EN_LINEA' && v.estado === 'PENDIENTE_PAGO')
          .map((v) => v.id)

        if (pedidosOnlineVistos.current === null) {
          pedidosOnlineVistos.current = new Set(pendientes)
        } else {
          const nuevos = pendientes.filter((id) => !pedidosOnlineVistos.current.has(id))
          if (nuevos.length > 0) {
            showToast(`🛵 ${nuevos.length === 1 ? 'Nuevo pedido en línea' : `${nuevos.length} nuevos pedidos en línea`}`, 'success')
          }
          pedidosOnlineVistos.current = new Set(pendientes)
        }
      } catch (err) {
        console.warn('No se pudo actualizar la lista de pedidos:', err)
      }
    }

    const id = setInterval(refrescar, 10000)
    return () => clearInterval(id)
  }, [currentUser])

  // Si la venta/comanda solo se guardó en este navegador, caja y los demás usuarios no la verán
  const avisarSiNoLlegoAlServidor = (venta) => {
    setServidorEstado(ventaService.estadoServidor)
    if (venta?.soloLocal) {
      alert(
        ventaService.estadoServidor === 'sin_sesion'
          ? 'ATENCIÓN: este pedido NO llegó al servidor porque tu sesión con el backend venció o no es válida. Caja no lo verá.\n\nCierra sesión, vuelve a ingresar y registra el pedido otra vez.'
          : 'ATENCIÓN: este pedido NO llegó al servidor (sin conexión con el backend). Caja no lo verá.\n\nVerifica que el backend esté encendido y vuelve a registrar el pedido.'
      )
    }
  }

  // Al cambiar de cliente seleccionado, auto-rellenar la dirección de entrega
  const handleSelectCliente = (cliente) => {
    setSelectedCliente(cliente)
    if (cliente?.direccion && cliente.nombre !== 'Consumidor') {
      setDeliveryAddress(cliente.direccion)
    }
    showToast(`Cliente asignado: ${cliente.nombre} ${cliente.apellido || ''}`, 'success')
  }

  // Registrar nuevo cliente desde el modal
  const handleCrearCliente = async (clienteData) => {
    const nuevo = await clienteService.createCliente(clienteData)
    setClientes((prev) => [nuevo, ...prev])
    showToast(`Cliente "${nuevo.nombre}" registrado con éxito`, 'success')
    return nuevo
  }

  // Iniciar toma de pedido para un cliente específico desde el Directorio
  const handleIniciarPedidoConCliente = (cliente) => {
    handleSelectCliente(cliente)
    setActiveView('pos')
    showToast(`Listo para tomar la orden de ${cliente.nombre}`, 'success')
  }

  // Inicio y Cierre de Sesión
  const handleLogin = (user, remember) => {
    setCurrentUser(user)
    if (remember) {
      localStorage.setItem('nocturna_user', JSON.stringify(user))
    }
    // Vista por defecto según rol
    if (user.role === 'admin') {
      setActiveView('admin')
    } else if (user.role === 'mesero') {
      setActiveView('mesero')
    } else {
      setActiveView('pos')
    }
    showToast(`¡Bienvenido a La Taberna de los Morenazos, ${user.name}!`, 'success')
  }

  const handleLogout = async () => {
    if (window.confirm('¿Seguro que deseas cerrar la sesión actual?')) {
      try {
        await authService.logout()
      } catch (err) {
        console.warn('Error al cerrar sesión en el backend:', err)
      }
      setCurrentUser(null)
      setShowLogin(true)
      localStorage.removeItem('nocturna_user')
      showToast('Sesión cerrada con éxito', 'danger')
    }
  }

  // --- ACCIONES DE CARRITO ---
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id)
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
    showToast(`"${product.name}" agregado a la orden`, 'success')
  }

  const decreaseQuantity = (productId) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === productId) {
            return { ...item, quantity: item.quantity - 1 }
          }
          return item
        })
        .filter((item) => item.quantity > 0)
    })
  }

  const removeFromCart = (productId, productName) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
    showToast(`"${productName}" eliminado de la orden`, 'danger')
  }

  const clearCart = () => {
    if (cart.length === 0) return
    if (window.confirm('¿Deseas vaciar todo el pedido actual?')) {
      setCart([])
      showToast('Pedido vaciado', 'danger')
    }
  }

  // --- ACCIONES DE CATÁLOGO ---
  const deleteProductFromMenu = (productId, productName) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${productName}" del menú?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      setCart((prev) => prev.filter((p) => p.id !== productId))
      showToast(`"${productName}" fue eliminado del catálogo`, 'danger')
    }
  }

  const restoreDefaultProducts = () => {
    if (window.confirm('¿Restablecer el menú inicial con comidas y bebidas?')) {
      setProducts(INITIAL_PRODUCTS)
      showToast('Menú restaurado con éxito', 'success')
    }
  }

  const handleCreateProduct = (e) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price) {
      alert('Por favor indica nombre y precio del producto')
      return
    }

    const defaultImg =
      newProduct.category === 'comida'
        ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'

    const itemToAdd = {
      id: 'prod_' + Date.now(),
      name: newProduct.name.trim(),
      category: newProduct.category,
      price: parseFloat(newProduct.price) || 0,
      description: newProduct.description.trim() || (newProduct.category === 'comida' ? 'Platillo preparado al momento con los mejores ingredientes.' : 'Bebida refrescante servida al momento.'),
      image: newProduct.image.trim() || defaultImg,
      tag: newProduct.tag.trim() || 'Nuevo'
    }

    setProducts([itemToAdd, ...products])
    setIsAddModalOpen(false)
    setNewProduct({
      name: '',
      category: 'comida',
      price: '',
      description: '',
      image: '',
      tag: 'Nuevo'
    })
    showToast(`Nuevo producto "${itemToAdd.name}" agregado con éxito`, 'success')
  }

  // --- FILTROS Y BÚSQUEDA ---
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory
      const query = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, searchQuery])

  const totalFoods = products.filter((p) => p.category === 'comida').length
  const totalDrinks = products.filter((p) => p.category === 'bebida').length

  // --- CÁLCULOS FINANCIEROS DEL CARRITO ---
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0)
  const tax = Number((subtotal * 0.13).toFixed(2)) // 13% IVA El Salvador
  const grandTotal = Number((subtotal + tax).toFixed(2))

  // =========================================================
  // COBRAR Y GENERAR FACTURA FISCAL / COMPROBANTE OFICIAL
  // =========================================================
  const handleCheckout = async () => {
    if (cart.length === 0) return

    const clienteAsignado = selectedCliente || {
      nombre: 'Consumidor',
      apellido: 'Final',
      documento: '00000000-0',
      telefono: '+503 2200-0000',
      email: 'ventas@tabernamorenazos.sv',
      direccion: 'Consumo en barra / mostrador'
    }

    const payloadVenta = {
      tipoPedido: orderType,
      numeroMesa: orderType === 'LOCAL' ? tableNumber : '',
      direccionEntrega: orderType === 'EN_LINEA' ? (deliveryAddress || clienteAsignado.direccion || '') : '',
      metodoPago: PAYMENT_LABELS[paymentMethod],
      notas: orderNotes.trim(),
      subtotal,
      iva: tax,
      total: grandTotal,
      estado: 'FACTURADO',
      cliente: clienteAsignado.id ? { id: clienteAsignado.id } : clienteAsignado,
      detalles: cart.map(it => ({
        cantidad: it.quantity,
        precioUnitario: it.price,
        subtotal: it.price * it.quantity,
        nombreProducto: it.name
      }))
    }

    try {
      // Guardar en backend (o sincronizar localmente)
      const ventaRegistrada = await ventaService.createVenta(payloadVenta)
      avisarSiNoLlegoAlServidor(ventaRegistrada)

      // Completar objeto para el modal de Factura con datos de presentación
      const facturaData = {
        ...ventaRegistrada,
        folio: ventaRegistrada.numeroFactura || `DTE-01-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
        numeroFactura: ventaRegistrada.numeroFactura,
        date: new Date().toLocaleDateString('es-SV', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        time: new Date().toLocaleTimeString('es-SV', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        items: [...cart],
        detalles: ventaRegistrada.detalles || [...cart],
        subtotal,
        tax,
        iva: tax,
        total: grandTotal,
        cliente: clienteAsignado,
        cajero: currentUser ? `${currentUser.name} (${currentUser.roleLabel})` : 'Cajero en Turno',
        paymentMethod: payloadVenta.metodoPago,
        metodoPago: payloadVenta.metodoPago,
        tipoPedido: orderType,
        numeroMesa: orderType === 'LOCAL' ? tableNumber : '',
        direccionEntrega: payloadVenta.direccionEntrega,
        notas: payloadVenta.notas
      }

      setActiveFactura(facturaData)
      setIsFacturaModalOpen(true)

      // Actualizar listado de ventas en memoria
      setVentas(prev => [facturaData, ...prev])

      // Vaciar carrito y resetear notas para la siguiente orden
      setCart([])
      setOrderNotes('')
      setIsMobileCartOpen(false)

      showToast('¡Orden cobrada y Factura generada con éxito!', 'success')
    } catch (err) {
      alert('Error al generar la venta y factura: ' + err.message)
    }
  }

  // =========================================================
  // MESERO: ENVIAR COMANDA A COCINA / GUARDAR PEDIDO PENDIENTE DE COBRO
  // =========================================================
  const handleRegistrarComandaMesero = async () => {
    if (cart.length === 0) return

    const clienteAsignado = selectedCliente || {
      nombre: 'Consumidor',
      apellido: 'Final',
      documento: 'XAXX010101000',
      telefono: '555-000-0000',
      direccion: 'Consumo en Salón'
    }

    const payloadComanda = {
      tipoPedido: orderType,
      numeroMesa: orderType === 'LOCAL' ? tableNumber : '',
      direccionEntrega: orderType === 'EN_LINEA' ? (deliveryAddress || clienteAsignado.direccion || '') : '',
      metodoPago: 'Pendiente de Cobro ⏳',
      notas: orderNotes.trim(),
      subtotal,
      iva: tax,
      total: grandTotal,
      estado: 'PENDIENTE_PAGO',
      cliente: clienteAsignado.id ? { id: clienteAsignado.id } : clienteAsignado,
      detalles: cart.map(it => ({
        cantidad: it.quantity,
        precioUnitario: it.price,
        subtotal: it.price * it.quantity,
        nombreProducto: it.name
      }))
    }

    try {
      const comandaGuardada = await ventaService.createVenta(payloadComanda)
      avisarSiNoLlegoAlServidor(comandaGuardada)
      const dataFinal = {
        ...comandaGuardada,
        folio: comandaGuardada.numeroFactura || `CMD-${Date.now().toString().slice(-6)}`,
        items: [...cart],
        detalles: comandaGuardada.detalles || [...cart],
        subtotal,
        iva: tax,
        total: grandTotal,
        cliente: clienteAsignado,
        cajero: currentUser ? `${currentUser.name} (${currentUser.roleLabel})` : 'Mesero',
        estado: 'PENDIENTE_PAGO'
      }

      setVentas(prev => [dataFinal, ...prev])
      setCart([])
      setOrderNotes('')
      setIsMobileCartOpen(false)
      showToast(`¡Comanda enviada con éxito para ${orderType === 'LOCAL' ? tableNumber : 'Entrega'}! Pasa a Caja para su cobro.`, 'success')
      setActiveView('mesero')
    } catch (err) {
      alert('Error registrando comanda: ' + err.message)
    }
  }

  // =========================================================
  // CAJERO: COBRAR PEDIDO PENDIENTE REGISTRADO PREVIAMENTE
  // =========================================================
  const handleCobrarPedidoPendiente = async (pedido, metodoKey = paymentMethod) => {
    try {
      const pedidoCobrado = {
        ...pedido,
        estado: 'FACTURADO',
        paymentMethod: PAYMENT_LABELS[metodoKey],
        metodoPago: PAYMENT_LABELS[metodoKey],
        cajero: currentUser ? `${currentUser.name} (${currentUser.roleLabel})` : 'Cajero en Turno'
      }

      const guardada = await ventaService.cobrar(pedido, pedidoCobrado.metodoPago)
      const pedidoFinal = guardada ? { ...pedidoCobrado, ...guardada, estado: 'FACTURADO' } : pedidoCobrado

      ventaService.saveLocal(pedidoFinal)

      setVentas(prev => prev.map(v => v.id === pedido.id ? pedidoFinal : v))
      setPedidoACobrar(null)
      setActiveFactura(pedidoFinal)
      setIsFacturaModalOpen(true)
      showToast(`¡Pedido ${pedido.numeroFactura || pedido.folio} cobrado exitosamente! Factura emitida.`, 'success')
    } catch (err) {
      alert('Error cobrando pedido: ' + err.message)
    }
  }

  // Abrir factura desde el historial
  const handleVerFactura = (venta) => {
    setActiveFactura(venta)
    setIsFacturaModalOpen(true)
  }

  // SI NO HAY SESIÓN INICIADA, MOSTRAR LA PANTALLA DE LOGIN
  if (!currentUser) {
    return showLogin
      ? <Login onLogin={handleLogin} onVolver={irATienda} />
      : <TiendaEnLinea onAccesoPersonal={irALogin} />
  }

  const pedidosPorCobrar = ventas.filter((v) => v.estado === 'PENDIENTE_PAGO').length

  return (
    <div className="pos-container">
      {/* HEADER SUPERIOR CON NAVEGACIÓN */}
      <header className="pos-header">
        <div className="header-inner">
          {/* LOGOTIPO */}
          <div className="brand-wrapper" onClick={() => setActiveView('pos')} style={{ cursor: 'pointer' }}>
            <div className="brand-icon-box">
              <Sparkles size={26} />
            </div>
            <div>
              <h1 className="brand-title">
                <span>La Taberna de los Morenazos</span>
              </h1>
              <p className="brand-subtitle">Comida Gourmet & Bebidas Selectas</p>
            </div>
          </div>

          {/* PESTAÑAS DE NAVEGACIÓN SEGÚN EL ROL AUTENTICADO */}
          <nav className="header-nav">
            {/* Si es Mesero: acceso a Control de Comandas y Tomar Pedido */}
            {currentUser.role === 'mesero' && (
              <>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeView === 'mesero' ? 'active' : ''}`}
                  onClick={() => setActiveView('mesero')}
                >
                  <Utensils size={16} />
                  <span>Mis Comandas</span>
                  {ventas.length > 0 && (
                    <span className="nav-badge-count">{ventas.length}</span>
                  )}
                </button>

                <button
                  type="button"
                  className={`nav-tab-btn ${activeView === 'pos' ? 'active' : ''}`}
                  onClick={() => setActiveView('pos')}
                >
                  <Plus size={16} />
                  <span>+ Tomar Pedido</span>
                </button>
              </>
            )}

            {/* Si es Cajero: Cobro de Pedidos y Facturas */}
            {currentUser.role === 'cajero' && (
              <>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeView === 'pos' ? 'active' : ''}`}
                  onClick={() => setActiveView('pos')}
                >
                  <Receipt size={16} />
                  <span>Caja & Cobro</span>
                </button>

                <button
                  type="button"
                  className={`nav-tab-btn ${activeView === 'historial' ? 'active' : ''}`}
                  onClick={() => setActiveView('historial')}
                >
                  <FileText size={16} />
                  <span>Facturas & Pedidos</span>
                  {ventas.length > 0 && (
                    <span className="nav-badge-count">{ventas.length}</span>
                  )}
                </button>

                <button
                  type="button"
                  className={`nav-tab-btn ${activeView === 'clientes' ? 'active' : ''}`}
                  onClick={() => setActiveView('clientes')}
                >
                  <Users size={16} />
                  <span>Clientes</span>
                  <span className="nav-badge-count">{clientes.length}</span>
                </button>
              </>
            )}

            {/* Si es Admin: Panel Administrativo de Ganancias/Inventario, Historial, POS y Clientes */}
            {currentUser.role === 'admin' && (
              <>
                <button
                  type="button"
                  className={`nav-tab-btn ${activeView === 'admin' ? 'active' : ''}`}
                  onClick={() => setActiveView('admin')}
                >
                  <TrendingUp size={16} />
                  <span>Finanzas & Ganancias</span>
                </button>

                <button
                  type="button"
                  className={`nav-tab-btn ${activeView === 'historial' ? 'active' : ''}`}
                  onClick={() => setActiveView('historial')}
                >
                  <FileText size={16} />
                  <span>Ventas ({ventas.length})</span>
                </button>

                <button
                  type="button"
                  className={`nav-tab-btn ${activeView === 'pos' ? 'active' : ''}`}
                  onClick={() => setActiveView('pos')}
                >
                  <LayoutGrid size={16} />
                  <span>Punto de Venta</span>
                </button>

                <button
                  type="button"
                  className={`nav-tab-btn ${activeView === 'clientes' ? 'active' : ''}`}
                  onClick={() => setActiveView('clientes')}
                >
                  <Users size={16} />
                  <span>Clientes</span>
                  <span className="nav-badge-count">{clientes.length}</span>
                </button>
              </>
            )}
          </nav>

          {/* ACCIONES DEL HEADER Y PERFIL */}
          <div className="header-actions">
            {pedidosPorCobrar > 0 && (
              <button
                type="button"
                className="tab-btn"
                style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.5)' }}
                onClick={() => {
                  if (currentUser.role === 'mesero') {
                    setActiveView('mesero')
                  } else {
                    setHistorialFiltro('DEBEN')
                    setActiveView('historial')
                  }
                }}
                title="Pedidos pendientes de cobro (mesas, para llevar y pedidos en línea)"
              >
                <Receipt size={15} /> Por cobrar ({pedidosPorCobrar})
              </button>
            )}

            {/* Perfil del Usuario Activo */}
            <div className="user-profile-badge">
              <div className="user-avatar">{currentUser.avatar || 'U'}</div>
              <div className="user-info">
                <span className="user-name">{currentUser.name}</span>
                <span className="user-role-tag">{currentUser.roleLabel}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn-logout"
                title="Cerrar sesión del sistema"
              >
                <LogOut size={15} />
                <span>Salir</span>
              </button>
            </div>

            {/* Botón para restaurar catálogo (solo visible para admin) */}
            {currentUser.role === 'admin' && activeView === 'pos' && (
              <button
                onClick={restoreDefaultProducts}
                className="tab-btn"
                title="Restaurar comidas y bebidas originales"
              >
                <RotateCcw size={15} /> Restaurar Catálogo
              </button>
            )}

            {/* BOTÓN PARA AGREGAR NUEVO PLATILLO O BEBIDA (solo para admin) */}
            {currentUser.role === 'admin' && activeView === 'pos' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="btn-add-product"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>Nuevo Producto</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {servidorEstado !== 'ok' && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.5)',
            color: '#fca5a5',
            padding: '0.55rem 1rem',
            textAlign: 'center',
            fontSize: '0.85rem'
          }}
        >
          {servidorEstado === 'sin_sesion'
            ? '⚠️ Tu sesión con el servidor no es válida: los pedidos que tomes NO llegarán a caja. Cierra sesión y vuelve a ingresar.'
            : '⚠️ Sin conexión con el servidor: los pedidos que tomes NO llegarán a caja hasta que se restablezca.'}
        </div>
      )}

      {/* ========================================================= */}
      {/* VISTA 1: PUNTO DE VENTA / CATÁLOGO + TICKET DE ORDEN      */}
      {/* ========================================================= */}
      {activeView === 'pos' && (
        <main className="pos-layout">
          {/* SECCIÓN IZQUIERDA: CATÁLOGO DE COMIDA Y BEBIDA */}
          <section className="catalog-section">
            {/* CONTROLES: BUSCADOR Y PESTAÑAS COMIDA / BEBIDA */}
            <div className="controls-card">
              <div className="search-box">
                <Search className="search-icon" size={20} />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar por comida (hamburguesas, tacos, pizza...) o bebida (mojito, malteada, cerveza...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      color: '#a855f7'
                    }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <div className="filters-row">
                <div className="category-tabs">
                  <button
                    className={`tab-btn ${activeCategory === 'all' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('all')}
                  >
                    <LayoutGrid size={16} />
                    <span>Todos los Productos</span>
                    <span className="tab-count">{products.length}</span>
                  </button>

                  <button
                    className={`tab-btn ${activeCategory === 'comida' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('comida')}
                  >
                    <Utensils size={16} />
                    <span>Comidas</span>
                    <span className="tab-count">{totalFoods}</span>
                  </button>

                  <button
                    className={`tab-btn ${activeCategory === 'bebida' ? 'active' : ''}`}
                    onClick={() => setActiveCategory('bebida')}
                  >
                    <CupSoda size={16} />
                    <span>Bebidas</span>
                    <span className="tab-count">{totalDrinks}</span>
                  </button>
                </div>

                <div className="results-info">
                  Mostrando {filteredProducts.length} producto(s)
                </div>
              </div>
            </div>

            {/* GRID DE PRODUCTOS */}
            {filteredProducts.length === 0 ? (
              <div className="empty-catalog">
                <Utensils className="empty-catalog-icon" />
                <h3>No se encontraron productos</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No hay comidas ni bebidas que coincidan con la búsqueda "{searchQuery}".
                </p>
                <button
                  className="btn-add-product"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('all')
                  }}
                >
                  Limpiar búsqueda
                </button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((item) => {
                  const isFood = item.category === 'comida'
                  const inCart = cart.find((c) => c.id === item.id)

                  return (
                    <div key={item.id} className="product-card">
                      {/* Imagen y Badges */}
                      <div className="product-img-wrapper">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="product-img"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = isFood
                              ? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                              : 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80'
                          }}
                        />

                        {/* Badge de Categoría Comida o Bebida */}
                        <span
                          className={`product-badge-category ${
                            isFood ? 'badge-food' : 'badge-drink'
                          }`}
                        >
                          {isFood ? (
                            <>
                              <Utensils size={12} /> Comida
                            </>
                          ) : (
                            <>
                              <CupSoda size={12} /> Bebida
                            </>
                          )}
                        </span>

                        {item.tag && (
                          <span className="product-badge-tag">{item.tag}</span>
                        )}

                        {/* Eliminar del menú (solo admin) */}
                        {currentUser.role === 'admin' && (
                          <button
                            className="btn-delete-menu-item"
                            title="Eliminar este platillo/bebida del menú"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteProductFromMenu(item.id, item.name)
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      {/* Información del Producto */}
                      <div className="product-info">
                        <h3 className="product-name">{item.name}</h3>
                        <p className="product-desc">{item.description}</p>

                        <div className="product-bottom">
                          <div className="product-price">
                            <small>$</small>
                            {item.price.toFixed(2)}
                          </div>

                          <button
                            className="btn-add-to-cart"
                            onClick={() => addToCart(item)}
                            title="Agregar al ticket de la orden"
                          >
                            <Plus size={16} strokeWidth={2.8} />
                            <span>
                              {inCart ? `Agregar (${inCart.quantity})` : 'Agregar'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* SECCIÓN DERECHA: TICKET DE VENTA CON CLIENTE Y FACTURACIÓN */}
          <aside className={`order-sidebar ${isMobileCartOpen ? 'mobile-cart-active' : ''}`}>
            {/* Header del Ticket */}
            <div className="order-header">
              <div className="order-header-top">
                <div className="order-title-box">
                  <Receipt size={22} color="#c084fc" />
                  <h2 className="order-title">Ticket & Factura</h2>
                  {totalItemsCount > 0 && (
                    <span className="cart-count-badge">{totalItemsCount}</span>
                  )}
                </div>

                <div className="order-header-actions">
                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="btn-clear-cart"
                      title="Vaciar toda la orden"
                    >
                      <Trash2 size={14} />
                      <span>Vaciar</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn-close-mobile-cart"
                    onClick={() => setIsMobileCartOpen(false)}
                    title="Cerrar ticket y volver al catálogo"
                  >
                    <X size={18} />
                    <span>Volver</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ÁREA SCROLLABLE: Modalidad + Cliente + Items */}
            <div className="order-scrollable-area">
              {/* SELECTOR DE MODALIDAD */}
              <div className="order-modality-block">
                <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', display: 'block' }}>
                  Modalidad del Pedido:
                </label>
                <div className="modality-selector">
                  <button
                    type="button"
                    className={`btn-modality ${orderType === 'LOCAL' ? 'active' : ''}`}
                    onClick={() => setOrderType('LOCAL')}
                    title="Consumo en el restaurante / comedor (lo que han comido)"
                  >
                    <Utensils size={15} />
                    <span>En Restaurante</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-modality ${orderType === 'EN_LINEA' ? 'active' : ''}`}
                    onClick={() => setOrderType('EN_LINEA')}
                    title="Pedido en línea / Envío a domicilio"
                  >
                    <Truck size={15} />
                    <span>Pedido en Línea</span>
                  </button>

                  <button
                    type="button"
                    className={`btn-modality ${orderType === 'LLEVAR' ? 'active' : ''}`}
                    onClick={() => setOrderType('LLEVAR')}
                    title="Para llevar / recoger en mostrador"
                  >
                    <ShoppingBag size={15} />
                    <span>Para Llevar</span>
                  </button>
                </div>
              </div>

              {/* SELECCIÓN Y GESTIÓN DEL CLIENTE */}
              <div className="order-client-card">
                <div className="order-client-header">
                  <div className="client-identity-box">
                    <div className="client-avatar-round">
                      {(selectedCliente?.nombre?.[0] || 'C').toUpperCase()}
                    </div>
                    <div>
                      <div className="client-name-bold">
                        {selectedCliente ? `${selectedCliente.nombre} ${selectedCliente.apellido || ''}` : 'Consumidor Final'}
                      </div>
                      <div className="client-rfc-sub">
                        {selectedCliente?.documento ? `DUI/NIT: ${selectedCliente.documento}` : 'Sin DUI/NIT asignado'}
                      </div>
                    </div>
                  </div>

                  <div className="order-client-actions">
                    <button
                      type="button"
                      className="btn-client-tag"
                      onClick={() => setIsClienteModalOpen(true)}
                      title="Seleccionar o registrar un nuevo cliente"
                    >
                      <UserPlus size={13} />
                      <span>{selectedCliente ? 'Cambiar' : 'Asignar'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CAMPOS ESPECÍFICOS SEGÚN MODALIDAD */}
              <div className="order-subfields">
                {orderType === 'LOCAL' && (
                  <div>
                    <input
                      type="text"
                      className="subfield-input"
                      placeholder="Mesa / Zona (Ej: Mesa 4, Terraza 2, Barra)"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                    />
                  </div>
                )}

                {orderType === 'EN_LINEA' && (
                  <>
                    <div>
                      <input
                        type="text"
                        className="subfield-input"
                        placeholder="Dirección de entrega a domicilio *"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        className="subfield-input"
                        placeholder="Instrucciones de entrega (Apto, timbre, referencias)..."
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                      />
                    </div>
                  </>
                )}

                {orderType === 'LLEVAR' && (
                  <div>
                    <input
                      type="text"
                      className="subfield-input"
                      placeholder="Notas para el pedido (Ej: Extra servilletas)..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Lista de Productos Agregados */}
              {cart.length === 0 ? (
                <div className="empty-cart-state">
                  <ShoppingBag className="empty-cart-icon" />
                  <h4 style={{ color: '#fff' }}>Orden Vacía</h4>
                  <p style={{ fontSize: '0.82rem' }}>
                    Selecciona comidas o bebidas del menú pulsando el botón{' '}
                    <strong style={{ color: '#a855f7' }}>+ Agregar</strong>.
                  </p>
                </div>
              ) : (
                <div className="order-items-list-inner">
                  {cart.map((item) => (
                    <div key={item.id} className="cart-item-row">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-thumb"
                      />

                      <div className="cart-item-details">
                        <div className="cart-item-name" title={item.name}>
                          {item.name}
                        </div>
                        <div className="cart-item-price-unit">
                          ${item.price.toFixed(2)} c/u
                        </div>
                      </div>

                      <div className="cart-qty-controls">
                        <button
                          className="btn-qty"
                          onClick={() => decreaseQuantity(item.id)}
                          title="Disminuir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="cart-qty-number">{item.quantity}</span>
                        <button
                          className="btn-qty"
                          onClick={() => addToCart(item)}
                          title="Agregar una unidad más"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>

                      <button
                        className="btn-remove-item"
                        onClick={() => removeFromCart(item.id, item.name)}
                        title="Eliminar de la orden"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* FOOTER FIJO: Totales + Métodos de pago + Botones de acción */}
            <div className="order-footer">
              <div className="summary-line">
                <span>Subtotal ({totalItemsCount} arts.)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="summary-line">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Percent size={13} /> IVA (13% Fiscal)
                </span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="summary-total">
                <span>TOTAL A FACTURAR</span>
                <span className="total-amount">${grandTotal.toFixed(2)}</span>
              </div>

              {/* Selector de Método de Pago */}
              <div style={{ marginTop: '0.2rem' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  Forma de Pago:
                </p>
                <div className="payment-selector">
                  <button
                    type="button"
                    className={`btn-payment-method ${paymentMethod === 'cash' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <Banknote size={16} />
                    <span>Efectivo</span>
                  </button>
                  <button
                    type="button"
                    className={`btn-payment-method ${paymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard size={16} />
                    <span>Tarjeta</span>
                  </button>
                  <button
                    type="button"
                    className={`btn-payment-method ${paymentMethod === 'transfer' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('transfer')}
                  >
                    <CheckCircle2 size={16} />
                    <span>Transf.</span>
                  </button>
                  <button
                    type="button"
                    className={`btn-payment-method ${paymentMethod === 'online' ? 'active' : ''}`}
                    onClick={() => setPaymentMethod('online')}
                  >
                    <Globe size={16} />
                    <span>En Línea</span>
                  </button>
                </div>

                <PaymentDetails key={paymentMethod} method={paymentMethod} total={grandTotal} />
              </div>

              {/* Botón de Cancelar Pedido */}
              <button
                className="btn-cancel-order"
                disabled={cart.length === 0}
                onClick={clearCart}
                title="Cancelar el pedido actual y vaciar la orden"
              >
                <X size={18} />
                <span>CANCELAR PEDIDO</span>
              </button>

              {/* Si es Mesero: Solo envía el pedido / comanda a cocina y queda pendiente de cobro */}
              {currentUser.role === 'mesero' ? (
                <button
                  className="btn-checkout"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)' }}
                  disabled={cart.length === 0}
                  onClick={handleRegistrarComandaMesero}
                  title="Enviar la comanda a cocina y registrar el pedido pendiente de cobro"
                >
                  <Utensils size={18} />
                  <span>REGISTRAR Y ENVIAR COMANDA (${grandTotal.toFixed(2)})</span>
                </button>
              ) : (
                /* Si es Cajero o Admin: Cobra la orden y emite factura oficial */
                <button
                  className="btn-checkout"
                  disabled={cart.length === 0}
                  onClick={handleCheckout}
                  title="Cobrar la orden y generar factura fiscal oficial"
                >
                  <Receipt size={18} />
                  <span>COBRAR Y GENERAR FACTURA (${grandTotal.toFixed(2)})</span>
                </button>
              )}
            </div>
          </aside>

          {/* Barra inferior fija flotante para celulares */}
          {!isMobileCartOpen && (
            <div className="mobile-cart-bottom-bar" onClick={() => setIsMobileCartOpen(true)}>
              <div className="mobile-cart-bar-left">
                <div className="mobile-cart-icon-bubble">
                  <ShoppingCart size={18} />
                  {totalItemsCount > 0 && <span className="mobile-cart-num">{totalItemsCount}</span>}
                </div>
                <div>
                  <div className="mobile-cart-bar-title">
                    {totalItemsCount === 0 ? 'Ticket Vacío' : `${totalItemsCount} producto(s) en orden`}
                  </div>
                  <div className="mobile-cart-bar-sub">Toca para revisar o cobrar</div>
                </div>
              </div>
              <div className="mobile-cart-bar-right">
                <span className="mobile-cart-bar-price">${grandTotal.toFixed(2)} USD</span>
                <ChevronRight size={18} />
              </div>
            </div>
          )}
        </main>
      )}

      {/* ========================================================= */}
      {/* VISTA 2: HISTORIAL DE VENTAS, FACTURAS Y PEDIDOS EN LÍNEA  */}
      {/* ========================================================= */}
      {activeView === 'historial' && (
        <HistorialFacturas
          ventas={ventas}
          onVerFactura={handleVerFactura}
          onRecargar={async () => {
            const res = await ventaService.getVentas()
            setVentas(res)
            showToast('Listado de facturas actualizado', 'success')
          }}
          onIrAlPOS={() => setActiveView('pos')}
          onCobrarPedido={setPedidoACobrar}
          filtroInicial={historialFiltro}
        />
      )}

      {/* ========================================================= */}
      {/* VISTA 3: PANEL ADMINISTRADOR: FINANZAS, GANANCIA Y PRODUCTOS */}
      {/* ========================================================= */}
      {activeView === 'admin' && (
        <PanelAdministrador
          ventas={ventas}
          products={products}
          onVerFactura={handleVerFactura}
          onVerCatalogo={() => setActiveView('pos')}
        />
      )}

      {/* ========================================================= */}
      {/* VISTA 4: PANEL MESERO: COMANDAS, ENTREGAS Y QUIENES DEBEN */}
      {/* ========================================================= */}
      {activeView === 'mesero' && (
        <PanelMesero
          ventas={ventas}
          onTomarNuevoPedido={() => setActiveView('pos')}
        />
      )}

      {/* ========================================================= */}
      {/* VISTA 5: DIRECTORIO DE CLIENTES Y GESTIÓN                 */}
      {/* ========================================================= */}
      {activeView === 'clientes' && (
        <DirectorioClientes
          clientes={clientes}
          onNuevoClienteClick={() => setIsClienteModalOpen(true)}
          onIniciarPedidoConCliente={handleIniciarPedidoConCliente}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL: GESTIÓN DE CLIENTES                                */}
      {/* ========================================================= */}
      <ClienteModal
        isOpen={isClienteModalOpen}
        onClose={() => setIsClienteModalOpen(false)}
        clientes={clientes}
        selectedCliente={selectedCliente}
        onSelectCliente={handleSelectCliente}
        onCrearCliente={handleCrearCliente}
      />

      {/* ========================================================= */}
      {/* MODAL: FACTURA FISCAL OFICIAL Y TICKET IMPRIMIBLE         */}
      {/* ========================================================= */}
      <FacturaModal
        isOpen={isFacturaModalOpen}
        onClose={() => setIsFacturaModalOpen(false)}
        factura={activeFactura}
        onNuevaVenta={() => {
          setIsFacturaModalOpen(false)
          setActiveView('pos')
        }}
      />

      {/* ========================================================= */}
      {/* MODAL: AGREGAR NUEVO PLATILLO O BEBIDA AL MENÚ            */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>
                <Plus size={20} color="#c084fc" />
                <span>Agregar Comida o Bebida al Menú</span>
              </h3>
              <button
                className="btn-close-modal"
                onClick={() => setIsAddModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Tipo de Producto:</label>
                  <div className="category-radio-group">
                    <div
                      className={`radio-card ${
                        newProduct.category === 'comida' ? 'selected' : ''
                      }`}
                      onClick={() =>
                        setNewProduct({ ...newProduct, category: 'comida' })
                      }
                    >
                      <Utensils size={18} color="#c084fc" />
                      <div>
                        <strong>Comida</strong>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                          Platillos, hamburguesas, tacos, pizza
                        </div>
                      </div>
                    </div>

                    <div
                      className={`radio-card ${
                        newProduct.category === 'bebida' ? 'selected' : ''
                      }`}
                      onClick={() =>
                        setNewProduct({ ...newProduct, category: 'bebida' })
                      }
                    >
                      <CupSoda size={18} color="#c084fc" />
                      <div>
                        <strong>Bebida</strong>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                          Cócteles, refrescos, cervezas, café
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Nombre del Producto *</label>
                  <input
                    type="text"
                    required
                    placeholder={
                      newProduct.category === 'comida'
                        ? 'Ej: Burrito de Arrachera'
                        : 'Ej: Frappé Moka con Caramelo'
                    }
                    className="form-control"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Precio de Venta ($ USD) *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.25"
                    required
                    placeholder="Ej: 4.50"
                    className="form-control"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Descripción / Ingredientes</label>
                  <textarea
                    rows="2"
                    placeholder="Breve descripción de los ingredientes..."
                    className="form-control"
                    value={newProduct.description}
                    onChange={(e) =>
                      setNewProduct({
                        ...newProduct,
                        description: e.target.value
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Etiqueta / Badge</label>
                  <input
                    type="text"
                    placeholder="Ej: Popular, Chef, Especial, Nuevo"
                    className="form-control"
                    value={newProduct.tag}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, tag: e.target.value })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>URL de Imagen (opcional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    className="form-control"
                    value={newProduct.image}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, image: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-add-product">
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Guardar Producto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pedidoACobrar && (
        <CobroModal
          pedido={pedidoACobrar}
          onConfirmar={handleCobrarPedidoPendiente}
          onCerrar={() => setPedidoACobrar(null)}
        />
      )}

      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {toast && (
        <div className="toast-container no-print">
          <div
            className={`toast ${
              toast.type === 'danger' ? 'toast-danger' : ''
            }`}
          >
            {toast.type === 'danger' ? (
              <Trash2 size={18} color="#ef4444" />
            ) : (
              <CheckCircle2 size={18} color="#a855f7" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  )
}
