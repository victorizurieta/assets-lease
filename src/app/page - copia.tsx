"use client";

import { useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Dashboard from "@/components/dashboard/Dashboard";
import ClientesModule from "@/components/clientes/ClientesModule";
import EquiposModule from "@/components/equipos/EquiposModule";
import SimsModule from "@/components/sims/SimsModule";
import UnidadesModule from "@/components/unidades/UnidadesModule";
import RenovacionesModule from "@/components/renovaciones/RenovacionesModule";
import NotificacionesModule from "@/components/notificaciones/NotificacionesModule";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const { currentView, sidebarOpen } = useAppStore();

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
      case "renovaciones":
        return <RenovacionesModule />;
      case "notificaciones":
        return <NotificacionesModule />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-vh-100 bg-light">
      <Sidebar />
      <div
        className="transition-all"
        style={{ marginLeft: sidebarOpen ? "280px" : "0" }}
      >
        <Header />
        <main className="p-4">{renderContent()}</main>
      </div>
    </div>
  );
}
