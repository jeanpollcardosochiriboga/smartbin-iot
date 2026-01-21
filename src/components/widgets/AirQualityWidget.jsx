import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Wind, Fan } from 'lucide-react';
import { cn, getAirQualityColor, formatChartData } from '../../lib/utils';

/**
 * Widget de Calidad del Aire
 * Muestra el gráfico de área con historial de PPM
 */
export function AirQualityWidget({ ppm, ppmHistory, status, fanOn = false }) {
  const color = getAirQualityColor(ppm);
  const chartData = formatChartData(ppmHistory, 'ppm');
  
  // Umbral de gases para activar indicador visual
  const GAS_ALERT_THRESHOLD = 310;
  
  // El ventilador debe mostrarse activo si: fanOn es true O hay gases peligrosos
  const isVentiladorActivo = fanOn || ppm > GAS_ALERT_THRESHOLD;
  // Si hay gases pero el ventilador físico no está encendido, mostrar estado de alerta
  const isAlertaGases = ppm > GAS_ALERT_THRESHOLD && !fanOn;

  const statusLabels = {
    good: 'Excelente',
    medium: 'Moderada',
    warning: 'Mala',
    danger: 'Peligrosa'
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-100">
          <p className="text-sm font-medium text-slate-700">
            {payload[0].value} PPM
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Wind className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">Calidad del Aire</h3>
        </div>
        
        {/* Indicador visual del ventilador - Más grande y visible */}
        <motion.div 
          animate={isVentiladorActivo ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all duration-300',
            isAlertaGases 
              ? 'bg-orange-100 text-orange-700 shadow-md shadow-orange-200 border border-orange-300'
              : fanOn 
                ? 'bg-blue-100 text-blue-700 shadow-md shadow-blue-200 border border-blue-300' 
                : 'bg-gray-100 text-gray-500 border border-gray-200'
          )}
          title={
            isAlertaGases 
              ? '¡Gases detectados! Ventilador debería activarse' 
              : fanOn 
                ? 'Ventilador activo' 
                : 'Ventilador apagado'
          }
        >
          <Fan 
            className={cn(
              'w-5 h-5 transition-all duration-300',
              isVentiladorActivo 
                ? isAlertaGases 
                  ? 'text-orange-600 animate-spin-slow' 
                  : 'text-blue-600 animate-spin-slow'
                : 'text-gray-400'
            )} 
          />
          <span>
            {isAlertaGases ? '⚠️' : fanOn ? 'ON' : 'OFF'}
          </span>
        </motion.div>
      </div>
      
      {/* Status badge */}
      <span
        className={cn(
          'px-3 py-1 rounded-full text-sm font-medium inline-block mb-3',
          status === 'danger' && 'bg-red-100 text-red-700',
          status === 'warning' && 'bg-amber-100 text-amber-700',
          status === 'medium' && 'bg-blue-100 text-blue-700',
          status === 'good' && 'bg-green-100 text-green-700'
        )}
      >
        {statusLabels[status]}
      </span>

      {/* Current value */}
      <div className="flex items-baseline gap-2 mb-4">
        <motion.span
          key={ppm}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl font-bold"
          style={{ color }}
        >
          {ppm}
        </motion.span>
        <span className="text-lg text-slate-400">PPM</span>
      </div>

      {/* Chart */}
      <div className="h-40 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="colorPpm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="ppm"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPpm)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Thresholds legend */}
      <div className="flex justify-between mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-slate-500">&lt;150 Buena</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span className="text-slate-500">300+ Mala</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-slate-500">400+ Peligro</span>
        </div>
      </div>
    </div>
  );
}

export default AirQualityWidget;
