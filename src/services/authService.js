/**
 * Auth Service - Servicio de Autenticación
 * =========================================
 * 
 * Gestiona la autenticación con Firebase Auth
 */

import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { ref, set, get, serverTimestamp } from 'firebase/database';
import { auth, database } from '../firebaseConfig';

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Usuario autenticado
 */
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Login exitoso:', userCredential.user.email);
    return { 
      success: true, 
      user: userCredential.user 
    };
  } catch (error) {
    console.error('❌ Error de autenticación:', error.code);
    
    // Mensajes de error amigables
    const errorMessages = {
      'auth/invalid-email': 'El email no es válido',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/user-not-found': 'No existe una cuenta con este email',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/invalid-credential': 'Credenciales inválidas',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet'
    };
    
    return {
      success: false,
      error: errorMessages[error.code] || 'Error de autenticación'
    };
  }
}

/**
 * Registra un nuevo usuario con email, contraseña y datos demográficos
 * @param {string} email - Email del nuevo usuario
 * @param {string} password - Contraseña
 * @param {Object} userData - Datos adicionales del usuario
 * @param {string} userData.fullName - Nombre completo
 * @param {string} userData.city - Ciudad
 * @returns {Promise<Object>} Usuario creado
 */
export async function register(email, password, userData = {}) {
  try {
    // 1. Crear usuario en Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Usuario registrado en Auth:', user.email);

    // 2. Actualizar displayName en Auth
    if (userData.fullName) {
      await updateProfile(user, {
        displayName: userData.fullName
      });
      console.log('✅ Perfil actualizado con displayName:', userData.fullName);
    }

    // 3. Guardar datos adicionales en Realtime Database
    if (database && (userData.fullName || userData.city)) {
      const userRef = ref(database, `users/${user.uid}`);
      await set(userRef, {
        fullName: userData.fullName || '',
        city: userData.city || '',
        email: user.email,
        registeredAt: serverTimestamp()
      });
      console.log('✅ Datos de usuario guardados en Database');
    }

    return { 
      success: true, 
      user: {
        ...user,
        displayName: userData.fullName || user.displayName
      }
    };
  } catch (error) {
    console.error('❌ Error de registro:', error.code);
    
    const errorMessages = {
      'auth/email-already-in-use': 'Este correo ya está registrado',
      'auth/invalid-email': 'El email no es válido',
      'auth/operation-not-allowed': 'Registro deshabilitado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres'
    };
    
    return {
      success: false,
      error: errorMessages[error.code] || 'Error al crear cuenta'
    };
  }
}

/**
 * Obtiene los datos del usuario desde la base de datos
 * @param {string} uid - ID del usuario
 * @returns {Promise<Object|null>} Datos del usuario
 */
export async function getUserData(uid) {
  if (!database || !uid) return null;
  
  try {
    const userRef = ref(database, `users/${uid}`);
    const snapshot = await get(userRef);
    return snapshot.val();
  } catch (error) {
    console.error('Error obteniendo datos del usuario:', error);
    return null;
  }
}

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise<boolean>} Éxito de la operación
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
    console.log('👋 Sesión cerrada');
    return { success: true };
  } catch (error) {
    console.error('❌ Error al cerrar sesión:', error);
    return { 
      success: false, 
      error: 'Error al cerrar sesión' 
    };
  }
}

/**
 * Suscribe a cambios en el estado de autenticación
 * @param {Function} callback - Función a llamar cuando cambie el estado
 * @returns {Function} Función para desuscribirse
 */
export function subscribeToAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user);
  });
}

/**
 * Obtiene el usuario actual
 * @returns {Object|null} Usuario actual o null
 */
export function getCurrentUser() {
  return auth.currentUser;
}

export default {
  signIn,
  signOut,
  register,
  getUserData,
  subscribeToAuthState,
  getCurrentUser
};
