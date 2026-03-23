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
}

export default function NotificacionesModule() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [filterTipo, setFilterTipo] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    tipo: 'email',
    destino: '',
    asunto: '',
    mensaje: '',
  })

  useEffect(() => {
    fetchNotificaciones()
  }, [])

  const fetchNotificaciones = async () => {
    try {
      const response = await fetch('/api/notificaciones')
      const data = await response.json()
      setNotificaciones(data)
    } catch (error) {
      console.error('Error fetching notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/notificaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      fetchNotificaciones()
      setShowModal(false)
      setFormData({ tipo: 'email', destino: '', asunto: '', mensaje: '' })
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  const filteredNotificaciones = notificaciones.filter((n) => {
    const matchesSearch = 
      n.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.mensaje.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === 'todos' || n.estado === filterEstado
    const matchesTipo = filterTipo === 'todos' || n.tipo === filterTipo
    return matchesSearch && matchesEstado && matchesTipo
  })

  const stats = {
    total: notificaciones.length,
    enviadas: notificaciones.filter(n => n.estado === 'enviada').length,
    pendientes: notificaciones.filter(n => n.estado === 'pendiente').length,
    fallidas: notificaciones.filter(n => n.estado === 'fallida').length,
  }

  const getTipoBadge = (tipo: string) => {
    return tipo === 'email' 
      ? <span className="badge bg-primary bg-opacity-10 text-primary"><i className="bi bi-envelope me-1"></i>Email</span>
      : <span className="badge bg-success bg-opacity-10 text-success"><i className="bi bi-whatsapp me-1"></i>WhatsApp</span>
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'enviada':
        return <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Enviada</span>
      case 'pendiente':
        return <span className="badge bg-warning text-dark"><i className="bi bi-clock me-1"></i>Pendiente</span>
      case 'fallida':
        return <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i>Fallida</span>
      default:
        return <span className="badge bg-secondary">{estado}</span>
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PA', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <div>
      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-dark text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-bell fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.total}</h4>
              <small className="opacity-75">Total</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-success text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-check-circle fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.enviadas}</h4>
              <small className="opacity-75">Enviadas</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-warning text-dark h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-clock fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.pendientes}</h4>
              <small className="opacity-75">Pendientes</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-danger text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-x-circle fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.fallidas}</h4>
              <small className="opacity-75">Fallidas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex flex-column flex-md-row gap-3 justify-content-between mb-4">
        <div className="d-flex gap-2 flex-wrap">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por destino o mensaje..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="form-select" 
            style={{ maxWidth: '130px' }}
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="todos">Estado</option>
            <option value="enviada">Enviadas</option>
            <option value="pendiente">Pendientes</option>
            <option value="fallida">Fallidas</option>
          </select>
          <select 
            className="form-select" 
            style={{ maxWidth: '130px' }}
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="todos">Tipo</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
        </div>
        <button 
          className="btn btn-success"
          onClick={() => setShowModal(true)}
        >
          <i className="bi bi-send me-2"></i>
          Nueva Notificación
        </button>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Fecha</th>
                  <th className="border-0 py-3">Tipo</th>
                  <th className="border-0 py-3">Destino</th>
                  <th className="border-0 py-3">Mensaje</th>
                  <th className="border-0 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      Cargando notificaciones...
                    </td>
                  </tr>
                ) : filteredNotificaciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      No se encontraron notificaciones
                    </td>
                  </tr>
                ) : (
                  filteredNotificaciones.map((notificacion) => (
                    <tr key={notificacion.id}>
                      <td className="px-4">
                        <small className="text-muted">{formatDate(notificacion.createdAt)}</small>
                      </td>
                      <td>{getTipoBadge(notificacion.tipo)}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className={`bi ${notificacion.tipo === 'email' ? 'bi-envelope text-primary' : 'bi-whatsapp text-success'} me-2`}></i>
                          <code>{notificacion.destino}</code>
                        </div>
                      </td>
                      <td style={{ maxWidth: '250px' }}>
                        {notificacion.asunto && (
                          <p className="mb-0 fw-medium small truncate">{notificacion.asunto}</p>
                        )}
                        <p className="mb-0 small text-muted truncate">{notificacion.mensaje}</p>
                      </td>
                      <td>
                        <div>
                          {getEstadoBadge(notificacion.estado)}
                          {notificacion.error && (
                            <small className="d-block text-danger mt-1">{notificacion.error}</small>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nueva Notificación</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Tipo</label>
                      <select 
                        className="form-select"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      >
                        <option value="email">Email</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">
                        {formData.tipo === 'email' ? 'Correo Electrónico' : 'Número de WhatsApp'}
                      </label>
                      <input
                        type={formData.tipo === 'email' ? 'email' : 'text'}
                        className="form-control"
                        value={formData.destino}
                        onChange={(e) => setFormData({ ...formData, destino: e.target.value })}
                        required
                        placeholder={formData.tipo === 'email' ? 'correo@ejemplo.com' : '+507 1234-5678'}
                      />
                    </div>
                    {formData.tipo === 'email' && (
                      <div className="col-12">
                        <label className="form-label">Asunto</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.asunto}
                          onChange={(e) => setFormData({ ...formData, asunto: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label">Mensaje</label>
                      <textarea
                        className="form-control"
                        rows={4}
                        value={formData.mensaje}
                        onChange={(e) => setFormData({ ...formData, mensaje: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    <i className="bi bi-send me-2"></i>Enviar
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