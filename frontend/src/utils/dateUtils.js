// Simple date formatter used on the rules page
export function formatDate(date) {
  if (!date) return '';
  try {
    return new Intl.DateTimeFormat('sk-SK', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (err) {
    return '';
  }
}

// Format duration in a human-readable way
// Shows top 2 units: days+hours, hours+minutes, or minutes+seconds
export function formatDuration(seconds) {
  if (!seconds || seconds < 0) return '0s';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m ${secs}s`;
  }
}

// Parse Python timedelta string to seconds
export function parsePythonTimedelta(timedelta) {
  if (!timedelta) return 0;
  
  // Format: "X days, HH:MM:SS.microseconds" or "HH:MM:SS.microseconds"
  const parts = timedelta.split(', ');
  let totalSeconds = 0;
  
  if (parts.length === 2) {
    // Has days
    const days = parseInt(parts[0].split(' ')[0]);
    totalSeconds += days * 86400;
    
    const [hours, minutes, seconds] = parts[1].split(':');
    totalSeconds += parseInt(hours) * 3600;
    totalSeconds += parseInt(minutes) * 60;
    totalSeconds += parseFloat(seconds);
  } else {
    // No days
    const [hours, minutes, seconds] = parts[0].split(':');
    totalSeconds += parseInt(hours) * 3600;
    totalSeconds += parseInt(minutes) * 60;
    totalSeconds += parseFloat(seconds);
  }
  
  return totalSeconds;
}
