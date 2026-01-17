/**
 * Auth Context - Contexto de Autenticación
 * =========================================
 * 
 * Provee estado de autenticación a toda la aplicación
 * Protege rutas que requieren login
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { subscribeToAuthState, signOut as authSignOut, getUserData } from '../services/authService';

// Crear contexto
const AuthContext = createContext(null);

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

/**
 * Proveedor de autenticación
 * Envuelve la aplicación y maneja el estado del usuario
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Suscribirse a cambios de autenticación
  useEffect(() => {
    const unsubscribe = subscribeToAuthState(async (firebaseUser) => {
      setUser(firebaseUser);
      
      // Cargar datos adicionales del usuario desde la base de datos
      if (firebaseUser) {
        const data = await getUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
      
      // Si hay usuario y estamos en login, redirigir al dashboard
      if (firebaseUser && location.pathname === '/login') {
        navigate('/', { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  // Función de logout
  const logout = async () => {
    const result = await authSignOut();
    if (result.success) {
      setUserData(null);
      navigate('/login', { replace: true });
    }
    return result;
  };

  // Valores del contexto
  const value = {
    user,
    userData,
    loading,
    isAuthenticated: !!user,
    logout,
    userEmail: user?.email || null,
    userName: user?.displayName || userData?.fullName || user?.email?.split('@')[0] || 'Usuario',
    userCity: userData?.city || null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Componente para proteger rutas
 * Redirige al login si no hay usuario autenticado
 */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { 
        replace: true, 
        state: { from: location.pathname } 
      });
    }
  }, [isAuthenticated, loading, navigate, location]);

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar nada (se redirigirá)
  if (!isAuthenticated) {
    return null;
  }

  return children;
}

export default AuthContext;
