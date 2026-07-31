import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, MessageSquare, Mail, ShieldAlert, X, PhoneCall } from 'lucide-react';
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
            className={`p-4 rounded-2xl glass-panel border shadow-2xl backdrop-blur-2xl pointer-events-auto relative ${
              notif.isCall
                ? 'border-purple-500/50 bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 ring-2 ring-purple-500/30'
                : notif.app === 'Security'
                ? 'border-red-500/40 bg-slate-950/90'
                : 'border-white/15 bg-slate-950/90'
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
                onClick={() => onDismiss(notif.id)}
                className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Notification Body */}
            {notif.subtitle && (
              <h4 className="text-xs font-semibold text-purple-300 mb-0.5">{notif.subtitle}</h4>
            )}
            <p className="text-xs text-slate-300 leading-snug mb-3">{notif.body}</p>

            {/* Action Buttons */}
            {notif.isCall ? (
              <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
                <button
                  onClick={() => onAction(notif)}
                  className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center space-x-1.5 cursor-pointer animate-bounce"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Accept Meeting Call</span>
                </button>
                <button
                  onClick={() => onDismiss(notif.id)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-semibold"
                >
                  Decline
                </button>
              </div>
            ) : (
              notif.actionText && (
                <button
                  onClick={() => onAction(notif)}
                  className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center space-x-1"
                >
                  <span>{notif.actionText} →</span>
                </button>
              )
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
