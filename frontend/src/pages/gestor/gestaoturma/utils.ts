export function getSafeImagePath(path?: string): string | null {
  const regex = /^\/uploads\/[a-zA-Z0-9_\-\.]+\.(jpg|jpeg|png|webp)$/i
  return path && regex.test(path) ? path : null
}
