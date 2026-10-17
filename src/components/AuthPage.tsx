import React, { useState } from 'react';
import { KidProfile, ParentSettings, AuthSession } from '../types';
import { KidAvatarView } from './KidAvatarView';
import { MASCOT_SPACE_PUP_IMG } from '../utils/initialData';
import {
  playPopSound,
  playStarTwinkle,
  playHighFiveBoing,
  playSuccessFanfare,
  playChimeSound,
} from '../utils/soundEffects';
import {
  Sparkles,
  Shield,
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Check,
  Smile,
  Users,
  KeyRound,
  Heart,
  Palette,
  AlertCircle,
} from 'lucide-react';

interface AuthPageProps {
  kidsList: KidProfile[];
  parentSettings: ParentSettings;
  onLogin: (session: AuthSession) => void;
  onSignUp: (newKid: KidProfile, parentEmail: string, parentPin: string) => void;
  onGuestExplore: () => void;
}

type AuthMode = 'kid-login' | 'parent-login' | 'signup';

const PASSCODE_ICONS = ['⭐', '🚀', '🐾', '🎈', '🎨', '🍦', '👑', '🦖', '🌈', '☀️'];

const SKIN_TONES = ['#fbd38d', '#fbb6ce', '#ed8936', '#c67d5a', '#8d5b4c'];
const SHIRT_COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'];
const PET_OPTIONS: { id: KidProfile['avatar']['petBuddy']; name: string; emoji: string }[] = [
  { id: 'spacePup', name: 'Pip the Space Pup', emoji: '🐶' },
  { id: 'starKitten', name: 'Luna the Star Kitten', emoji: '🐱' },
  { id: 'happyDino', name: 'Sparky the Dino', emoji: '🦖' },
  { id: 'magicBunny', name: 'Barnaby Bunny', emoji: '🐰' },
];

