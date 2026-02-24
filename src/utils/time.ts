export function formatRelativeTime(dateString: string, locale: string): string {
  const then = new Date(dateString).getTime();
  if (isNaN(then)) return '';

  const now = Date.now();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const isRu = locale.startsWith('ru');

  if (diffSec < 60) {
    return isRu ? 'только что' : 'just now';
  }
  if (diffMin < 60) {
    return isRu ? `${diffMin} мин назад` : `${diffMin} min ago`;
  }
  if (diffHour < 24) {
    return isRu ? `${diffHour} ч назад` : `${diffHour} h ago`;
  }
  if (diffDay === 1) {
    return isRu ? 'вчера' : 'yesterday';
  }
  if (diffDay < 7) {
    return isRu ? `${diffDay} дн назад` : `${diffDay} d ago`;
  }

  return new Date(dateString).toLocaleDateString(locale);
}
