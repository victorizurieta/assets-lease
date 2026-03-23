import { create } from 'zustand'

export type ViewType = 'dashboard' | 'clientes' | 'equipos' | 'sims' | 'unidades' | 'renovaciones' | 'notificaciones'

interface AppState {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentView: 'dashboard',
  setCurrentView: (view) => set({ currentView: view }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))