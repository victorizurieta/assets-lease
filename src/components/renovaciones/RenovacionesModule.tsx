'use client'

import { useState, useEffect } from 'react'

interface Renovacion {
  id: string
  clienteId: string
  cliente?: { id: string; nombre: string }
  unidadId: string
  unidad?: { id: string; placa: string }
  fechaInicio: string
  fechaVencimiento: string
  estado: string
  notificado: boolean
  resultado?: string
  fechaResultado?: string
  observaciones?: string
  createdAt: string
}

export default function RenovacionesModule() {
  const [renovaciones, setRenovaciones] = useState<Renovacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [selectedRenovacion, setSelectedRenovacion] = useState<Renovacion | null>(null)
  const [observaciones, setObservaciones] = useState('')

  useEffect(() => {
    fetchRenovaciones()
  }, [])

  const fetchRenovaciones = async () => {
    try {
      const response = await fetch('/api/renovaciones')
      const data = await response.json()
      setRenovaciones(data)
    } catch (error) {
      console.error('Error fetching renovaciones:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleProcesar = async (accion: 'renovado' | 'baja') => {
    if (!selectedRenovacion) return
    try {
      await fetch(`/api/renovaciones/${selectedRenovacion.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultado: accion,
          observaciones,
          fechaResultado: new Date().toISOString(),
          estado: accion === 'renovado' ? 'vigente' : 'vencida',
        }),
      })
      fetchRenovaciones()
      setShowModal(false)
      setSelectedRenovacion(null)
      setObservaciones('')
    } catch (error) {
      console.error('Error procesando renovación:', error)
    }
  }

  const filteredRenovaciones = renovaciones.filter((r) => {
    const matchesSearch = 
      r.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.unidad?.placa.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === 'todos' || r.estado === filterEstado
    return matchesSearch && matchesEstado
  })

  const stats = {
    total: renovaciones.length,
    vigentes: renovaciones.filter(r => r.estado === 'vigente').length,
    porVencer: renovaciones.filter(r => r.estado === 'por_vencer').length,
    vencidas: renovaciones.filter(r => r.estado === 'vencida').length,
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Vigente</span>
      case 'por_vencer':
        return <span className="badge bg-warning text-dark"><i className="bi bi-exclamation-triangle me-1"></i>Por Vencer</span>
      case 'vencida':
        return <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i>Vencida</span>
      default:
        return <span className="badge bg-secondary">{estado}</span>
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-PA', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div>
      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-dark text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-calendar-check fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.total}</h4>
              <small className="opacity-75">Total</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-success text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-check-circle fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.vigentes}</h4>
              <small className="opacity-75">Vigentes</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-warning text-dark h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-exclamation-triangle fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.porVencer}</h4>
              <small className="opacity-75">Por Vencer</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-danger text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-x-circle fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.vencidas}</h4>
              <small className="opacity-75">Vencidas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="d-flex flex-column flex-md-row gap-3 justify-content-between mb-4">
        <div className="d-flex gap-2">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por cliente o placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="form-select" 
            style={{ maxWidth: '150px' }}
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="vigente">Vigentes</option>
            <option value="por_vencer">Por Vencer</option>
            <option value="vencida">Vencidas</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Cliente</th>
                  <th className="border-0 py-3">Unidad</th>
                  <th className="border-0 py-3">Vencimiento</th>
                  <th className="border-0 py-3">Estado</th>
                  <th className="border-0 py-3 text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      Cargando renovaciones...
                    </td>
                  </tr>
                ) : filteredRenovaciones.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      No se encontraron renovaciones
                    </td>
                  </tr>
                ) : (
                  filteredRenovaciones.map((renovacion) => (
                    <tr key={renovacion.id}>
                      <td className="px-4">
                        <div>
                          <p className="mb-0 fw-medium">{renovacion.cliente?.nombre}</p>
                          {renovacion.notificado && (
                            <small className="text-primary">
                              <i className="bi bi-bell me-1"></i>Notificado
                            </small>
                          )}
                        </div>
                      </td>
                      <td>
                        <code>{renovacion.unidad?.placa}</code>
                        {renovacion.resultado && (
                          <span className={`badge ms-2 ${renovacion.resultado === 'renovado' ? 'bg-success' : 'bg-danger'}`}>
                            {renovacion.resultado === 'renovado' ? 'Renovado' : 'Baja'}
                          </span>
                        )}
                      </td>
                      <td>
                        <div>
                          <p className="mb-0 fw-medium">{formatDate(renovacion.fechaVencimiento)}</p>
                          <small className="text-muted">Desde {formatDate(renovacion.fechaInicio)}</small>
                        </div>
                      </td>
                      <td>{getEstadoBadge(renovacion.estado)}</td>
                      <td className="text-end pe-4">
                        <button 
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            setSelectedRenovacion(renovacion)
                            setObservaciones(renovacion.observaciones || '')
                            setShowModal(true)
                          }}
                        >
                          Ver Detalle
                        </button>
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
      {showModal && selectedRenovacion && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalle de Renovación</h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setSelectedRenovacion(null); }}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label text-muted small">Cliente</label>
                    <p className="fw-medium mb-0">{selectedRenovacion.cliente?.nombre}</p>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small">Unidad</label>
                    <p className="fw-medium mb-0"><code>{selectedRenovacion.unidad?.placa}</code></p>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small">Fecha Inicio</label>
                    <p className="fw-medium mb-0">{formatDate(selectedRenovacion.fechaInicio)}</p>
                  </div>
                  <div className="col-6">
                    <label className="form-label text-muted small">Fecha Vencimiento</label>
                    <p className="fw-medium mb-0">{formatDate(selectedRenovacion.fechaVencimiento)}</p>
                  </div>
                  <div className="col-12">
                    <label className="form-label text-muted small">Estado</label>
                    <div>{getEstadoBadge(selectedRenovacion.estado)}</div>
                  </div>
                </div>

                {!selectedRenovacion.resultado && selectedRenovacion.estado !== 'vigente' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Observaciones</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        placeholder="Notas sobre la renovación..."
                      ></textarea>
                    </div>
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-success flex-fill"
                        onClick={() => handleProcesar('renovado')}
                      >
                        <i className="bi bi-check-circle me-2"></i>Renovar
                      </button>
                      <button 
                        className="btn btn-danger flex-fill"
                        onClick={() => handleProcesar('baja')}
                      >
                        <i className="bi bi-x-circle me-2"></i>Dar de Baja
                      </button>
                    </div>
                  </>
                )}

                {selectedRenovacion.resultado && (
                  <div className="bg-light rounded-3 p-3">
                    <label className="form-label text-muted small">Resultado</label>
                    <div className="d-flex align-items-center gap-2">
                      <span className={`badge ${selectedRenovacion.resultado === 'renovado' ? 'bg-success' : 'bg-danger'}`}>
                        {selectedRenovacion.resultado === 'renovado' ? 'Renovado' : 'Dado de Baja'}
                      </span>
                      {selectedRenovacion.fechaResultado && (
                        <small className="text-muted">el {formatDate(selectedRenovacion.fechaResultado)}</small>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}