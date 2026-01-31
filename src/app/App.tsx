import React, { useState } from 'react';
import { ElectoralProvider, useElectoral } from '@/app/context/ElectoralContext';
import { Login } from '@/app/components/Login';
import { AdminLayout } from '@/app/components/admin/AdminLayout';
import { Dashboard } from '@/app/components/admin/Dashboard';
import { RevisionActas } from '@/app/components/admin/RevisionActas';
import { GestionCandidatos } from '@/app/components/admin/GestionCandidatos';
import { GestionMesas } from '@/app/components/admin/GestionMesas';
import { GestionPersoneros } from '@/app/components/admin/GestionPersoneros';
import { AsignacionPersoneros } from '@/app/components/admin/AsignacionPersoneros';
import { RegistroActa } from '@/app/components/personero/RegistroActa';
import { Toaster } from '@/app/components/ui/sonner';
import { ErrorBoundary } from '@/app/ErrorBoundary';

function AppContent() {
  const { usuarioActual } = useElectoral();
  const [currentView, setCurrentView] = useState<'dashboard' | 'actas' | 'candidatos' | 'mesas' | 'personeros' | 'asignacion'>('dashboard');

  // Si no hay usuario logueado, mostrar login
  if (!usuarioActual) {
    return <Login />;
  }

  // Debug: Verificar el rol del usuario
  console.log('Usuario actual:', usuarioActual);
  console.log('Rol:', usuarioActual.rol);

  // Si es personero, mostrar pantalla de registro de acta
  if (usuarioActual.rol === 'personero') {
    return <RegistroActa />;
  }

  // Si es admin, mostrar panel de administración
  const renderContent = () => {
    try {
      switch (currentView) {
        case 'dashboard':
          return <Dashboard />;
        case 'actas':
          return <RevisionActas />;
        case 'candidatos':
          return <GestionCandidatos />;
        case 'mesas':
          return <GestionMesas />;
        case 'personeros':
          return <GestionPersoneros />;
        case 'asignacion':
          return <AsignacionPersoneros />;
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error('Error renderizando contenido:', error);
      return <div className="p-8 text-red-600">Error al cargar el contenido: {String(error)}</div>;
    }
  };

  return (
    <AdminLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderContent()}
    </AdminLayout>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ElectoralProvider>
        <AppContent />
        <Toaster position="top-right" />
      </ElectoralProvider>
    </ErrorBoundary>
  );
}
