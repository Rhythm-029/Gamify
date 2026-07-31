import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, Flame, Terminal, Sparkles
} from 'lucide-react';
import { STAKEHOLDERS } from '../../data/simulationData';

interface LandingPageProps {
  onStartOnboarding: () => void;
  onViewLeaderboard: () => void;
  onViewCertificate: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartOnboarding,
  onViewLeaderboard,
  onViewCertificate,
}) => {
  return (
    <div className="min-h-screen bg-[#0B1020] text-white flex flex-col font-sans relative overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Lighting & Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER / NAVIGATION */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-30">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20">
            BQ
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white">Brained Quest</span>
            <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30">Enterprise Edition</span>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
          <a href="#hero" className="hover:text-white transition-colors">The Mandate</a>
          <a href="#characters" className="hover:text-white transition-colors">Stakeholders</a>
          <a href="#features" className="hover:text-white transition-colors">Simulation OS</a>
          <button onClick={onViewLeaderboard} className="hover:text-white transition-colors cursor-pointer">Leaderboard</button>
          <button onClick={onViewCertificate} className="hover:text-white transition-colors cursor-pointer">Credentials</button>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={onStartOnboarding}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 hover:scale-105 flex items-center space-x-2 cursor-pointer"
          >
            <span>Start Simulation</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* HERO SECTION - INCORPORATING EXACT REFERENCE IMAGE CONTENT */}
      <section id="hero" className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center relative z-20 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracking-widest uppercase text-slate-400">BRAINED • THE TRANSFORMATION ROOM</span>
        </motion.div>

        {/* Headline from Reference Image */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6 max-w-4xl font-serif"
        >
          Not everyone at this table <br className="hidden sm:block"/>
          <span className="bg-gradient-to-r from-white via-slate-200 to-blue-300 bg-clip-text text-transparent italic">
            wants you to win.
          </span>
        </motion.h1>

        {/* Subtitle text from reference image */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed mb-10"
        >
          15 minutes. A real mandate. Five characters who each have a reason to slow you down. Your job: ship something that survives contact with reality.
        </motion.p>

        {/* Key Metrics Bar from Reference Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-3 gap-8 sm:gap-16 py-6 px-10 rounded-2xl glass-panel border border-white/10 mb-10"
        >
          <div>
            <div className="text-3xl font-extrabold text-white font-mono">15</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">minutes</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-blue-400 font-mono">8</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">challenges</div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-purple-400 font-mono">1</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">score to share</div>
          </div>
        </motion.div>

        {/* Character Badges from Reference Image */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-10"
        >
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            <span className="w-5 h-5 rounded-full bg-emerald-400 text-slate-900 font-bold flex items-center justify-center text-[10px]">X</span>
            <span className="font-semibold">You</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            <span className="w-5 h-5 rounded-full bg-rose-400 text-slate-900 font-bold flex items-center justify-center text-[10px]">B</span>
            <span className="font-semibold">Boss</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-xs text-sky-300">
            <span className="w-5 h-5 rounded-full bg-sky-400 text-slate-900 font-bold flex items-center justify-center text-[10px]">M</span>
            <span className="font-semibold">Marshal</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 font-bold flex items-center justify-center text-[10px]">K</span>
            <span className="font-semibold">Knox</span>
          </div>
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-lime-500/10 border border-lime-500/30 text-xs text-lime-300">
            <span className="w-5 h-5 rounded-full bg-lime-400 text-slate-900 font-bold flex items-center justify-center text-[10px]">Ms</span>
            <span className="font-semibold">Missy</span>
          </div>
        </motion.div>

        {/* Enter The Room CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col items-center gap-4"
        >
          <button 
            onClick={onStartOnboarding}
            className="px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-bold text-lg transition-all shadow-2xl hover:scale-105 flex items-center space-x-3 cursor-pointer"
          >
            <span>Enter the room</span>
            <ArrowRight className="w-5 h-5 text-slate-950" />
          </button>

          <p className="text-xs text-slate-400 max-w-md italic mt-2">
            "A veteran transformer drops a mandate on your desk. No context. No hand-holding. The clock starts the moment you open the door."
          </p>
        </motion.div>
      </section>

      {/* STAKEHOLDER CAROUSEL / CARDS SECTION */}
      <section id="characters" className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10 w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-blue-400">Boardroom Stakeholders</span>
          <h2 className="text-3xl font-bold text-white mt-2">Meet Your Corporate Opponents</h2>
          <p className="text-slate-400 text-sm mt-2">Each C-Suite executive has competing priorities and secrets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STAKEHOLDERS.slice(0, 4).map((person) => (
            <div key={person.id} className="glass-panel-interactive rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-xl object-cover border border-white/20" />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 text-white text-[10px] font-bold flex items-center justify-center border border-white/20">
                      {person.badgeCode}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-white">{person.name}</h3>
                    <p className="text-[11px] text-slate-400 leading-snug">{person.role}</p>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 mb-4 text-xs italic text-slate-300">
                  "{person.recentQuote}"
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Initial Trust:</span>
                  <span className="font-bold text-emerald-400">{person.trustLevel}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Current Mood:</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/5 text-amber-300 text-[10px] font-medium">
                    {person.mood}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SIMULATION FEATURES GRID */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 border-t border-white/10 w-full">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-purple-400">Enterprise Operating System</span>
          <h2 className="text-3xl font-bold text-white mt-2">The Digital Transformation OS</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            Not a game with monsters. A realistic simulation of Fortune 500 corporate dynamics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Duolingo-Style Daily Streaks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Maintain your daily transformation streak. Miss a day, and your stakeholder attendance and certification eligibility drop.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">SaaS App Workspace</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Work inside hyper-realistic clones of Outlook, Slack, Teams, Notion, and Linear without leaving your browser window.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Proactive AI Director</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              An AI executive mentor monitors your email speed, document completeness, and stakeholder trust to provide real-time guidance.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-white/10 py-12 px-6 bg-slate-950/80 text-xs text-slate-500 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">BQ</div>
            <span className="text-slate-300 font-medium">Brained Quest © 2026</span>
          </div>
          <div className="flex space-x-6 text-slate-400">
            <span>Enterprise Terms</span>
            <span>Privacy Shield</span>
            <span>Security Certification</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
