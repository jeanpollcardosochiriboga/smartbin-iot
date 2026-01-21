import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Sidebar, Header } from '../components/layout';
import {
  LevelWidget,
  AirQualityWidget,
  ControlsWidget,
  StatusWidget,
  DebugPanel
} from '../components/widgets';
import { useSmartBin } from '../hooks/useSmartBin';

/**
 * Dashboard Principal
 * Página principal que muestra todos los widgets de monitoreo
 */
import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';

// Umbral para activar alerta crítica
const GAS_ALERT_THRESHOLD = 310;

export function Dashboard() {
  const {
    sensorData,
    status,
    isConnected,
    lastUpdate,
    isSimulation,
    toggleLid,
    toggleFan,
    simulateFill,
    simulateGas,
    resetSimulation
  } = useSmartBin();

  // Estado para el banner de alerta crítica
  const [showCriticalAlert, setShowCriticalAlert] = useState(false);
  const [alertDismissed, setAlertDismissed] = useState(false);
  
  // Ref para detectar transición de estado (activo → seguro)
  const prevAlertState = useRef(false);

  // Detectar condición de alerta crítica
  const isCriticalCondition = sensorData.fanOn || sensorData.ppm > GAS_ALERT_THRESHOLD;

  useEffect(() => {
    // Si hay condición crítica, mostrar banner
    if (isCriticalCondition) {
      setShowCriticalAlert(true);
      setAlertDismissed(false);
    } else {
      // Si estaba en alerta y ahora está seguro, mostrar toast verde
      if (prevAlertState.current && !isCriticalCondition) {
        toast.success('✅ Calidad del aire restablecida. Ventilador apagado.', {
          icon: '🌿',
          autoClose: 5000,
          style: { background: '#10b981', color: 'white' }
        });
      }
      setShowCriticalAlert(false);
    }
    
    // Actualizar estado previo
    prevAlertState.current = isCriticalCondition;
  }, [isCriticalCondition]);

  // Handler para cerrar el banner manualmente
  const dismissAlert = () => {
    setAlertDismissed(true);
    setShowCriticalAlert(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner de Alerta Crítica */}
      <AnimatePresence>
        {showCriticalAlert && !alertDismissed && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-red-600 via-red-500 to-orange-500 shadow-lg"
          >
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Ícono animado de advertencia */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.2, 1],
                      rotate: [0, -10, 10, -10, 0]
                    }}
                    transition={{ 
                      duration: 0.5,
                      repeat: Infinity,
                      repeatDelay: 1
                    }}
                    className="p-2 bg-white/20 rounded-full"
                  >
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </motion.div>
                  
                  <div>
                    <p className="text-white font-bold text-lg">
                      ⚠️ ¡ALERTA: Gases Detectados!
                    </p>
                    <p className="text-white/90 text-sm">
                      Ventilador activado automáticamente. PPM actual: {sensorData.ppm}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={dismissAlert}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                  aria-label="Cerrar alerta"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            
            {/* Barra de progreso animada */}
            <motion.div
              className="h-1 bg-white/30"
              initial={{ scaleX: 0, originX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 10, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar />
      
      <main className={`ml-64 ${showCriticalAlert && !alertDismissed ? 'pt-20' : ''}`}>
        <Header
          title="Dashboard"
          subtitle="Monitoreo en tiempo real del SmartBin"
          lastUpdate={lastUpdate}
        />

        <div className="p-6">
          {/* Status bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StatusWidget
              temperature={sensorData.temperature}
              humidity={sensorData.humidity}
              isConnected={isConnected}
              lastUpdate={lastUpdate}
              isSimulation={isSimulation}
            />
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Level Widget - Takes 1 column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <LevelWidget
                level={sensorData.level}
                status={status.levelStatus}
              />
            </motion.div>

            {/* Air Quality Widget - Takes 1 column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <AirQualityWidget
                ppm={sensorData.ppm}
                ppmHistory={sensorData.ppmHistory}
                status={status.airQualityStatus}
                fanOn={sensorData.fanOn}
              />
            </motion.div>

            {/* Controls Widget - Takes 1 column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ControlsWidget
                lidOpen={sensorData.lidOpen}
                fanOn={sensorData.fanOn}
                onToggleLid={toggleLid}
                onToggleFan={toggleFan}
              />
            </motion.div>
          </div>

          {/* Debug Panel - Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-6"
          >
            {/* Mini Debug: Valores en tiempo real */}
            <div className="mb-4 p-3 bg-slate-100 rounded-xl border border-slate-200 text-xs font-mono">
              <span className="text-slate-500">🔍 Debug:</span>
              <span className="ml-2 text-blue-600">level={sensorData.level}%</span>
              <span className="ml-3 text-green-600">lidOpen={String(sensorData.lidOpen)}</span>
              <span className="ml-3 text-purple-600">fanOn={String(sensorData.fanOn)}</span>
              <span className="ml-3 text-orange-600">ppm={sensorData.ppm}</span>
            </div>
            
            <DebugPanel
              onFill={simulateFill}
              onGas={simulateGas}
              onReset={resetSimulation}
              isSimulation={isSimulation}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
