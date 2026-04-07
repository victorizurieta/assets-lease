'use client'

import { useState, useEffect } from 'react'

interface Notificacion {
  id: string
  tipo: string
  destino: string
  asunto?: string
  mensaje: string
  estado: string
  error?: string
  createdAt: string
  enviadaAt?: string
  cliente?: { nombre: string }
}

export default function NotificacionesModule() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [emailConfigured, setEmailConfigured] = useState(false)
  const [sending, setSending] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    to: '',
    subject: '',
    message: ''
  })

  useEffect(() => {
    fetchNotificaciones()
    checkEmailConfig()
  }, [])

  const fetchNotificaciones = async () => {
    try {
      const response = await fetch('/api/notificaciones')
      const data = await response.json()
      setNotificaciones(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkEmailConfig = async () => {
    try {
      const response = await fetch('/api/email')
      const data = await response.json()
      setEmailConfigured(data.configured)
    } catch (error) {
      console.error('Error checking email config:', error)
    }
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.to,
          subject: formData.subject,
          html: `<div style="font-family: Arial, sans-serif; padding: 20px;">${formData.message.replace(/\n/g, '<br>')}</div>`,
          text: formData.message
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('Email enviado correctamente')
        setShowModal(false)
        setFormData({ to: '', subject: '', message: '' })
        fetchNotificaciones()
      } else {
        alert('Error: ' + result.error)
      }
    } catch (error) {
      console.error('Error sending email:', error)
      alert('Error al enviar email')
    } finally {
      setSending(false)
    }
  }

  const handleVerificarRenovaciones = async () => {
    if (!confirm('¿Desea enviar notificaciones de renovaciones próximas?')) return
    
    setSending(true)
    try {
      const response = await fetch('/api/notificaciones/verificar', {
        method: 'POST'
      })
      const result = await response.json()
      
      alert(`Proceso completado: ${result.enviadas} notificaciones enviadas, ${result.errores} errores`)
      fetchNotificaciones()
    } catch (error) {
      console.error('Error:', error)
      alert('Error al verificar renovaciones')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTipoBadge = (tipo: string) => {
    if (tipo === 'email') {
      return <span className="badge bg-primary"><i className="bi bi-envelope me-1"></i>Email</span>
    }
    return <span className="badge bg-success"><i className="bi bi-whatsapp me-1"></i>WhatsApp</span>
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'enviada':
        return <span className="badge bg-success">Enviada</span>
      case 'pendiente':
        return <span className="badge bg-warning text-dark">Pendiente</span>
      case 'fallida':
        return <span className="badge bg-danger">Fallida</span>
      default:
        return <span className="badge bg-secondary">{estado}</span>
    }
  }

  const stats = {
    total: notificaciones.length,
    enviadas: notificaciones.filter(n => n.estado === 'enviada').length,
    pendientes: notificaciones.filter(n => n.estado === 'pendiente').length,
    fallidas: notificaciones.filter(n => n.estado === 'fallida').length,
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-primary bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-bell fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.total}</h3>
              <small className="opacity-75">Total</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-success bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-check-circle fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.enviadas}</h3>
              <small className="opacity-75">Enviadas</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-warning bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-clock fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.pendientes}</h3>
              <small className="opacity-75">Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-danger bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-x-circle fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.fallidas}</h3>
              <small className="opacity-75">Fallidas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Email Config Alert */}
      {!emailConfigured && (
        <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          <div>
            <strong>Email no configurado.</strong> Vaya a <a href="#" onClick={() => window.location.reload()}>Administración</a> para configurar la API Key de Resend.
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="d-flex flex-column flex-md-row gap-3 justify-content-between mb-4">
        <div>
          <button 
            className="btn btn-outline-primary me-2"
            onClick={handleVerificarRenovaciones}
            disabled={sending || !emailConfigured}
          >
            <i className="bi bi-calendar-check me-2"></i>
            Verificar Renovaciones
          </button>
        </div>
        <button 
          className="btn btn-success"
          onClick={() => setShowModal(true)}
          disabled={!emailConfigured}
        >
          <i className="bi bi-send me-2"></i>
          Enviar Email de Prueba
        </button>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">
            <i className="bi bi-list-ul text-success me-2"></i>
            Historial de Notificaciones
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Fecha</th>
                  <th className="border-0 py-3">Tipo</th>
                  <th className="border-0 py-3">Destino</th>
                  <th className="border-0 py-3">Asunto</th>
                  <th className="border-0 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : notificaciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      No hay notificaciones
                    </td>
                  </tr>
                ) : (
                  notificaciones.map((notif) => (
                    <tr key={notif.id}>
                      <td className="px-4">
                        <small>{formatDate(notif.createdAt)}</small>
                      </td>
                      <td>{getTipoBadge(notif.tipo)}</td>
                      <td>
                        <small>{notif.destino}</small>
                        {notif.cliente && (
                          <small className="text-muted d-block">{notif.cliente.nombre}</small>
                        )}
                      </td>
                      <td>
                        <small>{notif.asunto || notif.mensaje.substring(0, 50)}...</small>
                      </td>
                      <td>{getEstadoBadge(notif.estado)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Enviar Email */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-envelope me-2"></i>
                  Enviar Email de Prueba
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSendEmail}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Para</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                      placeholder="correo@ejemplo.com"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Asunto</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Asunto del email"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Mensaje</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Escribe tu mensaje..."
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success" disabled={sending}>
                    {sending ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Enviar
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}