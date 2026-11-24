export const titleRules = [
  (value: string | null) => Boolean(value?.trim()) || 'El título es obligatorio.',
]
