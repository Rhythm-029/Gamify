import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, X, PhoneMissed, Video, MessageSquare, Mail, ShieldAlert, Code, 
  ChevronRight, CheckCheck, AlertTriangle
} from 'lucide-react';
import type { OSNotification } from '../../data/brainedOSData';

interface OSNotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  historyNotifications: OSNotification[];
  onOpenAppFromNotif: (notif: OSNotification) => void;
  onClearAll: () => void;
  onMarkAllRead: () => void;
}

export const OSNotificationCenterDrawer: React.FC<OSNotificationCenterDrawerProps> = ({
  isOpen,
  onClose,
  historyNotifications,
  onOpenAppFromNotif,
  onClearAll,
  onMarkAllRead,
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'missed'>('all');

  const unreadCount = historyNotifications.filter((n) => !n.read).length;
  const missedCount = historyNotifications.filter((n) => n.missed).length;

  const filtered = historyNotifications.filter((n) => {
    if (filterTab === 'missed') return n.missed;
    return true;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[80] pointer-events-auto"
          />

          {/* Right Sliding Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-11 right-0 bottom-0 w-96 max-w-full bg-[#0d101d]/95 border-l border-white/15 text-white z-[90] shadow-2xl backdrop-blur-2xl flex flex-col font-sans select-none pointer-events-auto"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#121526]/80">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center relative">
                  <Bell className="w-4 h-4 text-pink-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 rounded-full text-[9px] font-extrabold flex items-center justify-center text-white border border-slate-900">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white tracking-tight">Notification Center</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {historyNotifications.length} logged • {unreadCount} unread
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Mark all as read"
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="p-2 border-b border-white/10 flex space-x-1 shrink-0 bg-[#0a0c16]">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  filterTab === 'all'
                    ? 'bg-pink-600/30 text-pink-300 border border-pink-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>All Logged ({historyNotifications.length})</span>
              </button>

              <button
                onClick={() => setFilterTab('missed')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5 ${
                  filterTab === 'missed'
                    ? 'bg-rose-600/30 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <PhoneMissed className="w-3.5 h-3.5 text-rose-400" />
                <span>Missed Calls ({missedCount})</span>
              </button>
            </div>

            {/* Notifications History List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
              {filtered.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-500">
                  <Bell className="w-8 h-8 text-slate-600 opacity-60" />
                  <p className="text-xs font-semibold text-slate-400">
                    {filterTab === 'missed' ? 'No missed calls recorded.' : 'No notification history yet.'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    All incoming alerts, calls, and developer IDE tasks will appear here.
                  </p>
                </div>
              ) : (
                filtered.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onOpenAppFromNotif(item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group overflow-hidden ${
                      item.missed
                        ? 'bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-950 border-rose-500/40 hover:border-rose-400 shadow-md ring-1 ring-rose-500/20'
                        : !item.read
                        ? 'bg-slate-900/90 border-pink-500/30 hover:border-pink-500/60 ring-1 ring-pink-500/20'
                        : 'bg-slate-900/40 border-white/10 hover:border-white/20 opacity-85 hover:opacity-100'
                    }`}
                  >
                    {/* App Header Tag & Status */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center text-white text-[10px] ${
                            item.missed
                              ? 'bg-rose-600'
                              : item.app === 'Teams'
                              ? 'bg-[#464EB8]'
                              : item.app === 'Slack'
                              ? 'bg-purple-600'
                              : item.app === 'Mail'
                              ? 'bg-sky-500'
                              : item.app === 'Calendar'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                          }`}
                        >
                          {item.missed ? (
                            <PhoneMissed className="w-3 h-3" />
                          ) : item.app === 'Teams' ? (
                            <Video className="w-3 h-3" />
                          ) : item.app === 'Slack' ? (
                            <MessageSquare className="w-3 h-3" />
                          ) : item.app === 'Mail' ? (
                            <Mail className="w-3 h-3" />
                          ) : item.app === 'Security' ? (
                            <ShieldAlert className="w-3 h-3" />
                          ) : (
                            <Code className="w-3 h-3" />
                          )}
                        </div>
                        <span className="font-bold text-xs text-white">{item.title}</span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] text-slate-500 font-mono">{item.timestamp}</span>
                        {!item.read && (
                          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shrink-0" />
                        )}
                      </div>
                    </div>

                    {/* Subtitle & Body */}
                    {item.subtitle && (
                      <div className={`text-[11px] font-semibold mb-0.5 ${item.missed ? 'text-rose-400' : 'text-slate-300'}`}>
                        {item.subtitle}
                      </div>
                    )}
                    <p className="text-xs text-slate-300 leading-snug">{item.body}</p>

                    {/* Missed Call Tag Penalty Indicator */}
                    {item.missed && (
                      <div className="mt-2.5 pt-2 border-t border-rose-500/20 flex items-center justify-between text-[11px] font-bold text-rose-400">
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Missed Call (-10 Trust Score)</span>
                        </div>
                        <span className="text-xs text-rose-300 underline group-hover:text-rose-200">View Details</span>
                      </div>
                    )}

                    {/* Tap to open tag */}
                    {!item.missed && (
                      <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] text-sky-400 font-mono">
                        <span>Click to open application</span>
                        <ChevronRight className="w-3 h-3 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Drawer Footer */}
            {historyNotifications.length > 0 && (
              <div className="p-3 border-t border-white/10 bg-[#0f111d] flex items-center justify-between shrink-0">
                <button
                  onClick={onClearAll}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Clear History
                </button>

                <span className="text-[10px] text-slate-500 font-mono">Brained OS v3.2</span>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
