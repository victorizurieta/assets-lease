'use client'

import { useState, useEffect } from 'react'

interface EquipoGPS {
  id: string
  imei: string
  marca?: string
  modelo?: string
  tipo?: string
  tecnologia?: string
  estado: string
  observaciones?: string
  createdAt: string
}

export default function EquiposModule() {
  const [equipos, setEquipos] = useState<EquipoGPS[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [editingEquipo, setEditingEquipo] = useState<EquipoGPS | null>(null)
  const [formData, setFormData] = useState({
    imei: '',
    marca: '',
    modelo: '',
    tipo: 'vehicular',
    tecnologia: '4G',
    estado: 'disponible',
    observaciones: '',
  })

  useEffect(() => {
    fetchEquipos()
  }, [])

  const fetchEquipos = async () => {
    try {
      const response = await fetch('/api/equipos')
      const data = await response.json()
      setEquipos(data)
    } catch (error) {
      console.error('Error fetching equipos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEquipo) {
        await fetch(`/api/equipos/${editingEquipo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/equipos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      fetchEquipos()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Error saving equipo:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este equipo?')) {
      try {
        await fetch(`/api/equipos/${id}`, { method: 'DELETE' })
        fetchEquipos()
      } catch (error) {
        console.error('Error deleting equipo:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      imei: '',
      marca: '',
      modelo: '',
      tipo: 'vehicular',
      tecnologia: '4G',
      estado: 'disponible',
      observaciones: '',
    })
    setEditingEquipo(null)
  }

  const openEditModal = (equipo: EquipoGPS) => {
    setEditingEquipo(equipo)
    setFormData({
      imei: equipo.imei,
      marca: equipo.marca || '',
      modelo: equipo.modelo || '',
      tipo: equipo.tipo || 'vehicular',
      tecnologia: equipo.tecnologia || '4G',
      estado: equipo.estado,
      observaciones: equipo.observaciones || '',
    })
    setShowModal(true)
  }

  const filteredEquipos = equipos.filter((e) => {
    const matchesSearch = e.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.marca?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.modelo?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesEstado = filterEstado === 'todos' || e.estado === filterEstado
    return matchesSearch && matchesEstado
  })

  const stats = {
    total: equipos.length,
    disponibles: equipos.filter(e => e.estado === 'disponible').length,
    asignados: equipos.filter(e => e.estado === 'asignado').length,
    baja: equipos.filter(e => e.estado === 'baja').length,
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Disponible</span>
      case 'asignado':
        return <span className="badge bg-primary"><i className="bi bi-clock me-1"></i>Asignado</span>
      case 'baja':
        return <span className="badge bg-danger"><i className="bi bi-x-circle me-1"></i>Baja</span>
      default:
        return <span className="badge bg-secondary">{estado}</span>
    }
  }

  return (
    <div>
      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-dark text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-broadcast fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.total}</h4>
              <small className="opacity-75">Total</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-success text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-check-circle fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.disponibles}</h4>
              <small className="opacity-75">Disponibles</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-primary text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-clock fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.asignados}</h4>
              <small className="opacity-75">Asignados</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-danger text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-x-circle fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.baja}</h4>
              <small className="opacity-75">De Baja</small>
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
              placeholder="Buscar por IMEI, marca..."
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
            <option value="disponible">Disponibles</option>
            <option value="asignado">Asignados</option>
            <option value="baja">De Baja</option>
          </select>
        </div>
        <button 
          className="btn btn-success"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nuevo Equipo
        </button>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">IMEI</th>
                  <th className="border-0 py-3">Marca / Modelo</th>
                  <th className="border-0 py-3">Tipo</th>
                  <th className="border-0 py-3">Tecnología</th>
                  <th className="border-0 py-3">Estado</th>
                  <th className="border-0 py-3 text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      Cargando equipos...
                    </td>
                  </tr>
                ) : filteredEquipos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No se encontraron equipos
                    </td>
                  </tr>
                ) : (
                  filteredEquipos.map((equipo) => (
                    <tr key={equipo.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-light rounded-3 p-2 me-3">
                            <i className="bi bi-broadcast text-success"></i>
                          </div>
                          <code className="fw-medium">{equipo.imei}</code>
                        </div>
                      </td>
                      <td>
                        <p className="mb-0 fw-medium">{equipo.marca || '-'}</p>
                        <small className="text-muted">{equipo.modelo || '-'}</small>
                      </td>
                      <td className="text-capitalize">{equipo.tipo || '-'}</td>
                      <td><span className="badge bg-secondary">{equipo.tecnologia || '-'}</span></td>
                      <td>{getEstadoBadge(equipo.estado)}</td>
                      <td className="text-end pe-4">
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEditModal(equipo)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(equipo.id)}
                        >
                          <i className="bi bi-trash"></i>
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
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingEquipo ? 'Editar Equipo GPS' : 'Nuevo Equipo GPS'}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">IMEI *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.imei}
                        onChange={(e) => setFormData({ ...formData, imei: e.target.value })}
                        required
                        maxLength={15}
                        placeholder="15 dígitos"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Marca</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.marca}
                        onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                        placeholder="Teltonika, Suntech..."
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Modelo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.modelo}
                        onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                        placeholder="FMB120..."
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Tipo</label>
                      <select 
                        className="form-select"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      >
                        <option value="vehicular">Vehicular</option>
                        <option value="personal">Personal</option>
                        <option value="carga">Carga/Activos</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Tecnología</label>
                      <select 
                        className="form-select"
                        value={formData.tecnologia}
                        onChange={(e) => setFormData({ ...formData, tecnologia: e.target.value })}
                      >
                        <option value="2G">2G</option>
                        <option value="3G">3G</option>
                        <option value="4G">4G</option>
                        <option value="LTE">LTE-M</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Estado</label>
                      <select 
                        className="form-select"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      >
                        <option value="disponible">Disponible</option>
                        <option value="asignado">Asignado</option>
                        <option value="baja">De Baja</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Observaciones</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        value={formData.observaciones}
                        onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    {editingEquipo ? 'Actualizar' : 'Guardar'}
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