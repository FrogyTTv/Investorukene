// Toolbar icons for the emulator (same drawing style as the app's icons, but kept separate).
const PATHS = {
  rotate: (<><rect x="7" y="3.5" width="10" height="17" rx="2.5" fill="currentColor" fillOpacity={0.3} /><path d="M3.5 9a8.5 8.5 0 0 1 3-4.5M3.5 4.5V9H8" /></>),
  reload: <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4h-4" />,
  external: (<><path d="M13.5 4.5h6v6M19.5 4.5l-8 8" /><path d="M17.5 14v4a1.5 1.5 0 0 1-1.5 1.5H6A1.5 1.5 0 0 1 4.5 18V8A1.5 1.5 0 0 1 6 6.5h4" /></>),
}

export function Icon({ name, className = 'size-5' }: { name: keyof typeof PATHS; className?: string }) {
  return (
    <svg className={`flex-none ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  )
}
