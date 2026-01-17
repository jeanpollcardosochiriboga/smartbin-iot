import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, AlertTriangle, Trash2, CheckCircle, Clock, RefreshCw, AlertOctagon } from 'lucide-react';
import { toast } from 'react-toastify';
import { Sidebar, Header } from '../components/layout';
import { getAlerts, clearAlerts } from '../services/iotService';
import { cn, formatDateTime } from '../lib/utils';

/**
 * Página de Alertas
 * Muestra tarjetas de alertas con opción de limpiar
 */
export function AlertasPage() {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setIsLoading(true);
    const data = await getAlerts();
    setAlerts(data);
    setIsLoading(false);
  };

  const handleClearAlerts = async () => {
    setIsClearing(true);
    const success = await clearAlerts();
    
    if (success) {
      setAlerts([]);
      toast.success('Alertas eliminadas correctamente', { icon: '🗑️' });
    } else {
      toast.error('Error al eliminar alertas');
    }
    setIsClearing(false);
  };

  const getAlertStyles = (type) => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'bg-red-100',
          iconColor: 'text-red-600',
          title: 'text-red-800',
          text: 'text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'bg-amber-100',
          iconColor: 'text-amber-600',
          title: 'text-amber-800',
          text: 'text-amber-600'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'bg-blue-100',
          iconColor: 'text-blue-600',
          title: 'text-blue-800',
          text: 'text-blue-600'
        };
    }
  };

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64">
        <Header 
          title="Alertas" 
          subtitle="Centro de notificaciones del sistema" 
        />
        
        <div className="p-6">
          {/* Header con estadísticas */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-medium text-slate-700">
                  {unacknowledgedCount} sin atender
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100">
                <Bell className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-700">
                  {alerts.length} total
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadAlerts}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-medium text-slate-700 transition-colors"
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                Actualizar
              </button>
              <button
                onClick={handleClearAlerts}
                disabled={alerts.length === 0 || isClearing}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl text-sm font-medium text-white transition-colors"
              >
                <Trash2 className={cn("w-4 h-4", isClearing && "animate-pulse")} />
                Borrar Alertas
              </button>
            </div>
          </div>

          {/* Lista de alertas */}
          {isLoading ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Cargando alertas...</p>
            </div>
          ) : alerts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center"
            >
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                ¡Sin alertas pendientes!
              </h3>
              <p className="text-slate-500">
                El sistema está funcionando correctamente
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {alerts.map((alert, index) => {
                  const styles = getAlertStyles(alert.type);
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "rounded-2xl border-2 p-6 transition-all",
                        styles.bg,
                        styles.border,
                        alert.acknowledged && "opacity-60"
                      )}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icono */}
                        <div className={cn("p-3 rounded-xl", styles.icon)}>
                          {alert.type === 'danger' ? (
                            <AlertOctagon className={cn("w-6 h-6", styles.iconColor)} />
                          ) : (
                            <AlertTriangle className={cn("w-6 h-6", styles.iconColor)} />
                          )}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h4 className={cn("font-semibold text-lg", styles.title)}>
                                {alert.title}
                              </h4>
                              <p className={cn("mt-1", styles.text)}>
                                {alert.message}
                              </p>
                            </div>
                            
                            {/* Valor */}
                            {alert.value !== null && (
                              <div className={cn(
                                "px-4 py-2 rounded-xl font-mono text-lg font-bold",
                                styles.icon,
                                styles.title
                              )}>
                                {alert.value}
                              </div>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                              <Clock className="w-4 h-4" />
                              {formatDateTime(alert.timestamp)}
                            </div>
                            {alert.acknowledged && (
                              <div className="flex items-center gap-1 text-sm text-green-600">
                                <CheckCircle className="w-4 h-4" />
                                Atendida
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AlertasPage;
