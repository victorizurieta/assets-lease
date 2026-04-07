"use client";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Dashboard from "@/components/dashboard/Dashboard";
import ClientesModule from "@/components/clientes/ClientesModule";
import EquiposModule from "@/components/equipos/EquiposModule";
import SimsModule from "@/components/sims/SimsModule";
import UnidadesModule from "@/components/unidades/UnidadesModule";
import AsignacionesModule from "@/components/asignaciones/AsignacionesModule";
import RenovacionesModule from "@/components/renovaciones/RenovacionesModule";
import NotificacionesModule from "@/components/notificaciones/NotificacionesModule";
import AdminModule from "@/components/admin/AdminModule";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const { currentView } = useAppStore();

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "clientes":
        return <ClientesModule />;
      case "equipos":
        return <EquiposModule />;
      case "sims":
        return <SimsModule />;
      case "unidades":
        return <UnidadesModule />;
 	  case "asignaciones":
		return <AsignacionesModule />;
      case "renovaciones":
        return <RenovacionesModule />;
      case "notificaciones":
        return <NotificacionesModule />;
	  case "admin":
		return <AdminModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Sidebar />
      {/* 
        En desktop (d-lg-block): Sidebar siempre visible, margen fijo de 280px
        En móvil: Sidebar como overlay, sin margen
      */}
      <div className="ms-lg-auto" style={{ marginLeft: "0" }}>
        <style jsx>{`
          @media (min-width: 992px) {
            div {
              margin-left: 280px !important;
            }
          }
        `}</style>
        <Header />
        <main className="p-3 p-md-4">{renderContent()}</main>
      </div>
    </div>
  );
}