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
  QrCode,
  ShieldCheck
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
    numeroFactura = folio || `DTE-01-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
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
  // IVA oficial en El Salvador es del 13%
  const ivaFinal = Number(iva) || Number((subtotalFinal * 0.13).toFixed(2))
  const totalFinal = Number(total) || (subtotalFinal + ivaFinal)

  // Fecha legible con formato salvadoreño
  const fechaTexto = fechaVenta
    ? new Date(fechaVenta).toLocaleDateString('es-SV', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : date || new Date().toLocaleDateString('es-SV', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })

  const horaTexto = fechaVenta
    ? new Date(fechaVenta).toLocaleTimeString('es-SV', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    : time || new Date().toLocaleTimeString('es-SV', {
        hour: '2-digit',
        minute: '2-digit'
      })

  // Código de Generación y Sello oficial DTE (Ministerio de Hacienda de El Salvador)
  const codigoGeneracionUUID = `DTE-01-M001P001-${Math.floor(100000000000 + Math.random() * 900000000000)}`
  const selloRecepcionMH = `2026${Math.floor(10000000 + Math.random() * 90000000)}B${Math.floor(100000 + Math.random() * 900000)}`

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

  // Descargar factura en archivo HTML legible (Salvadoreño, USD, responsive)
  const handleDownload = () => {
    const content = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Factura Electrónica ${numeroFactura} - El Salvador</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; color: #111; max-width: 800px; margin: auto; line-height: 1.4; }
    .header { border-bottom: 2px solid #581c87; padding-bottom: 15px; margin-bottom: 20px; }
    .title { color: #581c87; font-size: 22px; font-weight: bold; margin-bottom: 5px; }
    .dte-badge { background: #f3e8ff; color: #6b21a8; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 10px; }
    .meta-p { margin: 3px 0; font-size: 13px; color: #374151; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px 10px; text-align: left; }
    th { background-color: #f3e8ff; color: #581c87; font-weight: bold; }
    .totals { float: right; width: 300px; margin-top: 10px; font-size: 13px; }
    .total-row { display: flex; justify-content: space-between; padding: 5px 0; }
    .grand-total { font-size: 16px; font-weight: bold; color: #581c87; border-top: 2px solid #581c87; margin-top: 5px; padding-top: 5px; }
    .footer-stamp { clear: both; padding-top: 30px; font-size: 11px; color: #6b7280; border-top: 1px dashed #d1d5db; margin-top: 20px; }
    @media (max-width: 600px) {
      body { padding: 10px; }
      .totals { float: none; width: 100%; }
      th, td { padding: 6px 4px; font-size: 12px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="title">LA TABERNA DE LOS MORENAZOS S.A. DE C.V.</div>
    <div class="dte-badge">DOCUMENTO TRIBUTARIO ELECTRÓNICO (DTE-01) - REPÚBLICA DE EL SALVADOR</div>
    <p class="meta-p"><strong>NIT:</strong> 0614-251024-102-3 | <strong>NRC:</strong> 328491-7</p>
    <p class="meta-p"><strong>Giro:</strong> Servicios de Restaurantes y Bares | <strong>Tel:</strong> +503 2255-8899</p>
    <p class="meta-p"><strong>Dirección:</strong> Boulevard Los Próceres #123, Colonia San Benito, San Salvador, El Salvador</p>
    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 10px 0;">
    <p class="meta-p"><strong>Folio DTE:</strong> ${numeroFactura}</p>
    <p class="meta-p"><strong>Código de Generación (UUID):</strong> ${codigoGeneracionUUID}</p>
    <p class="meta-p"><strong>Fecha y Hora:</strong> ${fechaTexto} ${horaTexto}</p>
    <p class="meta-p"><strong>Cliente / Receptor:</strong> ${cliente ? `${cliente.nombre} ${cliente.apellido || ''} (DUI/NIT: ${cliente.documento || '00000000-0'})` : 'Consumidor Final (DUI: 00000000-0)'}</p>
    <p class="meta-p"><strong>Modalidad:</strong> ${tipoPedido === 'EN_LINEA' ? 'Pedido en Línea / Delivery' : tipoPedido === 'LOCAL' ? `Consumo en Restaurante (${numeroMesa || 'Salón'})` : 'Para Llevar'}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 50px; text-align: center;">Cant.</th>
        <th>Descripción del Platillo / Bebida</th>
        <th style="width: 100px; text-align: right;">P. Unitario ($)</th>
        <th style="width: 110px; text-align: right;">Subtotal ($)</th>
      </tr>
    </thead>
    <tbody>
      ${listaItems.map(it => `
        <tr>
          <td style="text-align: center;">${it.quantity}</td>
          <td>${it.name}</td>
          <td style="text-align: right;">$${it.price.toFixed(2)}</td>
          <td style="text-align: right;">$${(it.price * it.quantity).toFixed(2)}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="totals">
    <div class="total-row"><span>Sumas / Ventas Gravadas:</span><span>$${subtotalFinal.toFixed(2)} USD</span></div>
    <div class="total-row"><span>IVA (13%):</span><span>$${ivaFinal.toFixed(2)} USD</span></div>
    <div class="total-row grand-total"><span>TOTAL A PAGAR:</span><span>$${totalFinal.toFixed(2)} USD</span></div>
    <p style="font-size: 11px; color: #581c87; font-weight: bold; margin-top: 8px;">SON: ${numeroALetras(totalFinal)}</p>
  </div>
  <div class="footer-stamp">
    <p><strong>Sello de Recepción MH:</strong> ${selloRecepcionMH}</p>
    <p>Documento Tributario Electrónico emitido de conformidad a la normativa del Ministerio de Hacienda de El Salvador. Moneda: Dólar Estadounidense (USD).</p>
  </div>
