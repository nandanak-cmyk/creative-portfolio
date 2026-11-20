/** Neon-cyan eyebrow label used above section headlines. */
export default function SectionLabel({ children, plain = false }: { children: string; plain?: boolean }) {
  return (
    <p
      data-reveal
      className={`mb-5 text-xs uppercase tracking-[0.28em] ${
        plain ? 'text-white/60' : 'text-brand-cyan [text-shadow:0_0_14px_rgba(0,207,255,0.7)]'
      }`}
    >
      {children}
    </p>
  );
}
