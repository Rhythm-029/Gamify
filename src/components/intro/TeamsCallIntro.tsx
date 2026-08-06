import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneCall, PhoneOff, Mic, Users, CheckCircle2 } from 'lucide-react';
import { STAKEHOLDERS } from '../../data/simulationData';

interface TeamsCallIntroProps {
  onJoinMeetingComplete: () => void;
}

export const TeamsCallIntro: React.FC<TeamsCallIntroProps> = ({ onJoinMeetingComplete }) => {
  const [callState, setCallState] = useState<'ringing' | 'connected' | 'ending' | 'loading'>('ringing');
  const [speechIndex, setSpeechIndex] = useState(0);

  // Aarav Kapoor — Mentor & first point of contact
  const aarav = STAKEHOLDERS.find(s => s.id === 'aarav') ?? {
    id: 'aarav',
    name: 'Aarav Kapoor',
    role: 'Senior Digital Transformation Consultant (Mentor)',
    avatar: '/character/AaravDP.png',
  };

  const speechBubbles = [
    "Hey! Welcome to Brained Consulting.",
    "I'm Aarav — I'll be your mentor.",
    "We have a live mandate from Titan Manufacturing.",
    "Six weeks. 12,000 employees. One portal.",
    "Let me introduce you to the team."
  ];

  useEffect(() => {
    if (callState === 'connected') {
      const interval = setInterval(() => {
        setSpeechIndex((prev) => {
          if (prev < speechBubbles.length - 1) {
            return prev + 1;
          } else {
            clearInterval(interval);
            return prev;
          }
        });
      }, 2500);

      return () => clearInterval(interval);
    }
  }, [callState]);

  const handleAcceptCall = () => {
    setCallState('connected');
  };

  const handleEndMeeting = () => {
    setCallState('ending');
    setTimeout(() => {
      setCallState('loading');
      setTimeout(() => {
        onJoinMeetingComplete();
      }, 2000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-[#0B1020] text-white z-50 flex items-center justify-center font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {callState === 'ringing' && (
          <motion.div
            key="ringing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="w-full max-w-md glass-panel rounded-3xl p-8 border border-white/10 text-center flex flex-col items-center shadow-2xl relative"
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-pulse-ring scale-150" />
              <div className="absolute inset-0 rounded-full bg-purple-500/20 animate-ping scale-125" />
              <img
                src={aarav.avatar}
                    alt={aarav.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 relative z-10 shadow-xl"
              />
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>Incoming Microsoft Teams Video Call</span>
            </div>

            <h2 className="text-2xl font-bold text-white mb-1">{aarav.name}</h2>
            <p className="text-xs text-slate-400 mb-8">{aarav.role} • Brained Consulting</p>

            <div className="flex items-center space-x-6">
              <button
                onClick={handleAcceptCall}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 transition-transform hover:scale-110 cursor-pointer"
                title="Accept Call"
              >
                <PhoneCall className="w-7 h-7" />
              </button>
            </div>
          </motion.div>
        )}

        {callState === 'connected' && (
          <motion.div
            key="connected"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-5xl h-[80vh] glass-panel rounded-3xl border border-white/10 flex flex-col overflow-hidden shadow-2xl"
          >
            <div className="h-12 bg-slate-900/90 border-b border-white/10 px-6 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-semibold text-white">Executive Transformation Kickoff — Live</span>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[10px]">00:04:12</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>2 Attendees</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 relative flex flex-col items-center justify-center bg-slate-950/60">
              <div className="relative w-full max-w-3xl h-96 rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 flex items-center justify-center">
                <img
                  src={aarav.avatar}
                    alt={aarav.name}
                  className="w-full h-full object-cover filter contrast-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />

                <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-semibold text-white">{aarav.name} ({aarav.role})</span>
                </div>

                <div className="absolute top-8 px-6 py-4 bg-blue-600/90 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-md shadow-2xl text-center">
                  <motion.p
                    key={speechIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-bold tracking-wide"
                  >
                    "{speechBubbles[speechIndex]}"
                  </motion.p>
                </div>
              </div>

              <div className="mt-4 flex items-center space-x-2">
                {speechBubbles.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      idx <= speechIndex ? 'w-8 bg-blue-500' : 'w-2 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="h-16 bg-slate-900/90 border-t border-white/10 px-6 flex items-center justify-between">
              <div className="flex items-center space-x-3 text-xs text-slate-400">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>Microphone Active</span>
              </div>

              <div className="flex items-center space-x-4">
                {speechIndex === speechBubbles.length - 1 ? (
                  <button
                    onClick={handleEndMeeting}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-lg shadow-blue-500/30 flex items-center space-x-2 animate-bounce cursor-pointer"
                  >
                    <span>Accept Mandate & Open OS</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setSpeechIndex((prev) => Math.min(prev + 1, speechBubbles.length - 1))}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Next Line →
                  </button>
                )}

                <button
                  onClick={handleEndMeeting}
                  className="p-3 rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 transition-colors cursor-pointer"
                  title="Leave Meeting"
                >
                  <PhoneOff className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {(callState === 'ending' || callState === 'loading') && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mx-auto" />
            <h3 className="text-xl font-bold text-white tracking-wide">Initializing Brained Quest OS...</h3>
            <p className="text-xs text-slate-400 font-mono">Loading Slack channels, Outlook inbox & RAID logs</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