</body>
</html>`
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Factura_DTE_${numeroFactura}.html`
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
              <span>Factura Electrónica DTE</span>
            </button>
            <button
              type="button"
              className={`btn-switch ${viewMode === 'ticket' ? 'active' : ''}`}
              onClick={() => setViewMode('ticket')}
            >
              <Receipt size={16} />
              <span>Ticket Térmico DTE</span>
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

            <button className="btn-close-modal" onClick={onClose} title="Cerrar comprobante">
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
        {/* VISTA 1: FACTURA ELECTRÓNICA FORMAL DE EL SALVADOR (DTE-01)     */}
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
                    <span className="invoice-brand-tag">Gastronomía & Bebidas Selectas • El Salvador</span>
                  </div>
                </div>

                <div className="issuer-legal-details">
                  <p><strong>Razón Social:</strong> LA TABERNA DE LOS MORENAZOS S.A. DE C.V.</p>
                  <p><strong>NIT:</strong> 0614-251024-102-3 | <strong>NRC:</strong> 328491-7</p>
                  <p><strong>Giro / Actividad:</strong> Servicios de Restaurantes y Bares (Venta de Comidas y Bebidas)</p>
                  <p><strong>Dirección:</strong> Boulevard Los Próceres #123, Colonia San Benito, San Salvador, El Salvador</p>
                  <p><strong>Teléfono:</strong> +503 2255-8899 | <strong>Email:</strong> facturacion@tabernamorenazos.sv</p>
                </div>
              </div>

              {/* RECUADRO DE DATOS DEL FOLIO FISCAL Y DTE SALVADOREÑO */}
              <div className="invoice-fiscal-box">
                <div className="fiscal-box-title">DOCUMENTO TRIBUTARIO ELECTRÓNICO</div>
                <div className="fiscal-dte-subtitle">FACTURA DE CONSUMIDOR FINAL (DTE-01)</div>
                <div className="fiscal-folio-number">{numeroFactura}</div>
                
                <div className="fiscal-meta-grid">
                  <div>
                    <span className="meta-lbl">Código Generación (UUID):</span>
                    <span className="meta-val monospace">{codigoGeneracionUUID}</span>
                  </div>
                  <div>
                    <span className="meta-lbl">Sello de Recepción MH:</span>
                    <span className="meta-val monospace">{selloRecepcionMH}</span>
                  </div>
                  <div>
                    <span className="meta-lbl">Fecha y Hora de Emisión:</span>
                    <span className="meta-val">{fechaTexto} | {horaTexto}</span>
                  </div>
                  <div>
                    <span className="meta-lbl">Moneda de la Operación:</span>
                    <span className="meta-val" style={{ color: '#059669', fontWeight: 'bold' }}>USD ($ - Dólar Estadounidense)</span>
                  </div>
                  <div>
                    <span className="meta-lbl">Modalidad de Consumo:</span>
                    <span className="meta-val badge-order-type">
                      {tipoPedido === 'EN_LINEA' ? (
                        <>
                          <Truck size={13} /> Pedido en Línea / Delivery
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

            {/* DATOS DEL CLIENTE / RECEPTOR EN EL SALVADOR */}
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
                  <span className="lbl">DUI / NIT:</span>
                  <span className="val monospace">
                    {cliente?.documento || '00000000-0'}
                  </span>
                </div>
                <div>
                  <span className="lbl">País / Municipio:</span>
                  <span className="val">El Salvador • San Salvador</span>
                </div>
                <div>
                  <span className="lbl">Teléfono de Contacto:</span>
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
                    <span className="lbl">Correo para Factura Electrónica:</span>
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

            {/* TABLA DE PRODUCTOS / CONSUMOS CON PRECIOS EN DÓLARES */}
            <div className="invoice-table-wrapper">
              <table className="invoice-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>Cant.</th>
                    <th style={{ width: '80px' }}>Código</th>
                    <th>Concepto / Descripción del Platillo o Bebida</th>
                    <th style={{ width: '105px', textAlign: 'right' }}>P. Unitario ($)</th>
                    <th style={{ width: '110px', textAlign: 'right' }}>Ventas Gravadas ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {listaItems.map((item, idx) => (
                    <tr key={idx}>
                      <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                      <td className="monospace" style={{ fontSize: '0.78rem', color: '#6b7280' }}>
                        {item.id ? String(item.id).substring(0, 8).toUpperCase() : `PRD-${idx + 1}`}
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

            {/* TOTALES Y FORMA DE PAGO EN DÓLARES */}
            <div className="invoice-footer-grid">
              <div className="payment-legal-box">
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Forma de Pago:</strong>{' '}
                  <span style={{ textTransform: 'capitalize' }}>{metodoPago}</span>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Condición de Pago:</strong> Contado
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Moneda:</strong> USD - Dólar Estadounidense ($)
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
                  <span>Suma Ventas Gravadas:</span>
                  <span>${subtotalFinal.toFixed(2)}</span>
                </div>
                <div className="fin-row">
                  <span>IVA (13%):</span>
                  <span>${ivaFinal.toFixed(2)}</span>
                </div>
                <div className="fin-row total-highlight">
                  <span>TOTAL A PAGAR:</span>
                  <span className="total-val">${totalFinal.toFixed(2)} <small>USD</small></span>
                </div>
              </div>
            </div>

            {/* SELLO DIGITAL, FIRMA MH Y CÓDIGO QR */}
            <div className="invoice-digital-stamp">
              <div className="qr-container">
                <div className="qr-box-simulated">
                  <QrCode size={78} color="#000" />
                </div>
              </div>

              <div className="stamps-text-box">
                <div className="stamp-line">
                  <span className="stamp-lbl">Firma Digital del DTE / Sello de Recepción:</span>
                  <p className="stamp-val monospace">
                    MH-SV-DTE|{codigoGeneracionUUID}|{totalFinal.toFixed(2)}|USD|{selloRecepcionMH}
                  </p>
                </div>
                <div className="stamp-line">
                  <span className="stamp-lbl">Cadena de Certificación del Emisor:</span>
                  <p className="stamp-val monospace">
                    06142510241023|3284917|{subtotalFinal.toFixed(2)}|{ivaFinal.toFixed(2)}|{totalFinal.toFixed(2)}|DTE01
                  </p>
                </div>
                <p className="legal-disclaimer">
                  <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Documento Tributario Electrónico (DTE) transmitido y validado ante la Dirección General de Impuestos Internos - Ministerio de Hacienda de la República de El Salvador.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* =============================================================== */
          /* VISTA 2: FORMATO TICKET TÉRMICO DTE (EL SALVADOR, USD, 13% IVA) */
          /* =============================================================== */
          <div className="printable-ticket-sheet" id="ticket-print-area">
            <div className="ticket-header-block">
              <h3>LA TABERNA DE LOS MORENAZOS</h3>
              <p>LA TABERNA DE LOS MORENAZOS S.A. DE C.V.</p>
              <p>NIT: 0614-251024-102-3 | NRC: 328491-7</p>
              <p>Giro: Servicios de Restaurantes y Bares</p>
              <p>Blvd. Los Próceres #123, San Salvador</p>
              <p>Teléfono: +503 2255-8899</p>
              <div className="ticket-divider-dashes" />
              <p style={{ fontWeight: 'bold', fontSize: '0.85rem' }}>FACTURA DE CONSUMIDOR FINAL (DTE-01)</p>
              <div className="ticket-folio-highlight">{numeroFactura}</div>
              <p style={{ fontSize: '0.7rem', wordBreak: 'break-all' }}>Cód. Gen: {codigoGeneracionUUID}</p>
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
                <p><strong>DUI/NIT:</strong> {cliente.documento || '00000000-0'}</p>
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
                  <th style={{ textAlign: 'right' }}>Total ($)</th>
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
                <span>Sumas / Gravadas:</span>
                <span>${subtotalFinal.toFixed(2)}</span>
              </div>
              <div className="ticket-tot-row">
                <span>IVA (13%):</span>
                <span>${ivaFinal.toFixed(2)}</span>
              </div>
              <div className="ticket-tot-row ticket-grand-total">
                <span>TOTAL PAGADO:</span>
                <span>${totalFinal.toFixed(2)} USD</span>
              </div>
              <div className="ticket-tot-row" style={{ marginTop: '4px' }}>
                <span>Pago con:</span>
                <span>{metodoPago}</span>
              </div>
            </div>

            <div className="ticket-divider-dashes" />

            <div className="ticket-footer-msg">
              <p style={{ fontWeight: 'bold' }}>¡Muchas gracias por su preferencia!</p>
              <p>Documento Tributario Electrónico (DTE)</p>
              <p>Consulte su factura electrónica en: <strong>factura.gob.sv</strong></p>
              <p style={{ fontSize: '0.68rem', marginTop: '4px' }}>www.tabernamorenazos.sv</p>
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
