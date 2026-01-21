/**
 * IoT Service - Capa de Datos del SmartBin
 * =========================================
 * 
 * Este servicio gestiona toda la lógica de datos del basurero inteligente.
 * Soporta dos modos:
 * - SIMULACIÓN: Para desarrollo y demos (fallback)
 * - FIREBASE: Para conexión real con hardware IoT
 */

import { ref, onValue, set, get, push } from 'firebase/database';
import { database } from '../firebaseConfig';

// ============================================
// CONFIGURACIÓN PRINCIPAL
// ============================================
export const USE_SIMULATION = false; // Cambiado a false para usar Firebase

// Flag para saber si estamos en modo fallback
let isUsingFallback = false;

// ============================================
// ESTADO INTERNO DE SIMULACIÓN (FALLBACK)
// ============================================
let simulationState = {
  level: 15,
  ppm: 50,
  lidOpen: false,
  fanOn: false,
  temperature: 22,
  humidity: 45,
  timestamp: Date.now()
};

let ppmHistory = Array(20).fill(50);
let levelHistory = Array(20).fill(15);
let listeners = [];
let simulationInterval = null;

// ============================================
// FIREBASE PATHS
// ============================================
const PATHS = {
  FILL_LEVEL: 'sensors/fill_level',
  AIR_QUALITY: 'sensors/air_quality',
  TEMPERATURE: 'sensors/temperature',
  HUMIDITY: 'sensors/humidity',
  LID_STATUS: 'sensors/lid_status',      // Sensor real del Arduino
  LID_OPEN: 'actuators/lid_open',         // Comando manual (legacy)
  FAN_STATUS: 'actuators/fan_status',
  EVENTS: 'events',
  CONFIG: 'config/thresholds',
  ALERTS: 'alerts'
};

// ============================================
// ESTADO FIREBASE
// ============================================
let firebaseState = {
  level: 0,
  ppm: 0,
  lidOpen: false,
  fanOn: false,
  temperature: 22,
  humidity: 45,
  timestamp: Date.now(),
  ppmHistory: Array(20).fill(0),
  levelHistory: Array(20).fill(0)
};

let firebaseListeners = [];
let unsubscribeFunctions = [];

// ============================================
// LÓGICA DE FÍSICA SIMULADA (FALLBACK)
// ============================================
function simulatePhysics() {
  const prevState = { ...simulationState };
  
  if (simulationState.level < 100) {
    simulationState.level = Math.min(100, simulationState.level + 0.3);
  }
  
  let basePpm = 50;
  if (simulationState.level > 80) {
    basePpm = 50 + (simulationState.level - 80) * 5;
  }
  if (simulationState.level > 90) {
    basePpm += (simulationState.level - 90) * 10;
  }
  
  if (simulationState.lidOpen && !prevState.lidOpen) {
    simulationState.ppm = Math.min(600, simulationState.ppm + 80 + Math.random() * 100);
  }
  
  if (simulationState.fanOn && simulationState.ppm > 60) {
    simulationState.ppm = Math.max(40, simulationState.ppm - 25);
  } else if (!simulationState.fanOn) {
    if (simulationState.ppm < basePpm) {
      simulationState.ppm = Math.min(basePpm, simulationState.ppm + 3);
    } else if (simulationState.ppm > basePpm + 20) {
      simulationState.ppm = Math.max(basePpm, simulationState.ppm - 2);
    }
  }
  
  simulationState.ppm += (Math.random() - 0.5) * 8;
  simulationState.ppm = Math.max(20, Math.min(600, simulationState.ppm));
  
  simulationState.temperature += (Math.random() - 0.5) * 0.3;
  simulationState.temperature = Math.max(18, Math.min(35, simulationState.temperature));
  
  simulationState.humidity += (Math.random() - 0.5) * 1;
  simulationState.humidity = Math.max(30, Math.min(80, simulationState.humidity));
  
  simulationState.timestamp = Date.now();
  
  ppmHistory.push(Math.round(simulationState.ppm));
  ppmHistory.shift();
  
  levelHistory.push(Math.round(simulationState.level));
  levelHistory.shift();
  
  notifyListeners();
}

