import { Thermometer, Droplets, Clock, Wifi, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatTime } from '../../lib/utils';

/**
 * Widget de Estado del Sistema
 * Muestra temperatura, humedad, conectividad y última actualización
 */
export function StatusWidget({ temperature, humidity, isConnected, lastUpdate, isSimulation }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Estado del Sistema</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Temperatura */}
        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Thermometer className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-orange-600 font-medium">Temperatura</p>
            <motion.p 
              key={temperature}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-orange-700"
            >
              {temperature.toFixed(1)}°C
            </motion.p>
          </div>
        </div>

        {/* Humedad */}
        <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-xl">
          <div className="p-2 bg-cyan-100 rounded-lg">
            <Droplets className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <p className="text-xs text-cyan-600 font-medium">Humedad</p>
            <motion.p 
              key={humidity}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-bold text-cyan-700"
            >
              {humidity}%
            </motion.p>
          </div>
        </div>

        {/* Conectividad */}
        <div className={`flex items-center gap-3 p-3 rounded-xl ${isConnected ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-600" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-600" />
            )}
          </div>
          <div>
            <p className={`text-xs font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
              Conexión
            </p>
            <p className={`text-lg font-bold ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
              {isSimulation ? 'Simulado' : isConnected ? 'Activa' : 'Perdida'}
            </p>
          </div>
        </div>

        {/* Última actualización */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Clock className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Última lectura</p>
            <p className="text-lg font-bold text-slate-700">
              {formatTime(lastUpdate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusWidget;
