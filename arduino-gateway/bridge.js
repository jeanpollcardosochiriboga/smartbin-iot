/**
 * SmartBin IoT - Arduino Gateway Bridge
 * 
 * Puente entre Arduino (Serial USB) y Firebase Realtime Database.
 * Lee datos JSON del puerto serial y los sincroniza con la nube.
 */

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const admin = require('firebase-admin');
require('dotenv').config();

// ============================================================
// CONFIGURACIÓN - Modifica estos valores según tu setup
// ============================================================

const PORT_PATH = process.env.SERIAL_PORT || 'COM3';  // Puerto serial del Arduino
const BAUD_RATE = 9600;                                // Velocidad de comunicación
const DATABASE_URL = 'https://smartbin-iot-epn-default-rtdb.firebaseio.com';

// ============================================================
// INICIALIZACIÓN DE FIREBASE
// ============================================================

let db;

function initializeFirebase() {
  try {
    const serviceAccount = require('./serviceAccountKey.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: DATABASE_URL
    });
    
    db = admin.database();
    console.log('✅ Firebase inicializado correctamente');
    console.log(`📡 Conectado a: ${DATABASE_URL}`);
    return true;
  } catch (error) {
    console.error('❌ Error al inicializar Firebase:', error.message);
    console.error('   Asegúrate de que serviceAccountKey.json existe en esta carpeta.');
    return false;
  }
}

// ============================================================
// CONEXIÓN SERIAL
// ============================================================

function initializeSerialPort() {
  console.log(`\n🔌 Intentando conectar al puerto: ${PORT_PATH}`);
  console.log(`   Baud Rate: ${BAUD_RATE}`);
  
  const port = new SerialPort({
    path: PORT_PATH,
    baudRate: BAUD_RATE,
    autoOpen: false
  });

  const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

  // Abrir conexión
  port.open((err) => {
    if (err) {
      console.error('❌ Error al abrir puerto serial:', err.message);
      console.error('\n💡 Sugerencias:');
      console.error('   1. Verifica que el Arduino esté conectado');
      console.error('   2. Cierra el Monitor Serial de Arduino IDE');
      console.error('   3. Revisa el puerto correcto en Administrador de Dispositivos');
      listAvailablePorts();
      return;
    }
    console.log('✅ Puerto serial abierto exitosamente\n');
    console.log('📟 Esperando datos del Arduino...');
    console.log('   Formato esperado: {"fill_level": X, "air_quality": Y}');
    console.log('─'.repeat(50));
  });

  // Procesar datos entrantes
  parser.on('data', (line) => {
    processSerialData(line);
  });

  // Manejo de errores
  port.on('error', (err) => {
    console.error('❌ Error en puerto serial:', err.message);
  });

  port.on('close', () => {
    console.log('⚠️  Conexión serial cerrada');
  });

  return port;
}

// ============================================================
// PROCESAMIENTO DE DATOS
// ============================================================

async function processSerialData(rawData) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n[${timestamp}] 📥 Recibido: ${rawData}`);

  try {
    // Intentar parsear como JSON
    const data = JSON.parse(rawData);

    // Validar estructura esperada
    if (typeof data.fill_level === 'undefined' && typeof data.air_quality === 'undefined') {
      console.log('⚠️  JSON válido pero sin campos esperados (fill_level, air_quality)');
      return;
    }

    // Preparar objeto para Firebase
    const sensorData = {};
    
    if (typeof data.fill_level !== 'undefined') {
      sensorData.fill_level = Number(data.fill_level);
    }
    
    if (typeof data.air_quality !== 'undefined') {
      sensorData.air_quality = Number(data.air_quality);
    }

    // Agregar timestamp
    sensorData.last_update = admin.database.ServerValue.TIMESTAMP;

    // Enviar a Firebase
    console.log('📤 Enviando a Firebase:', sensorData);
    
    await db.ref('sensors').update(sensorData);
    
    console.log('✅ Datos sincronizados exitosamente');

  } catch (parseError) {
    if (rawData.trim().length > 0) {
      console.log('⚠️  Línea no es JSON válido (ignorada)');
    }
  }
}

// ============================================================
// UTILIDADES
// ============================================================

async function listAvailablePorts() {
  try {
    const ports = await SerialPort.list();
    console.log('\n📋 Puertos disponibles:');
    if (ports.length === 0) {
      console.log('   (ninguno detectado)');
    } else {
      ports.forEach((port) => {
        console.log(`   - ${port.path} ${port.manufacturer || ''}`);
      });
    }
  } catch (err) {
    console.error('Error al listar puertos:', err.message);
  }
}

// ============================================================
// PUNTO DE ENTRADA
// ============================================================

console.log('═'.repeat(50));
console.log('   SmartBin IoT - Arduino Gateway Bridge');
console.log('═'.repeat(50));

// Inicializar Firebase primero
if (!initializeFirebase()) {
  console.error('\n🛑 No se puede continuar sin Firebase. Saliendo...');
  process.exit(1);
}

// Luego conectar al puerto serial
initializeSerialPort();

// Manejo de cierre limpio
process.on('SIGINT', () => {
  console.log('\n\n👋 Cerrando gateway...');
  process.exit(0);
});
