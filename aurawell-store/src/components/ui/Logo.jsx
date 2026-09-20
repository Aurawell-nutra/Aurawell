import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Aaurawell Nutra logo, redrawn as a vector from the product label artwork:
 * green "A" with a gold swoosh + gold figure, "aura" in green, "well" in gold,
 * "— NUTRA" and the "NEW ERA OF WELLNESS" tagline.
 */
export function LogoMark({ light = false, tagline = true, className }) {
  const green = light ? "#FFFFFF" : "#0E4A34";
  const h = tagline ? 118 : 98;

  return (
    <svg viewBox={`0 0 292 ${h}`} className={className} role="img" aria-label="Aaurawell Nutra">
      <defs>
        <linearGradient id="aw-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E2BF6E" />
          <stop offset=".45" stopColor="#C0923F" />
          <stop offset="1" stopColor="#8E6424" />
        </linearGradient>
        <linearGradient id="aw-gold-text" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9B25E" />
          <stop offset=".6" stopColor="#B8873A" />
          <stop offset="1" stopColor="#8F6526" />
        </linearGradient>
      </defs>

      {/* "A" — left leg */}
      <path d="M12 86 L50 12 C54 3 65 3 70 11 L60 33 L33 86 C31 90 27 91 23 91 L15 91 C11 91 10 89 12 86Z" fill={green} />
      {/* "A" — right leg sweeping into the tail under "aura" */}
      <path
        d="M70 11 C78 34 84 58 100 74 C110 84 124 88 140 85 C120 97 94 97 81 84 C69 72 64 52 60 33Z"
        fill={green}
      />
      {/* Gold swoosh crossbar */}
      <path d="M16 83 C36 58 68 44 98 49 C72 53 46 64 27 88Z" fill="url(#aw-gold)" />
      {/* Gold figure — head and raised arms */}
      <circle cx="91" cy="22" r="7" fill="url(#aw-gold)" />
      <path d="M80 34 C87 35 90 42 90 52 C94 38 104 26 122 15 C108 30 99 46 94 66 C90 60 88 54 88 50 C86 43 84 38 80 34Z" fill="url(#aw-gold)" />

      {/* Wordmark */}
      <text
        y="78"
        fontFamily="var(--font-playfair), Georgia, serif"
        fontWeight="700"
        fontSize="50"
        letterSpacing="-1"
      >
        <tspan x="102" fill={green} textLength="82" lengthAdjust="spacingAndGlyphs">
          aura
        </tspan>
        <tspan x="187" fill="url(#aw-gold-text)" textLength="95" lengthAdjust="spacingAndGlyphs">
          well
        </tspan>
      </text>

      {/* — NUTRA */}
      <line x1="202" y1="88.5" x2="221" y2="88.5" stroke={green} strokeWidth="1.6" />
      <text
        x="283"
        y="92"
        textAnchor="end"
        fontFamily="var(--font-poppins), system-ui, sans-serif"
        fontWeight="600"
        fontSize="11"
        letterSpacing="3.4"
        fill={green}
      >
        NUTRA
      </text>

      {tagline && (
        <>
          <line x1="10" y1="110" x2="36" y2="110" stroke={green} strokeWidth="1.4" />
          <text
            x="147"
            y="114"
            textAnchor="middle"
            fontFamily="var(--font-poppins), system-ui, sans-serif"
            fontWeight="600"
            fontSize="11.5"
            letterSpacing="3.6"
            fill={green}
          >
            NEW ERA OF WELLNESS
          </text>
          <line x1="256" y1="110" x2="282" y2="110" stroke={green} strokeWidth="1.4" />
        </>
      )}
    </svg>
  );
}

export default function Logo({ light = false, tagline = true, className }) {
  return (
    <Link href="/" aria-label="Aaurawell Nutra home" className={cn("inline-flex shrink-0", className)}>
      <LogoMark light={light} tagline={tagline} className="h-12 w-auto sm:h-14" />
    </Link>
  );
}
