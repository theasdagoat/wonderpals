import React, { useState } from 'react';
import { KidAvatar } from '../types';
import { KidAvatarView } from './KidAvatarView';
import { playPopSound, playSuccessFanfare } from '../utils/soundEffects';
import { X, Sparkles, Check } from 'lucide-react';

interface AvatarCreatorModalProps {
  currentAvatar: KidAvatar;
  onSave: (avatar: KidAvatar) => void;
  onClose: () => void;
}

const SKIN_COLORS = ['#fbd38d', '#fbb6ce', '#ed8936', '#c67d5a', '#8d5b4c', '#fed7aa'];
const HAIR_COLORS = ['#1e293b', '#4a2c11', '#b45309', '#eab308', '#ec4899', '#06b6d4'];
const SHIRT_COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

const HAIR_STYLES: { id: KidAvatar['hairStyle']; label: string }[] = [
  { id: 'spiky', label: 'Spiky Star' },
  { id: 'curls', label: 'Bouncy Curls' },
  { id: 'braids', label: 'Twin Braids' },
  { id: 'smooth', label: 'Sleek Swoop' },
  { id: 'afro', label: 'Awesome Afro' },
  { id: 'bob', label: 'Classic Bob' },
];

const ACCESSORIES: { id: KidAvatar['accessory']; label: string; icon: string }[] = [
  { id: 'none', label: 'None', icon: '✨' },
  { id: 'spaceHelmet', label: 'Space Helmet', icon: '🧑‍🚀' },
  { id: 'bearEars', label: 'Bear Ears', icon: '🐻' },
  { id: 'starHat', label: 'Party Hat', icon: '🎉' },
  { id: 'glasses', label: 'Cool Specs', icon: '👓' },
  { id: 'crown', label: 'Golden Crown', icon: '👑' },
];

const EXPRESSIONS: { id: KidAvatar['expression']; label: string; emoji: string }[] = [
  { id: 'happy', label: 'Big Smile', emoji: '😊' },
  { id: 'excited', label: 'Super Stoked', emoji: '🤩' },
  { id: 'winking', label: 'Cheeky Wink', emoji: '😉' },
  { id: 'cool', label: 'Chill Cool', emoji: '😎' },
];

const PET_BUDDIES: { id: KidAvatar['petBuddy']; name: string; emoji: string; desc: string }[] = [
  { id: 'spacePup', name: 'Pip the Space Pup', emoji: '🐶', desc: 'Loyal cosmic explorer' },
  { id: 'starKitten', name: 'Luna the Star Cat', emoji: '🐱', desc: 'Night sky dreamer' },
  { id: 'happyDino', name: 'Sparky the Dino', emoji: '🦖', desc: 'Roars with laughter' },
  { id: 'magicBunny', name: 'Barnaby Bunny', emoji: '🐰', desc: 'Bounces with joy' },
];

export const AvatarCreatorModal: React.FC<AvatarCreatorModalProps> = ({
  currentAvatar,
  onSave,
  onClose,
}) => {
  const [avatar, setAvatar] = useState<KidAvatar>({ ...currentAvatar });
  const [tab, setTab] = useState<'look' | 'pet'>('look');

  const update = (patch: Partial<KidAvatar>) => {
    playPopSound();
    setAvatar((prev) => ({ ...prev, ...patch }));
  };

  const handleSave = () => {
    playSuccessFanfare();
    onSave(avatar);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-100 via-orange-100 to-yellow-100 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl">✨</span>
            <h2 className="text-xl font-bold text-slate-800 font-heading">
              Dress Up Your WonderPal!
            </h2>
          </div>
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Avatar Preview Spotlight */}
          <div className="flex flex-col items-center justify-center py-4 bg-gradient-to-b from-sky-50 to-indigo-50/40 rounded-2xl border border-sky-100">
            <div className="animate-gentle-bounce">
              <KidAvatarView avatar={avatar} size="xl" showPetBadge={true} />
            </div>
            <div className="mt-2 text-center">
              <p className="text-xs text-slate-400 font-medium">Looking super awesome!</p>
            </div>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                playPopSound();
                setTab('look');
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                tab === 'look'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🎨 Hairstyle & Gear
            </button>
            <button
              onClick={() => {
                playPopSound();
                setTab('pet');
              }}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                tab === 'pet'
                  ? 'bg-white text-amber-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🐾 Pet Companion
            </button>
          </div>

          {tab === 'look' ? (
            <div className="space-y-5">
              {/* Expressions */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Face Expression
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {EXPRESSIONS.map((exp) => (
                    <button
                      key={exp.id}
                      onClick={() => update({ expression: exp.id })}
                      className={`py-2 px-3 rounded-xl border text-center transition-all ${
                        avatar.expression === exp.id
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="text-xl">{exp.emoji}</div>
                      <div className="text-[11px] font-semibold text-slate-700 mt-1">{exp.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hairstyle */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Hairstyle
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {HAIR_STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => update({ hairStyle: style.id })}
                      className={`py-2 px-2 rounded-xl border text-xs font-medium text-slate-700 transition-all ${
                        avatar.hairStyle === style.id
                          ? 'border-indigo-500 bg-indigo-50 font-bold text-indigo-700 ring-2 ring-indigo-200'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Hair Color
                </label>
                <div className="flex items-center gap-3">
                  {HAIR_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => update({ hairColor: c })}
                      className={`w-9 h-9 rounded-full border-2 transition-transform ${
                        avatar.hairColor === c
                          ? 'scale-110 border-indigo-600 shadow-md ring-2 ring-indigo-200'
                          : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Skin Tone
                </label>
                <div className="flex items-center gap-3">
                  {SKIN_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => update({ skinColor: c })}
                      className={`w-9 h-9 rounded-full border-2 transition-transform ${
                        avatar.skinColor === c
                          ? 'scale-110 border-indigo-600 shadow-md ring-2 ring-indigo-200'
                          : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Accessories */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Fun Hats & Gear
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {ACCESSORIES.map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => update({ accessory: acc.id })}
                      className={`py-2 px-2 rounded-xl border text-center transition-all ${
                        avatar.accessory === acc.id
                          ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200 font-bold text-amber-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                      }`}
                    >
                      <div className="text-xl">{acc.icon}</div>
                      <div className="text-[11px] mt-1">{acc.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Shirt Color
                </label>
                <div className="flex items-center gap-3">
                  {SHIRT_COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => update({ shirtColor: c })}
                      className={`w-9 h-9 rounded-full border-2 transition-transform ${
                        avatar.shirtColor === c
                          ? 'scale-110 border-indigo-600 shadow-md ring-2 ring-indigo-200'
                          : 'border-white hover:scale-105'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Pet Buddy Selection */
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Choose a faithful pet companion! Your pet buddy cheers for you whenever you share art or give kindness high-fives!
              </p>
              <div className="grid grid-cols-2 gap-3">
                {PET_BUDDIES.map((pet) => (
                  <button
                    key={pet.id}
                    onClick={() => update({ petBuddy: pet.id })}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col items-center text-center ${
                      avatar.petBuddy === pet.id
                        ? 'border-amber-400 bg-amber-50 ring-2 ring-amber-300 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="text-4xl mb-2">{pet.emoji}</div>
                    <div className="text-sm font-bold text-slate-800">{pet.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{pet.desc}</div>
                    {avatar.petBuddy === pet.id && (
                      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <Check className="w-3.5 h-3.5" /> Best Pal
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Save My Look!
          </button>
        </div>
      </div>
    </div>
  );
};
