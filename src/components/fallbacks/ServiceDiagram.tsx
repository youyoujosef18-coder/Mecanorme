'use client';

import React from 'react';
import type { ServiceId } from '@/lib/i18n/dict';

/**
 * 2D animated P&ID-style schematic — WebGL fallback for each service.
 * Blueprint aesthetic: line work + animated dashed flow paths.
 */

const S = {
  line: '#4A5578',
  steel: '#B9C0D4',
  orange: '#F57A1C',
  cyan: '#39B7D8',
  cold: '#4FC3F7',
  fire: '#E23D28',
  warm: '#FF9440',
  raw: '#8A6B3F',
};

function FlowPath({ d, color, width = 3, speed = 3 }: { d: string; color: string; width?: number; speed?: number }) {
  return (
    <>
      <path d={d} fill="none" stroke={color} strokeOpacity={0.25} strokeWidth={width + 3} />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeDasharray="10 14" style={{ animation: `dashflow ${speed}s linear infinite` }} />
    </>
  );
}

function PumpSym({ x, y, color = S.steel }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <circle r="22" fill="none" stroke={color} strokeWidth="2.5" />
      <path d="M-9,-12 L14,0 L-9,12 Z" fill={color} />
    </g>
  );
}

function ValveSym({ x, y, color = S.steel }: { x: number; y: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <path d="M-16,-11 L16,11 M-16,11 L16,-11 M-16,-11 L-16,11 M16,-11 L16,11" stroke={color} strokeWidth="2.5" fill="none" />
      <line x1="0" y1="0" x2="0" y2="-18" stroke={color} strokeWidth="2.5" />
      <line x1="-9" y1="-18" x2="9" y2="-18" stroke={color} strokeWidth="2.5" />
    </g>
  );
}

function VesselSym({ x, y, w = 46, h = 90, color = S.steel, fill = 'none' }: { x: number; y: number; w?: number; h?: number; color?: string; fill?: string }) {
  return (
    <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={w / 2.4} fill={fill} stroke={color} strokeWidth="2.5" />
  );
}

function Label({
  x,
  y,
  children,
  color = S.steel,
  anchor = 'middle',
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  color?: string;
  anchor?: 'start' | 'middle' | 'end';
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} style={{ font: '600 11px "JetBrains Mono", monospace', letterSpacing: '0.12em' }}>
      {children}
    </text>
  );
}

function Grid() {
  return (
    <g opacity="0.35">
      {Array.from({ length: 13 }).map((_, i) => (
        <line key={`v${i}`} x1={i * 53} y1="0" x2={i * 53} y2="400" stroke={S.line} strokeOpacity="0.25" strokeWidth="1" />
      ))}
      {Array.from({ length: 9 }).map((_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 50} x2="640" y2={i * 50} stroke={S.line} strokeOpacity="0.25" strokeWidth="1" />
      ))}
    </g>
  );
}

function Piping() {
  const d = 'M70,330 L70,120 L300,120 L300,120 L530,120 L530,270';
  return (
    <g>
      <FlowPath d={d} color={S.orange} />
      <PumpSym x={70} y={330} color={S.orange} />
      <ValveSym x={300} y={120} />
      <VesselSym x={530} y={310} w={80} h={70} />
      <Label x={70} y={375}>P-101</Label>
      <Label x={300} y={85}>VN-01 · DN100</Label>
      <Label x={530} y={365}>R-201</Label>
    </g>
  );
}

function Hvac() {
  return (
    <g>
      <rect x="40" y="150" width="130" height="120" fill="none" stroke={S.steel} strokeWidth="2.5" />
      <circle cx="105" cy="210" r="30" fill="none" stroke={S.orange} strokeWidth="2.5" />
      <path d="M105,180 L105,240 M75,210 L135,210 M84,189 L126,231 M84,231 L126,189" stroke={S.orange} strokeWidth="2" />
      <FlowPath d="M170,180 L560,180" color={S.cold} />
      {[260, 390, 520].map((x) => (
        <g key={x}>
          <FlowPath d={`M${x},180 L${x},280`} color={S.cold} width={2.5} speed={2.2} />
          <path d={`M${x - 22},280 L${x + 22},280 L${x},302 Z`} fill="none" stroke={S.steel} strokeWidth="2.5" />
        </g>
      ))}
      <Label x={105} y={135}>CTA-01</Label>
      <Label x={365} y={160}>GAINE PRINCIPALE</Label>
      <Label x={390} y={330}>DIFFUSEURS</Label>
    </g>
  );
}

function Water() {
  return (
    <g>
      <VesselSym x={70} y={220} w={60} h={130} color={S.raw} />
      <FlowPath d="M100,220 L160,220" color={S.raw} width={2.5} />
      <PumpSym x={185} y={220} />
      <FlowPath d="M210,220 L255,220" color={S.raw} width={2.5} />
      <VesselSym x={285} y={210} w={52} h={120} />
      <FlowPath d="M311,210 L345,210" color="#4E7F98" width={2.5} />
      <rect x="350" y="170" width="110" height="80" fill="none" stroke={S.steel} strokeWidth="2.5" />
      {[188, 210, 232].map((y) => (
        <line key={y} x1="358" y1={y} x2="452" y2={y} stroke={S.cyan} strokeWidth="4" strokeOpacity="0.7" />
      ))}
      <FlowPath d="M460,210 L520,210" color={S.cyan} width={2.5} />
      <VesselSym x={550} y={225} w={58} h={110} color={S.cyan} />
      <FlowPath d="M405,250 L405,330 L470,330" color={S.raw} width={2} speed={4} />
      <Label x={70} y={310}>EAU BRUTE</Label>
      <Label x={285} y={295}>FILTRES</Label>
      <Label x={405} y={155}>OSMOSE INVERSE</Label>
      <Label x={550} y={305} color={S.cyan}>EAU TRAITÉE</Label>
      <Label x={492} y={345}>REJET</Label>
    </g>
  );
}

