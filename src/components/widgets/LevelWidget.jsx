import { motion } from 'framer-motion';
import { cn, getLevelColor } from '../../lib/utils';

/**
 * Widget de Nivel de Llenado
 * Muestra un indicador visual circular con el porcentaje
 */
export function LevelWidget({ level, status }) {
  const color = getLevelColor(level);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (level / 100) * circumference;

  const statusLabels = {
    good: 'Normal',
    medium: 'Medio',
    warning: 'Alto',
    critical: 'Crítico'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800">Nivel de Llenado</h3>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            status === 'critical' && 'bg-red-100 text-red-700',
            status === 'warning' && 'bg-amber-100 text-amber-700',
            status === 'medium' && 'bg-blue-100 text-blue-700',
            status === 'good' && 'bg-green-100 text-green-700'
          )}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative w-40 h-40">
          {/* Background circle */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="10"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="80"
              cy="80"
              r="45"
              stroke={color}
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              key={level}
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold"
              style={{ color }}
            >
              {level.toFixed(0)}%
            </motion.span>
            <span className="text-sm text-slate-500">Capacidad</span>
          </div>
        </div>
      </div>

      {/* Visual bar */}
      <div className="mt-4">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${level}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Warning message */}
      {status === 'critical' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-sm text-red-700 font-medium text-center">
            ⚠️ ¡Requiere vaciado inmediato!
          </p>
        </motion.div>
      )}
    </div>
  );
}

export default LevelWidget;
