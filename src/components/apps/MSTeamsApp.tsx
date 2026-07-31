import React, { useState, useEffect } from 'react';
import { Video, Mic, MicOff, PhoneOff, CheckCircle2 } from 'lucide-react';
import { STAKEHOLDERS } from '../../data/simulationData';

export const MSTeamsApp: React.FC = () => {
  const [meetingState, setMeetingState] = useState<'lobby' | 'in_call' | 'ended'>('in_call');
  const [speechIndex, setSpeechIndex] = useState(0);
  const [isMicOn, setIsMicOn] = useState(true);

  const cto = STAKEHOLDERS[0]; // Marcus Boss

  const speechBubbles = [
    "Good morning, Alex. Welcome to Apex Global Enterprise.",
    "We have a major corporate mandate. Six weeks to deploy a zero-trust HR Portal.",
    "The board is watching us closely. Alignment with CISO Knox and CHRO Marshal is critical.",
    "I trust you to lead this digital transformation. Good luck!"
  ];

  useEffect(() => {
    if (meetingState === 'in_call') {
      const timer = setInterval(() => {
        setSpeechIndex((prev) => (prev < speechBubbles.length - 1 ? prev + 1 : prev));
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [meetingState]);

  return (
    <div className="flex-1 flex flex-col bg-slate-950/90 text-white font-sans text-xs overflow-hidden">
      {/* Teams Top Toolbar */}
      <div className="h-10 bg-[#3F4499] px-4 flex items-center justify-between font-semibold select-none border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Video className="w-4 h-4 text-white" />
          <span>Microsoft Teams — Project Titan Kickoff</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-white/20 text-[10px] font-mono">00:04:18 Live</span>
      </div>

      {meetingState === 'in_call' ? (
        <div className="flex-1 flex flex-col justify-between p-6 bg-slate-950/80">
          {/* Main Speaker Video Screen */}
          <div className="relative w-full max-w-3xl h-72 mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-slate-900 flex items-center justify-center">
            <img
              src={cto.avatar}
              alt={cto.name}
              className="w-full h-full object-cover filter contrast-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30" />

            {/* Active Speaker Name Tag */}
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-white text-xs">{cto.name} (CTO)</span>
            </div>

            {/* Subtitles Overlay */}
            <div className="absolute top-6 px-6 py-4 bg-[#3F4499]/90 backdrop-blur-md rounded-2xl border border-white/20 text-white max-w-md shadow-2xl text-center">
              <p className="text-sm font-bold tracking-wide">
                "{speechBubbles[speechIndex]}"
              </p>
            </div>
          </div>

          {/* Meeting Control Bar */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4 max-w-3xl mx-auto w-full">
            <div className="flex items-center space-x-3 text-slate-400">
              <button 
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                  isMicOn ? 'bg-slate-800 border-white/10 text-emerald-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>
              <span className="text-[10px]">{isMicOn ? 'Mic On' : 'Muted'}</span>
            </div>

            <div className="flex items-center space-x-3">
              {speechIndex === speechBubbles.length - 1 && (
                <button
                  onClick={() => setMeetingState('ended')}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 flex items-center space-x-1.5 cursor-pointer animate-bounce"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Accept Mandate & Return to Workstation</span>
                </button>
              )}
              <button
                onClick={() => setMeetingState('ended')}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Leave Meeting</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl border border-emerald-500/40">
            ✓
          </div>
          <h2 className="text-xl font-bold text-white">Teams Meeting Concluded</h2>
          <p className="text-xs text-slate-400 max-w-sm">
            You have received the executive mandate. Open Apple Mail, Slack, or Apple Notes to start executing.
          </p>
        </div>
      )}
    </div>
  );
};
