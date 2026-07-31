import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User, Briefcase, Building, Sparkles, Check } from 'lucide-react';
import { INITIAL_PLAYER_STATE } from '../../data/simulationData';

interface OnboardingFlowProps {
  onComplete: (userConfig: Partial<typeof INITIAL_PLAYER_STATE>) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: 'Alex Vance',
    role: 'Lead Digital Transformer',
    industry: 'FinTech & Cloud Enterprise',
    experience: 'Senior (7+ years)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    theme: 'Dark Operating System',
  });

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250',
  ];

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      onComplete({
        name: formData.name,
        role: formData.role,
        industry: formData.industry,
        avatar: formData.avatar,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1020] text-white flex items-center justify-center p-6 selection:bg-blue-500 selection:text-white">
      {/* Background Lighting */}
      <div className="absolute w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg glass-panel rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10"
      >
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs">
              0{step}
            </span>
            <span className="text-sm font-semibold text-slate-200">
              {step === 1 && 'Profile Initialization'}
              {step === 2 && 'Identity & Preferences'}
              {step === 3 && 'Mandate Confirmation'}
            </span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-6 h-1.5 rounded-full transition-colors ${
                  s === step ? 'bg-blue-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-xl font-bold text-white">Enter Your Identity</h2>
            <p className="text-xs text-slate-400">Specify your designation for the Fortune 500 steering committee.</p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Designation</label>
              <div className="relative">
                <Briefcase className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Industry Vertical</label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className="w-full bg-slate-900/80 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: AVATAR SELECTION */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h2 className="text-xl font-bold text-white">Select Corporate Avatar</h2>
            <p className="text-xs text-slate-400">Choose your executive avatar for Slack, Outlook, and Zoom meetings.</p>

            <div className="grid grid-cols-4 gap-4 py-2">
              {avatars.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setFormData({ ...formData, avatar: imgUrl })}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all p-1 ${
                    formData.avatar === imgUrl ? 'border-blue-500 shadow-lg shadow-blue-500/30' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={imgUrl} alt="Avatar" className="w-full h-16 object-cover rounded-xl" />
                  {formData.avatar === imgUrl && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">OS Visual Theme</label>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10 flex items-center justify-between text-xs">
                <span>{formData.theme}</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px]">Enterprise Dark</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: WELCOME TO BRAINED QUEST */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/30">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>

            <h2 className="text-2xl font-extrabold text-white">Welcome to Brained Quest</h2>
            <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Your credentials for <span className="text-blue-400 font-semibold">{formData.name}</span> have been verified. An urgent Microsoft Teams call is coming in from the CTO...
            </p>
          </motion.div>
        )}

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={handleNext}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center space-x-2"
          >
            <span>{step === 3 ? 'Accept Incoming Mandate' : 'Continue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
