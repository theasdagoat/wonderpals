import React from 'react';
import { Challenge } from '../types';
import { playPopSound } from '../utils/soundEffects';
import { Sparkles, Trophy, Users, Clock, ArrowRight } from 'lucide-react';

interface ChallengesSectionProps {
  challenges: Challenge[];
  onSelectChallenge: (challengeTag: string) => void;
}

export const ChallengesSection: React.FC<ChallengesSectionProps> = ({
  challenges,
  onSelectChallenge,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading flex items-center gap-2">
            <span>🚀 Super Quests & Creative Challenges</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
            Draw, build, and invent alongside friends to earn shiny badges and kindness points!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {challenges.map((chal) => (
          <div
            key={chal.id}
            className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
          >
            {/* Visual Thumbnail */}
            <div className="relative h-48 overflow-hidden bg-slate-100">
              <img
                src={chal.imageUrl}
                alt={chal.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{chal.endsIn}</span>
              </div>
              <div className="absolute top-3 right-3 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-extrabold shadow-sm flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>+{chal.pointsReward} Pts</span>
              </div>
            </div>

            {/* Info */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
                  {chal.title}
                </h3>
                <p className="text-xs font-semibold text-amber-800 mt-0.5">
                  {chal.subtitle}
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {chal.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-mono tabular-nums">{chal.participantsCount}</span> pals joined
                  </span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-600">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{chal.badgeReward}</span>
                  </span>
                </div>

                <button
                  onClick={() => {
                    playPopSound();
                    onSelectChallenge(chal.title);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span>Join Quest</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