function notifyListeners() {
  const state = getFormattedState();
  listeners.forEach(callback => callback(state));
}

function getFormattedState() {
  if (USE_SIMULATION || isUsingFallback) {
    return {
      level: Math.round(simulationState.level * 10) / 10,
      ppm: Math.round(simulationState.ppm),
      lidOpen: simulationState.lidOpen,
      fanOn: simulationState.fanOn,
      temperature: Math.round(simulationState.temperature * 10) / 10,
      humidity: Math.round(simulationState.humidity),
      timestamp: simulationState.timestamp,
      ppmHistory: [...ppmHistory],
      levelHistory: [...levelHistory]
    };
  }
  return { ...firebaseState };
}

// ============================================
// FIREBASE LISTENERS
// ============================================
function setupFirebaseListeners() {
  if (!database) {
    console.warn('⚠️ Database no disponible, usando simulación');
    isUsingFallback = true;
    startSimulation();
    return;
  }

  try {
    // Listener para nivel de llenado
    const levelRef = ref(database, PATHS.FILL_LEVEL);
    const unsubLevel = onValue(levelRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null) {
        firebaseState.level = typeof value === 'object' ? value.value || 0 : value;
        firebaseState.levelHistory.push(firebaseState.level);
        firebaseState.levelHistory.shift();
        notifyFirebaseListeners();
      }
    }, (error) => {
      console.error('Error en listener de nivel:', error);
      enableFallback();
    });
    unsubscribeFunctions.push(unsubLevel);

    // Listener para calidad del aire
    const airRef = ref(database, PATHS.AIR_QUALITY);
    const unsubAir = onValue(airRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null) {
        firebaseState.ppm = typeof value === 'object' ? value.value || 0 : value;
        firebaseState.ppmHistory.push(firebaseState.ppm);
        firebaseState.ppmHistory.shift();
        notifyFirebaseListeners();
      }
    }, (error) => {
      console.error('Error en listener de aire:', error);
      enableFallback();
    });
    unsubscribeFunctions.push(unsubAir);

    // Listener para estado de tapa desde SENSOR Arduino (lid_status)
    const lidSensorRef = ref(database, PATHS.LID_STATUS);
    const unsubLidSensor = onValue(lidSensorRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null) {
        // Puede venir como booleano directo o como objeto {status: bool}
        firebaseState.lidOpen = typeof value === 'object' ? (value.status ?? value.value ?? false) : Boolean(value);
        console.log('📦 Tapa (sensor):', firebaseState.lidOpen ? 'ABIERTA' : 'CERRADA');
        notifyFirebaseListeners();
      }
    });
    unsubscribeFunctions.push(unsubLidSensor);

    // Listener legacy para actuator/lid_open (comandos manuales)
    const lidActuatorRef = ref(database, PATHS.LID_OPEN);
    const unsubLidActuator = onValue(lidActuatorRef, (snapshot) => {
      const value = snapshot.val();
      // Solo actualizar si el sensor no ha reportado (fallback)
      if (value !== null && firebaseState.lidOpen === undefined) {
        firebaseState.lidOpen = typeof value === 'object' ? value.status || false : value;
        notifyFirebaseListeners();
      }
    });
    unsubscribeFunctions.push(unsubLidActuator);

    // Listener para estado del ventilador
    const fanRef = ref(database, PATHS.FAN_STATUS);
    const unsubFan = onValue(fanRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null) {
        firebaseState.fanOn = typeof value === 'object' ? value.status || false : value;
        notifyFirebaseListeners();
      }
    });
    unsubscribeFunctions.push(unsubFan);

    // Listener para temperatura
    const tempRef = ref(database, PATHS.TEMPERATURE);
    const unsubTemp = onValue(tempRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null) {
        firebaseState.temperature = typeof value === 'object' ? value.value || 22 : value;
        notifyFirebaseListeners();
      }
    });
    unsubscribeFunctions.push(unsubTemp);

    // Listener para humedad
    const humRef = ref(database, PATHS.HUMIDITY);
    const unsubHum = onValue(humRef, (snapshot) => {
      const value = snapshot.val();
      if (value !== null) {
        firebaseState.humidity = typeof value === 'object' ? value.value || 45 : value;
        notifyFirebaseListeners();
      }
    });
    unsubscribeFunctions.push(unsubHum);

    console.log('🔥 Listeners de Firebase configurados');
  } catch (error) {
    console.error('Error configurando Firebase:', error);
    enableFallback();
  }
}

