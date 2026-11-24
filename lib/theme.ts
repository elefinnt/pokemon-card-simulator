const STORAGE_KEY = 'packrip-theme'

export const THEMES = [
  { id: 'default', label: 'Default' },
  { id: 'gen1', label: 'Red/Blue' },
  { id: 'gen3', label: 'Emerald' },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

const listeners = new Set<() => void>()

function isThemeId(value: unknown): value is ThemeId {
  return THEMES.some((theme) => theme.id === value)
}

export function getTheme(): ThemeId {
  const value = document.documentElement.dataset.theme
  return isThemeId(value) ? value : 'default'
}

export function getServerTheme(): ThemeId {
  return 'default'
}

export function setTheme(next: string) {
  const theme = isThemeId(next) ? next : 'default'
  if (theme === 'default') {
    delete document.documentElement.dataset.theme
  } else {
    document.documentElement.dataset.theme = theme
  }
  try {
    if (theme === 'default') window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, theme)
  } catch {}
  listeners.forEach((listener) => listener())
}

export function subscribeTheme(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
