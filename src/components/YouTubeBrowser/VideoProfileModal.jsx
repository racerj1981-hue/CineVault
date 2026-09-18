import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Tag,
  CheckCircle2,
  HardDriveDownload,
  Trash2,
  Sparkles,
  BookOpen,
  FolderPlus,
  Clock,
  Check,
  ShieldCheck,
  SlidersHorizontal
} from 'lucide-react';
import {
  loadUserProfiles,
  getVideoProfile,
  updateVideoProfile,
  isVideoSavedOffline,
  toggleSaveVideoOffline
} from '../../utils/youtubeProfilesAndOffline';
import { getChannelAvatar, getVideoThumbnail } from '../../data/youtubeData';

export const VideoProfileModal = ({
  isOpen,
  onClose,
  video,
  onUpdate
}) => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState('default');
  const [status, setStatus] = useState('none');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [customTags, setCustomTags] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (isOpen && video) {
      const userProfiles = loadUserProfiles();
      setProfiles(userProfiles);

      const profileData = getVideoProfile(video.id) || {};
      setSelectedProfileId(profileData.profileId || 'default');
      setStatus(profileData.status || 'none');
      setNotes(profileData.notes || '');
      setCustomTags(profileData.customTags || []);
      setIsOffline(isVideoSavedOffline(video.id));
      setSavedNotice(false);
    }
  }, [isOpen, video]);

  if (!isOpen || !video) return null;

  const handleAddTag = (e) => {
    e.preventDefault();
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !customTags.includes(trimmed)) {
      setCustomTags([...customTags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setCustomTags(customTags.filter((t) => t !== tagToRemove));
  };

  const handleToggleOffline = () => {
    const newState = toggleSaveVideoOffline(video);
    setIsOffline(newState);
  };

  const handleSave = () => {
    updateVideoProfile(video.id, {
      profileId: selectedProfileId,
      status,
      notes,
      customTags
    });

    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onUpdate?.();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white leading-tight">Video Profile & Metadata</h3>
              <p className="text-[11px] text-zinc-400 leading-tight">Manage user profiles, status, tags, and offline caching</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-300">
          {/* Video Overview Snippet */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-950/80 border border-zinc-850">
            <img
              src={getVideoThumbnail(video)}
              alt={video.title}
              className="w-20 h-12 rounded-lg object-cover shrink-0 border border-zinc-800"
            />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white text-xs truncate leading-snug">{video.title}</div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-400">
                <img
                  src={getChannelAvatar(video.channel, video)}
                  alt={video.channel}
                  className="w-3.5 h-3.5 rounded-full object-cover"
                />
                <span className="font-semibold text-zinc-300">{video.channel}</span>
                <span>•</span>
                <span>{video.views}</span>
              </div>
            </div>
          </div>

          {/* 1. Assign to User Profile */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Assign to Viewer Profile:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {profiles.map((p) => {
                const isSelected = selectedProfileId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProfileId(p.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-bold'
                        : 'bg-zinc-950/60 border-zinc-800 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <span className="text-base">{p.avatarEmoji}</span>
                    <div className="truncate">
                      <div className="text-xs truncate">{p.name}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{p.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Video Watch Status */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Watch Status / Shelf:
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'must_watch', label: 'Must Watch', emoji: '⭐' },
                { id: 'watching', label: 'Watching', emoji: '▶️' },
                { id: 'completed', label: 'Finished', emoji: '✅' },
                { id: 'none', label: 'Default', emoji: '📁' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id)}
                  className={`py-1.5 px-2 rounded-lg border text-center text-xs font-semibold transition cursor-pointer ${
                    status === st.id
                      ? 'bg-amber-500 text-zinc-950 border-amber-400 font-bold shadow-xs'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <span className="mr-1">{st.emoji}</span>
                  <span>{st.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Offline Mode Download Caching */}
          <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border ${isOffline ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-zinc-800 border-zinc-700 text-zinc-400'}`}>
                <HardDriveDownload className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-white text-xs flex items-center gap-1.5">
                  <span>Offline Video Storage</span>
                  {isOffline && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                      Saved Offline ✓
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">
                  {isOffline
                    ? 'Cached in browser storage for 100% offline playback.'
                    : 'Download metadata and stream cache to watch when offline.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleOffline}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                isOffline
                  ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
              }`}
            >
              {isOffline ? 'Remove Offline' : 'Save Offline'}
            </button>
          </div>

          {/* 4. Custom Tags */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Custom Video Tags:
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {customTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs"
                >
                  <span>#{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 cursor-pointer ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
              {customTags.length === 0 && (
                <span className="text-[11px] text-zinc-500 italic">No custom tags added yet.</span>
              )}
            </div>

            <form onSubmit={handleAddTag} className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tag (e.g. Physics, Chill, ExamPrep)..."
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-white font-semibold text-xs border border-zinc-700 transition cursor-pointer"
              >
                Add
              </button>
            </form>
          </div>

          {/* 5. Custom Notes */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Personal Video Notes:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your personal notes or timestamps for this video..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            {savedNotice ? '✓ Changes saved' : 'Auto-saves to browser storage'}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs shadow-sm transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
