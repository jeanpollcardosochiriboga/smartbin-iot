import { motion } from 'framer-motion';
import { Sidebar, Header } from '../components/layout';
import {
  LevelWidget,
  AirQualityWidget,
  ControlsWidget,
  StatusWidget,
  DebugPanel
} from '../components/widgets';
import { useSmartBin } from '../hooks/useSmartBin';

/**
 * Dashboard Principal
 * Página principal que muestra todos los widgets de monitoreo
 */
export function Dashboard() {
  const {
    sensorData,
    status,
    isConnected,
    lastUpdate,
    isSimulation,
    toggleLid,
    toggleFan,
    simulateFill,
    simulateGas,
    resetSimulation
  } = useSmartBin();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="ml-64">
        <Header
          title="Dashboard"
          subtitle="Monitoreo en tiempo real del SmartBin"
          lastUpdate={lastUpdate}
        />

        <div className="p-6">
          {/* Status bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <StatusWidget
              temperature={sensorData.temperature}
              humidity={sensorData.humidity}
              isConnected={isConnected}
              lastUpdate={lastUpdate}
              isSimulation={isSimulation}
            />
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Level Widget - Takes 1 column */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <LevelWidget
                level={sensorData.level}
                status={status.levelStatus}
              />
            </motion.div>

            {/* Air Quality Widget - Takes 1 column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <AirQualityWidget
                ppm={sensorData.ppm}
                ppmHistory={sensorData.ppmHistory}
                status={status.airQualityStatus}
              />
            </motion.div>

            {/* Controls Widget - Takes 1 column */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <ControlsWidget
                lidOpen={sensorData.lidOpen}
                fanOn={sensorData.fanOn}
                onToggleLid={toggleLid}
                onToggleFan={toggleFan}
              />
            </motion.div>
          </div>

          {/* Debug Panel - Bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-6"
          >
            <DebugPanel
              onFill={simulateFill}
              onGas={simulateGas}
              onReset={resetSimulation}
              isSimulation={isSimulation}
            />
          </motion.div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
