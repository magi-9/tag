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

  const timeStr = String(timedelta).trim();
  let totalSeconds = 0;

  // Format can be:
  // "4 days, 14:37:48.591272"
  // "4 14:37:48.591272" (without "days,")
  // "14:37:48.591272" (just time)

  // Check if contains "days,"
  if (timeStr.includes('days,') || timeStr.includes('day,')) {
    const parts = timeStr.split(/, /);
    const days = parseInt(parts[0].split(' ')[0]);
    totalSeconds += days * 86400;

    const [hours, minutes, seconds] = parts[1].split(':');
    totalSeconds += parseInt(hours) * 3600;
    totalSeconds += parseInt(minutes) * 60;
    totalSeconds += parseFloat(seconds);
  }
  // Check if starts with number followed by space (e.g., "4 14:37:48")
  else if (/^\d+\s+\d+:/.test(timeStr)) {
    const firstSpace = timeStr.indexOf(' ');
    const days = parseInt(timeStr.substring(0, firstSpace));
    const timePart = timeStr.substring(firstSpace + 1);

    totalSeconds += days * 86400;

    const [hours, minutes, seconds] = timePart.split(':');
    totalSeconds += parseInt(hours) * 3600;
    totalSeconds += parseInt(minutes) * 60;
    totalSeconds += parseFloat(seconds);
  }
  // Just time (HH:MM:SS)
  else {
    const [hours, minutes, seconds] = timeStr.split(':');
    totalSeconds += parseInt(hours) * 3600;
    totalSeconds += parseInt(minutes) * 60;
    totalSeconds += parseFloat(seconds);
  }

  return totalSeconds;
}
