'use client'

import { useAppStore } from '@/lib/store'

export default function Header() {
  const { currentView, setSidebarOpen, sidebarOpen } = useAppStore()

  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    clientes: 'Gestión de Clientes',
    equipos: 'Equipos GPS',
    sims: 'SIM Cards',
    unidades: 'Unidades / Vehículos',
    renovaciones: 'Renovaciones',
    notificaciones: 'Notificaciones',
  }

  return (
    <header className="bg-white shadow-sm border-bottom px-4 py-3">
      <div className="d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <button 
            className="btn btn-outline-secondary d-none d-lg-inline-block"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="bi bi-list"></i>
          </button>
          <h4 className="mb-0 fw-semibold text-dark">{titles[currentView] || 'Dashboard'}</h4>
        </div>
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-light position-relative">
            <i className="bi bi-bell"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
              3
            </span>
          </button>
          <div className="dropdown">
            <button className="btn btn-light dropdown-toggle d-flex align-items-center gap-2" data-bs-toggle="dropdown">
              <div 
                className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white"
                style={{ width: '32px', height: '32px', fontSize: '14px' }}
              >
                A
              </div>
              <span className="d-none d-md-inline">Admin</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><a className="dropdown-item" href="#"><i className="bi bi-person me-2"></i>Perfil</a></li>
              <li><a className="dropdown-item" href="#"><i className="bi bi-gear me-2"></i>Configuración</a></li>
              <li><hr className="dropdown-divider" /></li>
              <li><a className="dropdown-item text-danger" href="#"><i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión</a></li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  )
}