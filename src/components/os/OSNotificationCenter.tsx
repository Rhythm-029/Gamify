import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, MessageSquare, Mail, ShieldAlert, X, PhoneCall, ChevronRight } from 'lucide-react';
import type { OSNotification } from '../../data/brainedOSData';

interface OSNotificationCenterProps {
  notifications: OSNotification[];
  onDismiss: (id: string) => void;
  onAction: (notif: OSNotification) => void;
}

export const OSNotificationCenter: React.FC<OSNotificationCenterProps> = ({
  notifications,
  onDismiss,
  onAction,
}) => {
  return (
    <div className="fixed top-12 right-4 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => onAction(notif)}
            className={`p-4 rounded-2xl glass-panel border shadow-2xl backdrop-blur-2xl pointer-events-auto relative cursor-pointer transition-all hover:scale-[1.02] hover:shadow-3xl active:scale-[0.98] ${
              notif.subtitle?.toLowerCase().includes('marcus') ? 'border-blue-500/40 bg-gradient-to-r from-slate-950 via-blue-950/15 to-slate-950 ring-1 ring-blue-500/25 hover:ring-blue-500/50' :
              notif.subtitle?.toLowerCase().includes('emma') ? 'border-emerald-500/40 bg-gradient-to-r from-slate-950 via-emerald-950/15 to-slate-950 ring-1 ring-emerald-500/25 hover:ring-emerald-500/50' :
              notif.subtitle?.toLowerCase().includes('daniel') ? 'border-orange-500/40 bg-gradient-to-r from-slate-950 via-orange-950/15 to-slate-950 ring-1 ring-orange-500/25 hover:ring-orange-500/50' :
              notif.subtitle?.toLowerCase().includes('aarav') ? 'border-yellow-500/40 bg-gradient-to-r from-slate-950 via-yellow-950/15 to-slate-950 ring-1 ring-yellow-500/25 hover:ring-yellow-500/50' :
              notif.isCall
                ? 'border-purple-500/50 bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 ring-2 ring-purple-500/30 hover:ring-purple-500/50'
                : 'border-white/15 bg-slate-950/90 hover:border-white/30'
            }`}
          >
            {/* Notification Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs ${
                  notif.app === 'Teams' ? 'bg-[#464EB8]' :
                  notif.app === 'Slack' ? 'bg-purple-600' :
                  notif.app === 'Mail' ? 'bg-sky-500' : 'bg-red-500'
                }`}>
                  {notif.app === 'Teams' && <Video className="w-3.5 h-3.5" />}
                  {notif.app === 'Slack' && <MessageSquare className="w-3.5 h-3.5" />}
                  {notif.app === 'Mail' && <Mail className="w-3.5 h-3.5" />}
                  {notif.app === 'Security' && <ShieldAlert className="w-3.5 h-3.5" />}
                </div>
                <span className="font-bold text-xs text-white truncate">{notif.title}</span>
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notification Body */}
            {notif.subtitle && (
              <h4 className={`text-xs font-semibold mb-0.5 ${
                notif.subtitle.toLowerCase().includes('marcus') ? 'text-blue-400' :
                notif.subtitle.toLowerCase().includes('emma') ? 'text-emerald-400' :
                notif.subtitle.toLowerCase().includes('daniel') ? 'text-orange-400' :
                notif.subtitle.toLowerCase().includes('aarav') ? 'text-yellow-400' :
                'text-purple-300'
              }`}>{notif.subtitle}</h4>
            )}
            <p className="text-xs text-slate-300 leading-snug mb-2">{notif.body}</p>

            {/* Action Area */}
            {notif.isCall ? (
              <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
                <button
                  onClick={(e) => { e.stopPropagation(); onAction(notif); }}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-1.5 cursor-pointer animate-bounce"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Accept Meeting Call</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold"
                >
                  Decline
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
                <span className="text-[10px] text-slate-500 font-mono">Tap to open</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