function Fire() {
  return (
    <g>
      <VesselSym x={75} y={280} w={80} h={120} color={S.fire} />
      <PumpSym x={185} y={330} color={S.fire} />
      <FlowPath d="M115,300 L160,330 M210,330 L250,330 L250,110 L560,110" color={S.cold} />
      {[320, 430, 540].map((x) => (
        <g key={x}>
          <line x1={x} y1="110" x2={x} y2="150" stroke={S.steel} strokeWidth="2.5" />
          <path d={`M${x - 10},150 L${x + 10},150 M${x},150 L${x},162`} stroke={S.orange} strokeWidth="2.5" />
          <path d={`M${x - 16},185 A20,20 0 0 1 ${x + 16},185`} fill="none" stroke={S.cold} strokeWidth="2" strokeDasharray="3 6" style={{ animation: 'dashflow 2s linear infinite' }} />
        </g>
      ))}
      <rect x="300" y="250" width="120" height="90" fill="none" stroke={S.line} strokeWidth="2" />
      <rect x="450" y="250" width="120" height="90" fill="none" stroke={S.line} strokeWidth="2" />
      <Label x={75} y={365}>RÉSERVE</Label>
      <Label x={185} y={375}>GR. MOTOPOMPE</Label>
      <Label x={430} y={90}>COLLECTEUR SPRINKLER</Label>
      <Label x={435} y={310} color={S.line}>STOCKAGE</Label>
    </g>
  );
}

function Insulation() {
  return (
    <g>
      {/* longitudinal */}
      <rect x="60" y="170" width="220" height="40" fill="none" stroke="#FF5A2A" strokeWidth="2.5" />
      <rect x="280" y="150" width="300" height="80" fill="none" stroke={S.steel} strokeWidth="2.5" />
      <rect x="280" y="162" width="300" height="56" fill="none" stroke={S.warm} strokeWidth="1.5" strokeDasharray="5 5" />
      <rect x="280" y="170" width="300" height="40" fill="none" stroke="#D9C98F" strokeWidth="1.5" />
      {[330, 400, 470, 540].map((x) => (
        <line key={x} x1={x} y1="150" x2={x} y2="230" stroke={S.steel} strokeWidth="1.5" />
      ))}
      {/* heat waves on bare section */}
      {[100, 160, 220].map((x) => (
        <path key={x} d={`M${x},160 q6,-12 0,-24 q-6,-12 0,-24`} fill="none" stroke="#FF5A2A" strokeWidth="2" strokeOpacity="0.7" strokeDasharray="4 6" style={{ animation: 'dashflow 2.4s linear infinite' }} />
      ))}
      {/* cross-section */}
      <circle cx="150" cy="320" r="16" fill="none" stroke="#FF5A2A" strokeWidth="2.5" />
      <circle cx="150" cy="320" r="34" fill="none" stroke="#D9C98F" strokeWidth="2.5" />
      <circle cx="150" cy="320" r="42" fill="none" stroke={S.steel} strokeWidth="2.5" />
      <line x1="150" y1="320" x2="245" y2="320" stroke={S.line} strokeWidth="1.5" />
      <Label x={170} y={128} color="#FF5A2A">TUBE NU · 165°C</Label>
      <Label x={430} y={128}>CALORIFUGÉ · 38°C</Label>
      <Label x={300} y={324} anchor="start">Ø + ISOLANT + TÔLE</Label>
    </g>
  );
}

function Plumbing() {
  return (
    <g>
      <path d="M100,60 L100,360 M560,60 L560,360 M100,360 L560,360 M100,60 L560,60 M100,160 L560,160 M100,260 L560,260" stroke={S.line} strokeWidth="2" fill="none" />
      <FlowPath d="M160,360 L160,80" color={S.cold} width={2.5} />
      {[100, 200, 300].map((y) => (
        <FlowPath key={y} d={`M160,${y} L380,${y}`} color={S.cold} width={2} speed={2.6} />
      ))}
      <FlowPath d="M240,340 L240,90" color={S.warm} width={2.5} speed={3.4} />
      <rect x="210" y="320" width="60" height="40" rx="8" fill="none" stroke={S.warm} strokeWidth="2.5" />
      <FlowPath d="M470,80 L470,360" color="#8B98B8" width={3.5} speed={2} />
      <PumpSym x={130} y={385} color={S.cold} />
      <Label x={160} y={50} color={S.cold}>EF</Label>
      <Label x={240} y={50} color={S.warm}>ECS</Label>
      <Label x={470} y={50} color="#8B98B8">EU</Label>
      <Label x={330} y={390}>SURPRESSEUR + PRODUCTION ECS</Label>
    </g>
  );
}

const DIAGRAMS: Record<ServiceId, React.FC> = {
  piping: Piping,
  hvac: Hvac,
  water: Water,
  fire: Fire,
  insulation: Insulation,
  plumbing: Plumbing,
};

export default function ServiceDiagram({ id, title }: { id: ServiceId; title?: string }) {
  const D = DIAGRAMS[id];
  return (
    <div className="relative h-full w-full bg-navy-deep">
      <style>{`@keyframes dashflow { to { stroke-dashoffset: -48; } }`}</style>
      <svg viewBox="0 0 640 400" className="h-full w-full" role="img" aria-label={title ?? id} preserveAspectRatio="xMidYMid meet">
        <Grid />
        <D />
      </svg>
      {title && (
        <div className="tech-label absolute bottom-3 left-4 text-steel-500">{title}</div>
      )}
    </div>
  );
}
