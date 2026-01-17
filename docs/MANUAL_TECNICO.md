# Manual Técnico - SmartBin IoT HMI

**Sistema de Interfaz Humano-Máquina para Basurero Inteligente**

| Campo | Valor |
|-------|-------|
| Versión | 2.0.0 |
| Fecha | Enero 2026 |
| Tecnologías | React 19, Firebase, Vite 7 |
| Nivel de Madurez | TRL 4-5 (Validación en laboratorio) |

---

## 1. Descripción General

### 1.1 Propósito del Sistema

SmartBin IoT HMI es una **aplicación web de monitoreo en tiempo real** diseñada para supervisar y controlar un sistema de basurero inteligente equipado con sensores IoT. La plataforma proporciona una interfaz gráfica intuitiva que permite a operadores y administradores:

- **Visualizar** el nivel de llenado del contenedor mediante indicadores gauge.
- **Monitorear** la calidad del aire (concentración de gases en PPM) con gráficos históricos.
- **Controlar** actuadores remotamente (tapa motorizada, ventilador de extracción).
- **Recibir alertas** automáticas cuando los umbrales de seguridad son superados.
- **Gestionar usuarios** con autenticación segura y registro demográfico.

### 1.2 Alcance del Proyecto

El sistema está diseñado como parte de un proyecto de investigación en gestión inteligente de residuos, implementando los principios de **Internet de las Cosas (IoT)** y **Smart Cities**. La aplicación actúa como capa HMI (Human-Machine Interface) entre el hardware embebido (ESP32) y el usuario final.

### 1.3 Usuarios Objetivo

| Rol | Permisos |
|-----|----------|
| Operador | Visualización de dashboard, control de actuadores, recepción de alertas |
| Administrador | Configuración de umbrales, gestión de usuarios, acceso a historial completo |

---

## 2. Arquitectura del Software

### 2.1 Stack Tecnológico

#### 2.1.1 Frontend - React + Vite

**Justificación de la elección:**

| Tecnología | Versión | Justificación |
|------------|---------|---------------|
| **React** | 19.2.3 | Biblioteca declarativa para construcción de interfaces reactivas. El modelo de componentes facilita la modularización y reutilización de código. El sistema de hooks permite gestionar estado complejo sin clases. |
| **Vite** | 7.2.4 | Build tool de nueva generación con Hot Module Replacement (HMR) instantáneo. Reduce tiempos de desarrollo de minutos a milisegundos comparado con webpack tradicional. Soporte nativo para ES modules. |
| **React Router DOM** | 7.12.0 | Enrutamiento declarativo para Single Page Applications (SPA). Permite navegación sin recarga de página, mejorando la experiencia de usuario. |

#### 2.1.2 Estilos - Tailwind CSS

```
Paradigma: Utility-First CSS
Versión: 3.4.19
```

**Justificación:** Tailwind CSS fue seleccionado por su enfoque de clases utilitarias que permite:

1. **Desarrollo Ágil:** Estilos inline sin salir del archivo JSX.
2. **Consistencia Visual:** Sistema de diseño predefinido con escala de espaciado, colores y tipografía.
3. **Optimización Automática:** El proceso de purge elimina clases no utilizadas, resultando en bundles CSS mínimos (~10KB en producción).
4. **Diseño Clínico:** La paleta de colores neutros (`slate-*`, `gray-*`) junto con acentos azules proporciona una estética profesional y limpia, óptima para proyección en entornos técnicos.

#### 2.1.3 Backend as a Service (BaaS) - Firebase

```
Plataforma: Google Firebase
Servicios Utilizados: Authentication, Realtime Database
```

| Servicio | Función | Justificación |
|----------|---------|---------------|
| **Firebase Authentication** | Gestión de identidad de usuarios | Solución lista para producción con soporte para email/password, proveedores OAuth, y tokens JWT seguros. |
| **Firebase Realtime Database** | Almacenamiento de telemetría IoT | Base de datos NoSQL optimizada para sincronización en tiempo real. Latencia típica <100ms. Modelo de suscripción push elimina necesidad de polling. |

