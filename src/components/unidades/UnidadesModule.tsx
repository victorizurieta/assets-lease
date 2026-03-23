'use client'

import { useState, useEffect } from 'react'

interface Unidad {
  id: string
  placa: string
  nombre?: string
  marcaVehiculo?: string
  modeloVehiculo?: string
  anio?: number
  color?: string
  estado: string
  observaciones?: string
  clienteId: string
  cliente?: { id: string; nombre: string }
  equipoGPS?: { id: string; imei: string }
  simCard?: { id: string; numeroSim: string }
  createdAt: string
}

interface Cliente {
  id: string
  nombre: string
}

interface EquipoGPS {
  id: string
  imei: string
  marca?: string
}

interface SIMCard {
  id: string
  numeroSim: string
  operador?: string
}

export default function UnidadesModule() {
  const [unidades, setUnidades] = useState<Unidad[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [equipos, setEquipos] = useState<EquipoGPS[]>([])
  const [sims, setSims] = useState<SIMCard[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingUnidad, setEditingUnidad] = useState<Unidad | null>(null)
  const [formData, setFormData] = useState({
    placa: '',
    nombre: '',
    marcaVehiculo: '',
    modeloVehiculo: '',
    anio: '',
    color: '',
    estado: 'activo',
    observaciones: '',
    clienteId: '',
    equipoGPSId: '',
    simCardId: '',
  })

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      const [unidadesRes, clientesRes, equiposRes, simsRes] = await Promise.all([
        fetch('/api/unidades'),
        fetch('/api/clientes'),
        fetch('/api/equipos'),
        fetch('/api/sims'),
      ])
      
      const [unidadesData, clientesData, equiposData, simsData] = await Promise.all([
        unidadesRes.json(),
        clientesRes.json(),
        equiposRes.json(),
        simsRes.json(),
      ])
      
      setUnidades(unidadesData)
      setClientes(clientesData)
      setEquipos(equiposData.filter((e: EquipoGPS) => e.marca !== 'baja'))
      setSims(simsData.filter((s: SIMCard) => s.operador !== 'baja'))
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        anio: formData.anio ? parseInt(formData.anio) : null,
        equipoGPSId: formData.equipoGPSId || null,
        simCardId: formData.simCardId || null,
      }

      if (editingUnidad) {
        await fetch(`/api/unidades/${editingUnidad.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        await fetch('/api/unidades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }
      fetchAll()
      setShowModal(false)
      resetForm()
    } catch (error) {
      console.error('Error saving unidad:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar esta unidad?')) {
      try {
        await fetch(`/api/unidades/${id}`, { method: 'DELETE' })
        fetchAll()
      } catch (error) {
        console.error('Error deleting unidad:', error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      placa: '',
      nombre: '',
      marcaVehiculo: '',
      modeloVehiculo: '',
      anio: '',
      color: '',
      estado: 'activo',
      observaciones: '',
      clienteId: '',
      equipoGPSId: '',
      simCardId: '',
    })
    setEditingUnidad(null)
  }

  const openEditModal = (unidad: Unidad) => {
    setEditingUnidad(unidad)
    setFormData({
      placa: unidad.placa,
      nombre: unidad.nombre || '',
      marcaVehiculo: unidad.marcaVehiculo || '',
      modeloVehiculo: unidad.modeloVehiculo || '',
      anio: unidad.anio?.toString() || '',
      color: unidad.color || '',
      estado: unidad.estado,
      observaciones: unidad.observaciones || '',
      clienteId: unidad.clienteId,
      equipoGPSId: unidad.equipoGPS?.id || '',
      simCardId: unidad.simCard?.id || '',
    })
    setShowModal(true)
  }

  const filteredUnidades = unidades.filter((u) =>
    u.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const stats = {
    total: unidades.length,
    activas: unidades.filter(u => u.estado === 'activo').length,
    inactivas: unidades.filter(u => u.estado === 'inactivo').length,
    conEquipo: unidades.filter(u => u.equipoGPS).length,
  }

  return (
    <div>
      {/* Stats */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-dark text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-truck fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.total}</h4>
              <small className="opacity-75">Total</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-success text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-check-circle fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.activas}</h4>
              <small className="opacity-75">Activas</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-danger text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-x-circle fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.inactivas}</h4>
              <small className="opacity-75">Inactivas</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 bg-primary text-white h-100">
            <div className="card-body text-center py-3">
              <i className="bi bi-broadcast fs-4 mb-2 d-block opacity-75"></i>
              <h4 className="mb-0 fw-bold">{stats.conEquipo}</h4>
              <small className="opacity-75">Con Equipo</small>
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
            placeholder="Buscar por placa, nombre o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-success"
          onClick={() => { resetForm(); setShowModal(true); }}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nueva Unidad
        </button>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Vehículo</th>
                  <th className="border-0 py-3">Cliente</th>
                  <th className="border-0 py-3">Equipo GPS</th>
                  <th className="border-0 py-3">SIM Card</th>
                  <th className="border-0 py-3">Estado</th>
                  <th className="border-0 py-3 text-end pe-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      Cargando unidades...
                    </td>
                  </tr>
                ) : filteredUnidades.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No se encontraron unidades
                    </td>
                  </tr>
                ) : (
                  filteredUnidades.map((unidad) => (
                    <tr key={unidad.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-warning bg-opacity-10 rounded-3 p-2 me-3">
                            <i className="bi bi-truck text-warning"></i>
                          </div>
                          <div>
                            <p className="mb-0 fw-medium">{unidad.placa}</p>
                            <small className="text-muted">
                              {[unidad.marcaVehiculo, unidad.modeloVehiculo, unidad.anio].filter(Boolean).join(' ') || unidad.nombre || '-'}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person text-muted me-2"></i>
                          {unidad.cliente?.nombre || '-'}
                        </div>
                      </td>
                      <td>
                        {unidad.equipoGPS ? (
                          <div className="d-flex align-items-center">
                            <i className="bi bi-broadcast text-success me-2"></i>
                            <code>{unidad.equipoGPS.imei}</code>
                          </div>
                        ) : (
                          <span className="text-muted">Sin asignar</span>
                        )}
                      </td>
                      <td>
                        {unidad.simCard ? (
                          <div className="d-flex align-items-center">
                            <i className="bi bi-sim text-info me-2"></i>
                            <code>{unidad.simCard.numeroSim}</code>
                          </div>
                        ) : (
                          <span className="text-muted">Sin asignar</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${unidad.estado === 'activo' ? 'bg-success' : 'bg-secondary'}`}>
                          {unidad.estado === 'activo' ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="text-end pe-4">
                        <button 
                          className="btn btn-sm btn-outline-primary me-1"
                          onClick={() => openEditModal(unidad)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(unidad.id)}
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
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingUnidad ? 'Editar Unidad' : 'Nueva Unidad'}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); resetForm(); }}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Cliente *</label>
                      <select 
                        className="form-select"
                        value={formData.clienteId}
                        onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                        required
                      >
                        <option value="">Seleccionar cliente</option>
                        {clientes.map((c) => (
                          <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Placa *</label>
                      <input
                        type="text"
                        className="form-control text-uppercase"
                        value={formData.placa}
                        onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                        required
                        placeholder="ABC-123"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Nombre en Plataforma</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nombre}
                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Marca del Vehículo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.marcaVehiculo}
                        onChange={(e) => setFormData({ ...formData, marcaVehiculo: e.target.value })}
                        placeholder="Toyota, Nissan..."
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Modelo del Vehículo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.modeloVehiculo}
                        onChange={(e) => setFormData({ ...formData, modeloVehiculo: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Año</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.anio}
                        onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                        placeholder="2024"
                        min="1900"
                        max={new Date().getFullYear() + 1}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Color</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      />
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
                    <div className="col-md-6">
                      <label className="form-label">Equipo GPS</label>
                      <select 
                        className="form-select"
                        value={formData.equipoGPSId}
                        onChange={(e) => setFormData({ ...formData, equipoGPSId: e.target.value })}
                      >
                        <option value="">Sin asignar</option>
                        {equipos.map((e) => (
                          <option key={e.id} value={e.id}>{e.imei} {e.marca && `(${e.marca})`}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">SIM Card</label>
                      <select 
                        className="form-select"
                        value={formData.simCardId}
                        onChange={(e) => setFormData({ ...formData, simCardId: e.target.value })}
                      >
                        <option value="">Sin asignar</option>
                        {sims.map((s) => (
                          <option key={s.id} value={s.id}>{s.numeroSim} {s.operador && `(${s.operador})`}</option>
                        ))}
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
                    {editingUnidad ? 'Actualizar' : 'Guardar'}
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