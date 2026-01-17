# SmartBin IoT - Guía para Agentes de IA

## Arquitectura del Proyecto

Esta aplicación es un **sistema de monitoreo IoT para basureros inteligentes** que soporta tanto simulación local (TRL 4) como conexión real a Firebase Realtime Database.

```
src/
├── services/       # Capa de datos
│   ├── iotService.js    # Firebase + simulación fallback
│   └── authService.js   # Autenticación Firebase
├── hooks/          # Lógica reactiva (useSmartBin.js) - Cerebro del sistema
├── context/        # React Context
│   └── AuthContext.jsx  # Estado de autenticación global
├── components/     # UI components organizados por función
│   ├── layout/     # Sidebar, Header
│   └── widgets/    # Widgets de dashboard (LevelWidget, AirQualityWidget, etc.)
├── pages/          # Páginas/rutas de la aplicación
│   ├── Dashboard.jsx         # Vista principal
│   ├── LoginPage.jsx         # Autenticación
│   ├── HistorialPage.jsx     # Eventos pasados
│   ├── AlertasPage.jsx       # Alertas activas
│   └── ConfiguracionPage.jsx # Ajustes y umbrales
└── lib/            # Utilidades (cn, formatters)
```

## Flujo de Datos Crítico

1. **iotService.js** → Conecta con Firebase Realtime Database (o simula si falla)
2. **authService.js** → Maneja login/logout con Firebase Auth
3. **AuthContext.jsx** → Provee estado de usuario y ProtectedRoute
4. **useSmartBin.js** → Hook que consume el servicio, maneja alertas automáticas via `react-toastify`
5. **Widgets** → Componentes de visualización que reciben datos del hook

## Comandos de Desarrollo

```bash
npm run dev     # Servidor de desarrollo (Vite)
npm run build   # Build de producción
npm run preview # Preview del build
```

## Convenciones Importantes

### Firebase Realtime Database Paths
- `sensors/fill_level` → Nivel de llenado (%)
- `sensors/air_quality` → Calidad de aire (PPM)
- `actuators/lid_open` → Estado de la tapa
- `actuators/fan_status` → Estado del ventilador
- `config/thresholds` → Umbrales de alerta
- `events/` → Historial de eventos
- `alerts/` → Alertas activas

### Modo Simulación vs Producción
- Variable `USE_SIMULATION = false` en iotService.js para producción
- Si Firebase falla, cae automáticamente a simulación
- `isSimulationMode()` indica el modo actual

### Autenticación
- Firebase Auth con email/password
- Usuario de prueba: `jeanpollcc@gmail.com` / `admin123`
- Todas las rutas (excepto /login) protegidas por `ProtectedRoute`

### Estilos (Tailwind CSS)
- Fondo claro (`bg-gray-50`) optimizado para proyector
- Tipografía: `text-slate-800` para legibilidad
- Usar `cn()` de src/lib/utils.js para combinar clases

### Alertas Automáticas (useSmartBin.js)
- Gases > 300 PPM → Toast warning
- Gases > 400 PPM → Toast error  
- Nivel > 80% → Toast info
- Nivel > 95% → Toast error (crítico)
- Cooldown de 10 segundos entre alertas del mismo tipo

## Stack Tecnológico

- **React 18** + **Vite** - Build ultrarrápido
- **Tailwind CSS v3** - Estilos utilitarios
- **Recharts** - Gráficos de área para PPM
- **Framer Motion** - Animaciones fluidas
- **Lucide React** - Iconografía
- **React Router DOM** - Navegación SPA
- **React Toastify** - Notificaciones toast
- **Firebase** - Auth + Realtime Database

## Patrones a Seguir

1. **Nuevos widgets**: Crear en `src/components/widgets/`, exportar en `index.js`
2. **Nuevas páginas**: Crear en `src/pages/`, agregar ruta en `App.jsx`, proteger con `ProtectedRoute`
3. **Lógica de sensores**: Extender `iotService.js`, no poner en componentes
4. **Alertas**: Configurar umbrales en `useSmartBin.js` → objeto `THRESHOLDS`
5. **Autenticación**: Usar `useAuth()` hook para acceder al usuario actual
