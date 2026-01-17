import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Clock, AlertTriangle, Info, Settings as SettingsIcon, Wrench, RefreshCw } from 'lucide-react';
import { Sidebar, Header } from '../components/layout';
import { getEventHistory } from '../services/iotService';
import { cn, formatDateTime } from '../lib/utils';

/**
 * Página de Historial
 * Muestra una tabla elegante con los últimos eventos del sistema
 */
export function HistorialPage() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    setIsLoading(true);
    const data = await getEventHistory();
    setEvents(data);
    setIsLoading(false);
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'danger':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'command':
        return <SettingsIcon className="w-4 h-4 text-blue-500" />;
      case 'system':
        return <Info className="w-4 h-4 text-slate-500" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  const getEventBadge = (type) => {
    const styles = {
      warning: 'bg-amber-100 text-amber-700',
      danger: 'bg-red-100 text-red-700',
      command: 'bg-blue-100 text-blue-700',
      system: 'bg-slate-100 text-slate-700',
      maintenance: 'bg-green-100 text-green-700',
      info: 'bg-cyan-100 text-cyan-700'
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64">
        <Header 
          title="Historial" 
          subtitle="Registro de eventos del sistema" 
        />
        
        <div className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <History className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Eventos Recientes</h3>
                  <p className="text-sm text-slate-500">Últimos 50 eventos registrados</p>
                </div>
              </div>
              <button
                onClick={loadEvents}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                Actualizar
              </button>
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-500">Cargando eventos...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center">
                <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No hay eventos registrados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Fecha y Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Evento
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {events.map((event, index) => (
                      <motion.tr
                        key={event.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400" />
                            {formatDateTime(event.timestamp)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {getEventIcon(event.type)}
                            <span className="text-sm font-medium text-slate-800">
                              {event.event}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={cn(
                            "px-2.5 py-1 text-xs font-medium rounded-full capitalize",
                            getEventBadge(event.type)
                          )}>
                            {event.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {event.value !== null ? (
                            <span className="font-mono bg-slate-100 px-2 py-1 rounded">
                              {event.value}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default HistorialPage;
