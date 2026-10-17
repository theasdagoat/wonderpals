import React, { useState } from 'react';
import { KidProfile, ParentSettings } from '../types';
import { KidAvatarView } from './KidAvatarView';
import { playPopSound, playChimeSound, playSuccessFanfare } from '../utils/soundEffects';
import {
  ShieldCheck,
  Clock,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  Sliders,
  Check,
  Sparkles,
  AlertTriangle,
  Users,
  Moon,
  Volume2,
  X,
} from 'lucide-react';

interface ParentDashboardProps {
  currentKid: KidProfile;
  allKids: KidProfile[];
  settings: ParentSettings;
  onUpdateSettings: (newSettings: ParentSettings) => void;
  onSelectKid: (kidId: string) => void;
  onAddNewKid: (kid: KidProfile) => void;
  onClose: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  currentKid,
  allKids,
  settings,
  onUpdateSettings,
  onSelectKid,
  onAddNewKid,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [showMathFallback, setShowMathFallback] = useState(false);
  const [mathAnswer, setMathAnswer] = useState('');
  const [mathError, setMathError] = useState(false);

  // Settings form local state
  const [localSettings, setLocalSettings] = useState<ParentSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New kid modal state
  const [showAddKidModal, setShowAddKidModal] = useState(false);
  const [newKidName, setNewKidName] = useState('');
  const [newKidAge, setNewKidAge] = useState(7);

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === localSettings.pin) {
      playSuccessFanfare();
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      playPopSound();
      setPinError(true);
      setPinInput('');
    }
  };

  const handleMathVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (mathAnswer.trim() === '42') {
      // 14 * 3 = 42
      playSuccessFanfare();
      setIsAuthenticated(true);
      setShowMathFallback(false);
      setMathError(false);
    } else {
      setMathError(true);
    }
  };

  const handleSaveSettings = () => {
    playSuccessFanfare();
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateSibling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidName.trim()) return;

    playSuccessFanfare();
    const newSibling: KidProfile = {
      id: 'kid-' + Date.now(),
      username: newKidName.toLowerCase().replace(/\s+/g, '_'),
      displayName: newKidName.trim(),
      age: newKidAge,
      avatar: {
        skinColor: '#fbd38d',
        hairStyle: 'curls',
        hairColor: '#4a2c11',
        accessory: 'glasses',
        shirtColor: '#10b981',
        expression: 'happy',
        petBuddy: 'magicBunny',
      },
      kindnessPoints: 50,
      level: 1,
      superTitle: 'Kind Explorer ✨',
      unlockedBadges: ['first_draw'],
      friendsCount: 2,
      dailyTimeLimitMinutes: localSettings.dailyScreenLimitMinutes,
      minutesUsedToday: 0,
    };

    onAddNewKid(newSibling);
    setShowAddKidModal(false);
    setNewKidName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-4 border-emerald-400 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-200" />
            <div>
              <h2 className="text-lg font-bold font-heading">
                Parent Safety & Family Portal
              </h2>
              <p className="text-xs text-emerald-100">
                Manage screen time limits, safety filters, and sibling profiles
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Barrier if Not Authenticated */}
        {!isAuthenticated ? (
          <div className="p-8 text-center space-y-6 my-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-800 font-heading">
                Parent Verification Required
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Please enter your 4-digit Parent PIN to access safety settings. (Default: 1234)
              </p>
            </div>

            <form onSubmit={handlePinSubmit} className="max-w-xs mx-auto space-y-4">
              <input
                type="password"
                maxLength={4}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="• • • •"
                className="w-full text-center text-3xl font-mono tracking-widest py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none"
                autoFocus
              />

              {pinError && (
                <p className="text-xs font-bold text-rose-600 animate-shake">
                  Incorrect PIN! Default is 1234.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                Unlock Parent Portal
              </button>
            </form>

            <div className="pt-2">
              <button
                onClick={() => setShowMathFallback(!showMathFallback)}
                className="text-xs text-slate-400 hover:text-slate-600 underline font-medium"
              >
                Forgot PIN? Solve adult math check instead
              </button>

              {showMathFallback && (
                <form onSubmit={handleMathVerify} className="mt-3 p-3 bg-slate-50 rounded-xl border max-w-xs mx-auto space-y-2">
                  <p className="text-xs font-semibold text-slate-700">What is 14 × 3 ?</p>
                  <input
                    type="number"
                    value={mathAnswer}
                    onChange={(e) => setMathAnswer(e.target.value)}
                    placeholder="Answer"
                    className="w-full px-3 py-1.5 border rounded-lg text-center text-sm"
                  />
                  {mathError && <p className="text-[11px] text-rose-600">Incorrect! Try again.</p>}
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg"
                  >
                    Verify Adult
                  </button>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* Authenticated Dashboard View */
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Child Profile Switcher */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Family Children Profiles</span>
                </label>
                <button
                  onClick={() => setShowAddKidModal(true)}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  + Add Child Profile
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {allKids.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => {
                      playPopSound();
                      onSelectKid(k.id);
                    }}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      k.id === currentKid.id
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-300 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <KidAvatarView avatar={k.avatar} size="sm" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 truncate">{k.displayName}</p>
                      <p className="text-[11px] text-slate-500">Age {k.age} · Level {k.level}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Screen Time Controls */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Daily Screen Time Budget for {currentKid.displayName}
                  </h4>
                </div>
                <span className="font-mono text-sm font-bold text-emerald-700 tabular-nums">
                  {currentKid.minutesUsedToday}m / {localSettings.dailyScreenLimitMinutes}m today
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.min(100, (currentKid.minutesUsedToday / localSettings.dailyScreenLimitMinutes) * 100)}%`,
                  }}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Daily limit: {localSettings.dailyScreenLimitMinutes} minutes</span>
                  <span>15m - 120m</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={120}
                  step={15}
                  value={localSettings.dailyScreenLimitMinutes}
                  onChange={(e) =>
                    setLocalSettings((prev) => ({
                      ...prev,
                      dailyScreenLimitMinutes: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Moderation Safety Toggles */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <span>Safety & Moderation Rules</span>
              </h4>

              <div className="space-y-2">
                {/* Moderation level */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Comment Interaction Filter</p>
                    <p className="text-[11px] text-slate-500">
                      {localSettings.safetyMode === 'strict_phrases_only'
                        ? 'Strict: Kids can only select pre-approved compliments'
                        : 'Smart: AI anti-bullying and PII filter allows safe typed text'}
                    </p>
                  </div>
                  <select
                    value={localSettings.safetyMode}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        safetyMode: e.target.value as ParentSettings['safetyMode'],
                      }))
                    }
                    className="text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none"
                  >
                    <option value="smart_filtered_text">Smart Safe Text</option>
                    <option value="strict_phrases_only">Strict Phrases Only</option>
                  </select>
                </div>

                {/* Require Parent Approval Before Post */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Require Parent Approval for New Posts</p>
                    <p className="text-[11px] text-slate-500">Review drawings before friends can view them</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.requireApprovalForPosting}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        requireApprovalForPosting: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* Quiet Hours */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Bedtime Quiet Mode (8 PM - 7:30 AM)</p>
                      <p className="text-[11px] text-slate-500">Locks the app during bedtime hours</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.quietHoursActive}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        quietHoursActive: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>

                {/* Allow Audio Voice Notes */}
                <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-sky-500" />
                    <div>
                      <p className="text-xs font-bold text-slate-800">Allow Friendly Voice Notes</p>
                      <p className="text-[11px] text-slate-500">Enable voice greeting posts and playback</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={localSettings.allowAudioNotes}
                    onChange={(e) =>
                      setLocalSettings((prev) => ({
                        ...prev,
                        allowAudioNotes: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Change PIN section */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Parent PIN Code</p>
                <p className="text-[11px] text-slate-500">4-digit passkey to lock this panel</p>
              </div>
              <input
                type="text"
                maxLength={4}
                value={localSettings.pin}
                onChange={(e) =>
                  setLocalSettings((prev) => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))
                }
                className="w-20 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-center font-mono font-bold text-sm tracking-wider"
              />
            </div>
          </div>
        )}

        {/* Footer */}
        {isAuthenticated && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-pulse">
                <Check className="w-4 h-4" />
                Settings Saved Successfully!
              </span>
            ) : (
              <span className="text-xs text-slate-400">All changes apply instantly</span>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playPopSound();
                  setIsAuthenticated(false);
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                Lock Panel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Save Preferences
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Sibling Modal */}
      {showAddKidModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border-2 border-emerald-400 space-y-4">
            <h4 className="text-base font-bold text-slate-900 font-heading">
              Add Child / Sibling Account
            </h4>
            <form onSubmit={handleCreateSibling} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Child's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Toby"
                  value={newKidName}
                  onChange={(e) => setNewKidName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Age</label>
                <input
                  type="number"
                  min={5}
                  max={13}
                  value={newKidAge}
                  onChange={(e) => setNewKidAge(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-xl text-sm font-semibold"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddKidModal(false)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
                >
                  Create Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
