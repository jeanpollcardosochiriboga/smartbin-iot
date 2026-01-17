import { Sidebar, Header } from '../components/layout';
import { Construction } from 'lucide-react';

/**
 * Página de Historial (placeholder)
 */
export function HistorialPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64">
        <Header title="Historial" subtitle="Registro histórico de datos" />
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Construction className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Próximamente</h3>
            <p className="text-slate-500">
              El historial de datos estará disponible cuando se integre Firebase.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Página de Alertas (placeholder)
 */
export function AlertasPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64">
        <Header title="Alertas" subtitle="Centro de notificaciones" />
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Construction className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Próximamente</h3>
            <p className="text-slate-500">
              La gestión de alertas estará disponible en la próxima versión.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Página de Configuración (placeholder)
 */
export function ConfiguracionPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64">
        <Header title="Configuración" subtitle="Ajustes del sistema" />
        <div className="p-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Construction className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">Próximamente</h3>
            <p className="text-slate-500">
              Los ajustes de configuración estarán disponibles en la próxima versión.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
