'use client'

import { useState, useEffect } from 'react'

interface Cliente {
  id: string
  nombre: string
  cedulaRuc: string
  telefono?: string
  email?: string
  direccion?: string
  tipoPlan: string
  estado: string
  pais?: string
  observaciones?: string
  createdAt: string
}

export default function ClientesModule() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    cedulaRuc: '',
    telefono: '',
    email: '',
    direccion: '',
    tipoPlan: 'mensual',
    estado: 'activo',
    pais: '',
    observaciones: '',
  })

  useEffect(() => {
    fetchClientes()
  }, [])

  const fetchClientes = async () => {
    try {
      const response = await fetch('/api/clientes')
      const data = await response.json()
      setClientes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCliente) {
        await fetch(`/api/clientes/${editingCliente.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/clientes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }
      fetchClientes()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Error saving cliente:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      try {
        await fetch(`/api/clientes/${id}`, { method: 'DELETE' })
        fetchClientes()
      } catch (error) {
        console.error('Error deleting cliente:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: '',
      cedulaRuc: '',
      telefono: '',
      email: '',
      direccion: '',
      tipoPlan: 'mensual',
      estado: 'activo',
      pais: '',
      observaciones: '',
    })
    setEditingCliente(null)
  }

  const openEditModal = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setFormData({
      nombre: cliente.nombre,
      cedulaRuc: cliente.cedulaRuc,
      telefono: cliente.telefono || '',
      email: cliente.email || '',
      direccion: cliente.direccion || '',
      tipoPlan: cliente.tipoPlan,
      estado: cliente.estado,
      pais: cliente.pais || '',
      observaciones: cliente.observaciones || '',
    })
    setShowModal(true)
  }

  const filteredClientes = clientes.filter(
    (c) =>
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cedulaRuc.includes(searchTerm)
  )

  // Estadísticas
  const stats = {
    total: clientes.length,
    activos: clientes.filter(c => c.estado === 'activo').length,
    inactivos: clientes.filter(c => c.estado === 'inactivo').length,
    mensuales: clientes.filter(c => c.tipoPlan === 'mensual').length,
    anuales: clientes.filter(c => c.tipoPlan === 'anual').length,
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-primary bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-people fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.total}</h3>
              <small className="opacity-75">Total Clientes</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-success bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-check-circle fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.activos}</h3>
              <small className="opacity-75">Activos</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-secondary bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-pause-circle fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.inactivos}</h3>
              <small className="opacity-75">Inactivos</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-info bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-calendar-check fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.anuales}</h3>
              <small className="opacity-75">Plan Anual</small>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="d-flex flex-column flex-md-row gap-3 justify-content-between mb-4">
        <div className="input-group" style={{ maxWidth: '400px' }}>
          <span className="input-group-text bg-white">
            <i className="bi bi-search text-muted"></i>
          </span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por nombre o cédula/RUC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-success"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nuevo Cliente
        </button>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Cliente</th>
                  <th className="border-0 py-3">Cédula/RUC</th>
                  <th className="border-0 py-3">Contacto</th>
                  <th className="border-0 py-3">Plan</th>
                  <th className="border-0 py-3">Estado</th>
                  <th className="border-0 py-3 text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Cargando clientes...
                    </td>
                  </tr>
                ) : filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No se encontraron clientes
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((cliente) => (
                    <tr key={cliente.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div 
                            className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white fw-bold me-3"
                            style={{ width: '40px', height: '40px' }}
                          >
                            {cliente.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="mb-0 fw-medium">{cliente.nombre}</p>
                            {cliente.pais && <small className="text-muted">{cliente.pais}</small>}
                          </div>
                        </div>
                      </td>
                      <td><code>{cliente.cedulaRuc}</code></td>
                      <td>
                        {cliente.telefono && (
                          <div className="small text-muted">
                            <i className="bi bi-telephone me-1"></i>{cliente.telefono}
                          </div>
                        )}
                        {cliente.email && (
                          <div className="small text-muted">
                            <i className="bi bi-envelope me-1"></i>{cliente.email}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${cliente.tipoPlan === 'anual' ? 'bg-primary' : 'bg-secondary'}`}>
                          {cliente.tipoPlan === 'anual' ? 'Anual' : 'Mensual'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${cliente.estado === 'activo' ? 'bg-success' : 'bg-danger'}`}>
                          {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEditModal(cliente)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(cliente.id)}
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
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombre / Razón Social *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Cédula / RUC *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.cedulaRuc}
                        onChange={(e) => setFormData({ ...formData, cedulaRuc: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Teléfono</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.telefono}
                        onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        placeholder="+507 1234-5678"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">País</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.pais}
                        onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
                        placeholder="Panamá"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Dirección</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.direccion}
                        onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Tipo de Plan</label>
                      <select 
                        className="form-select"
                        value={formData.tipoPlan}
                        onChange={(e) => setFormData({ ...formData, tipoPlan: e.target.value })}
                      >
                        <option value="mensual">Mensual</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Estado</label>
                      <select 
                        className="form-select"
                        value={formData.estado}
                        onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
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
                    {editingCliente ? 'Actualizar' : 'Guardar'}
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