function notifyFirebaseListeners() {
  firebaseState.timestamp = Date.now();
  const state = { ...firebaseState };
  firebaseListeners.forEach(callback => callback(state));
}

function enableFallback() {
  if (!isUsingFallback) {
    console.warn('⚠️ Activando modo simulación (fallback)');
    isUsingFallback = true;
    startSimulation();
  }
}

// ============================================
// INTERVALO DE SIMULACIÓN
// ============================================
export function startSimulation(intervalMs = 2000) {
  if ((USE_SIMULATION || isUsingFallback) && !simulationInterval) {
    simulationInterval = setInterval(simulatePhysics, intervalMs);
    console.log('🎮 Simulación IoT iniciada');
  }
}

export function stopSimulation() {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('⏹️ Simulación IoT detenida');
  }
}

// ============================================
// MODO DEMO (HARDWARE SIMULATOR)
// ============================================
let demoInterval = null;
let demoState = {
  level: 0,
  ppm: 50,
  isRunning: false
};

/**
 * Inicia el modo demo - escribe valores simulados a Firebase
 * Simula el comportamiento del ESP32
 */
export function startDemoMode() {
  if (demoInterval) {
    console.log('⚡ Demo mode ya está activo');
    return;
  }

  if (!database) {
    console.error('❌ No se puede iniciar demo: Firebase no disponible');
    return false;
  }

  demoState.isRunning = true;
  console.log('⚡ Hardware Simulator ACTIVADO');

  demoInterval = setInterval(async () => {
    try {
      // Incrementar nivel 5% cada paso
      demoState.level += 5;
      
      // Si llega a 100%, reiniciar a 0%
      if (demoState.level > 100) {
        demoState.level = 0;
        demoState.ppm = 50; // Reiniciar gases también
        console.log('🔄 Ciclo de demo reiniciado');
      }

      // Si nivel > 80%, subir gases aleatoriamente
      if (demoState.level > 80) {
        const gasIncrease = Math.floor(Math.random() * 50) + 20; // 20-70 PPM extra
        demoState.ppm = Math.min(500, demoState.ppm + gasIncrease);
      } else {
        // Fluctuación normal de gases
        demoState.ppm += Math.floor(Math.random() * 10) - 3;
        demoState.ppm = Math.max(40, Math.min(150, demoState.ppm));
      }

      // Escribir a Firebase
      const levelRef = ref(database, PATHS.FILL_LEVEL);
      const airRef = ref(database, PATHS.AIR_QUALITY);

      await set(levelRef, {
        value: demoState.level,
        timestamp: Date.now(),
        source: 'demo_simulator'
      });

      await set(airRef, {
        value: demoState.ppm,
        timestamp: Date.now(),
        source: 'demo_simulator'
      });

      console.log(`📊 Demo: Nivel=${demoState.level}%, PPM=${demoState.ppm}`);

    } catch (error) {
      console.error('Error en demo mode:', error);
    }
  }, 6000); // Cada 6 segundos (más realista para presentaciones)

  return true;
}

/**
 * Detiene el modo demo
 */
export function stopDemoMode() {
  if (demoInterval) {
    clearInterval(demoInterval);
    demoInterval = null;
    demoState.isRunning = false;
    console.log('⏹️ Hardware Simulator DETENIDO');
    return true;
  }
  return false;
}

