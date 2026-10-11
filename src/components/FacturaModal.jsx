import { useState } from 'react'
import {
  Printer,
  Download,
  Mail,
  CheckCircle2,
  X,
  FileText,
  Receipt,
  Utensils,
  Truck,
  ShoppingBag,
  Sparkles,
  QrCode
} from 'lucide-react'
import { numeroALetras } from '../utils/numberToLetters'

export default function FacturaModal({
  isOpen,
  onClose,
  factura,
  onNuevaVenta
}) {
  const [viewMode, setViewMode] = useState('factura') // 'factura' | 'ticket'
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  if (!isOpen || !factura) return null

  const {
    id,
    folio,
    numeroFactura = folio || `FAC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    date,
    time,
    fechaVenta,
    items = [],
    detalles = [],
    subtotal = 0,
    tax = 0,
    iva = tax,
    total = 0,
    cliente,
    cajero = 'Cajero en Turno',
    paymentMethod = 'Efectivo 💵',
    metodoPago = paymentMethod,
    tipoPedido = 'LOCAL',
    numeroMesa = '',
    direccionEntrega = '',
    notas = ''
  } = factura

  // Lista normalizada de ítems
  const listaItems = items.length > 0 ? items : detalles.map(d => ({
    id: d.id,
    name: d.nombreProducto || d.producto?.nombre || 'Producto / Platillo',
    quantity: d.cantidad || 1,
    price: Number(d.precioUnitario || 0),
    category: d.producto?.categoria?.nombre || 'comida'
  }))

  const subtotalFinal = Number(subtotal) || listaItems.reduce((acc, it) => acc + (it.price * it.quantity), 0)
  const ivaFinal = Number(iva) || Number((subtotalFinal * 0.16).toFixed(2))
  const totalFinal = Number(total) || (subtotalFinal + ivaFinal)

  // Fecha legible
  const fechaTexto = fechaVenta
    ? new Date(fechaVenta).toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : date || new Date().toLocaleDateString('es-MX', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

  const horaTexto = fechaVenta
    ? new Date(fechaVenta).toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : time || new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit'
      })

  const folioUUID = `4A8B${Math.floor(1000 + Math.random() * 9000)}-E71C-49D0-91BC-${Math.floor(100000000000 + Math.random() * 900000000000)}`

  // Imprimir ventana
  const handlePrint = () => {
    window.print()
  }

  // Simular envío de email
  const handleSendEmail = () => {
    setIsSendingEmail(true)
    setTimeout(() => {
      setIsSendingEmail(false)
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 4000)
    }, 1000)
  }

  // Descargar factura en archivo HTML legible
  const handleDownload = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Factura ${numeroFactura}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 30px; color: #111; max-width: 800px; margin: auto; }
    .header { border-bottom: 2px solid #6b21a8; padding-bottom: 15px; margin-bottom: 20px; }
    .title { color: #6b21a8; font-size: 24px; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f3e8ff; color: #581c87; }
    .totals { float: right; width: 300px; margin-top: 10px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; }
    .grand-total { font-size: 18px; font-weight: bold; color: #6b21a8; border-top: 2px solid #6b21a8; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">NOCTURNA BAR & GRILL - FACTURA FISCAL</div>
    <p>Folio: ${numeroFactura} | Fecha: ${fechaTexto} ${horaTexto}</p>
    <p>Cliente: ${cliente ? `${cliente.nombre} ${cliente.apellido || ''} (${cliente.documento || 'XAXX010101000'})` : 'Consumidor Final'}</p>
    <p>Modalidad: ${tipoPedido === 'EN_LINEA' ? 'Pedido en Línea / A Domicilio' : tipoPedido === 'LOCAL' ? `Consumo en Restaurante (${numeroMesa || 'Comedor'})` : 'Para Llevar'}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>Cant.</th>
        <th>Descripción</th>
        <th>P. Unitario</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${listaItems.map(it => `
        <tr>
          <td>${it.quantity}</td>
          <td>${it.name}</td>
          <td>$${it.price.toFixed(2)}</td>
          <td>$${(it.price * it.quantity).toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="totals">
    <div class="total-row"><span>Subtotal:</span><span>$${subtotalFinal.toFixed(2)}</span></div>
    <div class="total-row"><span>IVA (16%):</span><span>$${ivaFinal.toFixed(2)}</span></div>
    <div class="total-row grand-total"><span>TOTAL:</span><span>$${totalFinal.toFixed(2)} MXN</span></div>
    <p style="font-size: 11px; margin-top: 10px;">${numeroALetras(totalFinal)}</p>
  </div>
</body>
</html>`
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Factura_${numeroFactura}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content invoice-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de controles del comprobante */}
        <div className="invoice-top-toolbar no-print">
          <div className="invoice-type-switch">
            <button
              type="button"
              className={`btn-switch ${viewMode === 'factura' ? 'active' : ''}`}
              onClick={() => setViewMode('factura')}
            >
              <FileText size={16} />
              <span>Factura Fiscal Completa</span>
            </button>
            <button
              type="button"
              className={`btn-switch ${viewMode === 'ticket' ? 'active' : ''}`}
              onClick={() => setViewMode('ticket')}
            >
              <Receipt size={16} />
              <span>Ticket Térmico</span>
            </button>
          </div>

          <div className="invoice-action-buttons">
            <button
              type="button"
              className="btn-toolbar-action"
              onClick={handlePrint}
              title="Imprimir comprobante oficial"
            >
              <Printer size={16} />
              <span>Imprimir</span>
            </button>

            <button
              type="button"
              className="btn-toolbar-action"
              onClick={handleDownload}
              title="Descargar comprobante en archivo"
            >
              <Download size={16} />
              <span>Descargar</span>
            </button>

            {cliente?.email && (
              <button
                type="button"
                className="btn-toolbar-action"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
                title={`Enviar factura a ${cliente.email}`}
              >
                <Mail size={16} />
                <span>{isSendingEmail ? 'Enviando...' : emailSent ? '¡Enviada!' : 'Enviar Email'}</span>
              </button>
            )}

            <button className="btn-close-modal" onClick={onClose} title="Cerrar ventana">
              <X size={20} />
            </button>
          </div>
        </div>

        {emailSent && (
          <div className="alert-toast-inline">
            <CheckCircle2 size={16} color="#4ade80" />
            <span>Factura digital enviada exitosamente a <strong>{cliente.email}</strong></span>
          </div>
        )}

        {/* =============================================================== */}
        {/* VISTA 1: FACTURA FISCAL ELECTRÓNICA FORMAL (CFDI / FACTURA A4)  */}
        {/* =============================================================== */}
        {viewMode === 'factura' ? (
          <div className="printable-invoice-sheet" id="factura-print-area">
            {/* ENCABEZADO DE FACTURA */}
            <div className="invoice-sheet-header">
              <div className="invoice-issuer-info">
                <div className="invoice-brand-logo">
                  <div className="brand-icon-box" style={{ width: '42px', height: '42px' }}>
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <h2 className="invoice-brand-title">LA TABERNA DE LOS MORENAZOS</h2>
                    <span className="invoice-brand-tag">Comida Gourmet & Bebidas Selectas</span>
                  </div>
                </div>

                <div className="issuer-legal-details">
                  <p><strong>Emisor:</strong> LA TABERNA DE LOS MORENAZOS S.A. DE C.V.</p>
                  <p><strong>RFC / NIT:</strong> NOC-202610-HG1</p>
                  <p><strong>Régimen Fiscal:</strong> 601 - General de Ley Personas Morales</p>
                  <p><strong>Dirección:</strong> Av. Insurgentes Sur 1234, Benito Juárez, CDMX</p>
                  <p><strong>Teléfono:</strong> +52 55 5555-8899 | <strong>Email:</strong> facturacion@nocturnagrill.com</p>
                </div>
              </div>

              {/* RECUADRO DE DATOS DEL FOLIO FISCAL */}
              <div className="invoice-fiscal-box">
                <div className="fiscal-box-title">FACTURA ELECTRÓNICA</div>
                <div className="fiscal-folio-number">{numeroFactura}</div>
                
                <div className="fiscal-meta-grid">
                  <div>
                    <span className="meta-lbl">Folio Fiscal (UUID):</span>
                    <span className="meta-val monospace">{folioUUID}</span>
                  </div>
                  <div>
                    <span className="meta-lbl">Fecha y Hora de Emisión:</span>
                    <span className="meta-val">{fechaTexto} | {horaTexto}</span>
                  </div>
                  <div>
                    <span className="meta-lbl">Tipo de Comprobante:</span>
                    <span className="meta-val">I - Ingreso</span>
                  </div>
                  <div>
                    <span className="meta-lbl">Modalidad de Consumo:</span>
                    <span className="meta-val badge-order-type">
                      {tipoPedido === 'EN_LINEA' ? (
                        <>
                          <Truck size={13} /> Pedido en Línea / A Domicilio
                        </>
                      ) : tipoPedido === 'LOCAL' ? (
                        <>
                          <Utensils size={13} /> Consumo en Restaurante {numeroMesa ? `(${numeroMesa})` : ''}
                        </>
                      ) : (
                        <>
                          <ShoppingBag size={13} /> Para Llevar / Mostrador
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* DATOS DEL CLIENTE / RECEPTOR */}
            <div className="invoice-section-card">
              <div className="section-card-title">DATOS DEL CLIENTE / RECEPTOR</div>
              <div className="client-data-grid">
                <div>
                  <span className="lbl">Nombre / Razón Social:</span>
                  <strong className="val">
                    {cliente ? `${cliente.nombre} ${cliente.apellido || ''}` : 'Consumidor Final'}
                  </strong>
                </div>
                <div>
                  <span className="lbl">RFC / Documento:</span>
                  <span className="val monospace">
                    {cliente?.documento || 'XAXX010101000'}
                  </span>
                </div>
                <div>
                  <span className="lbl">Uso del CFDI:</span>
                  <span className="val">G03 - Gastos en general</span>
                </div>
                <div>
                  <span className="lbl">Teléfono:</span>
                  <span className="val">{cliente?.telefono || 'No registrado'}</span>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span className="lbl">Dirección Fiscal / Entrega:</span>
                  <span className="val">
                    {cliente?.direccion || direccionEntrega || 'Consumo en Salón / Mostrador'}
                  </span>
                </div>
                {cliente?.email && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span className="lbl">Correo para Factura:</span>
                    <span className="val">{cliente.email}</span>
                  </div>
                )}
                {notas && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <span className="lbl">Instrucciones del Pedido:</span>
                    <span className="val" style={{ fontStyle: 'italic' }}>"{notas}"</span>
                  </div>
                )}
              </div>
            </div>

            {/* TABLA DE PRODUCTOS / CONSUMOS */}
            <div className="invoice-table-wrapper">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>Cant.</th>
                    <th style={{ width: '100px' }}>Clave Prod</th>
                    <th>Concepto / Descripción del Platillo o Bebida</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>P. Unitario</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Importe</th>
                  </tr>
                </thead>
                <tbody>
                  {listaItems.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                      <td className="monospace" style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                        90101501
                      </td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                        <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                          Alimentos y bebidas preparados al momento
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>${item.price.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALES Y FORMA DE PAGO */}
            <div className="invoice-footer-grid">
              <div className="payment-legal-box">
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Forma de Pago:</strong>{' '}
                  <span style={{ textTransform: 'capitalize' }}>{metodoPago}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Método de Pago:</strong> PUE - Pago en una sola exhibición
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Moneda:</strong> MXN - Peso Mexicano
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Atendido por:</strong> {cajero}
                </div>
                <div className="amount-in-words-box">
                  <span className="lbl">IMPORTE CON LETRA:</span>
                  <div className="words-text">{numeroALetras(totalFinal)}</div>
                </div>
              </div>

              <div className="financial-totals-box">
                <div className="fin-row">
                  <span>Subtotal:</span>
                  <span>${subtotalFinal.toFixed(2)}</span>
                </div>
                <div className="fin-row">
                  <span>IVA Trasladado (16%):</span>
                  <span>${ivaFinal.toFixed(2)}</span>
                </div>
                <div className="fin-row total-highlight">
                  <span>TOTAL A PAGAR:</span>
                  <span className="total-val">${totalFinal.toFixed(2)} <small>MXN</small></span>
                </div>
              </div>
            </div>

            {/* SELLO DIGITAL Y QR */}
            <div className="invoice-digital-stamp">
              <div className="qr-container">
                <div className="qr-box-simulated">
                  <QrCode size={78} color="#000" />
                </div>
              </div>

              <div className="stamps-text-box">
                <div className="stamp-line">
                  <span className="stamp-lbl">Cadena Original del SAT:</span>
                  <p className="stamp-val monospace">
                    ||1.1|{folioUUID}|2026-10-08T13:30:00|NOC202610HG1|{totalFinal.toFixed(2)}|MXN|PUE|00001000000508821432||
                  </p>
                </div>
                <div className="stamp-line">
                  <span className="stamp-lbl">Sello Digital del Emisor:</span>
                  <p className="stamp-val monospace">
                    xY9bM1qRk0v...a9LpZ8T2uQ7wX1v8bN3mM0oP9qR6sT4uV2wX0yZ7aB5cD3eF1gH9iJ=
                  </p>
                </div>
                <p className="legal-disclaimer">
                  Este documento es una representación impresa y legal de una Factura de Venta / Consumo.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* =============================================================== */
          /* VISTA 2: FORMATO TICKET TÉRMICO (PARA IMPRESORA DE TICKETS)     */
          /* =============================================================== */
          <div className="printable-ticket-sheet" id="ticket-print-area">
            <div className="ticket-header-block">
              <h3>LA TABERNA DE LOS MORENAZOS</h3>
              <p>RFC: NOC-202610-HG1</p>
              <p>Av. Insurgentes Sur 1234, CDMX</p>
              <p>Tel: +52 55 5555-8899</p>
              <div className="ticket-divider-dashes" />
              <div className="ticket-folio-highlight">{numeroFactura}</div>
              <p>{fechaTexto} - {horaTexto}</p>
              <p><strong>Cajero:</strong> {cajero}</p>
              <p className="ticket-order-modality">
                {tipoPedido === 'EN_LINEA'
                  ? '🛵 PEDIDO EN LÍNEA / DELIVERY'
                  : tipoPedido === 'LOCAL'
                  ? `🍽️ CONSUMO EN MESA (${numeroMesa || 'SALÓN'})`
                  : '🛍️ PARA LLEVAR'}
              </p>
            </div>

            {cliente && (
              <div className="ticket-client-box">
                <p><strong>Cliente:</strong> {cliente.nombre} {cliente.apellido || ''}</p>
                {cliente.documento && <p><strong>RFC/Doc:</strong> {cliente.documento}</p>}
                {cliente.telefono && <p><strong>Tel:</strong> {cliente.telefono}</p>}
                {(cliente.direccion || direccionEntrega) && (
                  <p><strong>Dir:</strong> {cliente.direccion || direccionEntrega}</p>
                )}
              </div>
            )}

            <div className="ticket-divider-dashes" />

            <table className="ticket-items-table">
              <thead>
                <tr>
                  <th>Cant.</th>
                  <th>Platillo / Bebida</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {listaItems.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ verticalAlign: 'top' }}>{item.quantity}x</td>
                    <td>
                      <div>{item.name}</div>
                      <small style={{ color: '#6b7280' }}>${item.price.toFixed(2)} c/u</small>
                    </td>
                    <td style={{ textAlign: 'right', verticalAlign: 'top', fontWeight: 'bold' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="ticket-divider-dashes" />

            <div className="ticket-totals-section">
              <div className="ticket-tot-row">
                <span>Subtotal:</span>
                <span>${subtotalFinal.toFixed(2)}</span>
              </div>
              <div className="ticket-tot-row">
                <span>IVA (16%):</span>
                <span>${ivaFinal.toFixed(2)}</span>
              </div>
              <div className="ticket-tot-row ticket-grand-total">
                <span>TOTAL PAGADO:</span>
                <span>${totalFinal.toFixed(2)}</span>
              </div>
              <div className="ticket-tot-row">
                <span>Pago con:</span>
                <span>{metodoPago}</span>
              </div>
            </div>

            <div className="ticket-divider-dashes" />

            <div className="ticket-footer-msg">
              <p>¡Gracias por su preferencia!</p>
              <p>Conserve su ticket para aclaraciones o facturación.</p>
              <p style={{ fontSize: '0.68rem', marginTop: '4px' }}>www.nocturnagrill.com</p>
            </div>
          </div>
        )}

        {/* Botón inferior para comenzar nueva venta */}
        <div className="invoice-bottom-actions no-print">
          <button
            type="button"
            className="btn-add-product"
            style={{ width: '100%', justifyContent: 'center', padding: '0.85rem' }}
            onClick={() => {
              onClose()
              if (onNuevaVenta) onNuevaVenta()
            }}
          >
            <CheckCircle2 size={18} />
            <span>Finalizar y Comenzar Nueva Venta</span>
          </button>
        </div>
      </div>
    </div>
  )
}
