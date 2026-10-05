import { useState, useMemo } from 'react'
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
  LogOut
} from 'lucide-react'
import { INITIAL_PRODUCTS } from './data/initialProducts'
import Login from './Login'
import authService from './services/authService'
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

  // Estado de productos en catálogo (persiste cambios locales)
  const [products, setProducts] = useState(INITIAL_PRODUCTS)

  // Estado del Carrito / Orden actual
  const [cart, setCart] = useState([])

  // Filtros y Búsqueda
  const [activeCategory, setActiveCategory] = useState('all') // 'all' | 'comida' | 'bebida'
  const [searchQuery, setSearchQuery] = useState('')

  // Método de pago: 'cash' | 'card' | 'transfer'
  const [paymentMethod, setPaymentMethod] = useState('cash')

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [lastReceipt, setLastReceipt] = useState(null)

  // Notificación Toast
  const [toast, setToast] = useState(null)

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

  // Inicio y Cierre de Sesión
  const handleLogin = (user, remember) => {
    setCurrentUser(user)
    if (remember) {
      localStorage.setItem('nocturna_user', JSON.stringify(user))
    }
    showToast(`¡Bienvenido a Nocturna, ${user.name}!`, 'success')
  }

  const handleLogout = async () => {
    if (window.confirm('¿Seguro que deseas cerrar la sesión actual?')) {
      try {
        await authService.logout()
      } catch (err) {
        console.warn('Error al cerrar sesión en el backend:', err)
      }
      setCurrentUser(null)
      localStorage.removeItem('nocturna_user')
      showToast('Sesión cerrada con éxito', 'danger')
    }
  }

  // --- ACCIONES DE CARRITO ---
  // AGREGAR AL CARRITO (Icono Plus)
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

  // DISMINUIR CANTIDAD (Icono Minus)
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

  // ELIMINAR ÍTEM DEL CARRITO (Icono Trash2)
  const removeFromCart = (productId, productName) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
    showToast(`"${productName}" eliminado de la orden`, 'danger')
  }

  // VACIAR TODO EL CARRITO (Icono Trash2)
  const clearCart = () => {
    if (cart.length === 0) return
    if (window.confirm('¿Deseas vaciar todo el pedido actual?')) {
      setCart([])
      showToast('Pedido vaciado', 'danger')
    }
  }

  // --- ACCIONES DE CATÁLOGO ---
  // ELIMINAR PRODUCTO DEL MENÚ (Icono Trash2)
  const deleteProductFromMenu = (productId, productName) => {
    if (window.confirm(`¿Seguro que deseas eliminar "${productName}" del menú?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      // Si está en el carrito, también removerlo
      setCart((prev) => prev.filter((p) => p.id !== productId))
      showToast(`"${productName}" fue eliminado del catálogo`, 'danger')
    }
  }

  // RESTAURAR PRODUCTOS POR DEFECTO
  const restoreDefaultProducts = () => {
    if (window.confirm('¿Restablecer el menú inicial con comidas y bebidas?')) {
      setProducts(INITIAL_PRODUCTS)
      showToast('Menú restaurado con éxito', 'success')
    }
  }

  // AGREGAR NUEVO PRODUCTO AL CATÁLOGO
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

  // Conteos
  const totalFoods = products.filter((p) => p.category === 'comida').length
  const totalDrinks = products.filter((p) => p.category === 'bebida').length

  // --- CÁLCULOS FINANCIEROS DEL CARRITO ---
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0)
  const tax = subtotal * 0.16 // 16% IVA
  const grandTotal = subtotal + tax

  // COBRAR Y GENERAR TICKET
  const handleCheckout = () => {
    if (cart.length === 0) return
    const receiptData = {
      folio: 'FOL-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      items: [...cart],
      subtotal,
      tax,
      total: grandTotal,
      cajero: currentUser ? `${currentUser.name} (${currentUser.roleLabel})` : 'Cajero en Turno',
      paymentMethod:
        paymentMethod === 'cash'
          ? 'Efectivo 💵'
          : paymentMethod === 'card'
          ? 'Tarjeta 💳'
          : 'Transferencia 📱'
    }
    setLastReceipt(receiptData)
    setIsReceiptModalOpen(true)
    setCart([])
  }

  // SI NO HAY SESIÓN INICIADA, MOSTRAR LA PANTALLA DE LOGIN
  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="pos-container">
      {/* HEADER SUPERIOR */}
      <header className="pos-header">
        <div className="header-inner">
          <div className="brand-wrapper">
            <div className="brand-icon-box">
              <Sparkles size={26} />
            </div>
            <div>
              <h1 className="brand-title">
                PUNTO DE VENTA <span>NOCTURNA</span>
              </h1>
              <p className="brand-subtitle">Comida Gourmet & Bebidas Selectas</p>
            </div>
          </div>

          <div className="header-actions">
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

            {/* Botón para restaurar catálogo si se eliminaron muchos */}
            <button
              onClick={restoreDefaultProducts}
              className="tab-btn"
              title="Restaurar comidas y bebidas originales"
            >
              <RotateCcw size={15} /> Restaurar Catálogo
            </button>

            {/* BOTÓN CON ICONO DE AGREGAR PRODUCTO */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-add-product"
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>Nuevo Producto</span>
            </button>
          </div>
        </div>
      </header>

      {/* CUERPO PRINCIPAL DEL PUNTO DE VENTA */}
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

                {/* FILTRO COMIDA */}
                <button
                  className={`tab-btn ${activeCategory === 'comida' ? 'active' : ''}`}
                  onClick={() => setActiveCategory('comida')}
                >
                  <Utensils size={16} />
                  <span>Comidas</span>
                  <span className="tab-count">{totalFoods}</span>
                </button>

                {/* FILTRO BEBIDA */}
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

                      {/* ICONO DE ELIMINAR DEL CATÁLOGO */}
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

                        {/* BOTÓN CON ICONO DE AGREGAR */}
                        <button
                          className="btn-add-to-cart"
                          onClick={() => addToCart(item)}
                          title="Agregar al ticket"
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

        {/* SECCIÓN DERECHA: TICKET DE VENTA / CARRITO */}
        <aside className="order-sidebar">
          {/* Header del Ticket */}
          <div className="order-header">
            <div className="order-header-top">
              <div className="order-title-box">
                <Receipt className="text-purple-400" size={22} color="#c084fc" />
                <h2 className="order-title">Ticket de Venta</h2>
                {totalItemsCount > 0 && (
                  <span className="cart-count-badge">{totalItemsCount}</span>
                )}
              </div>

              {cart.length > 0 && (
                <div className="order-header-actions">
                  {/* BOTÓN CON ICONO DE ELIMINAR / VACIAR CARRITO */}
                  <button
                    onClick={clearCart}
                    className="btn-clear-cart"
                    title="Vaciar toda la orden"
                  >
                    <Trash2 size={14} />
                    <span>Vaciar</span>
                  </button>
                </div>
              )}
            </div>
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
            <div className="order-items-list">
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

                  {/* CONTROLES DE CANTIDAD: AGREGAR (+) Y REDUCIR (-) */}
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

                  {/* BOTÓN CON ICONO DE ELIMINAR ESTE PRODUCTO */}
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

          {/* Totales y Cobro */}
          <div className="order-footer">
            <div className="summary-line">
              <span>Subtotal ({totalItemsCount} arts.)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="summary-line">
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Percent size={13} /> IVA (16%)
              </span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="summary-total">
              <span>TOTAL</span>
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
                  className={`btn-payment-method ${
                    paymentMethod === 'cash' ? 'active' : ''
                  }`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <Banknote size={16} />
                  <span>Efectivo</span>
                </button>
                <button
                  type="button"
                  className={`btn-payment-method ${
                    paymentMethod === 'card' ? 'active' : ''
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <CreditCard size={16} />
                  <span>Tarjeta</span>
                </button>
                <button
                  type="button"
                  className={`btn-payment-method ${
                    paymentMethod === 'transfer' ? 'active' : ''
                  }`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  <CheckCircle2 size={16} />
                  <span>Transf.</span>
                </button>
              </div>
            </div>

            {/* Botón de Finalizar y Cobrar */}
            <button
              className="btn-checkout"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              <Receipt size={18} />
              <span>COBRAR ORDEN (${grandTotal.toFixed(2)})</span>
            </button>
          </div>
        </aside>
      </main>

      {/* MODAL: AGREGAR NUEVO PLATILLO O BEBIDA */}
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
                {/* Tipo: Comida o Bebida */}
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
                          Platillos, snacks, postres
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
                          Cócteles, refrescos, café
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nombre */}
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

                {/* Precio */}
                <div className="form-group">
                  <label>Precio de Venta ($ MXN) *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    placeholder="Ej: 120.00"
                    className="form-control"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                  />
                </div>

                {/* Descripción */}
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

                {/* Etiqueta especial */}
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

                {/* URL de Imagen */}
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

      {/* MODAL: TICKET DE VENTA COBRADO */}
      {isReceiptModalOpen && lastReceipt && (
        <div
          className="modal-backdrop"
          onClick={() => setIsReceiptModalOpen(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '440px' }}
          >
            <div className="modal-header">
              <h3 style={{ color: '#4ade80' }}>
                <CheckCircle2 size={22} color="#4ade80" />
                <span>¡Cobro Realizado con Éxito!</span>
              </h3>
              <button
                className="btn-close-modal"
                onClick={() => setIsReceiptModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="ticket-receipt-card">
                <div className="receipt-header">
                  <h4>NOCTURNA BAR & GRILL</h4>
                  <p style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                    Punto de Venta Oficial
                  </p>
                  <p style={{ fontSize: '0.78rem', color: '#a855f7' }}>
                    {lastReceipt.folio}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                    {lastReceipt.date} - {lastReceipt.time}
                  </p>
                  {lastReceipt.cajero && (
                    <p style={{ fontSize: '0.74rem', color: '#c084fc', marginTop: '2px', fontWeight: '500' }}>
                      Atendido por: {lastReceipt.cajero}
                    </p>
                  )}
                </div>

                <table className="receipt-items-table">
                  <thead>
                    <tr
                      style={{
                        borderBottom: '1px solid #374151',
                        textAlign: 'left',
                        color: '#c084fc'
                      }}
                    >
                      <th>Cant.</th>
                      <th>Desc.</th>
                      <th style={{ textAlign: 'right' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lastReceipt.items.map((it) => (
                      <tr key={it.id}>
                        <td style={{ verticalAlign: 'top' }}>{it.quantity}x</td>
                        <td>
                          <div>{it.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                            ${it.price.toFixed(2)}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', verticalAlign: 'top' }}>
                          ${(it.price * it.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="receipt-totals">
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <span>Subtotal:</span>
                    <span>${lastReceipt.subtotal.toFixed(2)}</span>
                  </div>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between' }}
                  >
                    <span>IVA (16%):</span>
                    <span>${lastReceipt.tax.toFixed(2)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: '#c084fc'
                    }}
                  >
                    <span>Método de pago:</span>
                    <span>{lastReceipt.paymentMethod}</span>
                  </div>
                  <div className="big-total">
                    <span>TOTAL PAGADO:</span>
                    <span>${lastReceipt.total.toFixed(2)}</span>
                  </div>
                </div>

                <div
                  style={{
                    textAlign: 'center',
                    marginTop: '1.25rem',
                    fontSize: '0.75rem',
                    color: '#9ca3af',
                    borderTop: '1px dashed #374151',
                    paddingTop: '0.75rem'
                  }}
                >
                  ¡Gracias por su consumo en Nocturna!
                  <br />
                  Vuelva pronto.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-add-product"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setIsReceiptModalOpen(false)}
              >
                <CheckCircle2 size={18} />
                <span>Comenzar Nueva Venta</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {toast && (
        <div className="toast-container">
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