export const AuthPage: React.FC<AuthPageProps> = ({
  kidsList,
  parentSettings,
  onLogin,
  onSignUp,
  onGuestExplore,
}) => {
  const [mode, setMode] = useState<AuthMode>('kid-login');

  // Kid Login State
  const [selectedKidId, setSelectedKidId] = useState<string>(kidsList[0]?.id || '');
  const [pictureCodeInput, setPictureCodeInput] = useState<string[]>([]);
  const [kidLoginError, setKidLoginError] = useState<string | null>(null);

  // Parent Login State
  const [parentEmail, setParentEmail] = useState('');
  const [parentPin, setParentPin] = useState('');
  const [parentError, setParentError] = useState<string | null>(null);
  const [showMathGate, setShowMathGate] = useState(false);
  const [mathInput, setMathInput] = useState('');

  // Sign Up Multi-Step State
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [newParentEmail, setNewParentEmail] = useState('');
  const [newParentPin, setNewParentPin] = useState('1234');
  const [parentConfirmedConsent, setParentConfirmedConsent] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);

  // Kid Setup in Signup
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState(8);
  const [childAvatar, setChildAvatar] = useState<KidProfile['avatar']>({
    skinColor: '#fbd38d',
    hairStyle: 'curls',
    hairColor: '#4a2c11',
    accessory: 'spaceHelmet',
    shirtColor: '#3b82f6',
    expression: 'happy',
    petBuddy: 'spacePup',
  });
  const [newPicturePasscode, setNewPicturePasscode] = useState<string[]>([]);

  // Selected kid reference
  const selectedKid = kidsList.find((k) => k.id === selectedKidId) || kidsList[0];

  // Handle Kid Profile Login
  const handleKidLogin = (kid: KidProfile) => {
    // If the kid has a passcode and wants to enter with passcode, check it
    if (kid.picturePasscode && kid.picturePasscode.length > 0) {
      if (pictureCodeInput.length === 3) {
        const matches = pictureCodeInput.every((icon, i) => icon === kid.picturePasscode?.[i]);
        if (!matches) {
          playPopSound();
          setKidLoginError(`Oops! That passcode didn't match ${kid.displayName}'s symbols.`);
          return;
        }
      }
    }

    playSuccessFanfare();
    onLogin({
      role: 'kid',
      kidId: kid.id,
    });
  };

  const handleTogglePasscodeIcon = (icon: string) => {
    playPopSound();
    setKidLoginError(null);
    if (pictureCodeInput.length < 3) {
      const next = [...pictureCodeInput, icon];
      setPictureCodeInput(next);
      if (next.length === 3 && selectedKid) {
        // Auto check
        if (selectedKid.picturePasscode) {
          const matches = next.every((val, i) => val === selectedKid.picturePasscode?.[i]);
          if (matches) {
            playSuccessFanfare();
            setTimeout(() => {
              onLogin({ role: 'kid', kidId: selectedKid.id });
            }, 300);
          } else {
            setKidLoginError(`Oops! That picture code didn't match ${selectedKid.displayName}'s symbols.`);
          }
        }
      }
    }
  };

  const handleClearPasscode = () => {
    playPopSound();
    setPictureCodeInput([]);
    setKidLoginError(null);
  };

  // Handle Parent Login
  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentPin === parentSettings.pin) {
      playSuccessFanfare();
      onLogin({
        role: 'parent',
        parentEmail: parentEmail || 'parent@family.com',
      });
    } else {
      playPopSound();
      setParentError('Incorrect PIN code. Default is 1234.');
    }
  };

  const handleMathUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (mathInput.trim() === '42') {
      playSuccessFanfare();
      onLogin({
        role: 'parent',
        parentEmail: 'parent@family.com',
      });
    } else {
      setParentError('Incorrect answer. Please try again.');
    }
  };

  // Handle Signup Progression
  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParentEmail.includes('@')) {
      setSignupError('Please enter a valid parent email address.');
      return;
    }
    if (newParentPin.length !== 4) {
      setSignupError('Parent PIN must be exactly 4 digits.');
      return;
    }
    if (!parentConfirmedConsent) {
      setSignupError('A parent or guardian must accept to continue.');
      return;
    }
    setSignupError(null);
    playChimeSound();
    setSignupStep(2);
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) {
      setSignupError("Please enter your child's name or nickname.");
      return;
    }
    setSignupError(null);
    playChimeSound();
    setSignupStep(3);
  };

  const handleAddSignupPasscode = (icon: string) => {
    playPopSound();
    if (newPicturePasscode.length < 3) {
      setNewPicturePasscode([...newPicturePasscode, icon]);
    }
  };

  const handleCompleteSignup = () => {
    if (newPicturePasscode.length < 3) {
      setSignupError('Please choose 3 fun icons for the picture password!');
      return;
    }

    playSuccessFanfare();
    const newKid: KidProfile = {
      id: 'kid-' + Date.now(),
      username: childName.toLowerCase().replace(/\s+/g, '_'),
      displayName: childName.trim(),
      age: childAge,
      avatar: childAvatar,
      kindnessPoints: 100,
      level: 1,
      superTitle: 'Kind Explorer ✨',
      unlockedBadges: ['first_draw'],
      friendsCount: 1,
      dailyTimeLimitMinutes: parentSettings.dailyScreenLimitMinutes,
      minutesUsedToday: 0,
      picturePasscode: newPicturePasscode,
    };

    onSignUp(newKid, newParentEmail, newParentPin);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/70 via-sky-50/50 to-indigo-50/50 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-body">
      {/* Top Brand Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-2.5">
          <span className="text-3xl animate-gentle-bounce select-none">🎈</span>
          <span className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
            WonderPals
          </span>
        </div>

        <button
          onClick={() => {
            playPopSound();
            onGuestExplore();
          }}
          className="text-xs font-bold text-slate-500 hover:text-amber-700 bg-white/80 hover:bg-white px-3.5 py-1.5 rounded-full border border-slate-200 transition-all flex items-center gap-1 shadow-2xs"
        >
          <span>Preview Clubhouse</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-5xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Mascot & Whimsical Safe Promise */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="relative inline-block mx-auto lg:mx-0">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-gradient-to-tr from-sky-100 to-amber-100 mx-auto">
              <img
                src={MASCOT_SPACE_PUP_IMG}
                alt="Pip the mascot puppy"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover animate-gentle-bounce"
              />
            </div>
            <span className="absolute -bottom-2 -right-2 px-3 py-1 bg-amber-400 text-amber-950 text-xs font-extrabold rounded-full shadow-md">
              100% Kid Safe 🛡️
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-slate-900 leading-tight">
              Where Kids Create, Share & Cheer!
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto lg:mx-0">
              A gentle, positive digital clubhouse designed with love for children. Draw artwork, laugh at silly riddles, and build kindness habits together.
            </p>
          </div>

          {/* Core Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 pt-2 text-left max-w-md mx-auto lg:mx-0">
            <div className="p-3 bg-white/90 rounded-2xl border border-amber-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">Positivity & High Fives Only</p>
                <p className="text-slate-500 text-[11px]">Zero cyberbullying, negative reactions, or mean comments.</p>
              </div>
            </div>

            <div className="p-3 bg-white/90 rounded-2xl border border-sky-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">No Open Stranger DMs</p>
                <p className="text-slate-500 text-[11px]">Personal info and phone numbers are blocked automatically.</p>
              </div>
            </div>

            <div className="p-3 bg-white/90 rounded-2xl border border-emerald-200/80 shadow-2xs flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Lock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-800">Parent PIN Screen Time Limits</p>
                <p className="text-slate-500 text-[11px]">Built-in daily play timers and bedtime quiet hours.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Login / Signup Card */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl border-4 border-amber-300 shadow-xl overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-amber-200 bg-amber-50/50 p-1.5 gap-1.5">
              <button
                onClick={() => {
                  playPopSound();
                  setMode('kid-login');
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'kid-login'
                    ? 'bg-amber-400 text-amber-950 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🎨 Kid Log In</span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  setMode('signup');
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'signup'
                    ? 'bg-gradient-to-r from-orange-400 to-amber-400 text-amber-950 shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>✨ New Sign Up</span>
              </button>

              <button
                onClick={() => {
                  playPopSound();
                  setMode('parent-login');
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'parent-login'
                    ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🛡️ Parent Login</span>
              </button>
            </div>

            {/* TAB 1: KID LOG IN */}
            {mode === 'kid-login' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-heading">
                    Welcome Back, WonderPal!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Select your profile to jump straight into the clubhouse!
                  </p>
                </div>

                {/* Kid Profile Selector Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  {kidsList.map((k) => {
                    const isSelected = k.id === selectedKidId;
                    return (
                      <div
                        key={k.id}
                        onClick={() => {
                          playPopSound();
                          setSelectedKidId(k.id);
                          setPictureCodeInput([]);
                          setKidLoginError(null);
                        }}
                        className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col items-center text-center ${
                          isSelected
                            ? 'border-amber-400 bg-amber-50/70 ring-4 ring-amber-200/60 shadow-md scale-102'
                            : 'border-slate-200 hover:border-amber-200 bg-white'
                        }`}
                      >
                        <KidAvatarView avatar={k.avatar} size="lg" showPetBadge={true} />
                        <h4 className="font-bold text-sm text-slate-900 mt-2">
                          {k.displayName}
                        </h4>
                        <p className="text-[11px] text-amber-800 font-semibold">
                          Age {k.age} · Level {k.level}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleKidLogin(k);
                          }}
                          className="mt-3 w-full py-1.5 bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1"
                        >
                          <span>Enter</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Visual 3-Icon Passcode Area */}
                {selectedKid && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span>Or Enter with Picture Password:</span>
                      </span>
                      {selectedKid.picturePasscode && (
                        <span className="text-[10px] text-slate-400">
                          Hint: {selectedKid.picturePasscode.join(' ')}
                        </span>
                      )}
                    </div>

                    {/* Display Chosen 3 slots */}
                    <div className="flex items-center justify-center gap-3 py-2">
                      {[0, 1, 2].map((slot) => (
                        <div
                          key={slot}
                          className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-300 shadow-inner flex items-center justify-center text-2xl font-bold"
                        >
                          {pictureCodeInput[slot] || '•'}
                        </div>
                      ))}
                      {pictureCodeInput.length > 0 && (
                        <button
                          onClick={handleClearPasscode}
                          className="text-xs text-rose-600 font-bold hover:underline ml-2"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Emoji keypad */}
                    <div className="grid grid-cols-5 gap-2">
                      {PASSCODE_ICONS.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => handleTogglePasscodeIcon(icon)}
                          className="py-2 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-xl flex items-center justify-center transition-transform active:scale-90"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>

                    {kidLoginError && (
                      <p className="text-xs text-rose-600 font-bold text-center">
                        {kidLoginError}
                      </p>
                    )}
                  </div>
                )}

                {/* Instant Demo Switcher */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Fast testing demo accounts:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const leo = kidsList.find((k) => k.id === 'kid-leo') || kidsList[0];
                        handleKidLogin(leo);
                      }}
                      className="px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg font-bold text-[11px]"
                    >
                      Leo (Age 8)
                    </button>
                    <button
                      onClick={() => {
                        const maya = kidsList.find((k) => k.id === 'kid-maya') || kidsList[1] || kidsList[0];
                        handleKidLogin(maya);
                      }}
                      className="px-2.5 py-1 bg-pink-50 text-pink-700 hover:bg-pink-100 rounded-lg font-bold text-[11px]"
                    >
                      Maya (Age 10)
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SIGN UP FLOW */}
            {mode === 'signup' && (
              <div className="p-6 sm:p-8 space-y-6">
                {/* Stepper Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 font-heading">
                      Create Your Family Clubhouse Account
                    </h3>
                    <p className="text-xs text-slate-500">
                      Step {signupStep} of 3: {signupStep === 1 ? 'Parent Setup' : signupStep === 2 ? 'Kid Profile & Avatar' : 'Picture Password'}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          signupStep === step
                            ? 'bg-amber-400 text-amber-950 font-extrabold'
                            : signupStep > step
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {signupStep > step ? '✓' : step}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 1: Parent Setup */}
                {signupStep === 1 && (
                  <form onSubmit={handleStep1Next} className="space-y-4">
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-2.5">
                      <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-900">
                        <strong className="block font-bold">Parental Consent & Oversight</strong>
                        WonderPals adheres strictly to children's online privacy guidelines. Parents control screen time limits and approve safety settings.
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Parent or Guardian Email Address
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="parent@example.com"
                        value={newParentEmail}
                        onChange={(e) => setNewParentEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Create 4-Digit Parent PIN
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        required
                        placeholder="e.g. 1234"
                        value={newParentPin}
                        onChange={(e) => setNewParentPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-center font-mono font-bold text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-300"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Used to access screen time controls and friend permissions.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5 pt-2">
                      <input
                        type="checkbox"
                        id="parentConsent"
                        checked={parentConfirmedConsent}
                        onChange={(e) => setParentConfirmedConsent(e.target.checked)}
                        className="w-4 h-4 mt-0.5 accent-amber-500 rounded"
                      />
                      <label htmlFor="parentConsent" className="text-xs text-slate-600 font-medium cursor-pointer">
                        I am 18+ and give permission for my child to participate in the WonderPals safe clubhouse.
                      </label>
                    </div>

                    {signupError && (
                      <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl">
                        ⚠️ {signupError}
                      </p>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <span>Next: Child Profile</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2: Child Profile & Avatar */}
                {signupStep === 2 && (
                  <form onSubmit={handleStep2Next} className="space-y-4">
                    {/* Live Avatar Preview */}
                    <div className="p-4 bg-sky-50/60 rounded-3xl border border-sky-200 flex flex-col items-center justify-center">
                      <div className="animate-gentle-bounce">
                        <KidAvatarView avatar={childAvatar} size="lg" showPetBadge={true} />
                      </div>
                      <p className="text-xs font-bold text-slate-700 mt-2">
                        {childName || 'Your Child'} (Age {childAge})
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Child's Name / Nickname
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Leo"
                          value={childName}
                          onChange={(e) => setChildName(e.target.value)}
                          className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-300"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Age (5 - 12)
                        </label>
                        <select
                          value={childAge}
                          onChange={(e) => setChildAge(Number(e.target.value))}
                          className="w-full px-3 py-2 border rounded-xl text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-amber-300 bg-white"
                        >
                          {[5, 6, 7, 8, 9, 10, 11, 12].map((a) => (
                            <option key={a} value={a}>
                              Age {a}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Skin & Shirt Colors */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Shirt Color
                      </label>
                      <div className="flex items-center gap-2">
                        {SHIRT_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => {
                              playPopSound();
                              setChildAvatar((prev) => ({ ...prev, shirtColor: c }));
                            }}
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${
                              childAvatar.shirtColor === c
                                ? 'scale-110 border-slate-900 ring-2 ring-amber-300'
                                : 'border-white hover:scale-105'
                            }`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Pet Companion */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">
                        Choose Starting Pet Buddy
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {PET_OPTIONS.map((pet) => (
                          <button
                            key={pet.id}
                            type="button"
                            onClick={() => {
                              playPopSound();
                              setChildAvatar((prev) => ({ ...prev, petBuddy: pet.id }));
                            }}
                            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                              childAvatar.petBuddy === pet.id
                                ? 'border-amber-400 bg-amber-50 font-bold text-amber-950 ring-2 ring-amber-200'
                                : 'border-slate-200 bg-white text-slate-700'
                            }`}
                          >
                            <span className="text-xl">{pet.emoji}</span>
                            <span className="truncate">{pet.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {signupError && (
                      <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl">
                        ⚠️ {signupError}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          playPopSound();
                          setSignupStep(1);
                        }}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-1.5"
                      >
                        <span>Next: Picture Passcode</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: Choose 3 Picture Passcode */}
                {signupStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Pick 3 Fun Symbols for {childName}'s Secret Password
                      </h4>
                      <p className="text-xs text-slate-500">
                        Kids don't need to type hard passwords! Tap 3 symbols to remember:
                      </p>
                    </div>

                    {/* Current chosen symbols */}
                    <div className="flex items-center justify-center gap-3 py-3">
                      {[0, 1, 2].map((slot) => (
                        <div
                          key={slot}
                          className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-inner flex items-center justify-center text-3xl font-bold animate-fade-in"
                        >
                          {newPicturePasscode[slot] || '❓'}
                        </div>
                      ))}
                      {newPicturePasscode.length > 0 && (
                        <button
                          onClick={() => setNewPicturePasscode([])}
                          className="text-xs text-rose-600 font-bold hover:underline ml-2"
                        >
                          Reset
                        </button>
                      )}
                    </div>

                    {/* Emoji choices */}
                    <div className="grid grid-cols-5 gap-2">
                      {PASSCODE_ICONS.map((icon) => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => handleAddSignupPasscode(icon)}
                          className="py-3 rounded-2xl bg-white hover:bg-amber-100 border border-slate-200 hover:border-amber-400 text-2xl flex items-center justify-center transition-transform active:scale-90"
                        >
                          {icon}
                        </button>
                      ))}
                    </div>

                    {signupError && (
                      <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2 rounded-xl">
                        ⚠️ {signupError}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          playPopSound();
                          setSignupStep(2);
                        }}
                        className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleCompleteSignup}
                        className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Launch WonderPals!</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: PARENT SIGN IN */}
            {mode === 'parent-login' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-heading flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Parent & Guardian Access</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage daily screen time limits, review approved friends, and adjust moderation filters.
                  </p>
                </div>

                <form onSubmit={handleParentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Parent Email (optional)
                    </label>
                    <input
                      type="email"
                      placeholder="parent@example.com"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      4-Digit Parent PIN (Default: 1234)
                    </label>
                    <input
                      type="password"
                      maxLength={4}
                      required
                      placeholder="• • • •"
                      value={parentPin}
                      onChange={(e) => {
                        setParentPin(e.target.value);
                        setParentError(null);
                      }}
                      className="w-full text-center text-3xl font-mono tracking-widest py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:border-emerald-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {parentError && (
                    <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl text-center">
                      ⚠️ {parentError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <KeyRound className="w-4 h-4" />
                    Enter Parent Dashboard
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <button
                    onClick={() => setShowMathGate(!showMathGate)}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                  >
                    Forgot PIN? Pass adult math check instead
                  </button>

                  {showMathGate && (
                    <form onSubmit={handleMathUnlock} className="mt-3 p-3 bg-slate-50 rounded-2xl border space-y-2 max-w-xs mx-auto">
                      <p className="text-xs font-semibold text-slate-700">What is 14 × 3 ?</p>
                      <input
                        type="number"
                        placeholder="Answer"
                        value={mathInput}
                        onChange={(e) => setMathInput(e.target.value)}
                        className="w-full px-3 py-1.5 border rounded-xl text-center text-sm"
                      />
                      <button
                        type="submit"
                        className="w-full py-1.5 bg-slate-800 text-white text-xs font-bold rounded-xl"
                      >
                        Verify Adult
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer safe disclaimer */}
      <footer className="max-w-6xl w-full mx-auto pt-6 text-center text-xs text-slate-400">
        <p>WonderPals Kids Universe · Family Safety Certified · Built with care for positive creativity</p>
      </footer>
    </div>
  );
};
