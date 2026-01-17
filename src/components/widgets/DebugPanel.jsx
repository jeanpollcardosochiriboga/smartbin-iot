import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bug, RotateCcw, Trash2, Wind, Zap, ZapOff } from 'lucide-react';
import { startDemoMode, stopDemoMode, isDemoModeActive } from '../../services/iotService';

/**
 * Panel de Debug para demos
 * Permite simular escenarios rápidamente
 */
export function DebugPanel({ onFill, onGas, onReset, isSimulation }) {
  const [demoActive, setDemoActive] = useState(isDemoModeActive());

  const toggleDemoMode = () => {
    if (demoActive) {
      stopDemoMode();
      setDemoActive(false);
    } else {
      const started = startDemoMode();
      if (started !== false) {
        setDemoActive(true);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800 rounded-2xl shadow-lg p-4"
    >
      <div className="flex items-center gap-2 mb-4">
        <Bug className="w-5 h-5 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Panel de Debug</h3>
        {isSimulation && (
          <span className="ml-auto text-xs px-2 py-1 bg-amber-500/20 text-amber-400 rounded-full">
            Simulación Local
          </span>
        )}
        {demoActive && (
          <span className="ml-auto text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full animate-pulse">
            ⚡ Demo Activo
          </span>
        )}
      </div>

      {/* Hardware Simulator Button - Siempre visible */}
      <div className="mb-4 p-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-xl border border-purple-500/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium">⚡ Simular Hardware (Demo)</p>
            <p className="text-slate-400 text-xs mt-1">
              Escribe valores automáticos a Firebase
            </p>
          </div>
          <button
            onClick={toggleDemoMode}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              demoActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
            }`}
          >
            {demoActive ? (
              <>
                <ZapOff className="w-4 h-4" />
                Detener
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Iniciar
              </>
            )}
          </button>
        </div>
        {demoActive && (
          <div className="mt-3 text-xs text-green-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-ping" />
            Escribiendo a Firebase cada 2 segundos...
          </div>
        )}
      </div>

      {/* Controles de simulación local */}
      {isSimulation && (
        <>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onFill}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Llenar +30%
            </button>

            <button
              onClick={onGas}
              className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-lg transition-colors"
            >
              <Wind className="w-4 h-4" />
              Pico de gases
            </button>

            <button
              onClick={onReset}
              className="flex items-center gap-2 px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reiniciar
            </button>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Controles de simulación local (sin Firebase).
          </p>
        </>
      )}

      {!isSimulation && !demoActive && (
        <p className="text-xs text-slate-400">
          Conectado a Firebase. Activa el simulador de hardware para ver datos en movimiento.
        </p>
      )}
    </motion.div>
  );
}

export default DebugPanel;
