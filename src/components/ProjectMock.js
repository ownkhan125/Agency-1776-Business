"use client";

/**
 * ProjectMock — a self-hosted SVG mock of a website screenshot, tuned
 * per project variant. Rendered inline so it's SSR-clean, retina-sharp,
 * cache-free, and re-tintable by CSS variables (matches theme).
 *
 * Each variant hand-composes a plausible interface — browser chrome,
 * top nav, hero block, content grid — so a card face reads as "premium
 * portfolio screenshot" rather than "placeholder". Six variants cover
 * the three real projects plus three secondary layouts, so an 18-slot
 * sphere never repeats a face in a visible cluster.
 *
 * Layout is intentionally low-detail at the pixel level so the same
 * SVG scales cleanly from a 92-px sphere card to a 1200-px marquee
 * tile without any blur or aliasing.
 */

const VARIANTS = {
  northwind: {
    label: "Northwind Systems",
    caption: "Trading terminal",
    hue: 350, // brand accent
    layout: "trading",
  },
  lumen: {
    label: "Lumen Health",
    caption: "Marketing site",
    hue: 190, // clinical teal
    layout: "editorial",
  },
  halo: {
    label: "Halo Studios",
    caption: "Product tour",
    hue: 42, // warm gold
    layout: "motion",
  },
  ledger: {
    label: "Ledger Republic",
    caption: "Finance dashboard",
    hue: 268, // deep violet
    layout: "dashboard",
  },
  kestrel: {
    label: "Kestrel Field",
    caption: "Ops console",
    hue: 132, // signal green
    layout: "ops",
  },
  arcane: {
    label: "Arcane & Co.",
    caption: "Editorial studio",
    hue: 22, // umber
    layout: "editorial",
  },
};

export const MOCK_VARIANT_KEYS = Object.keys(VARIANTS);

export function getMockVariant(key) {
  return VARIANTS[key] || VARIANTS.northwind;
}

/**
 * Render a full-bleed SVG mockup that fills its container. Uses
 * preserveAspectRatio="xMidYMid slice" so the 3:2 vBox always fills.
 */
