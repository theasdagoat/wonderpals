import React from 'react';
import { KidProfile, KindnessBadge } from '../types';
import { MASCOT_SPACE_PUP_IMG } from '../utils/initialData';
import { playPopSound, playStarTwinkle } from '../utils/soundEffects';
import { Sparkles, Trophy, Heart, Award, Star } from 'lucide-react';

interface PetBuddyKindnessCardProps {
  currentKid: KidProfile;
  badges: KindnessBadge[];
  onOpenAvatarMaker: () => void;
}

export const PetBuddyKindnessCard: React.FC<PetBuddyKindnessCardProps> = ({
  currentKid,
  badges,
  onOpenAvatarMaker,
}) => {
  const nextLevelPoints = currentKid.level * 60;
  const progressPercent = Math.min(100, Math.round((currentKid.kindnessPoints / nextLevelPoints) * 100));

  const petNames: Record<string, string> = {
    spacePup: 'Pip the Cosmic Pup',
    starKitten: 'Luna the Star Kitten',
    happyDino: 'Sparky the Dino',
    magicBunny: 'Barnaby Bunny',
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-5">
      {/* Pet Buddy Showcase */}
      <div className="relative p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl border border-amber-200 overflow-hidden">
        <div className="flex items-center gap-3.5">
          {/* Mascot Portrait */}
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-white shrink-0">
            <img
              src={MASCOT_SPACE_PUP_IMG}
              alt="Mascot Pal"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover animate-gentle-bounce"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-amber-800">Your Pet Pal</span>
              <span className="text-xs">🐾</span>
            </div>
            <h4 className="text-base font-bold text-slate-900 font-heading truncate">
              {petNames[currentKid.avatar.petBuddy] || 'Pip the Cosmic Pup'}
            </h4>
            <p className="text-xs text-amber-700/80 font-medium">
              "You're doing awesome spreading smiles today!"
            </p>
          </div>
        </div>

        {/* Kindness Level Progress */}
        <div className="mt-4 pt-3 border-t border-amber-200/60">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              Level {currentKid.level} Kindness Hero
            </span>
            <span className="font-mono tabular-nums text-amber-800">
              {currentKid.kindnessPoints} / {nextLevelPoints} pts
            </span>
          </div>

          {/* Bar */}
          <div className="w-full h-2.5 bg-white rounded-full overflow-hidden border border-amber-200 p-0.5">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily Kindness Quests */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Today's Kindness Quests</span>
          </h4>
          <span className="text-[11px] text-amber-600 font-bold">+15 pts each</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span>✋</span> Give 3 High Fives to pals
            </span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              Complete! ✨
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span>🎨</span> Share a creative drawing
            </span>
            <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              Complete! ✨
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <span>💖</span> Send a friendly compliment
            </span>
            <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-mono">
              1 / 2
            </span>
          </div>
        </div>
      </div>

      {/* Badges Collection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Your Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})</span>
          </h4>
          <button
            onClick={() => {
              playPopSound();
              onOpenAvatarMaker();
            }}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Customize Avatar
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {badges.map((b) => (
            <div
              key={b.id}
              onClick={() => {
                playStarTwinkle();
              }}
              title={`${b.name}: ${b.description}`}
              className={`p-2.5 rounded-2xl border text-center transition-transform hover:scale-105 cursor-pointer ${
                b.unlocked
                  ? 'bg-amber-50/70 border-amber-200 shadow-2xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-[11px] font-bold text-slate-800 truncate">{b.name}</div>
              <div className="text-[10px] text-slate-500 font-mono tabular-nums">
                {b.unlocked ? 'Unlocked' : `${b.currentProgress}/${b.targetProgress}`}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