/**
 * Verifica si el modo demo está activo
 */
export function isDemoModeActive() {
  return demoState.isRunning;
}

// ============================================
// API PÚBLICA
// ============================================

/**
 * Inicializa el servicio (Firebase o Simulación)
 */
export function initializeService() {
  if (USE_SIMULATION) {
    startSimulation();
  } else {
    setupFirebaseListeners();
  }
}

/**
 * Detiene todos los listeners
 */
export function cleanupService() {
  stopSimulation();
  unsubscribeFunctions.forEach(unsub => unsub());
  unsubscribeFunctions = [];
}

/**
 * Obtiene los datos actuales del sensor
 */
export async function fetchSensorData() {
  return Promise.resolve(getFormattedState());
}

/**
 * Envía un comando al SmartBin
 */
export async function sendCommand(command) {
  // Si estamos en simulación o fallback
  if (USE_SIMULATION || isUsingFallback) {
    switch (command) {
      case 'openLid':
        simulationState.lidOpen = true;
        break;
      case 'closeLid':
        simulationState.lidOpen = false;
        break;
      case 'fanOn':
        simulationState.fanOn = true;
        break;
      case 'fanOff':
        simulationState.fanOn = false;
        break;
      case 'toggleLid':
        simulationState.lidOpen = !simulationState.lidOpen;
        break;
      case 'toggleFan':
        simulationState.fanOn = !simulationState.fanOn;
        break;
      default:
        console.warn('Comando desconocido:', command);
        return false;
    }
    notifyListeners();
    return true;
  }

  // Firebase real
  try {
    if (!database) throw new Error('Database no disponible');
    
    switch (command) {
      case 'openLid':
      case 'closeLid':
      case 'toggleLid': {
        const lidRef = ref(database, PATHS.LID_OPEN);
        const newLidState = command === 'toggleLid' ? !firebaseState.lidOpen : command === 'openLid';
        await set(lidRef, { status: newLidState, timestamp: Date.now() });
        break;
      }
      case 'fanOn':
      case 'fanOff':
      case 'toggleFan': {
        const fanRef = ref(database, PATHS.FAN_STATUS);
        const newFanState = command === 'toggleFan' ? !firebaseState.fanOn : command === 'fanOn';
        await set(fanRef, { status: newFanState, timestamp: Date.now() });
        break;
      }
      default:
        console.warn('Comando desconocido:', command);
        return false;
    }
    
    // Registrar evento
    await logEvent(command, 'command');
    return true;
  } catch (error) {
    console.error('Error enviando comando:', error);
    return false;
  }
}

/**
 * Suscribirse a cambios en los datos del sensor
 */
export function subscribeToSensorData(callback) {
  if (USE_SIMULATION || isUsingFallback) {
    listeners.push(callback);
    callback(getFormattedState());
    return () => {
      listeners = listeners.filter(cb => cb !== callback);
    };
  }
  
  firebaseListeners.push(callback);
  callback(getFormattedState());
  return () => {
    firebaseListeners = firebaseListeners.filter(cb => cb !== callback);
  };
}

// ============================================
// EVENTOS Y ALERTAS
// ============================================

/**
 * Registra un evento en la base de datos
 */
