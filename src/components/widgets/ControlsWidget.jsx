import { motion } from 'framer-motion';
import { DoorOpen, DoorClosed, Fan, Power } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Widget de Controles
 * Botones para controlar la tapa y el ventilador
 */
export function ControlsWidget({ lidOpen, fanOn, onToggleLid, onToggleFan }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">Controles</h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Tarjeta Estado Tapa - Vinculada a sensors/lid_status */}
        <motion.div
          className={cn(
            'relative p-6 rounded-xl border-2 transition-all duration-300',
            'flex flex-col items-center justify-center gap-3',
            lidOpen
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400 text-green-700 shadow-lg shadow-green-100'
              : 'bg-slate-50 border-slate-200 text-slate-600'
          )}
        >
          {/* Ícono animado de la tapa */}
          <motion.div
            animate={lidOpen ? { y: [0, -8, 0] } : { y: 0 }}
            transition={{ 
              duration: 1.5, 
              repeat: lidOpen ? Infinity : 0,
              ease: "easeInOut"
            }}
          >
            {lidOpen ? (
              <DoorOpen className={cn(
                'w-12 h-12 transition-colors duration-300',
                'text-green-600'
              )} />
            ) : (
              <DoorClosed className="w-12 h-12 text-slate-500" />
            )}
          </motion.div>
          
          <span className="font-semibold text-base">Tapa</span>
          
          <motion.span 
            key={lidOpen ? 'open' : 'closed'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              'text-xs px-3 py-1.5 rounded-full font-bold tracking-wide',
              lidOpen 
                ? 'bg-green-500 text-white shadow-sm' 
                : 'bg-slate-200 text-slate-600'
            )}
          >
            {lidOpen ? 'ABIERTA' : 'CERRADA'}
          </motion.span>
          
          {/* Indicador pulsante */}
          <motion.div
            className={cn(
              'absolute top-3 right-3 w-3 h-3 rounded-full',
              lidOpen ? 'bg-green-500' : 'bg-slate-300'
            )}
            animate={lidOpen ? { 
              scale: [1, 1.4, 1],
              opacity: [1, 0.5, 1]
            } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        </motion.div>

        {/* Botón Ventilador */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleFan}
          className={cn(
            'relative p-6 rounded-xl border-2 transition-all duration-200',
            'flex flex-col items-center justify-center gap-3',
            fanOn
              ? 'bg-blue-50 border-blue-300 text-blue-700'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
          )}
        >
          <motion.div
            animate={fanOn ? { rotate: 360 } : {}}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          >
            <Fan className="w-10 h-10" />
          </motion.div>
          <span className="font-medium">Ventilador</span>
          <span className={cn(
            'text-xs px-2 py-1 rounded-full',
            fanOn ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'
          )}>
            {fanOn ? 'ACTIVO' : 'APAGADO'}
          </span>
          
          {/* Indicator */}
          <motion.div
            className={cn(
              'absolute top-3 right-3 w-3 h-3 rounded-full',
              fanOn ? 'bg-blue-500' : 'bg-slate-300'
            )}
            animate={fanOn ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.button>
      </div>

      {/* Quick actions */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-slate-400 mb-3">Acciones rápidas</p>
        <div className="flex gap-2">
          <button
            onClick={onToggleFan}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors',
              fanOn 
                ? 'bg-red-50 text-red-600 hover:bg-red-100' 
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            )}
          >
            <Power className="w-4 h-4" />
            {fanOn ? 'Apagar ventilador' : 'Activar extracción'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ControlsWidget;
