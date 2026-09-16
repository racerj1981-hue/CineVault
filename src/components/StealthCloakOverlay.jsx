import React, { useEffect } from 'react';
import { Menu, Plus, Grid, MoreVertical, Folder, ArrowRight, Shield } from 'lucide-react';

export const StealthCloakOverlay = ({ isOpen, onClose, preset = 'classroom' }) => {
  // Listen for Escape or hotkey to uncloak
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="stealth-cloak-overlay"
      className="fixed inset-0 z-[9999] bg-[#ffffff] text-[#3c4043] font-sans overflow-y-auto select-none"
      style={{ fontFamily: 'Roboto, Arial, sans-serif' }}
    >
      {/* Top Google Classroom Navbar */}
      <header className="sticky top-0 bg-white border-b border-[#dadce0] px-4 h-16 flex items-center justify-between z-10 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            title="Toggle main menu"
            className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full cursor-pointer transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <rect x="2" y="3" width="20" height="15" rx="2" fill="#137333" />
              <rect x="4" y="5" width="16" height="11" rx="1" fill="#0f9d58" />
              <circle cx="12" cy="10" r="2.5" fill="#f4b400" />
              <path d="M8 15c0-2.2 1.8-3 4-3s4 .8 4 3" fill="#f4b400" />
            </svg>
            <span className="text-xl font-normal text-[#5f6368] tracking-tight">Google Classroom</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center text-xs text-[#5f6368] bg-[#f8f9fa] border border-[#dadce0] px-2.5 py-1 rounded-full">
            <Shield className="w-3.5 h-3.5 text-[#137333] mr-1" />
            <span>Stealth Cloak Active (Press Esc to exit)</span>
          </div>

          <button
            onClick={onClose}
            title="Join or create a class"
            className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            title="Google apps"
            className="p-2 text-[#5f6368] hover:bg-[#f1f3f4] rounded-full cursor-pointer"
          >
            <Grid className="w-5 h-5" />
          </button>
          {/* Avatar button serves as stealth exit */}
          <button
            onClick={onClose}
            title="Exit Stealth Disguise"
            className="w-8 h-8 rounded-full bg-[#1a73e8] text-white flex items-center justify-center text-sm font-semibold hover:ring-2 hover:ring-[#1a73e8]/40 transition cursor-pointer"
          >
            S
          </button>
        </div>
      </header>

      {/* Classroom Content Grid */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#dadce0]">
          <h1 className="text-lg font-medium text-[#3c4043]">Enrolled Classes</h1>
          <button
            onClick={onClose}
            className="text-xs text-[#1a73e8] hover:underline font-medium cursor-pointer"
          >
            To-do list
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Class Card 1 */}
          <div className="border border-[#dadce0] rounded-lg overflow-hidden bg-white shadow-xs hover:shadow-md transition">
            <div className="bg-[#137333] text-white p-4 h-32 flex flex-col justify-between relative">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-medium leading-tight">AP Calculus BC</h2>
                  <p className="text-xs text-white/80 mt-1">Period 2 • Mr. Henderson</p>
                </div>
                <MoreVertical className="w-5 h-5 text-white/80" />
              </div>
            </div>
            <div className="p-4 min-h-[110px] flex flex-col justify-between text-xs">
              <div>
                <p className="font-semibold text-[#202124] mb-1">Due Today, 11:59 PM</p>
                <p className="text-[#5f6368]">Unit 4 Problem Set: Derivatives & Integrals</p>
              </div>
              <div className="pt-3 border-t border-[#f1f3f4] flex justify-end gap-3 text-[#5f6368]">
                <Folder className="w-4 h-4" />
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Class Card 2 */}
          <div className="border border-[#dadce0] rounded-lg overflow-hidden bg-white shadow-xs hover:shadow-md transition">
            <div className="bg-[#1a73e8] text-white p-4 h-32 flex flex-col justify-between relative">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-medium leading-tight">AP US History</h2>
                  <p className="text-xs text-white/80 mt-1">Period 4 • Ms. Campbell</p>
                </div>
                <MoreVertical className="w-5 h-5 text-white/80" />
              </div>
            </div>
            <div className="p-4 min-h-[110px] flex flex-col justify-between text-xs">
              <div>
                <p className="font-semibold text-[#202124] mb-1">Due Tomorrow</p>
                <p className="text-[#5f6368]">DBQ Outline: Industrial Revolution Impacts</p>
              </div>
              <div className="pt-3 border-t border-[#f1f3f4] flex justify-end gap-3 text-[#5f6368]">
                <Folder className="w-4 h-4" />
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Class Card 3 */}
          <div className="border border-[#dadce0] rounded-lg overflow-hidden bg-white shadow-xs hover:shadow-md transition">
            <div className="bg-[#b06000] text-white p-4 h-32 flex flex-col justify-between relative">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-medium leading-tight">English Literature 11</h2>
                  <p className="text-xs text-white/80 mt-1">Period 6 • Dr. Martinez</p>
                </div>
                <MoreVertical className="w-5 h-5 text-white/80" />
              </div>
            </div>
            <div className="p-4 min-h-[110px] flex flex-col justify-between text-xs">
              <div>
                <p className="font-semibold text-[#202124] mb-1">Due Friday</p>
                <p className="text-[#5f6368]">Analytical Essay Draft: Act III Discussion</p>
              </div>
              <div className="pt-3 border-t border-[#f1f3f4] flex justify-end gap-3 text-[#5f6368]">
                <Folder className="w-4 h-4" />
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Return Button */}
        <div className="mt-12 text-center">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1a73e8] text-white text-sm font-medium hover:bg-[#1557b0] shadow-sm transition cursor-pointer"
          >
            <span>Exit Stealth Cloak & Return to Movies</span>
          </button>
        </div>
      </main>
    </div>
  );
};
