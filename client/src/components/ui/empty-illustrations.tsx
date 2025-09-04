import React from 'react'

// Simple inline SVG illustration primitives (can be expanded later)
export const DocIllustration = ({ className = 'w-24 h-24' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Document illustration">
    <rect x="12" y="10" width="72" height="100" rx="8" fill="var(--semantic-surface)" stroke="var(--semantic-border)" strokeWidth="2" />
    <rect x="24" y="26" width="48" height="6" rx="3" fill="var(--semantic-inset)" />
    <rect x="24" y="40" width="36" height="6" rx="3" fill="var(--semantic-inset)" />
    <rect x="24" y="54" width="42" height="6" rx="3" fill="var(--semantic-inset)" />
    <rect x="24" y="68" width="30" height="6" rx="3" fill="var(--semantic-inset)" />
    <rect x="24" y="82" width="40" height="6" rx="3" fill="var(--semantic-inset)" />
  </svg>
)

export const ResearchIllustration = ({ className = 'w-24 h-24' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Research illustration">
  <circle cx="54" cy="54" r="32" fill="var(--accent-surface)" stroke="var(--brand-accent)" strokeWidth="2" />
    <circle cx="54" cy="54" r="18" fill="var(--semantic-surface)" stroke="var(--semantic-border)" strokeWidth="2" />
  <line x1="74" y1="74" x2="100" y2="104" stroke="var(--brand-accent)" strokeWidth="6" strokeLinecap="round" />
  </svg>
)

export const AudioIllustration = ({ className = 'w-24 h-24' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Audio illustration">
  <rect x="20" y="30" width="16" height="60" rx="4" fill="var(--brand-accent)" opacity="0.5" />
  <rect x="44" y="20" width="16" height="80" rx="4" fill="var(--brand-accent)" opacity="0.7" />
  <rect x="68" y="40" width="16" height="60" rx="4" fill="var(--brand-accent)" opacity="0.5" />
  <rect x="92" y="50" width="16" height="50" rx="4" fill="var(--brand-accent)" opacity="0.35" />
  </svg>
)

// Phase 8: Additional contextual illustrations (stroke/duotone, currentColor driven)
// Pattern: base shapes use currentColor with opacity tiers, accent wash via brand token.

export const IdeaIllustration = ({ className = 'w-24 h-24' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Idea illustration">
    <circle cx="60" cy="60" r="44" fill="var(--accent-soft-bg)" />
    <path d="M60 30c-11 0-20 9-20 20 0 6.4 3 12.1 8 15.7v10.3a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4V65.7c5-3.6 8-9.3 8-15.7 0-11-9-20-20-20Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M52 98h16" stroke="var(--brand-accent)" strokeWidth="4" strokeLinecap="round" />
  </svg>
)

export const EmptyInboxIllustration = ({ className = 'w-24 h-24' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Empty inbox illustration">
    <rect x="14" y="40" width="92" height="52" rx="10" fill="var(--accent-soft-bg)" stroke="var(--brand-accent)" strokeWidth="2" />
    <path d="M14 66h26c3 6 8 10 20 10s17-4 20-10h26" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M40 36v-6a6 6 0 0 1 6-6h28a6 6 0 0 1 6 6v6" stroke="currentColor" strokeWidth="2.5" fill="none" />
  </svg>
)

export const WaveUploadIllustration = ({ className = 'w-24 h-24' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Upload audio illustration">
    <rect x="10" y="70" width="12" height="30" rx="4" fill="var(--brand-accent)" opacity="0.35" />
    <rect x="28" y="55" width="12" height="45" rx="4" fill="var(--brand-accent)" opacity="0.5" />
    <rect x="46" y="40" width="12" height="60" rx="4" fill="var(--brand-accent)" opacity="0.65" />
    <rect x="64" y="50" width="12" height="50" rx="4" fill="var(--brand-accent)" opacity="0.5" />
    <rect x="82" y="60" width="12" height="40" rx="4" fill="var(--brand-accent)" opacity="0.35" />
    <path d="M60 22v30" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
    <path d="m48 34 12-12 12 12" stroke="var(--brand-accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
)

export const ResearchDiscoveryIllustration = ({ className = 'w-24 h-24' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Discovery illustration">
    <circle cx="50" cy="54" r="30" fill="var(--semantic-surface)" stroke="var(--brand-accent)" strokeWidth="2.5" />
    <circle cx="50" cy="54" r="16" fill="var(--accent-soft-bg)" stroke="currentColor" strokeWidth="2" />
    <line x1="69" y1="73" x2="98" y2="102" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
    <path d="M50 24v6M50 78v6M20 54h6M74 54h6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
)

export const ScriptEmptyIllustration = ({ className = 'w-24 h-24' }: { className?: string }) => (
  <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Script empty illustration">
    <rect x="30" y="20" width="60" height="80" rx="10" fill="var(--semantic-surface)" stroke="var(--semantic-border)" strokeWidth="2" />
    <path d="M42 38h36M42 52h28M42 66h34" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M30 20h60l6 10H24l6-10Z" fill="var(--accent-soft-bg)" />
  </svg>
)
