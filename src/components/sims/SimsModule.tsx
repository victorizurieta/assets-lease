'use client'

import { useState, useEffect } from 'react'

interface SIMCard {
  id: string
  numeroSim: string
  operador?: string
  tipo?: string
  plan?: string
  estado: string
  observaciones?: string
  createdAt: string
}

export default function SimsModule() {
  const [sims, setSims] = useState<SIMCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEstado, setFilterEstado] = useState('todos')
  const [showModal, setShowModal] = useState(false)
  const [editingSim, setEditingSim] = useState<SIMCard | null>(null)
  const [formData, setFormData] = useState({
    numeroSim: '',
    operador: '',
    tipo: 'prepago',
    plan: '',
    estado: 'disponible',
    observaciones: '',
  })

  useEffect(() => {
    fetchSims()
  }, [])

  const fetchSims = async () => {
    try {
      const response = await fetch('/api/sims')
      const data = await response.json()
      setSims(data)
    } catch (error) {
      console.error('Error fetching SIMs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingSim) {
        await fetch(`/api/sims/${editingSim.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/sims', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      fetchSims()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Error saving SIM:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta SIM Card?')) {
      try {
        await fetch(`/api/sims/${id}`, { method: 'DELETE' })
        fetchSims()
      } catch (error) {
        console.error('Error deleting SIM:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      numeroSim: '',
      operador: '',
      tipo: 'prepago',
      plan: '',
      estado: 'disponible',
      observaciones: '',
    })
    setEditingSim(null)
  }

  const openEditModal = (sim: SIMCard) => {
    setEditingSim(sim)
    setFormData({
      numeroSim: sim.numeroSim,
      operador: sim.operador || '',
      tipo: sim.tipo || 'prepago',
      plan: sim.plan || '',
      estado: sim.estado,
      observaciones: sim.observaciones || '',
    })
    setShowModal(true)
  }

  const filteredSims = sims.filter((s) => {
    const matchesSearch = s.numeroSim.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.operador?.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesEstado = filterEstado === 'todos' || s.estado === filterEstado
    return matchesSearch && matchesEstado
  })

  const stats = {
    total: sims.length,
    disponibles: sims.filter(s => s.estado === 'disponible').length,
    asignadas: sims.filter(s => s.estado === 'asignada').length,
    baja: sims.filter(s => s.estado === 'baja').length,
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'disponible':
        return <span className="badge bg-success"><i className="bi bi-check-circle me-1"></i>Disponible</span>
      case 'asignada':
        return <span className="badge bg-primary"><i className="bi bi-clock me-1"></i>Asignada</span>
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
              <i className="bi bi-sim fs-4 mb-2 d-block opacity-75"></i>
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
              <h4 className="mb-0 fw-bold">{stats.asignadas}</h4>
              <small className="opacity-75">Asignadas</small>
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
        <div className="d-flex gap-2">
          <div className="input-group" style={{ maxWidth: '300px' }}>
            <span className="input-group-text bg-white">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por número u operador..."
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
            <option value="asignada">Asignadas</option>
            <option value="baja">De Baja</option>
          </select>
        </div>
        <button 
          className="btn btn-success"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nueva SIM
        </button>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Número SIM</th>
                  <th className="border-0 py-3">Operador</th>
                  <th className="border-0 py-3">Tipo</th>
                  <th className="border-0 py-3">Plan</th>
                  <th className="border-0 py-3">Estado</th>
                  <th className="border-0 py-3 text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      Cargando SIM Cards...
                    </td>
                  </tr>
                ) : filteredSims.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No se encontraron SIM Cards
                    </td>
                  </tr>
                ) : (
                  filteredSims.map((sim) => (
                    <tr key={sim.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-info bg-opacity-10 rounded-3 p-2 me-3">
                            <i className="bi bi-sim text-info"></i>
                          </div>
                          <code className="fw-medium">{sim.numeroSim}</code>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-secondary bg-opacity-10 text-secondary">
                          {sim.operador || '-'}
                        </span>
                      </td>
                      <td className="text-capitalize">{sim.tipo || '-'}</td>
                      <td>{sim.plan || '-'}</td>
                      <td>{getEstadoBadge(sim.estado)}</td>
                      <td className="text-end pe-4">
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEditModal(sim)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(sim.id)}
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
                  {editingSim ? 'Editar SIM Card' : 'Nueva SIM Card'}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Número SIM *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.numeroSim}
                        onChange={(e) => setFormData({ ...formData, numeroSim: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Operador</label>
                      <select 
                        className="form-select"
                        value={formData.operador}
                        onChange={(e) => setFormData({ ...formData, operador: e.target.value })}
                      >
                        <option value="">Seleccionar</option>
                        <option value="Claro">Claro</option>
                        <option value="Movistar">Movistar</option>
                        <option value="Tigo">Tigo</option>
                        <option value="Digicel">Digicel</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label">Tipo</label>
                      <select 
                        className="form-select"
                        value={formData.tipo}
                        onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      >
                        <option value="prepago">Prepago</option>
                        <option value="postpago">Postpago</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Plan</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.plan}
                        onChange={(e) => setFormData({ ...formData, plan: e.target.value })}
                        placeholder="ej. Datos 1GB"
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Estado</label>
                      <select 
                        className="form-select"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      >
                        <option value="disponible">Disponible</option>
                        <option value="asignada">Asignada</option>
                        <option value="baja">De Baja</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    {editingSim ? 'Actualizar' : 'Guardar'}
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