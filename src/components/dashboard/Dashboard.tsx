'use client'

import { useState, useEffect } from 'react'

interface Stats {
  totalClientes: number
  clientesActivos: number
  totalEquipos: number
  equiposDisponibles: number
  totalSims: number
  simsDisponibles: number
  totalUnidades: number
  unidadesActivas: number
  renovacionesPendientes: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalClientes: 0,
    clientesActivos: 0,
    totalEquipos: 0,
    equiposDisponibles: 0,
    totalSims: 0,
    simsDisponibles: 0,
    totalUnidades: 0,
    unidadesActivas: 0,
    renovacionesPendientes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [clientesRes, equiposRes, simsRes, unidadesRes, renovacionesRes] = await Promise.all([
        fetch('/api/clientes'),
        fetch('/api/equipos'),
        fetch('/api/sims'),
        fetch('/api/unidades'),
        fetch('/api/renovaciones'),
      ])

      const clientes = await clientesRes.json()
      const equipos = await equiposRes.json()
      const sims = await simsRes.json()
      const unidades = await unidadesRes.json()
      const renovaciones = await renovacionesRes.json()

      setStats({
        totalClientes: clientes.length,
        clientesActivos: clientes.filter((c: any) => c.estado === 'activo').length,
        totalEquipos: equipos.length,
        equiposDisponibles: equipos.filter((e: any) => e.estado === 'disponible').length,
        totalSims: sims.length,
        simsDisponibles: sims.filter((s: any) => s.estado === 'disponible').length,
        totalUnidades: unidades.length,
        unidadesActivas: unidades.filter((u: any) => u.estado === 'activo').length,
        renovacionesPendientes: renovaciones.filter((r: any) => r.estado === 'por_vencer' || r.estado === 'vencida').length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="row g-4 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-gradient rounded-3 p-3">
                  <i className="bi bi-people fs-4 text-white"></i>
                </div>
                <div className="ms-3">
                  <p className="text-muted mb-0 small">Clientes</p>
                  <h3 className="mb-0 fw-bold">{stats.totalClientes}</h3>
                  <small className="text-success">{stats.clientesActivos} activos</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-success bg-gradient rounded-3 p-3">
                  <i className="bi bi-broadcast fs-4 text-white"></i>
                </div>
                <div className="ms-3">
                  <p className="text-muted mb-0 small">Equipos GPS</p>
                  <h3 className="mb-0 fw-bold">{stats.totalEquipos}</h3>
                  <small className="text-success">{stats.equiposDisponibles} disponibles</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-info bg-gradient rounded-3 p-3">
                  <i className="bi bi-sim fs-4 text-white"></i>
                </div>
                <div className="ms-3">
                  <p className="text-muted mb-0 small">SIM Cards</p>
                  <h3 className="mb-0 fw-bold">{stats.totalSims}</h3>
                  <small className="text-success">{stats.simsDisponibles} disponibles</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-gradient rounded-3 p-3">
                  <i className="bi bi-truck fs-4 text-white"></i>
                </div>
                <div className="ms-3">
                  <p className="text-muted mb-0 small">Unidades</p>
                  <h3 className="mb-0 fw-bold">{stats.totalUnidades}</h3>
                  <small className="text-success">{stats.unidadesActivas} activas</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="card border-0 bg-success bg-gradient text-white h-100">
            <div className="card-body text-center py-4">
              <i className="bi bi-check-circle fs-1 mb-2 opacity-75"></i>
              <h2 className="fw-bold mb-0">{stats.unidadesActivas}</h2>
              <p className="mb-0 opacity-75">Servicios Activos</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-warning bg-gradient text-white h-100">
            <div className="card-body text-center py-4">
              <i className="bi bi-clock fs-1 mb-2 opacity-75"></i>
              <h2 className="fw-bold mb-0">{stats.renovacionesPendientes}</h2>
              <p className="mb-0 opacity-75">Por Renovar</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 bg-primary bg-gradient text-white h-100">
            <div className="card-body text-center py-4">
              <i className="bi bi-box-seam fs-1 mb-2 opacity-75"></i>
              <h2 className="fw-bold mb-0">{stats.equiposDisponibles}</h2>
              <p className="mb-0 opacity-75">Equipos en Stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Status */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-clock-history text-success me-2"></i>
                Actividad Reciente
              </h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <tbody>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-3 p-2 me-3">
                            <i className="bi bi-person-plus text-primary"></i>
                          </div>
                          <div>
                            <p className="mb-0 fw-medium">Sistema Inicializado</p>
                            <small className="text-muted">Base de datos configurada</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-end text-muted small">Ahora</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-success bg-opacity-10 rounded-3 p-2 me-3">
                            <i className="bi bi-check-circle text-success"></i>
                          </div>
                          <div>
                            <p className="mb-0 fw-medium">Módulos Cargados</p>
                            <small className="text-muted">7 módulos disponibles</small>
                          </div>
                        </div>
                      </td>
                      <td className="text-end text-muted small">Ahora</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-0 py-3">
              <h5 className="mb-0 fw-semibold">
                <i className="bi bi-activity text-success me-2"></i>
                Estado del Sistema
              </h5>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">Base de datos</span>
                <span className="badge bg-success-subtle text-success">Conectada</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">API</span>
                <span className="badge bg-success-subtle text-success">Operativa</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">Versión</span>
                <span className="badge bg-secondary">1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}