import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Trash2, Mail, Lock, Eye, EyeOff, Loader2, UserPlus, User, MapPin } from 'lucide-react';
import { signIn, register } from '../services/authService';

/**
 * Página de Login / Registro
 * Formulario de autenticación con Firebase Auth
 */
export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta de origen (si viene de una ruta protegida)
  const from = location.state?.from || '/';

  // Validación básica de email
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Por favor ingresa email y contraseña');
      return;
    }

    if (!isValidEmail(email)) {
      toast.error('Por favor ingresa un email válido');
      return;
    }

    if (isRegistering) {
      if (password.length < 6) {
        toast.error('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (!fullName.trim()) {
        toast.error('Por favor ingresa tu nombre completo');
        return;
      }
      if (!city.trim()) {
        toast.error('Por favor ingresa tu ciudad');
        return;
      }
    }

    setIsLoading(true);

    try {
      const result = isRegistering 
        ? await register(email, password, { fullName: fullName.trim(), city: city.trim() })
        : await signIn(email, password);
      
      if (result.success) {
        const displayName = result.user.displayName || result.user.email;
        toast.success(
          isRegistering 
            ? `¡Cuenta creada! Bienvenido, ${displayName}`
            : `¡Bienvenido, ${displayName}!`, 
          { icon: isRegistering ? '🎉' : '👋' }
        );
        navigate(from, { replace: true });
      } else {
        toast.error(result.error, { icon: '❌' });
      }
    } catch (error) {
      toast.error('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setPassword('');
    setFullName('');
    setCity('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className={`px-8 py-10 text-center transition-colors duration-300 ${
            isRegistering 
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700'
          }`}>
            <motion.div
              key={isRegistering ? 'register' : 'login'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-4 flex items-center justify-center"
            >
              {isRegistering ? (
                <UserPlus className="w-10 h-10 text-white" />
              ) : (
                <Trash2 className="w-10 h-10 text-white" />
              )}
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isRegistering ? 'Crear Cuenta' : 'SmartBin IoT'}
            </h1>
            <p className={`text-sm ${isRegistering ? 'text-emerald-100' : 'text-blue-100'}`}>
              {isRegistering 
                ? 'Regístrate para acceder al sistema' 
                : 'Sistema de Monitoreo Inteligente'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {/* Campos adicionales para registro */}
            <AnimatePresence>
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  {/* Nombre Completo */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Juan Pérez García"
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  {/* Ciudad */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Quito, Guayaquil, Cuenca..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    isRegistering ? 'focus:ring-emerald-500' : 'focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contraseña {isRegistering && <span className="text-slate-400 font-normal">(mín. 6 caracteres)</span>} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
                    isRegistering ? 'focus:ring-emerald-500' : 'focus:ring-blue-500'
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 text-white font-medium rounded-xl shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6 ${
                isRegistering
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 shadow-blue-500/25 hover:shadow-blue-500/40'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...'}
                </>
              ) : (
                <>
                  {isRegistering ? <UserPlus className="w-5 h-5" /> : null}
                  {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
                </>
              )}
            </motion.button>

            {/* Toggle Mode */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                {isRegistering ? (
                  <>¿Ya tienes cuenta? <span className="text-blue-600 font-medium hover:underline">Inicia sesión</span></>
                ) : (
                  <>¿No tienes cuenta? <span className="text-emerald-600 font-medium hover:underline">Crea una aquí</span></>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="px-8 pb-8 text-center">
            <p className="text-xs text-slate-400">
              Sistema de monitoreo IoT • Versión 2.0
            </p>
          </div>
        </div>

        {/* Info */}
        <p className="text-center text-sm text-slate-500 mt-6">
          ¿Problemas para acceder? Contacta al administrador
        </p>
      </motion.div>
    </div>
  );
}

export default LoginPage;
