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
      id: 'marcus_cto',
      name: 'Executive Leadership Hub',
      department: 'Technology Leadership',
      description: 'Spacious high-end office, private discussion space, glass Brained branding panel.',
      x: 0,
      y: -220,
      w: 230,
      h: 155,
      color: 'from-blue-500/20 to-blue-600/5',
      accentGlow: 'rgba(59, 130, 246, 0.4)',
      icon: <Award className="w-5 h-5 text-blue-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[8px] font-mono text-blue-400 font-bold tracking-wider truncate">EXECUTIVE_SUITE</span>
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
          </div>
          <div className="flex flex-col items-center justify-center py-1">
            <span className="text-[13px] font-black text-white/40 tracking-wider">BRAINED</span>
            <span className="text-[6px] text-blue-400 font-mono tracking-widest uppercase">CONSULTING HQ</span>
          </div>
          <span className="text-[8px] font-mono text-slate-500 text-center truncate">CTO marcus@brained.com</span>
        </div>
      ),
    },
    {
      id: 'emma_hr',
      name: 'Human Resources Suite',
      department: 'Human Resources',
      description: 'Glass-walled meeting room, digital whiteboard, collaborative layouts.',
      x: -120,
      y: -120,
      w: 185,
      h: 145,
      color: 'from-emerald-500/20 to-emerald-600/5',
      accentGlow: 'rgba(16, 185, 129, 0.4)',
      icon: <Users className="w-5 h-5 text-emerald-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[8px] font-mono text-emerald-400 font-bold tracking-wider truncate">COLLABORATION ZONE</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          </div>
          <div className="w-full bg-white/5 border border-white/10 rounded p-1.5 space-y-1">
            <div className="h-1 bg-emerald-500/40 rounded w-3/4" />
            <div className="h-1 bg-white/10 rounded w-1/2" />
            <div className="h-1 bg-white/10 rounded w-5/6" />
          </div>
          <span className="text-[8px] font-mono text-slate-500 text-right truncate">Emma's Desk</span>
        </div>
      ),
    },
    {
      id: 'daniel_biz',
      name: 'Business Development Board',
      department: 'Business Strategy',
      description: 'Smart presentation display screens, analytical charts, executive seating.',
      x: 120,
      y: -120,
      w: 195,
      h: 145,
      color: 'from-orange-500/20 to-orange-600/5',
      accentGlow: 'rgba(249, 115, 22, 0.4)',
      icon: <Briefcase className="w-5 h-5 text-orange-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[8px] font-mono text-orange-400 font-bold tracking-wider truncate">BOARDROOM B</span>
            <div className="flex space-x-0.5 shrink-0">
              <span className="w-1 h-1 rounded-full bg-orange-400 animate-ping" />
              <span className="w-1 h-1 rounded-full bg-orange-400" />
            </div>
          </div>
          <div className="flex items-end justify-between px-2 h-10 border-b border-white/10 pb-1">
            <div className="w-1.5 bg-orange-500/30 rounded-t h-[40%]" />
            <div className="w-1.5 bg-orange-500/50 rounded-t h-[70%]" />
            <div className="w-1.5 bg-orange-400 rounded-t h-[90%] animate-pulse" />
            <div className="w-1.5 bg-orange-500/40 rounded-t h-[60%]" />
            <div className="w-1.5 bg-orange-500/20 rounded-t h-[30%]" />
          </div>
          <span className="text-[7px] font-mono text-orange-300/80 truncate">KPI MANDATE STAKES</span>
        </div>
      ),
    },
    {
      id: 'olivia_sec',
      name: 'Information Security Ops Center',
      department: 'Cyber Security',
      description: 'Access monitor matrix, active threat visual maps, warning system LEDs.',
      x: 120,
      y: 100,
      w: 195,
      h: 155,
      color: 'from-red-500/20 to-red-600/5',
      accentGlow: 'rgba(225, 29, 72, 0.4)',
      icon: <Shield className="w-5 h-5 text-red-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[8px] font-mono text-red-400 font-bold tracking-wider truncate">SOC_NODE_ALPHA</span>
            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-[7px] text-red-400 font-bold border border-red-500/30 animate-pulse shrink-0">SECURE</span>
          </div>
          <div className="relative h-12 bg-black/30 border border-red-500/20 rounded flex items-center justify-center overflow-hidden">
            <div className="absolute w-full h-px bg-red-500/40 animate-scan-beam" style={{ animationDuration: '2s', animationIterationCount: 'infinite', animationTimingFunction: 'linear' }} />
            <div className="grid grid-cols-6 gap-0.5 opacity-40">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`w-1.5 h-1.5 rounded-sm ${i === 3 || i === 8 ? 'bg-red-500 animate-ping' : 'bg-red-950'}`} />
              ))}
            </div>
          </div>
          <span className="text-[7px] font-mono text-red-300/80 truncate">ZERO-TRUST AUDIT PORTAL</span>
        </div>
      ),
    },
    {
      id: 'sophia_val',
      name: 'Client Collaboration Room',
      department: 'Business Value',
      description: 'Customer journey dashboard wall, elegant glass panels, presentation display.',
      x: -20,
      y: 200,
      w: 185,
      h: 140,
      color: 'from-purple-500/20 to-purple-600/5',
      accentGlow: 'rgba(147, 51, 234, 0.4)',
      icon: <CheckCircle className="w-5 h-5 text-purple-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[8px] font-mono text-purple-400 font-bold tracking-wider truncate">CLIENT_VALUE</span>
            <span className="text-[7px] text-purple-300 font-mono shrink-0">98% SATISFACTION</span>
          </div>
          <div className="grid grid-cols-4 gap-1 p-1 bg-black/20 rounded border border-white/5">
            {[1, 2, 3, 4].map((v) => (
              <div key={v} className="flex items-center space-x-1 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                <span className="text-[6px] font-mono text-slate-400 truncate">V0{v}</span>
              </div>
            ))}
          </div>
          <span className="text-[7px] font-mono text-slate-500 truncate">Value Realization Lab</span>
        </div>
      ),
    },
    {
      id: 'aarav_dto',
      name: 'Transformation Strategy Center',
      department: 'Digital Transformation Office',
      description: 'Digital whiteboard roadmap screens, strategic indicators, feedback boards.',
      x: -140,
      y: 100,
      w: 205,
      h: 155,
      color: 'from-yellow-500/20 to-yellow-600/5',
      accentGlow: 'rgba(234, 179, 8, 0.4)',
      icon: <Code className="w-5 h-5 text-yellow-400" />,
      ambientContent: (
        <div className="absolute inset-0 flex flex-col justify-between p-3 select-none">
          <div className="flex justify-between items-center gap-2">
            <span className="text-[8px] font-mono text-yellow-400 font-bold tracking-wider truncate">DTO_ROADMAP // ACTIVE</span>
            <span className="font-mono text-[7px] text-yellow-400/60 shrink-0">ACTIVE</span>
          </div>
          <div className="font-mono text-[6px] text-yellow-300/50 space-y-0.5 overflow-hidden h-14 bg-black/20 p-1 rounded border border-white/5">
            <div className="truncate text-yellow-400/80">{`✓ Loading roadmap parameters`}</div>
            <div className="truncate">{`[system] Syncing DTO dashboard metrics`}</div>
            <div className="truncate text-emerald-400/70">{`Success: 6/6 Stakeholders connected`}</div>
          </div>
          <span className="text-[8px] font-mono text-slate-500 truncate">Aarav & DTO</span>
        </div>
      ),
    },
  ];

  // Active room coords used to offset the blueprint map viewport
  const activeRoom = rooms[activeStakeholderIndex] || rooms[0];

  // Animated pathways to make the office blueprint look dynamically populated
  const walkingPaths = [
    {
      id: 'worker_1',
      coords: [
        { x: -100, y: -80 },
        { x: 0, y: -80 },
        { x: 100, y: -80 },
        { x: 100, y: 50 },
        { x: 0, y: 50 },
        { x: -100, y: 50 },
        { x: -100, y: -80 }
      ],
      duration: 25,
      color: 'bg-sky-400/50'
    },
    {
      id: 'worker_2',
      coords: [
        { x: 50, y: 150 },
        { x: 50, y: -50 },
        { x: -50, y: -50 },
        { x: -50, y: 150 },
        { x: 50, y: 150 }
      ],
      duration: 18,
      color: 'bg-pink-400/50'
    }
  ];

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden flex items-center justify-center bg-[#070913] z-0">
      {/* Dynamic isometric grid background lines */}
      <div 
        className="absolute inset-0 bg-cover opacity-[0.04] pointer-events-none"
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
      <div className="absolute inset-0 w-full h-full flex items-center justify-center perspective-[1500px]">
        {/* Isometric map container */}
        <motion.div
          animate={{
            x: -activeRoom.x + 160, // Shift center x to the right to leave space for the portrait on the left!
            y: -activeRoom.y - 20,
            scale: 1.45, // Dramatic AAA zoom focus
          }}
          transition={{
            type: 'spring',
            stiffness: 55,
            damping: 18,
          }}
          className="relative w-0 h-0 transform-style-preserve-3d"
          style={{
            transform: 'rotateX(60deg) rotateZ(-45deg)',
          }}
        >
          {/* Main floor outline blueprint */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[760px] h-[760px] rounded-full border border-dashed border-white/5 bg-slate-950/20 backdrop-blur-[1px] transform-style-preserve-3d"
            style={{ transform: 'translateZ(-10px)' }}
          />

          {/* Grid lines floor */}
          <div 
            className="absolute -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] border border-white/10 transform-style-preserve-3d"
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
                  translateZ: isActive ? 30 : 0, // Extra elevation height on active
                  opacity: isActive ? 1.0 : 0.08, // Dim inactive rooms significantly!
                  scale: isActive ? 1.06 : 0.92,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 90,
                  damping: 16,
                }}
                className={`absolute rounded-2xl bg-gradient-to-br ${room.color} border-2 border-white/15 backdrop-blur-md shadow-2xl flex flex-col justify-between overflow-hidden transform-style-preserve-3d z-10`}
                style={{
                  width: room.w,
                  height: room.h,
                  left: room.x - room.w / 2,
                  top: room.y - room.h / 2,
                  boxShadow: isActive ? `0 0 60px 15px ${room.accentGlow}` : 'none',
                }}
              >
                {/* 3D Depth walls representation */}
                <div 
                  className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none transform-style-preserve-3d"
                  style={{ transform: 'translateZ(12px)' }}
                />

                {/* Inner Room Header */}
                <div className="p-3 pb-1 flex items-center gap-2 border-b border-white/5 bg-white/5 overflow-hidden">
                  <div className="p-1 rounded-lg bg-black/40 border border-white/15 shrink-0">
                    {room.icon}
                  </div>
                  <div className="text-left min-w-0 overflow-hidden">
                    <div className="text-[10px] font-extrabold text-white tracking-tight truncate">{room.name}</div>
                    <div className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider truncate">{room.department}</div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 relative bg-slate-950/40">
                  {room.ambientContent}
                </div>

                {/* Spotlight cone overlay gradient */}
                {isActive && (
                  <div 
                    className="absolute inset-0 pointer-events-none transform-style-preserve-3d"
                    style={{
                      background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06), transparent 80%)',
                      transform: 'translateZ(15px)',
                    }}
                  />
                )}

                {/* Active scanner outline indicator */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 border-2 border-white pointer-events-none rounded-2xl"
                    animate={{
                      borderColor: ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.8)', 'rgba(255,255,255,0.1)'],
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

          {/* Animated walking workers inside corridors */}
          {walkingPaths.map((worker) => (
            <motion.div
              key={worker.id}
              animate={{
                x: worker.coords.map(c => c.x),
                y: worker.coords.map(c => c.y),
              }}
              transition={{
                duration: worker.duration,
                repeat: Infinity,
                ease: 'linear'
              }}
              className={`absolute w-3 h-3 rounded-full ${worker.color} border border-white/10 flex items-center justify-center shadow-md transform-style-preserve-3d z-30`}
              style={{ transform: 'translateZ(10px)' }}
            >
              <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Ambient office camera watermarks */}
      <div className="absolute bottom-6 left-6 flex items-center space-x-2 bg-slate-950/80 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full select-none z-30">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-[9px] font-mono text-emerald-400 tracking-widest font-extrabold">LIVE_FEED // HQ_CAM_14</span>
      </div>
    </div>
  );
};
