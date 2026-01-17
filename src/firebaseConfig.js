/**
 * Firebase Configuration for SmartBin IoT
 * =========================================
 * 
 * CONFIGURACIÓN DE PRODUCCIÓN
 * Este archivo contiene las credenciales de Firebase
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Configuración de Firebase - SmartBin IoT EPN
const firebaseConfig = {
  apiKey: "AIzaSyBJ_eEhHTQfLpTjnQoTh_WpRzMh_3aaQa0",
  authDomain: "smartbin-iot-epn.firebaseapp.com",
  databaseURL: "https://smartbin-iot-epn-default-rtdb.firebaseio.com",
  projectId: "smartbin-iot-epn",
  storageBucket: "smartbin-iot-epn.firebasestorage.app",
  messagingSenderId: "219143779625",
  appId: "1:219143779625:web:22c4a00af5bb5537b43338",
  measurementId: "G-0XHHG659SB"
};

// Inicializar Firebase
let app;
let auth;
let database;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  database = getDatabase(app);
  console.log('🔥 Firebase inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Firebase:', error);
}

export { app, auth, database };
export default firebaseConfig;
