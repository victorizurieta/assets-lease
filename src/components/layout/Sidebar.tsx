"use client";

import { useAppStore, ViewType } from "@/lib/store";

interface NavItem {
  id: ViewType;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { id: "clientes", label: "Clientes", icon: "bi-people" },
  { id: "equipos", label: "Equipos GPS", icon: "bi-broadcast" },
  { id: "sims", label: "SIM Cards", icon: "bi-sim" },
  { id: "unidades", label: "Unidades", icon: "bi-truck" },
  { id: "asignaciones", label: "Asignaciones", icon: "bi-arrow-left-right" }, 
  { id: "renovaciones", label: "Renovaciones", icon: "bi-calendar-check" },
  { id: "notificaciones", label: "Notificaciones", icon: "bi-bell" },
  { id: "admin", label: "Administración", icon: "bi-gear" },
];

export default function Sidebar() {
  const { currentView, setCurrentView, sidebarOpen, setSidebarOpen } =
    useAppStore();

  return (
    <>
      {/* Mobile toggle button - z-index alto para que siempre sea visible */}
      <button
        className="btn btn-dark position-fixed d-lg-none"
        style={{ top: "10px", left: "10px", zIndex: 1100 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - z-index entre overlay y botón hamburguesa */}
      <aside
        className={`position-fixed top-0 start-0 h-100 bg-dark text-white ${sidebarOpen ? "" : "d-none d-lg-block"}`}
        style={{ width: "280px", zIndex: 1050 }}
      >
        {/* Logo */}
        <div className="d-flex align-items-center gap-3 p-4 border-bottom border-secondary">
          <div className="bg-success rounded-3 p-2">
            <i className="bi bi-broadcast-pin fs-4"></i>
          </div>
          <div>
            <h5 className="mb-0 fw-bold">Assets Lease</h5>
            <small className="text-secondary">Gestión administrativa</small>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                if (window.innerWidth < 992) setSidebarOpen(false);
              }}
              className={`btn w-100 text-start d-flex align-items-center gap-3 mb-2 ${
                currentView === item.id ? "btn-success" : "btn-dark text-white"
              }`}
            >
              <i className={`bi ${item.icon} fs-5`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="position-absolute bottom-0 start-0 end-0 p-3 border-top border-secondary">
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-success rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
              style={{ width: "40px", height: "40px" }}
            >
              A
            </div>
            <div>
              <p className="mb-0 small fw-medium">Admin</p>
              <small className="text-secondary">Administrador</small>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}