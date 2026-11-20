/** Small pill used for service / project tags. */
export default function Tag({ children }: { children: string }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/65">
      {children}
    </span>
  );
}
