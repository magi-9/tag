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
