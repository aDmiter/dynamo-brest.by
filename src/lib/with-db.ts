/** Выполняет запрос к БД; при недоступности MySQL возвращает fallback без падения страницы */
export async function withDb<T>(
  operation: () => Promise<T>,
  fallback: T,
  label?: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[db${label ? `:${label}` : ''}] База недоступна:`, error);
    }
    return fallback;
  }
}
