import React, { ReactNode, useState } from 'react';
import { useElectoral } from '@/app/context/ElectoralContext';
import { Button } from '@/app/components/ui/button';
import {
  LayoutDashboard,
  FileText,
  Users,
  MapPin,
  UserCheck,
  LogOut,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  currentView: 'dashboard' | 'actas' | 'candidatos' | 'mesas' | 'personeros' | 'asignacion';
  onViewChange: (view: 'dashboard' | 'actas' | 'candidatos' | 'mesas' | 'personeros' | 'asignacion') => void;
}

export function AdminLayout({ children, currentView, onViewChange }: AdminLayoutProps) {
  const { usuarioActual, logout } = useElectoral();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'actas' as const, label: 'Revisión de Actas', icon: FileText },
    { id: 'candidatos' as const, label: 'Gestión de Candidatos', icon: Users },
    { id: 'mesas' as const, label: 'Gestión de Mesas', icon: MapPin },
    { id: 'personeros' as const, label: 'Gestión de Personeros', icon: Users },
    { id: 'asignacion' as const, label: 'Asignación de Mesas', icon: UserCheck },
  ];

  const handleNavClick = (id: any) => {
    onViewChange(id);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800">Sistema Electoral</h1>
              <p className="text-xs text-slate-500">Panel de Administración</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-3">
          <div className="px-4 py-3 bg-slate-50 rounded-lg">
            <p className="text-xs text-slate-500 mb-1">Usuario actual</p>
            <p className="text-sm font-medium text-slate-800">{usuarioActual?.nombre}</p>
            <p className="text-xs text-blue-600 mt-1">Administrador</p>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full justify-start gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header con botón hamburguesa para móviles */}
        <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-slate-800">Sistema Electoral</span>
          </div>
          <div className="w-10" />
        </header>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}