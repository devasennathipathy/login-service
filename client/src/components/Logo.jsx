export default function Logo({ size = 34 }) {
  return (
    <span className="brand">
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
        <rect x="6" y="4" width="28" height="32" rx="6" fill="var(--accent)" />
        <rect x="6" y="4" width="8" height="32" rx="4" fill="rgba(0,0,0,.18)" />
        <path d="M19 20l4 4 7-8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Daybook
    </span>
  );
}
