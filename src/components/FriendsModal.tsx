import React, { useState } from 'react';
import { KidProfile } from '../types';
import { KidAvatarView } from './KidAvatarView';
import { playHighFiveBoing, playPopSound, playSuccessFanfare } from '../utils/soundEffects';
import { Users, UserPlus, Heart, Hand, ShieldCheck, X, Check } from 'lucide-react';

interface FriendsModalProps {
  currentKid: KidProfile;
  onClose: () => void;
}

interface FriendItem {
  id: string;
  name: string;
  age: number;
  avatar: KidProfile['avatar'];
  superTitle: string;
  isOnline: boolean;
  highFiveSent?: boolean;
}

const INITIAL_FRIENDS: FriendItem[] = [
  {
    id: 'f-1',
    name: 'Sophia',
    age: 9,
    avatar: {
      skinColor: '#fbd38d',
      hairStyle: 'curls',
      hairColor: '#d69e2e',
      accessory: 'crown',
      shirtColor: '#10b981',
      expression: 'happy',
      petBuddy: 'magicBunny',
    },
    superTitle: 'Creative Wizard ✨',
    isOnline: true,
  },
  {
    id: 'f-2',
    name: 'Noah',
    age: 8,
    avatar: {
      skinColor: '#fbb6ce',
      hairStyle: 'smooth',
      hairColor: '#78350f',
      accessory: 'glasses',
      shirtColor: '#6366f1',
      expression: 'excited',
      petBuddy: 'happyDino',
    },
    superTitle: 'Craft Builder 🛠️',
    isOnline: true,
  },
  {
    id: 'f-3',
    name: 'Zara',
    age: 7,
    avatar: {
      skinColor: '#fed7aa',
      hairStyle: 'afro',
      hairColor: '#1e293b',
      accessory: 'starHat',
      shirtColor: '#f59e0b',
      expression: 'cool',
      petBuddy: 'spacePup',
    },
    superTitle: 'Laugh Master 🎭',
    isOnline: false,
  },
  {
    id: 'f-4',
    name: 'Ethan',
    age: 9,
    avatar: {
      skinColor: '#ed8936',
      hairStyle: 'spiky',
      hairColor: '#1e293b',
      accessory: 'spaceHelmet',
      shirtColor: '#ec4899',
      expression: 'happy',
      petBuddy: 'starKitten',
    },
    superTitle: 'Space Cadet 🛸',
    isOnline: false,
  },
];

export const FriendsModal: React.FC<FriendsModalProps> = ({ currentKid, onClose }) => {
  const [friends, setFriends] = useState<FriendItem[]>(INITIAL_FRIENDS);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [addedMessage, setAddedMessage] = useState<string | null>(null);

  const handleSendHighFive = (friendId: string) => {
    playHighFiveBoing();
    setFriends((prev) =>
      prev.map((f) => (f.id === friendId ? { ...f, highFiveSent: true } : f))
    );
    setTimeout(() => {
      setFriends((prev) =>
        prev.map((f) => (f.id === friendId ? { ...f, highFiveSent: false } : f))
      );
    }, 2000);
  };

  const handleAddFriend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendCodeInput.trim()) return;

    playSuccessFanfare();
    const newFriend: FriendItem = {
      id: 'f-' + Date.now(),
      name: 'Pal_' + friendCodeInput.trim().toUpperCase(),
      age: currentKid.age,
      avatar: {
        skinColor: '#fbb6ce',
        hairStyle: 'curls',
        hairColor: '#b45309',
        accessory: 'bearEars',
        shirtColor: '#3b82f6',
        expression: 'excited',
        petBuddy: 'happyDino',
      },
      superTitle: 'Super Buddy 🌟',
      isOnline: true,
    };

    setFriends((prev) => [newFriend, ...prev]);
    setAddedMessage(`Added new friend with code ${friendCodeInput.trim().toUpperCase()}!`);
    setFriendCodeInput('');
    setTimeout(() => setAddedMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-indigo-300 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-100 via-sky-100 to-indigo-100 border-b border-indigo-200">
          <div className="flex items-center gap-2.5">
            <Users className="w-6 h-6 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-800 font-heading">
                Clubhouse Friends & Pals
              </h2>
              <p className="text-xs text-indigo-900/70 font-medium">
                Safe peer circle under parent supervision
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Safe Friend Code Banner */}
          <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">
                Your Safe Friend Code
              </span>
              <p className="text-xl font-mono font-extrabold text-indigo-950 tracking-wider">
                PAL-8821
              </p>
              <p className="text-[11px] text-indigo-700/80 mt-0.5">
                Share this code with real-life friends at school!
              </p>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white shadow-xs border border-indigo-200 flex items-center justify-center text-xl">
              🤝
            </div>
          </div>

          {/* Add Friend Code Form */}
          <form onSubmit={handleAddFriend} className="space-y-2">
            <label className="block text-xs font-bold text-slate-600">
              Enter a friend's code to connect:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. PAL-4492"
                value={friendCodeInput}
                onChange={(e) => setFriendCodeInput(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-300 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-sm flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Pal</span>
              </button>
            </div>
            {addedMessage && (
              <p className="text-xs font-bold text-emerald-600 bg-emerald-50 p-2 rounded-xl flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {addedMessage}
              </p>
            )}
          </form>

          {/* Friends List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                My Pals Circle ({friends.length})
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Safe Pals
              </span>
            </div>

            <div className="space-y-2.5">
              {friends.map((f) => (
                <div
                  key={f.id}
                  className="p-3 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <KidAvatarView avatar={f.avatar} size="sm" showPetBadge={true} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 truncate">{f.name}</span>
                        <span className="text-[10px] text-slate-400">Age {f.age}</span>
                      </div>
                      <p className="text-[11px] text-amber-700 font-semibold truncate">
                        {f.superTitle}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendHighFive(f.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                      f.highFiveSent
                        ? 'bg-amber-400 text-amber-950 scale-105 shadow-sm'
                        : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    <span>✋</span>
                    <span>{f.highFiveSent ? 'High Five Sent!' : 'High Five'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            No open stranger DMs · Kid safe always
          </span>
          <button
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="px-5 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
