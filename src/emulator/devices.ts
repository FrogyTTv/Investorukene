// Devices for the desktop preview. Sizes are CSS pixels of the screen (portrait).
// "safe" is the safe area the app gets, like env(safe-area-inset-*) on a real phone.

export type Kind = 'island' | 'home-button' | 'punch-hole' | 'tablet'
export type Insets = { top: number; right: number; bottom: number; left: number }

export type Device = {
  id: string
  name: string
  group: 'iPhone' | 'Android' | 'Nettbrett'
  kind: Kind
  w: number
  h: number
  /** Corner radius of the screen. */
  radius: number
  /** Bezel width around the screen, portrait. */
  bezel: Insets
  safe: Insets
  safeLandscape: Insets
}

const even = (n: number): Insets => ({ top: n, right: n, bottom: n, left: n })

export const DEVICES: Device[] = [
  // Same frame and screen as the Saldo Prototype artifact. This is the default.
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', group: 'iPhone', kind: 'island', w: 390, h: 848, radius: 54, bezel: even(12),
    safe: { top: 42, right: 0, bottom: 20, left: 0 }, safeLandscape: { top: 0, right: 47, bottom: 21, left: 47 } },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', group: 'iPhone', kind: 'island', w: 430, h: 932, radius: 55, bezel: even(12),
    safe: { top: 59, right: 0, bottom: 34, left: 0 }, safeLandscape: { top: 0, right: 59, bottom: 21, left: 59 } },
  { id: 'iphone-se', name: 'iPhone SE', group: 'iPhone', kind: 'home-button', w: 375, h: 667, radius: 0, bezel: { top: 64, right: 14, bottom: 72, left: 14 },
    safe: { top: 20, right: 0, bottom: 0, left: 0 }, safeLandscape: even(0) },
  { id: 'pixel-8', name: 'Google Pixel 8', group: 'Android', kind: 'punch-hole', w: 412, h: 915, radius: 36, bezel: even(10),
    safe: { top: 36, right: 0, bottom: 16, left: 0 }, safeLandscape: { top: 0, right: 0, bottom: 16, left: 36 } },
  { id: 'galaxy-s24', name: 'Samsung Galaxy S24', group: 'Android', kind: 'punch-hole', w: 360, h: 780, radius: 30, bezel: even(9),
    safe: { top: 32, right: 0, bottom: 16, left: 0 }, safeLandscape: { top: 0, right: 0, bottom: 16, left: 32 } },
  { id: 'ipad-mini', name: 'iPad mini', group: 'Nettbrett', kind: 'tablet', w: 744, h: 1133, radius: 22, bezel: even(20),
    safe: { top: 24, right: 0, bottom: 20, left: 0 }, safeLandscape: { top: 24, right: 0, bottom: 20, left: 0 } },
]

export const DEFAULT_DEVICE = DEVICES[0].id

/** Bezel after turning the device a quarter turn clockwise (top moves to the right). */
export const rotate = (b: Insets): Insets => ({ top: b.left, right: b.top, bottom: b.right, left: b.bottom })
