export const PALETTE = {
  'tf-success': '#1F5F5B',
  'tf-warning': '#87503B',
  'tf-primary': '#004743',
  'tf-on-primary': '#FFFFFF',
  'tf-primary-container': '#1F5F5B',
  'tf-on-primary-container': '#99D7D1',
  'tf-secondary': '#4C6360',
  'tf-on-secondary': '#FFFFFF',
  'tf-secondary-container': '#CCE5E1',
  'tf-on-secondary-container': '#1F3432',
  'tf-tertiary': '#61321E',
  'tf-on-tertiary': '#FFFFFF',
  'tf-tertiary-container': '#FFDBCE',
  'tf-on-tertiary-container': '#502412',
  'tf-error': '#BA1A1A',
  'tf-on-error': '#FFFFFF',
  'tf-error-container': '#FFDAD6',
  'tf-on-error-container': '#93000A',
  'tf-background': '#F8FAF8',
  'tf-on-background': '#191C1C',
  'tf-surface': '#F8FAF8',
  'tf-surface-container-lowest': '#FFFFFF',
  'tf-surface-container-low': '#F2F4F3',
  'tf-surface-container': '#ECEEED',
  'tf-surface-container-high': '#E7E8E7',
  'tf-surface-container-highest': '#E1E3E2',
  'tf-on-surface': '#191C1C',
  'tf-surface-variant': '#DBE4E3',
  'tf-on-surface-variant': '#3F4947',
  'tf-outline': '#6F7978',
  'tf-outline-variant': '#BFC8C7',
} as const

export const BRAND = {
  primary: PALETTE['tf-primary'],
  secondary: PALETTE['tf-secondary'],
  accent: PALETTE['tf-tertiary'],
  dark: PALETTE['tf-on-background'],
  positive: PALETTE['tf-success'],
  negative: PALETTE['tf-error'],
  warning: PALETTE['tf-warning'],
  info: PALETTE['tf-secondary'],
} as const

export function toIsoDate(date: Date): string {
  const pad = (value: number): string => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const now = new Date()

export const TODAY_ISO = toIsoDate(now)

export const TODAY_LABEL = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
}).format(now)