export default function ProjectMock({
  variant = "northwind",
  className = "",
  showCaption = true,
}) {
  const v = getMockVariant(variant);
  const accent = `hsl(${v.hue}, 78%, 58%)`;
  const accentSoft = `hsl(${v.hue}, 70%, 45%)`;
  const accentGlow = `hsla(${v.hue}, 90%, 60%, 0.28)`;

  return (
    <svg
      viewBox="0 0 300 200"
      preserveAspectRatio="xMidYMid slice"
      className={`block h-full w-full ${className}`}
      role="img"
      aria-label={`${v.label} — ${v.caption}`}
    >
      <defs>
        <linearGradient id={`bg-${variant}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e0e11" />
          <stop offset="100%" stopColor="#050506" />
        </linearGradient>
        <linearGradient id={`accent-${variant}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={accentSoft} />
        </linearGradient>
        <radialGradient id={`glow-${variant}`} cx="0.7" cy="0.3" r="0.8">
          <stop offset="0%" stopColor={accentGlow} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>

      {/* Base fill */}
      <rect width="300" height="200" fill={`url(#bg-${variant})`} />
      <rect width="300" height="200" fill={`url(#glow-${variant})`} />

      {/* Browser chrome */}
      <g>
        <rect width="300" height="14" fill="#111116" />
        <line x1="0" y1="14" x2="300" y2="14" stroke="#1a1a20" strokeWidth="0.6" />
        <circle cx="7" cy="7" r="1.6" fill="#2d2d34" />
        <circle cx="13" cy="7" r="1.6" fill="#2d2d34" />
        <circle cx="19" cy="7" r="1.6" fill="#2d2d34" />
        <rect x="80" y="4" width="140" height="6" rx="1" fill="#16161c" />
        <rect x="82" y="6" width="60" height="2" rx="0.5" fill="#3b3b46" />
      </g>

      {/* Top nav */}
      <g transform="translate(0, 14)">
        <rect width="300" height="18" fill="#08080c" />
        <rect x="10" y="7" width="4" height="4" fill={accent} />
        <rect x="18" y="8" width="22" height="2" fill="#e6e2d8" />
        <rect x="200" y="8" width="14" height="2" fill="#7f7c76" />
        <rect x="218" y="8" width="14" height="2" fill="#7f7c76" />
        <rect x="236" y="8" width="14" height="2" fill="#7f7c76" />
        <rect x="256" y="5" width="34" height="8" rx="1" fill="none" stroke={accent} strokeWidth="0.6" />
        <rect x="260" y="8" width="26" height="2" fill={accent} />
      </g>

      {/* Layout-specific content */}
      {v.layout === "trading" && (
        <g transform="translate(0, 36)">
          {/* Left ticker column */}
          <rect x="10" y="4" width="80" height="150" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          {Array.from({ length: 10 }).map((_, i) => (
            <g key={i} transform={`translate(14, ${8 + i * 14})`}>
              <rect width="18" height="2" fill="#e6e2d8" />
              <rect x="26" y="0" width="14" height="2" fill={i % 3 === 0 ? accent : "#7f7c76"} />
              <rect x="46" y="0" width="26" height="2" fill={i % 3 === 0 ? "#7f7c76" : "#3b3b46"} />
            </g>
          ))}
          {/* Center chart */}
          <rect x="96" y="4" width="130" height="90" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <polyline
            points="100,80 112,72 122,74 134,60 148,66 164,48 178,54 194,40 210,44 222,32"
            fill="none"
            stroke={accent}
            strokeWidth="1.2"
          />
          <polyline
            points="100,80 112,72 122,74 134,60 148,66 164,48 178,54 194,40 210,44 222,32 222,90 100,90"
            fill={accentGlow}
          />
          {/* Right book */}
          <rect x="232" y="4" width="58" height="90" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          {Array.from({ length: 8 }).map((_, i) => (
            <g key={i} transform={`translate(236, ${8 + i * 8})`}>
              <rect width={30 - i * 2} height="1.5" fill={i < 4 ? "hsl(0, 60%, 55%)" : "hsl(140, 60%, 50%)"} />
              <rect x="34" y="0" width="18" height="1.5" fill="#3b3b46" />
            </g>
          ))}
          {/* Bottom row cards */}
          <rect x="96" y="100" width="42" height="54" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <rect x="144" y="100" width="42" height="54" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <rect x="192" y="100" width="42" height="54" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <rect x="240" y="100" width="50" height="54" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <rect x="100" y="108" width="20" height="2" fill="#e6e2d8" />
          <rect x="100" y="114" width="34" height="1.5" fill="#7f7c76" />
          <rect x="148" y="108" width="20" height="2" fill="#e6e2d8" />
          <rect x="148" y="114" width="30" height="1.5" fill={accent} />
          <rect x="196" y="108" width="20" height="2" fill="#e6e2d8" />
          <rect x="196" y="114" width="34" height="1.5" fill="#7f7c76" />
        </g>
      )}

      {v.layout === "editorial" && (
        <g transform="translate(0, 36)">
          {/* Big headline */}
          <rect x="16" y="16" width="180" height="6" fill="#e6e2d8" />
          <rect x="16" y="26" width="150" height="6" fill="#e6e2d8" />
          <rect x="16" y="36" width="120" height="6" fill={accent} />
          {/* Body */}
          <rect x="16" y="52" width="220" height="2" fill="#7f7c76" />
          <rect x="16" y="58" width="220" height="2" fill="#7f7c76" />
          <rect x="16" y="64" width="180" height="2" fill="#7f7c76" />
          {/* CTA */}
          <rect x="16" y="78" width="70" height="14" rx="1" fill="none" stroke={accent} strokeWidth="0.8" />
          <rect x="24" y="83" width="46" height="3" fill={accent} />
          <rect x="94" y="82" width="60" height="2" fill="#7f7c76" />
          <rect x="94" y="88" width="46" height="2" fill="#7f7c76" />
          {/* Image slot */}
          <rect x="204" y="14" width="80" height="88" fill="#0e0e14" stroke="#1a1a20" strokeWidth="0.5" />
          <circle cx="244" cy="58" r="18" fill={accentGlow} />
          <circle cx="244" cy="58" r="10" fill={accent} opacity="0.8" />
          {/* Grid below */}
          <rect x="16" y="112" width="80" height="44" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <rect x="104" y="112" width="80" height="44" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <rect x="192" y="112" width="92" height="44" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <rect x="22" y="120" width="30" height="2.5" fill={accent} />
          <rect x="22" y="128" width="60" height="2" fill="#e6e2d8" />
          <rect x="22" y="134" width="52" height="2" fill="#7f7c76" />
          <rect x="110" y="120" width="30" height="2.5" fill={accent} />
          <rect x="110" y="128" width="60" height="2" fill="#e6e2d8" />
          <rect x="110" y="134" width="52" height="2" fill="#7f7c76" />
          <rect x="198" y="120" width="30" height="2.5" fill={accent} />
          <rect x="198" y="128" width="70" height="2" fill="#e6e2d8" />
          <rect x="198" y="134" width="62" height="2" fill="#7f7c76" />
        </g>
      )}

      {v.layout === "motion" && (
        <g transform="translate(0, 36)">
          {/* Big centered hero */}
          <rect x="60" y="14" width="180" height="4" fill={accent} />
          <rect x="30" y="26" width="240" height="10" fill="#e6e2d8" />
          <rect x="70" y="42" width="160" height="10" fill="#e6e2d8" />
          <rect x="90" y="58" width="120" height="2" fill="#7f7c76" />
          <rect x="70" y="64" width="160" height="2" fill="#7f7c76" />
          {/* Floating panels */}
          <g opacity="0.9">
            <rect x="24" y="78" width="80" height="48" fill="#0e0e14" stroke={accent} strokeWidth="0.5" transform="rotate(-4 64 102)" />
            <circle cx="42" cy="94" r="6" fill={accent} transform="rotate(-4 64 102)" />
            <rect x="52" y="92" width="42" height="2" fill="#e6e2d8" transform="rotate(-4 64 102)" />
            <rect x="52" y="98" width="30" height="1.5" fill="#7f7c76" transform="rotate(-4 64 102)" />
          </g>
          <g opacity="0.95">
            <rect x="110" y="80" width="80" height="48" fill="#0a0a0f" stroke="#1a1a20" strokeWidth="0.5" />
            <rect x="118" y="88" width="20" height="2" fill={accent} />
            <rect x="118" y="94" width="60" height="2" fill="#e6e2d8" />
            <rect x="118" y="100" width="54" height="1.5" fill="#7f7c76" />
            <polyline
              points="118,120 128,116 138,118 148,110 158,114 168,108 178,112"
              fill="none"
              stroke={accent}
              strokeWidth="1.2"
            />
          </g>
          <g opacity="0.9">
            <rect x="196" y="78" width="80" height="48" fill="#0e0e14" stroke={accent} strokeWidth="0.5" transform="rotate(4 236 102)" />
            <rect x="204" y="90" width="46" height="2" fill="#e6e2d8" transform="rotate(4 236 102)" />
            <rect x="204" y="96" width="30" height="1.5" fill="#7f7c76" transform="rotate(4 236 102)" />
            <rect x="204" y="112" width="20" height="6" rx="1" fill={accent} transform="rotate(4 236 102)" />
          </g>
          {/* Bottom scroll indicator */}
          <line x1="140" y1="146" x2="160" y2="146" stroke={accent} strokeWidth="0.6" />
          <line x1="148" y1="142" x2="152" y2="150" stroke={accent} strokeWidth="0.6" />
        </g>
      )}

      {v.layout === "dashboard" && (
        <g transform="translate(0, 36)">
          {/* Left sidebar */}
          <rect x="0" y="0" width="46" height="160" fill="#08080c" />
          <line x1="46" y1="0" x2="46" y2="160" stroke="#161620" strokeWidth="0.5" />
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i} transform={`translate(8, ${12 + i * 22})`}>
              <rect width="3" height="3" fill={i === 1 ? accent : "#3b3b46"} />
              <rect x="8" y="0.5" width="24" height="2" fill={i === 1 ? "#e6e2d8" : "#7f7c76"} />
            </g>
          ))}
          {/* Top stats */}
          <rect x="54" y="10" width="76" height="40" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <rect x="138" y="10" width="76" height="40" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <rect x="222" y="10" width="68" height="40" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <rect x="60" y="16" width="20" height="2" fill="#7f7c76" />
          <rect x="60" y="24" width="40" height="8" fill={accent} />
          <rect x="60" y="38" width="30" height="2" fill="#7f7c76" />
          <rect x="144" y="16" width="20" height="2" fill="#7f7c76" />
          <rect x="144" y="24" width="40" height="8" fill="#e6e2d8" />
          <rect x="144" y="38" width="30" height="2" fill="#7f7c76" />
          <rect x="228" y="16" width="20" height="2" fill="#7f7c76" />
          <rect x="228" y="24" width="40" height="8" fill="#e6e2d8" />
          {/* Big chart */}
          <rect x="54" y="58" width="160" height="96" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          <polyline
            points="60,140 74,130 88,132 102,120 118,124 134,110 150,116 168,98 184,104 200,88"
            fill="none"
            stroke={accent}
            strokeWidth="1.4"
          />
          <polyline
            points="60,140 74,130 88,132 102,120 118,124 134,110 150,116 168,98 184,104 200,88 200,150 60,150"
            fill={accentGlow}
          />
          {/* Side list */}
          <rect x="222" y="58" width="68" height="96" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          {Array.from({ length: 6 }).map((_, i) => (
            <g key={i} transform={`translate(228, ${66 + i * 14})`}>
              <rect width="2" height="2" fill={accent} opacity={0.8 - i * 0.1} />
              <rect x="6" y="0" width="30" height="2" fill="#e6e2d8" />
              <rect x="42" y="0" width="18" height="2" fill="#7f7c76" />
            </g>
          ))}
        </g>
      )}

      {v.layout === "ops" && (
        <g transform="translate(0, 36)">
          {/* Grid of tiles */}
          {Array.from({ length: 12 }).map((_, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const active = i === 3 || i === 6 || i === 9;
            return (
              <g key={i} transform={`translate(${16 + col * 68}, ${16 + row * 48})`}>
                <rect width="60" height="40" fill="#0a0a0f" stroke={active ? accent : "#161620"} strokeWidth="0.6" />
                <rect x="4" y="4" width="2" height="2" fill={active ? accent : "#3b3b46"} />
                <rect x="10" y="4" width="24" height="2" fill="#7f7c76" />
                <rect x="4" y="14" width="40" height="5" fill={active ? accent : "#e6e2d8"} />
                <rect x="4" y="24" width="30" height="2" fill="#7f7c76" />
                <rect x="4" y="30" width="22" height="2" fill="#7f7c76" />
              </g>
            );
          })}
          {/* Bottom log strip */}
          <rect x="16" y="132" width="268" height="24" fill="#0a0a0f" stroke="#161620" strokeWidth="0.5" />
          {Array.from({ length: 4 }).map((_, i) => (
            <g key={i} transform={`translate(22, ${138 + i * 4.5})`}>
              <rect width="1.5" height="1.5" fill={i === 0 ? accent : "#3b3b46"} />
              <rect x="6" y="0.2" width={40 + i * 12} height="1.2" fill="#7f7c76" />
              <rect x="200" y="0.2" width="20" height="1.2" fill="#3b3b46" />
            </g>
          ))}
        </g>
      )}

      {/* Foreground caption pill — reads "client · caption" */}
      {showCaption && (
        <g transform="translate(0, 172)">
          <rect x="10" y="4" width="80" height="16" rx="1" fill="#0a0a0f" stroke={accent} strokeWidth="0.5" />
          <rect x="16" y="10" width="2" height="4" fill={accent} />
          <text
            x="22"
            y="14"
            fill="#e6e2d8"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="5.5"
            letterSpacing="0.5"
          >
            {v.label.toUpperCase().slice(0, 14)}
          </text>
          <text
            x="98"
            y="14"
            fill="#7f7c76"
            fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
            fontSize="5"
            letterSpacing="0.5"
          >
            {v.caption.toUpperCase()}
          </text>
        </g>
      )}
    </svg>
  );
}
