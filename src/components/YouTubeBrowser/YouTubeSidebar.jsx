import React from 'react';
import {
  Home,
  TrendingUp,
  Compass,
  Music,
  Gamepad2,
  GraduationCap,
  Film,
  History,
  ListMusic,
  Clock,
  Sparkles,
  HelpCircle,
  Activity,
  ShieldCheck,
  ChevronRight,
  HardDriveDownload,
  User,
  WifiOff,
  Wifi
} from 'lucide-react';

export const YouTubeSidebar = ({
  activeSection,
  onSelectSection,
  isCollapsed,
  onToggleCollapse,
  historyCount = 0,
  queueCount = 0,
  offlineCount = 0,
  profilesCount = 0,
  isOfflineMode = false,
  onToggleOfflineMode,
  onOpenDiagnostics,
  onOpenShortcuts
}) => {
  const mainNav = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'music', label: 'Music & Lofi', icon: Music },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'movies', label: 'Movies & Sci-Fi', icon: Film },
    { id: 'guaranteed', label: '⭐ Guaranteed', icon: Sparkles }
  ];

  const libraryNav = [
    { id: 'offline', label: 'Offline Vault', icon: HardDriveDownload, badge: offlineCount },
    { id: 'profiles', label: 'Video Profiles', icon: User, badge: profilesCount },
    { id: 'history', label: 'History', icon: History, badge: historyCount },
    { id: 'queue', label: 'Up Next Queue', icon: ListMusic, badge: queueCount }
  ];

  return (
    <aside
      className={`shrink-0 border-r border-zinc-800/80 bg-zinc-950 flex flex-col justify-between transition-all duration-300 select-none ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className="py-3 px-2 space-y-4 overflow-y-auto no-scrollbar">
        {/* Main Navigation */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Feeds
            </div>
          )}
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                title={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/90'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        <div className="h-px bg-zinc-850 mx-2" />

        {/* Offline Mode Switch in Sidebar */}
        {!isCollapsed && onToggleOfflineMode && (
          <div className="px-1">
            <button
              type="button"
              onClick={onToggleOfflineMode}
              className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition cursor-pointer text-left ${
                isOfflineMode
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-xs'
                  : 'bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-850'
              }`}
            >
              <div className="flex items-center gap-2">
                {isOfflineMode ? (
                  <WifiOff className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Wifi className="w-3.5 h-3.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[11px] font-bold leading-tight">
                    {isOfflineMode ? 'Offline Mode ON' : 'Offline Mode'}
                  </div>
                  <div className="text-[9px] text-zinc-500 truncate leading-tight">
                    {isOfflineMode ? 'Cached vault active' : 'Click to go offline'}
                  </div>
                </div>
              </div>
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  isOfflineMode ? 'bg-emerald-400 shadow-xs shadow-emerald-400 animate-pulse' : 'bg-zinc-600'
                }`}
              />
            </button>
          </div>
        )}

        {/* Library Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              Library
            </div>
          )}
          {libraryNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                title={item.label}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-zinc-950 font-bold shadow-sm'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900/90'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-zinc-950' : 'text-zinc-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>
                {!isCollapsed && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-zinc-950 text-amber-300' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>


      {/* Bottom Tools & Status */}
      <div className="p-2 border-t border-zinc-850 space-y-1 bg-zinc-950/80">
        {!isCollapsed && (
          <div className="px-2 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 mb-1 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Bypass Active</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        )}

        <button
          onClick={onOpenDiagnostics}
          title="Run diagnostics on YouTube proxy nodes"
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-amber-400 hover:bg-zinc-900 transition cursor-pointer ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <Activity className="w-3.5 h-3.5 shrink-0 text-amber-400" />
          {!isCollapsed && <span>Ping Nodes</span>}
        </button>

        <button
          onClick={onOpenShortcuts}
          title="Keyboard shortcuts"
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-zinc-900 transition cursor-pointer ${
            isCollapsed ? 'justify-center px-2' : ''
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5 shrink-0" />
          {!isCollapsed && <span>Shortcuts</span>}
        </button>
      </div>
    </aside>
  );
};
