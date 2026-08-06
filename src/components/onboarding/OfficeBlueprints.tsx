import React from 'react';
import { motion } from 'framer-motion';
import { Users, Code, Shield, Briefcase, CheckCircle, Award } from 'lucide-react';

interface OfficeBlueprintsProps {
  activeStakeholderIndex: number;
}

export interface OfficeRoom {
  id: string;
  name: string;
  department: string;
  description: string;
  x: number; // grid position
  y: number; // grid position
  w: number; // size width
  h: number; // size height
  color: string; // theme color
  accentGlow: string;
  icon: React.ReactNode;
  ambientContent: React.ReactNode;
}

export const OfficeBlueprints: React.FC<OfficeBlueprintsProps> = ({ activeStakeholderIndex }) => {
  const rooms: OfficeRoom[] = [
    {
      id: 'sarah_hr',
      name: 'Human Resources Suite',
      department: 'Human Resources',
      description: 'Glass-walled meeting room, digital whiteboard, collaborative layouts.',
      x: -120,
      y: -120,
      w: 160,
      h: 140,
      color: 'from-pink-500/20 to-pink-600/5',
      accentGlow: 'rgba(236, 72, 153, 0.4)',
      icon: <Users className="w-5 h-5 text-pink-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-mono text-pink-400 font-bold tracking-wider">COLLABORATION ZONE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse" />
          </div>
          {/* Animated whiteboard representation */}
          <div className="w-full bg-white/5 border border-white/10 rounded p-1.5 space-y-1">
            <div className="h-1 bg-pink-500/40 rounded w-3/4" />
            <div className="h-1 bg-white/10 rounded w-1/2" />
            <div className="h-1 bg-white/10 rounded w-5/6" />
          </div>
          <span className="text-[8px] font-mono text-slate-500 text-right">Sarah\'s Desk</span>
        </div>
      ),
    },
    {
      id: 'raj_biz',
      name: 'Business Development Boardroom',
      department: 'Business',
      description: 'Smart presentation display screens, analytical charts, executive seating.',
      x: 120,
      y: -120,
      w: 180,
      h: 140,
      color: 'from-amber-500/20 to-amber-600/5',
      accentGlow: 'rgba(245, 158, 11, 0.4)',
      icon: <Briefcase className="w-5 h-5 text-amber-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-mono text-amber-400 font-bold tracking-wider">BOARDROOM B</span>
            <div className="flex space-x-0.5">
              <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" />
              <span className="w-1 h-1 rounded-full bg-amber-400" />
            </div>
          </div>
          {/* Analytical charts ticker */}
          <div className="flex items-end justify-between px-2 h-10 border-b border-white/10 pb-1">
            <div className="w-1.5 bg-amber-500/30 rounded-t h-[40%]" />
            <div className="w-1.5 bg-amber-500/50 rounded-t h-[70%]" />
            <div className="w-1.5 bg-amber-400 rounded-t h-[90%] animate-pulse" />
            <div className="w-1.5 bg-amber-500/40 rounded-t h-[60%]" />
            <div className="w-1.5 bg-amber-500/20 rounded-t h-[30%]" />
          </div>
          <span className="text-[7px] font-mono text-amber-300/80">KPI MANDATE STAKES</span>
        </div>
      ),
    },
    {
      id: 'ethan_tech',
      name: 'Technology & Development Center',
      department: 'Technology',
      description: 'Dual-monitor developer setups, local build servers, matrix screen glows.',
      x: -140,
      y: 100,
      w: 190,
      h: 150,
      color: 'from-sky-500/20 to-sky-600/5',
      accentGlow: 'rgba(56, 189, 248, 0.4)',
      icon: <Code className="w-5 h-5 text-sky-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-mono text-sky-400 font-bold tracking-wider">DEV_HQ // TERMINAL</span>
            <span className="font-mono text-[7px] text-sky-400/60">PING: 14ms</span>
          </div>
          {/* Matrix code lines representation */}
          <div className="font-mono text-[6px] text-sky-300/50 space-y-0.5 overflow-hidden h-14 bg-black/20 p-1 rounded border border-white/5">
            <div className="truncate text-emerald-400/70">{`$ yarn build --prod`}</div>
            <div className="truncate text-sky-400/80">{`✓ Bundling components (4.2s)`}</div>
            <div className="truncate">{`[webpack] Compiled successfully.`}</div>
            <div className="truncate text-yellow-400/85">{`⚠ Deprecation: use postcss-loader v4`}</div>
          </div>
          <span className="text-[8px] font-mono text-slate-500">Ethan & Team</span>
        </div>
      ),
    },
    {
      id: 'olivia_sec',
      name: 'Information Security Operations Center (SOC)',
      department: 'Information Security',
      description: 'Access monitor matrix, active threat visual maps, warning system LEDs.',
      x: 120,
      y: 100,
      w: 180,
      h: 150,
      color: 'from-rose-500/20 to-rose-600/5',
      accentGlow: 'rgba(244, 63, 94, 0.4)',
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-mono text-rose-400 font-bold tracking-wider">SOC_NODE_ALPHA</span>
            <span className="px-1 py-0.2 rounded bg-rose-500/20 text-[7px] text-rose-400 font-bold border border-rose-500/30 animate-pulse">SECURE</span>
          </div>
          {/* Threat scanning layout grid */}
          <div className="relative h-12 bg-black/30 border border-rose-500/20 rounded flex items-center justify-center overflow-hidden">
            <div className="absolute w-full h-px bg-rose-500/40 animate-scan-beam" style={{ animationDuration: '2s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' }} />
            <div className="grid grid-cols-6 gap-0.5 opacity-40">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-sm ${i === 3 || i === 8 ? 'bg-rose-500 animate-ping' : 'bg-rose-950'}`} />
              ))}
            </div>
          </div>
          <span className="text-[7px] font-mono text-rose-300/80">ZERO-TRUST AUDIT PORTAL</span>
        </div>
      ),
    },
    {
      id: 'david_qa',
      name: 'Quality Assurance Lab',
      department: 'Quality Assurance',
      description: 'Automation test dashboard screens, green verification checklist arrays.',
      x: -20,
      y: 200,
      w: 160,
      h: 130,
      color: 'from-emerald-500/20 to-emerald-600/5',
      accentGlow: 'rgba(16, 185, 129, 0.4)',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-mono text-emerald-400 font-bold tracking-wider">QA_AUTOMATION</span>
            <span className="text-[7px] text-emerald-300 font-mono">PASS RATE: 100%</span>
          </div>
          {/* Green check grid */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-black/20 rounded border border-white/5">
            {[1, 2, 3, 4].map((v) => (
              <div key={v} className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[6px] font-mono text-slate-400">T0{v}</span>
              </div>
            ))}
          </div>
          <span className="text-[7px] font-mono text-slate-500">Regression Workspace</span>
        </div>
      ),
    },
    {
      id: 'michael_cto',
      name: 'Executive Leadership Hub',
      department: 'Executive Leadership',
      description: 'Spacious high-end office, private discussion space, glass Brained branding panel.',
      x: 0,
      y: -220,
      w: 220,
      h: 150,
      color: 'from-violet-500/20 to-violet-600/5',
      accentGlow: 'rgba(139, 92, 246, 0.4)',
      icon: <Award className="w-5 h-5 text-violet-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-mono text-violet-400 font-bold tracking-wider">EXECUTIVE_SUITE</span>
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          </div>
          {/* Glowing Brained Logo */}
          <div className="flex flex-col items-center justify-center py-1">
            <span className="text-[14px] font-black text-white/40 tracking-wider">BRAINED</span>
            <span className="text-[6px] text-violet-400 font-mono tracking-widest uppercase">CONSULTING HQ</span>
          </div>
          <span className="text-[8px] font-mono text-slate-500 text-center">CTO michael.chen@brained.com</span>
        </div>
      ),
    },
  ];

  // Active room coords used to offset the blueprint map viewport
  const activeRoom = rooms[activeStakeholderIndex] || rooms[0];

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center bg-[#070913]">
      {/* Dynamic isometric grid background grid lines */}
      <div 
        className="absolute inset-0 bg-cover opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, white 1px, transparent 0),
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 0),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 0)
          `,
          backgroundSize: '24px 24px, 48px 48px, 48px 48px'
        }}
      />

      {/* Blueprint viewport with perspective */}
      <div className="w-full h-[55vh] flex items-center justify-center perspective-[1200px]">
        {/* Isometric map container */}
        <motion.div
          animate={{
            x: -activeRoom.x,
            y: -activeRoom.y,
            scale: 1.15,
          }}
          transition={{
            type: 'spring',
            stiffness: 70,
            damping: 20,
          }}
          className="relative w-0 h-0 transform-style-preserve-3d"
          style={{
            transform: 'rotateX(60deg) rotateZ(-45deg)',
          }}
        >
          {/* Main floor outline blueprint */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full border border-dashed border-white/5 bg-slate-950/20 backdrop-blur-[1px] transform-style-preserve-3d"
            style={{ transform: 'translateZ(-10px)' }}
          />

          {/* Grid lines floor */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] border border-white/10 transform-style-preserve-3d"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              transform: 'translateZ(-5px)',
            }}
          />

          {/* Interactive rooms map */}
          {rooms.map((room, idx) => {
            const isActive = idx === activeStakeholderIndex;
            return (
              <motion.div
                key={room.id}
                animate={{
                  translateZ: isActive ? 20 : 0,
                  opacity: isActive ? 1.0 : 0.25,
                  scale: isActive ? 1.05 : 0.95,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 100,
                  damping: 18,
                }}
                className={`absolute rounded-2xl bg-gradient-to-br ${room.color} border-2 border-white/15 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden cursor-pointer transform-style-preserve-3d`}
                style={{
                  width: room.w,
                  height: room.h,
                  left: room.x - room.w / 2,
                  top: room.y - room.h / 2,
                  boxShadow: isActive ? `0 0 45px ${room.accentGlow}` : 'none',
                }}
              >
                {/* 3D Depth walls representation */}
                <div 
                  className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none transform-style-preserve-3d"
                  style={{ transform: 'translateZ(10px)' }}
                />

                {/* Inner Room Header */}
                <div className="p-3 pb-1 flex items-start justify-between border-b border-white/5 bg-white/5">
                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="p-1 rounded-lg bg-black/40 border border-white/15">
                      {room.icon}
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] font-extrabold text-white tracking-tight">{room.name}</div>
                      <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider">{room.department}</div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative bg-slate-950/40">
                  {room.ambientContent}
                </div>

                {/* Active scanner outline indicator */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 border-2 border-white pointer-events-none rounded-2xl"
                    animate={{
                      borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.7)', 'rgba(255,255,255,0.1)'],
                    }}
                    transition={{
                      duration: 2.0,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Ambient office sound wave overlay details */}
      <div className="absolute bottom-6 left-6 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full select-none">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[9px] font-mono text-emerald-400 tracking-widest font-extrabold">LIVE_FEED // HQ_CAM_14</span>
      </div>
    </div>
  );
};
