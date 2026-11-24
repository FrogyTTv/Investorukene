// Saldo icon set: drawn for this app. 24px grid, 1.75 stroke, rounded, one soft duotone fill each.
// Do not mix in other icon libraries.
import type { ReactNode } from 'react'

const D = { fill: 'currentColor', fillOpacity: 0.3 } as const

const PATHS = {
  tx: (<><path d="M8 4v15.5M8 19.5l-3.5-3.5M8 19.5l3.5-3.5" /><path d="M16 20V4.5M16 4.5l-3.5 3.5M16 4.5l3.5 3.5" /></>),
  pie: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5V12h8.5A8.5 8.5 0 0 0 12 3.5z" {...D} /></>),
  plus: <path d="M12 5v14M5 12h14" />,
  income: (<><path d="M12 4v10.5M8 10.5l4 4 4-4" /><path d="M4.5 15.5v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2.5" /></>),
  sliders: (<><path d="M4 7h9M19 7h1M4 17h1M11 17h9" /><circle cx="16" cy="7" r="2.5" {...D} /><circle cx="8" cy="17" r="2.5" {...D} /></>),
  user: (<><circle cx="12" cy="8.5" r="3.5" /><path d="M5 20c1-3.5 3.8-5 7-5s6 1.5 7 5" /></>),
  back: <path d="M19 12H5M11 6l-6 6 6 6" />,
  down: <path d="M12 5v14M6 13l6 6 6-6" />,
  home: <path d="M4 11l8-6.5 8 6.5V19a1 1 0 0 1-1 1h-4v-5H9v5H5a1 1 0 0 1-1-1z" {...D} />,
  bolt: <path d="M13 3L5.5 13.5h6L10.5 21 18 10.5h-6z" {...D} />,
  bag: (<><path d="M5 8.5h14l-1.2 11.5H6.2z" {...D} /><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" /></>),
  bus: (<><rect x="5" y="3.5" width="14" height="13" rx="3" /><path d="M5 11h14" /><circle cx="9" cy="14" r=".9" fill="currentColor" /><circle cx="15" cy="14" r=".9" fill="currentColor" /><path d="M8 20.5l1.3-4M16 20.5l-1.3-4" /></>),
  repeat: (<><path d="M4.5 12a7.5 7.5 0 0 1 13-5.1l2 2M19.5 4v5h-5" /><path d="M19.5 12a7.5 7.5 0 0 1-13 5.1l-2-2M4.5 20v-5h5" /></>),
  dots: (<><circle cx="6" cy="12" r="1.4" fill="currentColor" /><circle cx="12" cy="12" r="1.4" fill="currentColor" /><circle cx="18" cy="12" r="1.4" fill="currentColor" /></>),
  rotate: (<><rect x="7" y="3.5" width="10" height="17" rx="2.5" {...D} /><path d="M3.5 9a8.5 8.5 0 0 1 3-4.5M3.5 4.5V9H8" /></>),
  reload: <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4" />,
  external: (<><path d="M13.5 4.5h6v6M19.5 4.5l-8 8" /><path d="M17.5 14v4a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V8A1.5 1.5 0 0 1 6 6.5h4" /></>),
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof PATHS

export function Icon({ name, className = 'size-5' }: { name: IconName; className?: string }) {
  return (
    <svg className={`flex-none ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}
