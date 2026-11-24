import { useEffect, useRef, type ReactNode } from 'react'
import { Icon } from '../components/Icon'

/**
 * Bottom sheet / dialog in the blue theme. Full screen on phones, centred card on desktop.
 * Opening it never changes the page theme.
 */
export function Sheet({ open, onClose, title, titleId, children }: {
  open: boolean; onClose: () => void; title: string; titleId: string; children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog ref={ref} aria-labelledby={titleId} onClose={onClose}
      onClick={(e) => { if (e.target === ref.current) onClose() }} // click on the backdrop closes
      className="m-0 h-full max-h-full w-full max-w-full border-0 bg-sheet p-0 text-cream [color-scheme:dark] open:animate-rise-fast backdrop:bg-[rgb(0_0_20/.55)] min-[901px]:m-auto min-[901px]:h-auto min-[901px]:max-h-[calc(100dvh-32px)] min-[901px]:w-[min(440px,calc(100%-32px))] min-[901px]:rounded-3xl min-[901px]:shadow-[0_30px_80px_-20px_rgb(0_21_20/.35)]">
      <div className="box-border flex min-h-full flex-col gap-4 pt-[calc(12px+var(--safe-top))] pr-[max(16px,var(--safe-right))] pb-[calc(20px+var(--safe-bottom))] pl-[max(16px,var(--safe-left))] min-[901px]:min-h-[min(480px,calc(100dvh-32px))] min-[901px]:p-[18px_18px_22px]">
        <button type="button" aria-label="Lukk" onClick={onClose}
          className="-ml-2 grid size-10 cursor-pointer place-items-center self-start rounded-full glass">
          <Icon name="back" />
        </button>
        <h2 id={titleId} className="mb-1 font-display text-[30px] leading-[1.1] font-bold tracking-[-0.03em]">{title}</h2>
        {children}
      </div>
    </dialog>
  )
}

export const PillButton = ({ ghost = false, type = 'button', onClick, children }: {
  ghost?: boolean; type?: 'button' | 'submit'; onClick?: () => void; children: ReactNode
}) => (
  <button type={type} onClick={onClick}
    className={`mt-auto h-[54px] w-full cursor-pointer rounded-full text-base font-bold transition-transform duration-150 ease-soft hover:-translate-y-px active:scale-[.98] ${ghost ? 'glass text-cream' : 'bg-cream text-ink shadow-[inset_0_1px_0_rgb(255_255_255_/.7),0_10px_24px_-10px_rgb(0_0_0_/.6)]'}`}>
    {children}
  </button>
)
