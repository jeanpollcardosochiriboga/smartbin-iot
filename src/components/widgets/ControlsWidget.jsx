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
        {/* Botón Tapa */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onToggleLid}
          className={cn(
            'relative p-6 rounded-xl border-2 transition-all duration-200',
            'flex flex-col items-center justify-center gap-3',
            lidOpen
              ? 'bg-amber-50 border-amber-300 text-amber-700'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
          )}
        >
          {lidOpen ? (
            <DoorOpen className="w-10 h-10" />
          ) : (
            <DoorClosed className="w-10 h-10" />
          )}
          <span className="font-medium">Tapa</span>
          <span className={cn(
            'text-xs px-2 py-1 rounded-full',
            lidOpen ? 'bg-amber-200 text-amber-800' : 'bg-slate-200 text-slate-600'
          )}>
            {lidOpen ? 'ABIERTA' : 'CERRADA'}
          </span>
          
          {/* Indicator */}
          <motion.div
            className={cn(
              'absolute top-3 right-3 w-3 h-3 rounded-full',
              lidOpen ? 'bg-amber-500' : 'bg-slate-300'
            )}
            animate={lidOpen ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.button>

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
