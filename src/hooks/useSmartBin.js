import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  initializeService,
  cleanupService,
  subscribeToSensorData,
  sendCommand,
  debugFillQuickly,
  debugGasSpike,
  debugReset,
  isSimulationMode,
  seedDatabase
} from '../services/iotService';

/**
 * Custom Hook - El Cerebro Reactivo del SmartBin
 * ================================================
 * 
 * Gestiona:
 * - Suscripción a datos del sensor
 * - Lógica de alertas automáticas
 * - Comandos al dispositivo
 * - Estado de conexión
 */
export function useSmartBin() {
  // Estado principal de los sensores
  const [sensorData, setSensorData] = useState({
    level: 0,
    ppm: 0,
    lidOpen: false,
    fanOn: false,
    temperature: 0,
    humidity: 0,
    timestamp: 0,
    ppmHistory: [],
    levelHistory: []
  });

  // Estado de la aplicación
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Refs para evitar alertas duplicadas
  const lastGasAlert = useRef(0);
  const lastLevelAlert = useRef(0);
  const lastCriticalAlert = useRef(0);

  // Umbrales de alerta
  const THRESHOLDS = {
    GAS_WARNING: 300,
    GAS_DANGER: 400,
    LEVEL_WARNING: 80,
    LEVEL_CRITICAL: 95,
    ALERT_COOLDOWN: 10000 // 10 segundos entre alertas del mismo tipo
  };

  // ============================================
  // LÓGICA DE ALERTAS AUTOMÁTICAS
  // ============================================
  const checkAlerts = useCallback((data) => {
    const now = Date.now();

    // Alerta de gases peligrosos
    if (data.ppm > THRESHOLDS.GAS_DANGER && now - lastGasAlert.current > THRESHOLDS.ALERT_COOLDOWN) {
      toast.error(`⚠️ ¡Gases peligrosos detectados! PPM: ${data.ppm}`, {
        icon: '💨',
        autoClose: 6000
      });
      lastGasAlert.current = now;
    } else if (data.ppm > THRESHOLDS.GAS_WARNING && now - lastGasAlert.current > THRESHOLDS.ALERT_COOLDOWN) {
      toast.warning(`Calidad del aire baja. PPM: ${data.ppm}`, {
        icon: '🌫️',
        autoClose: 4000
      });
      lastGasAlert.current = now;
    }

    // Alerta de nivel crítico
    if (data.level >= THRESHOLDS.LEVEL_CRITICAL && now - lastCriticalAlert.current > THRESHOLDS.ALERT_COOLDOWN) {
      toast.error(`🚨 ¡Basurero LLENO! Nivel: ${data.level.toFixed(1)}%`, {
        autoClose: 8000
      });
      lastCriticalAlert.current = now;
    } else if (data.level >= THRESHOLDS.LEVEL_WARNING && now - lastLevelAlert.current > THRESHOLDS.ALERT_COOLDOWN * 2) {
      toast.info(`📊 Nivel alto de llenado: ${data.level.toFixed(1)}%`, {
        autoClose: 4000
      });
      lastLevelAlert.current = now;
    }
  }, []);

  // ============================================
  // INICIALIZACIÓN Y SUSCRIPCIÓN
  // ============================================
  useEffect(() => {
    // Iniciar servicio (Firebase o Simulación)
    initializeService();
    setIsConnected(true);
    setIsLoading(false);

    // Suscribirse a cambios
    const unsubscribe = subscribeToSensorData((data) => {
      // Debug: Log de datos recibidos
      console.log('🔄 useSmartBin recibió:', {
        level: data.level,
        lidOpen: data.lidOpen,
        fanOn: data.fanOn,
        ppm: data.ppm
      });
      
      setSensorData(data);
      setLastUpdate(new Date());
      checkAlerts(data);
    });

    // Notificación inicial
    toast.success(
      isSimulationMode() 
        ? '🎮 Modo simulación activo' 
        : '📡 Conectado a Firebase',
      { autoClose: 3000 }
    );

    // Cleanup
    return () => {
      cleanupService();
      unsubscribe();
    };
  }, [checkAlerts]);

  // ============================================
  // COMANDOS
  // ============================================
  const toggleLid = useCallback(async () => {
    const success = await sendCommand('toggleLid');
    if (success) {
      toast.info(sensorData.lidOpen ? '🚪 Cerrando tapa...' : '🚪 Abriendo tapa...', {
        autoClose: 2000
      });
    }
    return success;
  }, [sensorData.lidOpen]);

  const toggleFan = useCallback(async () => {
    const success = await sendCommand('toggleFan');
    if (success) {
      toast.info(sensorData.fanOn ? '🌀 Apagando ventilador...' : '🌀 Activando ventilador...', {
        autoClose: 2000
      });
    }
    return success;
  }, [sensorData.fanOn]);

  const openLid = useCallback(() => sendCommand('openLid'), []);
  const closeLid = useCallback(() => sendCommand('closeLid'), []);
  const turnFanOn = useCallback(() => sendCommand('fanOn'), []);
  const turnFanOff = useCallback(() => sendCommand('fanOff'), []);

  // ============================================
  // FUNCIONES DE DEBUG
  // ============================================
  const simulateFill = useCallback(() => {
    debugFillQuickly();
    toast.info('🗑️ Simulando llenado rápido...', { autoClose: 2000 });
  }, []);

  const simulateGas = useCallback(() => {
    debugGasSpike();
    toast.warning('💨 Simulando pico de gases...', { autoClose: 2000 });
  }, []);

  const resetSimulation = useCallback(() => {
    debugReset();
    toast.success('🔄 Simulación reiniciada', { autoClose: 2000 });
  }, []);

  const initDatabase = useCallback(async () => {
    const success = await seedDatabase();
    if (success) {
      toast.success('🌱 Base de datos inicializada', { autoClose: 2000 });
    } else {
      toast.error('Error al inicializar base de datos');
    }
    return success;
  }, []);

  // ============================================
  // ESTADOS DERIVADOS
  // ============================================
  const status = {
    isOverflowing: sensorData.level >= THRESHOLDS.LEVEL_CRITICAL,
    isAlmostFull: sensorData.level >= THRESHOLDS.LEVEL_WARNING,
    hasGasWarning: sensorData.ppm >= THRESHOLDS.GAS_WARNING,
    hasGasDanger: sensorData.ppm >= THRESHOLDS.GAS_DANGER,
    levelStatus: sensorData.level >= 95 ? 'critical' : 
                  sensorData.level >= 80 ? 'warning' : 
                  sensorData.level >= 50 ? 'medium' : 'good',
    airQualityStatus: sensorData.ppm >= 400 ? 'danger' :
                      sensorData.ppm >= 300 ? 'warning' :
                      sensorData.ppm >= 150 ? 'medium' : 'good'
  };

  return {
    // Datos
    sensorData,
    status,
    
    // Estado de conexión
    isConnected,
    isLoading,
    lastUpdate,
    isSimulation: isSimulationMode(),
    
    // Comandos
    toggleLid,
    toggleFan,
    openLid,
    closeLid,
    turnFanOn,
    turnFanOff,
    
    // Debug
    simulateFill,
    simulateGas,
    resetSimulation,
    initDatabase,
    
    // Umbrales (para UI)
    thresholds: THRESHOLDS
  };
}

export default useSmartBin;