### 2.2 Diagrama de Flujo de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FLUJO DE DATOS - SmartBin IoT                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   SENSORES   │     │   FIREBASE   │     │   FRONTEND   │     │   USUARIO    │
│   (ESP32)    │     │   REALTIME   │     │   (REACT)    │     │  (OPERADOR)  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │                    │
       │  1. Lectura        │                    │                    │
       │  sensores          │                    │                    │
       │  (cada 5s)         │                    │                    │
       │                    │                    │                    │
       ├───────────────────►│  2. Escritura      │                    │
       │  sensors/          │  Realtime DB       │                    │
       │  fill_level        │                    │                    │
       │  air_quality       │                    │                    │
       │                    │                    │                    │
       │                    ├───────────────────►│  3. Push via       │
       │                    │  onValue()         │  WebSocket         │
       │                    │  listener          │                    │
       │                    │                    │                    │
       │                    │                    ├───────────────────►│
       │                    │                    │  4. Renderizado    │
       │                    │                    │  en Dashboard      │
       │                    │                    │                    │
       │                    │                    │◄───────────────────┤
       │                    │                    │  5. Comando        │
       │                    │                    │  (toggle fan)      │
       │                    │                    │                    │
       │                    │◄───────────────────┤  6. Escritura      │
       │                    │  actuators/        │  comando           │
       │                    │  fan_status        │                    │
       │                    │                    │                    │
       │◄───────────────────┤  7. Notificación   │                    │
       │  Listener en       │  push al ESP32     │                    │
       │  ESP32             │                    │                    │
       │                    │                    │                    │
       │  8. Ejecución      │                    │                    │
       │  física            │                    │                    │
       │  (encender fan)    │                    │                    │
       ▼                    ▼                    ▼                    ▼
```

### 2.3 Estructura de Datos en Firebase

```json
{
  "sensors": {
    "fill_level": {
      "value": 45,
      "timestamp": 1737150000000,
      "source": "esp32"
    },
    "air_quality": {
      "value": 120,
      "timestamp": 1737150000000,
      "source": "esp32"
    }
  },
  "actuators": {
    "lid_open": {
      "status": false,
      "timestamp": 1737150000000
    },
    "fan_status": {
      "status": true,
      "timestamp": 1737150000000
    }
  },
  "users": {
    "<uid>": {
      "fullName": "Juan Pérez",
      "city": "Quito",
      "email": "juan@example.com",
      "registeredAt": 1737150000000
    }
  },
  "config": {
    "thresholds": {
      "gasWarning": 300,
      "gasDanger": 400,
      "levelWarning": 80,
      "levelCritical": 95
    }
  }
}
```

---

## 3. Características Clave

### 3.1 Simulación de Hardware (Demo Mode)

El sistema implementa un **Hardware Simulator** que permite demostrar la funcionalidad completa sin necesidad del hardware físico conectado.

#### 3.1.1 Funcionamiento Técnico

```javascript
// Ubicación: src/services/iotService.js

export function startDemoMode() {
  demoInterval = setInterval(async () => {
    // Incrementar nivel 5% cada paso
    demoState.level += 5;
    
    // Ciclo automático: reinicia al llegar a 100%
    if (demoState.level > 100) {
      demoState.level = 0;
      demoState.ppm = 50;
    }

    // Correlación física: más basura = más gases
    if (demoState.level > 80) {
      demoState.ppm += Math.floor(Math.random() * 50) + 20;
    }

    // Escritura directa a Firebase
    await set(ref(database, 'sensors/fill_level'), {
      value: demoState.level,
      timestamp: Date.now(),
      source: 'demo_simulator'
    });
  }, 6000); // Cada 6 segundos
}
```

#### 3.1.2 Casos de Uso

| Escenario | Comportamiento Simulado |
|-----------|-------------------------|
| Llenado gradual | Nivel incrementa 5% cada 6 segundos |
| Correlación gases-nivel | PPM aumenta cuando nivel > 80% |
| Ciclo completo | Al llegar a 100%, reinicia automáticamente |
| Fluctuación realista | Variación aleatoria en lecturas de gases |

### 3.2 Sistema de Visualización

#### 3.2.1 Componentes de Visualización

| Componente | Biblioteca | Función |
|------------|------------|---------|
| **LevelWidget** | CSS Custom | Indicador de nivel tipo gauge con gradiente de colores según estado |
| **AirQualityWidget** | Recharts (AreaChart) | Gráfico de área con historial de 20 lecturas de PPM |
| **StatusWidget** | Lucide Icons | Indicadores de estado de conexión, temperatura, humedad |
| **ControlsWidget** | Framer Motion | Botones animados para control de tapa y ventilador |

#### 3.2.2 Escala de Estados

```
NIVEL DE LLENADO:
├── 0-50%   → Estado: GOOD     (Verde)
├── 50-80%  → Estado: MEDIUM   (Amarillo)
├── 80-95%  → Estado: WARNING  (Naranja)
└── 95-100% → Estado: CRITICAL (Rojo)

