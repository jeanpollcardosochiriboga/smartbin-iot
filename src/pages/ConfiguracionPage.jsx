import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, RotateCcw, Loader2, AlertTriangle, Wind, Gauge, Ruler, User, Mail, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import { Sidebar, Header } from '../components/layout';
import { getThresholds, saveThresholds, seedDatabase, isSimulationMode } from '../services/iotService';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

/**
 * Página de Configuración
 * Formulario para ajustar umbrales guardados en Firebase
 */
export function ConfiguracionPage() {
  const { user, userName, userCity } = useAuth();
  const [config, setConfig] = useState({
    gasWarning: 300,
    gasDanger: 400,
    levelWarning: 80,
    levelCritical: 95,
    maxDistance: 100
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalConfig, setOriginalConfig] = useState(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setIsLoading(true);
    const data = await getThresholds();
    if (data) {
      setConfig(data);
      setOriginalConfig(data);
    }
    setIsLoading(false);
  };

  const handleChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setConfig(prev => ({ ...prev, [field]: numValue }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validaciones
    if (config.gasWarning >= config.gasDanger) {
      toast.error('El umbral de advertencia debe ser menor que el de peligro');
      return;
    }
    if (config.levelWarning >= config.levelCritical) {
      toast.error('El umbral de advertencia de nivel debe ser menor que el crítico');
      return;
    }

    setIsSaving(true);
    const success = await saveThresholds(config);
    
    if (success) {
      toast.success('Configuración guardada correctamente', { icon: '✅' });
      setOriginalConfig(config);
      setHasChanges(false);
    } else {
      toast.error('Error al guardar la configuración');
    }
    setIsSaving(false);
  };

  const handleReset = () => {
    if (originalConfig) {
      setConfig(originalConfig);
      setHasChanges(false);
      toast.info('Cambios descartados');
    }
  };

  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    const success = await seedDatabase();
    
    if (success) {
      toast.success('Base de datos inicializada correctamente', { icon: '🌱' });
      await loadConfig();
    } else {
      toast.error('Error al inicializar la base de datos');
    }
    setIsSeeding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <main className="ml-64">
          <Header title="Configuración" subtitle="Ajustes del sistema" />
          <div className="p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500">Cargando configuración...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64">
        <Header 
          title="Configuración" 
          subtitle="Ajustes y umbrales del sistema" 
        />
        
        <div className="p-6 space-y-6">
          {/* Tarjeta de Cuenta Actual */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Cuenta Actual</p>
                <p className="text-slate-800 font-semibold">{userName}</p>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-slate-500 text-sm">{user?.email}</p>
                  </div>
                  {userCity && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <p className="text-slate-500 text-sm">{userCity}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  Conectado
                </span>
              </div>
            </div>
          </motion.div>

          {/* Alerta de modo simulación */}
          {isSimulationMode() && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-center gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="text-amber-700 text-sm">
                Modo simulación activo. Los cambios se guardarán localmente.
              </p>
            </motion.div>
          )}

          {/* Formulario principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Settings className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Umbrales de Alerta</h3>
                  <p className="text-sm text-slate-500">Configure los valores para disparar alertas</p>
                </div>
              </div>
              {hasChanges && (
                <span className="text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                  Cambios sin guardar
                </span>
              )}
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              {/* Sección de Gases */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Wind className="w-5 h-5 text-blue-500" />
                  <h4 className="font-medium text-slate-700">Calidad del Aire (PPM)</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Umbral de Advertencia
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={config.gasWarning}
                        onChange={(e) => handleChange('gasWarning', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="1000"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        PPM
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Se mostrará advertencia amarilla
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Umbral de Peligro
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={config.gasDanger}
                        onChange={(e) => handleChange('gasDanger', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        min="0"
                        max="1000"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        PPM
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Se mostrará alerta roja crítica
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Sección de Nivel */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Gauge className="w-5 h-5 text-green-500" />
                  <h4 className="font-medium text-slate-700">Nivel de Llenado (%)</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Umbral de Advertencia
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={config.levelWarning}
                        onChange={(e) => handleChange('levelWarning', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        %
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Notificación de nivel alto
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-2">
                      Umbral Crítico
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={config.levelCritical}
                        onChange={(e) => handleChange('levelCritical', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                        %
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Alerta de basurero lleno
                    </p>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Sección de Sensor */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Ruler className="w-5 h-5 text-purple-500" />
                  <h4 className="font-medium text-slate-700">Calibración del Sensor</h4>
                </div>
                <div className="max-w-md">
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Distancia Máxima del Sensor
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={config.maxDistance}
                      onChange={(e) => handleChange('maxDistance', e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="1"
                      max="500"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                      cm
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Distancia desde el sensor hasta el fondo del contenedor
                  </p>
                </div>
              </div>
            </div>

            {/* Footer con botones */}
            <div className="px-6 py-4 bg-slate-50 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Descartar cambios
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all",
                  hasChanges
                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                )}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Configuración
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Panel de Debug - Seed Database */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800 rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold mb-1">Inicializar Base de Datos</h3>
                <p className="text-slate-400 text-sm">
                  Crea la estructura inicial en Firebase con valores por defecto
                </p>
              </div>
              <button
                onClick={handleSeedDatabase}
                disabled={isSeeding}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white rounded-xl transition-colors"
              >
                {isSeeding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Inicializando...
                  </>
                ) : (
                  <>
                    <span>🌱</span>
                    Seed Database
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default ConfiguracionPage;
