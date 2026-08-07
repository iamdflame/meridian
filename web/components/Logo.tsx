export function Logo({ size = 24, withWord = false }: { size?: number; withWord?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Meridian">
        <circle cx="32" cy="32" r="18" stroke="var(--brand-1)" strokeWidth="4" />
        <path d="M32 6 L32 20 M32 44 L32 58" stroke="var(--ink-1)" strokeWidth="4" strokeLinecap="round" />
        <circle cx="32" cy="32" r="5" fill="var(--ink-1)" />
      </svg>
      {withWord && <span className="font-semibold tracking-[-0.02em] text-ink-1">MERIDIAN</span>}
    </span>
  );
}
