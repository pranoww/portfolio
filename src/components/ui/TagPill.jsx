// Small rounded label used for tech stacks and product names
export default function TagPill({ children, className = "" }) {
  return (
    <span className={`inline-block rounded-full border border-line bg-bg px-2.5 py-1 font-mono text-xs text-ink-2 ${className}`}>
      {children}
    </span>
  );
}
