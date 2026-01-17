import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  History, 
  Settings, 
  Bell, 
  Info,
  Trash2
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/historial', icon: History, label: 'Historial' },
  { path: '/alertas', icon: Bell, label: 'Alertas' },
  { path: '/configuracion', icon: Settings, label: 'Configuración' },
];

/**
 * Sidebar de navegación
 * Diseño limpio para visualización en proyector
 */
export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 shadow-sm z-40">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-gray-100">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
          <Trash2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800">SmartBin</h1>
          <p className="text-xs text-slate-400">IoT Monitor</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                'hover:bg-gray-50',
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-slate-600'
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl">
          <Info className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs font-medium text-slate-600">Versión 1.0</p>
            <p className="text-xs text-slate-400">TRL 4 - Simulación</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