export async function logEvent(event, type = 'info', value = null) {
  if (!database || USE_SIMULATION || isUsingFallback) {
    console.log(`📝 Evento (simulado): ${type} - ${event}`);
    return;
  }

  try {
    const eventsRef = ref(database, PATHS.EVENTS);
    await push(eventsRef, {
      event,
      type,
      value,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error registrando evento:', error);
  }
}

/**
 * Obtiene el historial de eventos
 */
export async function getEventHistory(limit = 50) {
  if (!database || USE_SIMULATION || isUsingFallback) {
    return getMockEventHistory();
  }

  try {
    const eventsRef = ref(database, PATHS.EVENTS);
    const snapshot = await get(eventsRef);
    const data = snapshot.val();
    
    if (!data) return [];
    
    return Object.entries(data)
      .map(([id, event]) => ({ id, ...event }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch (error) {
    console.error('Error obteniendo eventos:', error);
    return getMockEventHistory();
  }
}

/**
 * Guarda una alerta
 */
export async function saveAlert(alert) {
  if (!database || USE_SIMULATION || isUsingFallback) {
    console.log('🚨 Alerta (simulada):', alert);
    return;
  }

  try {
    const alertsRef = ref(database, PATHS.ALERTS);
    await push(alertsRef, {
      ...alert,
      timestamp: Date.now(),
      acknowledged: false
    });
  } catch (error) {
    console.error('Error guardando alerta:', error);
  }
}

/**
 * Obtiene las alertas
 */
export async function getAlerts() {
  if (!database || USE_SIMULATION || isUsingFallback) {
    return getMockAlerts();
  }

  try {
    const alertsRef = ref(database, PATHS.ALERTS);
    const snapshot = await get(alertsRef);
    const data = snapshot.val();
    
    if (!data) return [];
    
    return Object.entries(data)
      .map(([id, alert]) => ({ id, ...alert }))
      .sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    return getMockAlerts();
  }
}

/**
 * Limpia todas las alertas
 */
export async function clearAlerts() {
  if (!database || USE_SIMULATION || isUsingFallback) {
    console.log('🗑️ Alertas limpiadas (simulación)');
    return true;
  }

  try {
    const alertsRef = ref(database, PATHS.ALERTS);
    await set(alertsRef, null);
    return true;
  } catch (error) {
    console.error('Error limpiando alertas:', error);
    return false;
  }
}

// ============================================
// CONFIGURACIÓN
// ============================================

/**
 * Obtiene la configuración de umbrales
 */
export async function getThresholds() {
  if (!database || USE_SIMULATION || isUsingFallback) {
    return {
      gasWarning: 300,
      gasDanger: 400,
      levelWarning: 80,
      levelCritical: 95,
      maxDistance: 100
    };
  }

  try {
    const configRef = ref(database, PATHS.CONFIG);
    const snapshot = await get(configRef);
    return snapshot.val() || {
      gasWarning: 300,
      gasDanger: 400,
      levelWarning: 80,
      levelCritical: 95,
      maxDistance: 100
    };
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return null;
  }
}

/**
 * Guarda la configuración de umbrales
 */
export async function saveThresholds(thresholds) {
  if (!database || USE_SIMULATION || isUsingFallback) {
    console.log('💾 Configuración guardada (simulación):', thresholds);
    return true;
  }

  try {
    const configRef = ref(database, PATHS.CONFIG);
    await set(configRef, {
      ...thresholds,
      updatedAt: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error guardando configuración:', error);
    return false;
  }
}

// ============================================
// SEED DATABASE (Para inicializar datos)
// ============================================

/**
 * Inicializa la base de datos con valores por defecto
 */
export async function seedDatabase() {
  if (!database) {
    console.warn('⚠️ Database no disponible para seed');
    return false;
  }

  try {
    console.log('🌱 Inicializando base de datos...');

    // Sensores
    await set(ref(database, PATHS.FILL_LEVEL), { value: 25, timestamp: Date.now() });
    await set(ref(database, PATHS.AIR_QUALITY), { value: 75, timestamp: Date.now() });
    await set(ref(database, PATHS.TEMPERATURE), { value: 22, timestamp: Date.now() });
    await set(ref(database, PATHS.HUMIDITY), { value: 45, timestamp: Date.now() });

    // Actuadores
    await set(ref(database, PATHS.LID_OPEN), { status: false, timestamp: Date.now() });
    await set(ref(database, PATHS.FAN_STATUS), { status: false, timestamp: Date.now() });

    // Configuración
    await set(ref(database, PATHS.CONFIG), {
      gasWarning: 300,
      gasDanger: 400,
      levelWarning: 80,
      levelCritical: 95,
      maxDistance: 100,
      updatedAt: Date.now()
    });

    // Evento inicial
    await push(ref(database, PATHS.EVENTS), {
      event: 'Sistema inicializado',
      type: 'system',
      timestamp: Date.now()
    });

    console.log('✅ Base de datos inicializada correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    return false;
  }
}

// ============================================
// FUNCIONES DE DEBUG / DEMO
// ============================================

export function debugFillQuickly() {
  if (USE_SIMULATION || isUsingFallback) {
    simulationState.level = Math.min(100, simulationState.level + 30);
    notifyListeners();
  } else if (database) {
    const newLevel = Math.min(100, firebaseState.level + 30);
    set(ref(database, PATHS.FILL_LEVEL), { value: newLevel, timestamp: Date.now() });
  }
}

export function debugGasSpike() {
  if (USE_SIMULATION || isUsingFallback) {
    simulationState.ppm = Math.min(600, simulationState.ppm + 200);
    notifyListeners();
  } else if (database) {
    const newPpm = Math.min(600, firebaseState.ppm + 200);
    set(ref(database, PATHS.AIR_QUALITY), { value: newPpm, timestamp: Date.now() });
  }
}

export function debugReset() {
  if (USE_SIMULATION || isUsingFallback) {
    simulationState = {
      level: 15,
      ppm: 50,
      lidOpen: false,
      fanOn: false,
      temperature: 22,
      humidity: 45,
      timestamp: Date.now()
    };
    ppmHistory = Array(20).fill(50);
    levelHistory = Array(20).fill(15);
    notifyListeners();
  } else {
    seedDatabase();
  }
}

export function isSimulationMode() {
  return USE_SIMULATION || isUsingFallback;
}

// ============================================
// MOCK DATA
// ============================================

function getMockEventHistory() {
  const events = [
    { event: 'Ventilador activado', type: 'command', value: null },
    { event: 'Gases detectados > 350 PPM', type: 'warning', value: 352 },
    { event: 'Tapa abierta', type: 'command', value: null },
    { event: 'Nivel de llenado alto', type: 'warning', value: 82 },
    { event: 'Sistema iniciado', type: 'system', value: null },
    { event: 'Configuración actualizada', type: 'system', value: null },
    { event: 'Tapa cerrada', type: 'command', value: null },
    { event: 'Ventilador desactivado', type: 'command', value: null },
    { event: 'Basurero vaciado', type: 'maintenance', value: 15 },
    { event: 'Gases normalizados', type: 'info', value: 85 },
  ];

  const now = Date.now();
  return events.map((event, index) => ({
    id: `mock-${index}`,
    ...event,
    timestamp: now - (index * 3600000)
  }));
}

function getMockAlerts() {
  const now = Date.now();
  return [
    { 
      id: 'alert-1', 
      type: 'danger', 
      title: 'Gases peligrosos detectados',
      message: 'Se detectaron niveles de gas superiores a 400 PPM',
      value: 423,
      timestamp: now - 1800000,
      acknowledged: false
    },
    { 
      id: 'alert-2', 
      type: 'warning', 
      title: 'Nivel de llenado alto',
      message: 'El contenedor está al 85% de su capacidad',
      value: 85,
      timestamp: now - 3600000,
      acknowledged: false
    },
    { 
      id: 'alert-3', 
      type: 'warning', 
      title: 'Calidad del aire baja',
      message: 'Niveles de PPM por encima del umbral de advertencia',
      value: 315,
      timestamp: now - 7200000,
      acknowledged: true
    },
  ];
}

export default {
  USE_SIMULATION,
  initializeService,
  cleanupService,
  startSimulation,
  stopSimulation,
  fetchSensorData,
  sendCommand,
  subscribeToSensorData,
  logEvent,
  getEventHistory,
  saveAlert,
  getAlerts,
  clearAlerts,
  getThresholds,
  saveThresholds,
  seedDatabase,
  debugFillQuickly,
  debugGasSpike,
  debugReset,
  isSimulationMode
};
