export const BRAND = {
  primary: '#2563EB',
  secondary: '#0F172A',
  accent: '#0EA5E9',
  dark: '#1E293B',
  positive: '#16A34A',
  negative: '#DC2626',
  warning: '#D97706',
} as const

const now = new Date()
const pad = (value: number): string => String(value).padStart(2, '0')

export const TODAY_ISO = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

export const TODAY_LABEL = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
}).format(now)
