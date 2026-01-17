import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function para combinar clases de Tailwind
 * Evita conflictos y duplicados
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formatea una fecha a hora local
 */
export function formatTime(date) {
  if (!date) return '--:--:--';
  return new Date(date).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Formatea una fecha completa
 */
export function formatDateTime(date) {
  if (!date) return '--/--/---- --:--';
  return new Date(date).toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Obtiene el color según el estado
 */
export function getStatusColor(status) {
  const colors = {
    good: 'text-green-600 bg-green-50 border-green-200',
    medium: 'text-blue-600 bg-blue-50 border-blue-200',
    warning: 'text-amber-600 bg-amber-50 border-amber-200',
    danger: 'text-red-600 bg-red-50 border-red-200',
    critical: 'text-red-700 bg-red-100 border-red-300'
  };
  return colors[status] || colors.good;
}

/**
 * Obtiene el color del nivel según porcentaje
 */
export function getLevelColor(level) {
  if (level >= 95) return '#dc2626'; // red-600
  if (level >= 80) return '#f59e0b'; // amber-500
  if (level >= 50) return '#3b82f6'; // blue-500
  return '#22c55e'; // green-500
}

/**
 * Obtiene el color de calidad del aire
 */
export function getAirQualityColor(ppm) {
  if (ppm >= 400) return '#dc2626'; // red-600
  if (ppm >= 300) return '#f59e0b'; // amber-500
  if (ppm >= 150) return '#3b82f6'; // blue-500
  return '#22c55e'; // green-500
}

/**
 * Genera datos para el gráfico de área con timestamps
 */
export function formatChartData(history, label = 'value') {
  return history.map((value, index) => ({
    time: index,
    [label]: value
  }));
}