CALIDAD DEL AIRE (PPM):
├── 0-150   → Estado: GOOD     (Verde)
├── 150-300 → Estado: MEDIUM   (Amarillo)
├── 300-400 → Estado: WARNING  (Naranja)
└── 400+    → Estado: DANGER   (Rojo)
```

### 3.3 Sistema de Seguridad y Autenticación

#### 3.3.1 Flujo de Autenticación

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUJO DE AUTENTICACIÓN                    │
└─────────────────────────────────────────────────────────────┘

                    ┌─────────────────┐
                    │   LoginPage     │
                    │   /login        │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
     ┌─────────────────┐         ┌─────────────────┐
     │    REGISTRO     │         │     LOGIN       │
     │  (isRegistering)│         │                 │
     └────────┬────────┘         └────────┬────────┘
              │                           │
              ▼                           ▼
     ┌─────────────────┐         ┌─────────────────┐
     │ createUser +    │         │ signInWith      │
     │ updateProfile + │         │ EmailAndPassword│
     │ save to DB      │         │                 │
     └────────┬────────┘         └────────┬────────┘
              │                           │
              └──────────────┬────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  AuthContext    │
                    │  user = {...}   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ ProtectedRoute  │
                    │ isAuthenticated?│
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
                    ▼                 ▼
           ┌──────────────┐  ┌──────────────┐
           │   ACCESO     │  │  REDIRIGIR   │
           │   Dashboard  │  │  a /login    │
           └──────────────┘  └──────────────┘
```

#### 3.3.2 Datos Demográficos Capturados

Durante el registro, el sistema captura información demográfica para análisis estadístico:

```javascript
// Estructura guardada en users/{uid}
{
  fullName: "Nombre Completo",
  city: "Ciudad de residencia",
  email: "correo@ejemplo.com",
  registeredAt: ServerTimestamp
}
```

### 3.4 Sistema de Alertas

El hook `useSmartBin` implementa un sistema de alertas automáticas con **cooldown** para evitar spam de notificaciones.

```javascript
const THRESHOLDS = {
  GAS_WARNING: 300,      // PPM - Advertencia
  GAS_DANGER: 400,       // PPM - Peligro
  LEVEL_WARNING: 80,     // % - Advertencia
  LEVEL_CRITICAL: 95,    // % - Crítico
  ALERT_COOLDOWN: 10000  // 10 segundos entre alertas
};
```

| Tipo de Alerta | Condición | Acción |
|----------------|-----------|--------|
| Gas Warning | PPM > 300 | Toast amarillo con icono 🌫️ |
| Gas Danger | PPM > 400 | Toast rojo con icono 💨 |
| Level Warning | Nivel > 80% | Toast info con icono 📊 |
| Level Critical | Nivel > 95% | Toast rojo con icono 🚨 |

---

## 4. Guía de Instalación y Despliegue

### 4.1 Prerrequisitos

| Software | Versión Mínima | Verificación |
|----------|----------------|--------------|
| Node.js | 18.0.0 | `node --version` |
| npm | 9.0.0 | `npm --version` |
| Git | 2.0.0 | `git --version` |

### 4.2 Instalación Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/usuario/smartbin-iot.git
cd smartbin-iot

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (opcional)
# Las credenciales de Firebase están en src/firebaseConfig.js

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Acceder a la aplicación
# Abrir navegador en: http://localhost:5173
```

### 4.3 Configuración de Firebase

El archivo `src/firebaseConfig.js` contiene las credenciales del proyecto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "smartbin-iot-epn.firebaseapp.com",
  databaseURL: "https://smartbin-iot-epn-default-rtdb.firebaseio.com",
  projectId: "smartbin-iot-epn",
  storageBucket: "smartbin-iot-epn.firebasestorage.app",
  messagingSenderId: "...",
  appId: "..."
};
```

