'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { usePrefersReducedMotion } from '@/lib/hooks';

/* ---------- Magnetic CTA button ---------- */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  ariaLabel,
}: {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'ghost' | 'light';
  className?: string;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  const handleMove = (e: React.MouseEvent) => {
    if (reduced || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.18;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.28;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'translate(0,0)';
  };

  const base =
    'chamfer-sm group relative inline-flex items-center gap-3 px-7 py-4 text-sm font-semibold tracking-wide transition-colors duration-200';
  const styles =
    variant === 'primary'
      ? 'bg-brand-orange text-white hover:bg-brand-amber'
      : variant === 'light'
        ? 'bg-paper text-navy hover:bg-white'
        : 'border border-steel-500/50 text-paper hover:border-brand-orange hover:text-brand-orange';

  const inner = (
    <span
      ref={ref}
      className="flex items-center gap-3 transition-transform duration-200 ease-out"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <span className="tri-marker-right shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
      {children}
    </span>
  );

  if (href) {
    return (
      <a href={href} aria-label={ariaLabel} className={`${base} ${styles} ${className}`} onClick={onClick}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" aria-label={ariaLabel} className={`${base} ${styles} ${className}`} onClick={onClick}>
      {inner}
    </button>
  );
}

/* ---------- Section header ---------- */
export function SectionHeader({
  kicker,
  title,
  sub,
  dark = true,
  align = 'left',
  index,
}: {
  kicker: string;
  title: string;
  sub?: string;
  dark?: boolean;
  align?: 'left' | 'center';
  index?: string;
}) {
  return (
    <div className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''}`}>
      <div className={`flex items-center gap-3 ${align === 'center' ? 'justify-center' : ''}`}>
        <span className="tri-marker" aria-hidden />
        <span className={`tech-label ${dark ? 'text-brand-orange' : 'text-brand-ember'}`}>
          {index ? `${index} / ` : ''}
          {kicker}
        </span>
      </div>
      <h2
        className={`mt-4 whitespace-pre-line font-display text-4xl font-bold uppercase leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl ${
          dark ? 'text-paper' : 'text-navy'
        }`}
      >
        {title}
      </h2>
      {sub && (
        <p className={`mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${dark ? 'text-steel-300' : 'text-steel-700'} ${align === 'center' ? 'mx-auto' : ''}`}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ---------- Scroll reveal ---------- */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  once = true,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Animated counter ---------- */
export function Counter({
  to,
  suffix = '',
  className = '',
  duration = 1.6,
}: {
  to: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduced = usePrefersReducedMotion();
  const [val, setVal] = React.useState(0);

  React.useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / (duration * 1000));
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduced]);

  return (
    <span ref={ref} className={className}>
      {val}
      {suffix}
    </span>
  );
}
