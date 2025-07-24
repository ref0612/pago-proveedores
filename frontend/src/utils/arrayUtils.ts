// Utilidad global para validar arrays de forma segura
export function safeArray<T>(data: any): T[] {
  return Array.isArray(data) ? data : [];
}