**Nota de Seguridad:** Para producción, considerar migrar estas credenciales a variables de entorno (`.env`).

### 4.4 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia servidor de desarrollo con HMR |
| `npm run build` | Genera build optimizado para producción |
| `npm run preview` | Previsualiza el build de producción |

### 4.5 Despliegue en Producción

```bash
# Generar build
npm run build

# El directorio 'dist/' contiene los archivos estáticos
# Puede desplegarse en: Firebase Hosting, Vercel, Netlify, etc.

# Ejemplo con Firebase Hosting:
firebase deploy --only hosting
```

---

## 5. Estructura del Proyecto

```
smartbin-iot/
├── public/                    # Archivos estáticos
├── src/
│   ├── components/
│   │   ├── layout/            # Componentes estructurales
│   │   │   ├── Header.jsx     # Barra superior con menú de usuario
│   │   │   ├── Sidebar.jsx    # Navegación lateral
│   │   │   └── index.js       # Barrel export
│   │   └── widgets/           # Componentes de visualización
│   │       ├── LevelWidget.jsx       # Indicador gauge de nivel
│   │       ├── AirQualityWidget.jsx  # Gráfico de calidad de aire
│   │       ├── ControlsWidget.jsx    # Panel de control de actuadores
│   │       ├── StatusWidget.jsx      # Indicadores de estado
│   │       ├── DebugPanel.jsx        # Panel de simulación/debug
│   │       └── index.js              # Barrel export
│   │
│   ├── context/
│   │   └── AuthContext.jsx    # Contexto de autenticación global
│   │
│   ├── hooks/
│   │   └── useSmartBin.js     # Hook principal de lógica IoT
│   │
│   ├── lib/
│   │   └── utils.js           # Utilidades (cn, formatters)
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx      # Página principal de monitoreo
│   │   ├── LoginPage.jsx      # Autenticación y registro
│   │   ├── HistorialPage.jsx  # Historial de eventos
│   │   ├── AlertasPage.jsx    # Gestión de alertas
│   │   ├── ConfiguracionPage.jsx # Configuración de umbrales
│   │   └── index.js           # Barrel export
│   │
│   ├── services/
│   │   ├── iotService.js      # Capa de datos IoT (Firebase + Simulación)
│   │   └── authService.js     # Servicios de autenticación
│   │
│   ├── App.jsx                # Componente raíz con rutas
│   ├── main.jsx               # Entry point de React
│   ├── index.css              # Estilos globales + Tailwind
│   └── firebaseConfig.js      # Configuración de Firebase
│
├── docs/
│   └── MANUAL_TECNICO.md      # Este documento
│
├── .github/
│   └── copilot-instructions.md # Guía para agentes de IA
│
├── package.json               # Dependencias y scripts
├── vite.config.js             # Configuración de Vite
├── tailwind.config.js         # Configuración de Tailwind CSS
└── postcss.config.js          # Configuración de PostCSS
```

### 5.1 Descripción de Directorios Clave

#### `/src/services` - Capa de Servicios

Esta capa encapsula toda la lógica de comunicación con backends externos, siguiendo el principio de **Separación de Responsabilidades**.

| Archivo | Responsabilidad | Funciones Exportadas |
|---------|-----------------|---------------------|
| `iotService.js` | Comunicación IoT con Firebase Realtime Database | `initializeService()`, `subscribeToSensorData()`, `sendCommand()`, `startDemoMode()`, `stopDemoMode()` |
| `authService.js` | Autenticación y gestión de usuarios | `signIn()`, `register()`, `signOut()`, `getUserData()`, `subscribeToAuthState()` |

#### `/src/hooks` - Hooks Personalizados

| Hook | Descripción |
|------|-------------|
| `useSmartBin` | Hook principal que orquesta la suscripción a datos, lógica de alertas, y comandos al dispositivo. Actúa como "cerebro reactivo" de la aplicación. |

#### `/src/components` - Componentes UI

Organizados por función:

- **`/layout`**: Componentes estructurales que persisten entre páginas (Header, Sidebar).
- **`/widgets`**: Componentes de visualización de datos reutilizables.

