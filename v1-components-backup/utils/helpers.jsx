import { XP_PER_LEVEL } from './constants';

/**
 * Calculate user level information from XP points
 */
export function getLevelInfo(xp = 0) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1;
  const currentLevelXP = (level - 1) * XP_PER_LEVEL;
  const nextLevelXP = level * XP_PER_LEVEL;
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
  
  return { 
    level, 
    progress, 
    nextLevelXP, 
    currentXP: xp,
    xpToNextLevel: nextLevelXP - xp
  };
}

/**
 * Get color class based on match percentage
 */
export function getMatchColor(percentage) {
  if (percentage >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (percentage >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (percentage >= 40) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
}

/**
 * Get color class based on priority
 */
export function getPriorityColor(priority) {
  const colors = {
    'critical': 'bg-red-500/20 text-red-400 border-red-500/30',
    'high': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'important': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'medium': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'low': 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    'nice-to-have': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
  };
  return colors[priority?.toLowerCase()] || colors['medium'];
}

/**
 * Get color class for work status badge
 */
export function getWorkStatusColor(status) {
  if (status === 'Open to Work') return 'bg-green-500/20 text-green-300 border-green-500/30';
  if (status === 'Networking Only') return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
  return 'bg-red-500/20 text-red-300 border-red-500/30';
}

/**
 * Format currency amount
 */
export function formatCurrency(amount, currency = 'Robux') {
  if (currency === 'Robux') {
    return `R$${amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
}

/**
 * Calculate time ago from date
 */
export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [name, secondsInInterval] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInInterval);
    if (interval >= 1) {
      return `${interval} ${name}${interval !== 1 ? 's' : ''} ago`;
    }
  }
  
  return 'just now';
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Generate random ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}