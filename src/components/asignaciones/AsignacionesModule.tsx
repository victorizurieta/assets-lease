'use client'

import { useState, useEffect } from 'react'

interface HistorialAsignacion {
  id: string
  unidadId: string
  unidad?: { id: string; placa: string; cliente?: { nombre: string } }
  equipoGPSId?: string
  equipoGPS?: { id: string; imei: string }
  simCardId?: string
  simCard?: { id: string; numeroSim: string }
  tipoCambio: string
  descripcion?: string
  createdAt: string
}

export default function AsignacionesModule() {
  const [historial, setHistorial] = useState<HistorialAsignacion[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState('todos')

  useEffect(() => {
    fetchHistorial()
  }, [])

  const fetchHistorial = async () => {
    try {
      const response = await fetch('/api/asignaciones')
      const data = await response.json()
      setHistorial(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching historial:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistorial = historial.filter((h) => {
    const matchesSearch = 
      h.unidad?.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.unidad?.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.equipoGPS?.imei.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.simCard?.numeroSim.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTipo = filterTipo === 'todos' || h.tipoCambio === filterTipo
    return matchesSearch && matchesTipo
  })

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'alta':
        return <span className="badge bg-success"><i className="bi bi-arrow-up-right me-1"></i>Alta</span>
      case 'cambio_equipo':
        return <span className="badge bg-primary"><i className="bi bi-broadcast me-1"></i>Cambio Equipo</span>
      case 'cambio_sim':
        return <span className="badge bg-info"><i className="bi bi-sim me-1"></i>Cambio SIM</span>
      case 'baja':
        return <span className="badge bg-danger"><i className="bi bi-arrow-down-right me-1"></i>Baja</span>
      default:
        return <span className="badge bg-secondary">{tipo}</span>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  const stats = {
    total: historial.length,
    altas: historial.filter(h => h.tipoCambio === 'alta').length,
    cambios: historial.filter(h => h.tipoCambio.includes('cambio')).length,
    bajas: historial.filter(h => h.tipoCambio === 'baja').length,
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-secondary bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-arrow-left-right fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.total}</h3>
              <small className="opacity-75">Total Movimientos</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-success bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-arrow-up-right fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.altas}</h3>
              <small className="opacity-75">Altas</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-primary bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-arrow-left-right fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.cambios}</h3>
              <small className="opacity-75">Cambios</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100 bg-danger bg-gradient text-white">
            <div className="card-body text-center py-3">
              <i className="bi bi-arrow-down-right fs-3 mb-2 opacity-75"></i>
              <h3 className="fw-bold mb-0">{stats.bajas}</h3>
              <small className="opacity-75">Bajas</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por placa, IMEI, SIM o cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select 
                className="form-select"
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
              >
                <option value="todos">Todos los movimientos</option>
                <option value="alta">Altas</option>
                <option value="cambio_equipo">Cambios de Equipo</option>
                <option value="cambio_sim">Cambios de SIM</option>
                <option value="baja">Bajas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 fw-semibold">
            <i className="bi bi-clock-history text-success me-2"></i>
            Historial de Asignaciones
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Fecha</th>
                  <th className="border-0 py-3">Tipo</th>
                  <th className="border-0 py-3">Unidad / Cliente</th>
                  <th className="border-0 py-3">Equipo GPS</th>
                  <th className="border-0 py-3">SIM Card</th>
                  <th className="border-0 py-3">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredHistorial.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      No se encontraron registros
                    </td>
                  </tr>
                ) : (
                  filteredHistorial.map((registro) => (
                    <tr key={registro.id}>
                      <td className="px-4">
                        <div>
                          <p className="mb-0 fw-medium">{formatDate(registro.createdAt)}</p>
                          <small className="text-muted">{formatTime(registro.createdAt)}</small>
                        </div>
                      </td>
                      <td>{getTipoBadge(registro.tipoCambio)}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div className="bg-warning bg-opacity-10 rounded-2 p-2">
                            <i className="bi bi-truck text-warning"></i>
                          </div>
                          <div>
                            <p className="mb-0 fw-medium font-monospace">{registro.unidad?.placa}</p>
                            <small className="text-muted">{registro.unidad?.cliente?.nombre}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        {registro.equipoGPS ? (
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-broadcast text-success"></i>
                            <span className="font-monospace small">{registro.equipoGPS.imei}</span>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {registro.simCard ? (
                          <div className="d-flex align-items-center gap-2">
                            <i className="bi bi-sim text-info"></i>
                            <span className="font-monospace small">{registro.simCard.numeroSim}</span>
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <span className="small text-muted">{registro.descripcion || '-'}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}