---

## 6. Dependencias del Proyecto

### 6.1 Dependencias de Producción

| Paquete | Versión | Función |
|---------|---------|---------|
| `react` | 19.2.3 | Biblioteca UI |
| `react-dom` | 19.2.3 | Renderizado DOM |
| `react-router-dom` | 7.12.0 | Enrutamiento SPA |
| `firebase` | 12.8.0 | SDK de Firebase (Auth + Database) |
| `recharts` | 3.6.0 | Gráficos SVG declarativos |
| `framer-motion` | 12.26.2 | Animaciones fluidas |
| `lucide-react` | 0.562.0 | Iconos SVG |
| `react-toastify` | 11.0.5 | Notificaciones toast |
| `clsx` | 2.1.1 | Utilidad para clases condicionales |
| `tailwind-merge` | 3.4.0 | Merge inteligente de clases Tailwind |

### 6.2 Dependencias de Desarrollo

| Paquete | Versión | Función |
|---------|---------|---------|
| `vite` | 7.2.4 | Build tool y dev server |
| `@vitejs/plugin-react` | 5.1.2 | Plugin React para Vite |
| `tailwindcss` | 3.4.19 | Framework CSS |
| `postcss` | 8.5.6 | Procesador CSS |
| `autoprefixer` | 10.4.23 | Prefijos CSS automáticos |

---

## 7. Consideraciones de Seguridad

### 7.1 Autenticación

- Tokens JWT gestionados automáticamente por Firebase Auth.
- Sesiones persistentes en localStorage con revalidación automática.
- Protección de rutas mediante componente `ProtectedRoute`.

### 7.2 Base de Datos

- Reglas de seguridad de Firebase deben configurarse para restringir acceso.
- Se recomienda implementar reglas que validen autenticación:

```json
{
  "rules": {
    "sensors": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### 7.3 Credenciales

Las API keys de Firebase son públicas por diseño, pero se deben:
1. Configurar dominios autorizados en la consola de Firebase.
2. Implementar reglas de seguridad en la base de datos.
3. Considerar uso de Firebase App Check para prevenir abuso.

---

## 8. Mantenimiento y Extensibilidad

### 8.1 Agregar Nuevos Sensores

1. Agregar path en `PATHS` de `iotService.js`.
2. Crear listener en `setupFirebaseListeners()`.
3. Actualizar estado en `firebaseState`.
4. Crear componente widget en `/components/widgets/`.

### 8.2 Agregar Nuevas Páginas

1. Crear componente en `/pages/`.
2. Exportar en `/pages/index.js`.
3. Agregar ruta en `App.jsx` con `ProtectedRoute`.
4. Agregar enlace en `Sidebar.jsx`.

### 8.3 Modificar Umbrales de Alerta

Editar objeto `THRESHOLDS` en `useSmartBin.js`:

```javascript
const THRESHOLDS = {
  GAS_WARNING: 300,
  GAS_DANGER: 400,
  LEVEL_WARNING: 80,
  LEVEL_CRITICAL: 95,
  ALERT_COOLDOWN: 10000
};
```

---

## 9. Glosario Técnico

| Término | Definición |
|---------|------------|
| **HMI** | Human-Machine Interface - Interfaz de interacción entre usuario y sistema |
| **IoT** | Internet of Things - Red de dispositivos interconectados |
| **TRL** | Technology Readiness Level - Nivel de madurez tecnológica |
| **BaaS** | Backend as a Service - Servicios de backend gestionados |
| **SPA** | Single Page Application - Aplicación de página única |
| **HMR** | Hot Module Replacement - Actualización en caliente de módulos |
| **PPM** | Parts Per Million - Unidad de concentración de gases |
| **JWT** | JSON Web Token - Estándar de tokens de autenticación |

---

## 10. Referencias

1. React Documentation - https://react.dev
2. Firebase Documentation - https://firebase.google.com/docs
3. Tailwind CSS - https://tailwindcss.com/docs
4. Vite Guide - https://vite.dev/guide
5. Recharts API - https://recharts.org/en-US/api

---

**Documento generado para proyecto académico**  
*Escuela Politécnica Nacional - Formulación de Proyectos 2025-B*
