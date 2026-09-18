import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Plus,
  Check,
  HardDriveDownload,
  Wifi,
  WifiOff,
  Sparkles,
  Layers,
  Settings2
} from 'lucide-react';
import {
  loadUserProfiles,
  saveUserProfiles,
  getActiveProfileId,
  setActiveProfileId,
  createUserProfile,
  loadOfflineModeState,
  setOfflineModeState,
  loadOfflineVideos,
  loadAllVideoProfiles
} from '../../utils/youtubeProfilesAndOffline';

export const UserProfileManagerModal = ({
  isOpen,
  onClose,
  onProfileChanged
}) => {
  const [profiles, setProfiles] = useState([]);
  const [activeProfileId, setActiveId] = useState('default');
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🎬');
  const [newColor, setNewColor] = useState('amber');
  const [offlineCount, setOfflineCount] = useState(0);
  const [taggedCount, setTaggedCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const userProfiles = loadUserProfiles();
      setProfiles(userProfiles);
      setActiveId(getActiveProfileId());
      setIsOfflineMode(loadOfflineModeState());
      setOfflineCount(loadOfflineVideos().length);
      setTaggedCount(Object.keys(loadAllVideoProfiles()).length);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectProfile = (id) => {
    setActiveId(id);
    setActiveProfileId(id);
    onProfileChanged?.(id);
    onClose();
  };

  const handleToggleOfflineMode = () => {
    const next = !isOfflineMode;
    setIsOfflineMode(next);
    setOfflineModeState(next);
  };

  const handleCreateProfile = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = createUserProfile(newName.trim(), newEmoji, newColor);
    setProfiles(loadUserProfiles());
    setActiveId(created.id);
    setActiveProfileId(created.id);
    setShowAddForm(false);
    setNewName('');
    onProfileChanged?.(created.id);
  };

  const EMOJI_OPTIONS = ['👤', '🎬', '🎧', '🧪', '🚀', '🎮', '🍿', '💡', '📚', '🌟'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Viewer Profiles & Offline</h3>
              <p className="text-[11px] text-zinc-400 leading-tight">Switch profiles and manage offline capabilities</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {/* Offline Mode Switch Card */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${isOfflineMode ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                {isOfflineMode ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Offline Mode</span>
                  {isOfflineMode && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-zinc-400">
                  {isOfflineMode
                    ? `Browsing ${offlineCount} cached offline videos with zero network usage.`
                    : `${offlineCount} videos cached for offline watching.`}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleOfflineMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                isOfflineMode
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                  : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-300 border border-zinc-700'
              }`}
            >
              {isOfflineMode ? 'Turn Online' : 'Enable Offline'}
            </button>
          </div>

          {/* User Profiles Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Active Profiles ({profiles.length})
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddForm ? 'Cancel' : 'New Profile'}</span>
              </button>
            </div>

            {/* Profile List */}
            <div className="space-y-2">
              {profiles.map((p) => {
                const isActive = activeProfileId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProfile(p.id)}
                    className={`w-full p-3 rounded-xl border flex items-center justify-between transition cursor-pointer text-left ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/50 text-white shadow-xs'
                        : 'bg-zinc-950/70 border-zinc-800 hover:bg-zinc-800/80 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{p.avatarEmoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {isActive && (
                            <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500 text-zinc-950 font-black">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-zinc-400">{p.description}</div>
                      </div>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Add Profile Form */}
            {showAddForm && (
              <form onSubmit={handleCreateProfile} className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-750 space-y-3 mt-2 animate-in fade-in">
                <div className="text-xs font-bold text-white">Create New Viewer Profile</div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                    Profile Name
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Night Shift, Kids Lounge..."
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-1">
                    Choose Avatar Icon
                  </label>
                  <div className="flex gap-1.5 flex-wrap">
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewEmoji(emoji)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition cursor-pointer ${
                          newEmoji === emoji
                            ? 'bg-amber-500/30 border border-amber-400'
                            : 'bg-zinc-900 border border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-sm transition cursor-pointer"
                >
                  Create & Activate Profile
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between text-[11px] text-zinc-500">
          <span>{taggedCount} custom tagged videos</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
