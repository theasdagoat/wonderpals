import React, { useState, useEffect } from 'react';
import {
  KidProfile,
  Post,
  PostCategory,
  ReactionType,
  SafeComment,
  ParentSettings,
} from './types';
import {
  INITIAL_KID_PROFILES,
  INITIAL_POSTS,
  INITIAL_BADGES,
  INITIAL_CHALLENGES,
  DEFAULT_PARENT_SETTINGS,
  HERO_BANNER_IMG,
} from './utils/initialData';
import { KidAvatarView } from './components/KidAvatarView';
import { PostCard } from './components/PostCard';
import { CreateStudioModal } from './components/CreateStudioModal';
import { AvatarCreatorModal } from './components/AvatarCreatorModal';
import { ParentDashboard } from './components/ParentDashboard';
import { FriendsModal } from './components/FriendsModal';
import { PetBuddyKindnessCard } from './components/PetBuddyKindnessCard';
import { ChallengesSection } from './components/ChallengesSection';
import {
  isMuted,
  toggleAudioMute,
  playPopSound,
  playStarTwinkle,
  playSuccessFanfare,
} from './utils/soundEffects';
import {
  Sparkles,
  Volume2,
  VolumeX,
  Shield,
  Palette,
  Users,
  Trophy,
  Compass,
  Smile,
  Clock,
  Plus,
  Heart,
  ChevronRight,
  Sun,
  Flame,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { AuthSession } from './types';

type NavTab = 'feed' | 'challenges' | 'mypal' | 'friends';

export default function App() {
  // Profiles State
  const [kidsList, setKidsList] = useState<KidProfile[]>(() => {
    const saved = localStorage.getItem('wonderpals_kids');
    return saved ? JSON.parse(saved) : INITIAL_KID_PROFILES;
  });

  // Auth Session State
  const [session, setSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem('wonderpals_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentKidId, setCurrentKidId] = useState<string>(() => {
    return session?.kidId || kidsList[0]?.id || 'kid-leo';
  });

  const currentKid = kidsList.find((k) => k.id === currentKidId) || kidsList[0];

  // Posts State
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('wonderpals_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });

  // Badges State
  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem('wonderpals_badges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  // Parent Settings State
  const [parentSettings, setParentSettings] = useState<ParentSettings>(() => {
    const saved = localStorage.getItem('wonderpals_parent_settings');
    return saved ? JSON.parse(saved) : DEFAULT_PARENT_SETTINGS;
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavTab>('feed');
  const [categoryFilter, setCategoryFilter] = useState<'all' | PostCategory>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showParentModal, setShowParentModal] = useState(false);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [activeChallengeTag, setActiveChallengeTag] = useState<string | undefined>(undefined);

  // Audio mute state
  const [audioMuted, setAudioMuted] = useState(false);

  // Screen time tracking
  const [timeRemainingMinutes, setTimeRemainingMinutes] = useState(
    Math.max(0, parentSettings.dailyScreenLimitMinutes - currentKid.minutesUsedToday)
  );
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('wonderpals_kids', JSON.stringify(kidsList));
  }, [kidsList]);

  useEffect(() => {
    localStorage.setItem('wonderpals_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('wonderpals_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('wonderpals_parent_settings', JSON.stringify(parentSettings));
  }, [parentSettings]);

  useEffect(() => {
    setAudioMuted(isMuted());
  }, []);

  // Screen time simulation ticker (every 60s of active use adds 1m)
  useEffect(() => {
    const timer = setInterval(() => {
      setKidsList((prev) =>
        prev.map((k) => {
          if (k.id === currentKidId) {
            const nextUsed = k.minutesUsedToday + 1;
            const remaining = Math.max(0, parentSettings.dailyScreenLimitMinutes - nextUsed);
            setTimeRemainingMinutes(remaining);
            if (remaining <= 0) {
              setIsTimeUp(true);
            }
            return { ...k, minutesUsedToday: nextUsed };
          }
          return k;
        })
      );
    }, 60000);

    return () => clearInterval(timer);
  }, [currentKidId, parentSettings.dailyScreenLimitMinutes]);

  // Handlers
  const handleToggleSound = () => {
    const newState = toggleAudioMute();
    setAudioMuted(newState);
    if (!newState) playPopSound();
  };

  const handleReactToPost = (postId: string, reactionType: ReactionType) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const alreadyReacted = p.userReactions.includes(reactionType);
        const nextUserReactions = alreadyReacted
          ? p.userReactions.filter((r) => r !== reactionType)
          : [...p.userReactions, reactionType];

        const nextCount = Math.max(
          0,
          (p.reactions[reactionType] || 0) + (alreadyReacted ? -1 : 1)
        );

        return {
          ...p,
          reactions: { ...p.reactions, [reactionType]: nextCount },
          userReactions: nextUserReactions,
        };
      })
    );

    // Reward kid with kindness points
    setKidsList((prev) =>
      prev.map((k) =>
        k.id === currentKidId
          ? { ...k, kindnessPoints: k.kindnessPoints + 2 }
          : k
      )
    );
  };

  const handleAddComment = (postId: string, comment: SafeComment) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          comments: [...p.comments, comment],
        };
      })
    );

    // Reward kid with kindness points
    setKidsList((prev) =>
      prev.map((k) =>
        k.id === currentKidId
          ? { ...k, kindnessPoints: k.kindnessPoints + 5 }
          : k
      )
    );
  };

  const handleReportPost = (postId: string, reason: string) => {
    // Flagged post for safety
    console.log(`Safety alert logged for post ${postId}: ${reason}`);
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts((prev) => [newPost, ...prev]);
    // Reward points and bump user stats
    setKidsList((prev) =>
      prev.map((k) =>
        k.id === currentKidId
          ? {
              ...k,
              kindnessPoints: k.kindnessPoints + (newPost.challengeTag ? 50 : 25),
            }
          : k
      )
    );
  };

  const handleAvatarSaved = (newAvatar: KidProfile['avatar']) => {
    setKidsList((prev) =>
      prev.map((k) => (k.id === currentKidId ? { ...k, avatar: newAvatar } : k))
    );
  };

  const handleSelectChallenge = (challengeTitle: string) => {
    setActiveChallengeTag(challengeTitle);
    setShowCreateModal(true);
  };

  // Auth Handlers
  const handleLogin = (newSession: AuthSession) => {
    playSuccessFanfare();
    setSession(newSession);
    localStorage.setItem('wonderpals_session', JSON.stringify(newSession));
    if (newSession.kidId) {
      setCurrentKidId(newSession.kidId);
    }
    if (newSession.role === 'parent') {
      setShowParentModal(true);
    }
  };

  const handleSignUp = (newKid: KidProfile, parentEmail: string, parentPin: string) => {
    playSuccessFanfare();
    setKidsList((prev) => [newKid, ...prev]);
    setCurrentKidId(newKid.id);
    setParentSettings((prev) => ({ ...prev, pin: parentPin }));
    const newSession: AuthSession = { role: 'kid', kidId: newKid.id };
    setSession(newSession);
    localStorage.setItem('wonderpals_session', JSON.stringify(newSession));
  };

  const handleLogout = () => {
    playPopSound();
    setSession(null);
    localStorage.removeItem('wonderpals_session');
  };

  // Filtered posts
  const filteredPosts = posts.filter((p) => {
    if (categoryFilter === 'all') return true;
    return p.category === categoryFilter;
  });

  // If not logged in, render the Kid & Parent AuthPage
  if (!session) {
    return (
      <AuthPage
        kidsList={kidsList}
        parentSettings={parentSettings}
        onLogin={handleLogin}
        onSignUp={handleSignUp}
        onGuestExplore={() => {
          handleLogin({ role: 'kid', kidId: kidsList[0]?.id || 'kid-leo' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/50 via-amber-50/30 to-slate-50 text-slate-800 flex flex-col font-body">
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Brand title, one line
        Zone 2: 4-5 nav links, 1-2 word labels, single line
        Zone 3: 1 primary action
      */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <div
            onClick={() => {
              playPopSound();
              setActiveTab('feed');
            }}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span className="text-2xl animate-gentle-bounce select-none">🎈</span>
            <span className="text-xl sm:text-2xl font-bold font-heading tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
              WonderPals
            </span>
          </div>

          {/* Zone 2: 4-5 concise single-line nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-600">
            <button
              onClick={() => {
                playPopSound();
                setActiveTab('feed');
              }}
              className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'feed' ? 'text-amber-600 font-extrabold' : ''
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Clubhouse</span>
            </button>
            <button
              onClick={() => {
                playPopSound();
                setActiveTab('challenges');
              }}
              className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'challenges' ? 'text-amber-600 font-extrabold' : ''
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Quests</span>
            </button>
            <button
              onClick={() => {
                playPopSound();
                setActiveTab('mypal');
              }}
              className={`hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'mypal' ? 'text-amber-600 font-extrabold' : ''
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>Pet Pal</span>
            </button>
            <button
              onClick={() => {
                playPopSound();
                setShowFriendsModal(true);
              }}
              className="hover:text-amber-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>Friends Circle</span>
            </button>
            <button
              onClick={() => {
                playPopSound();
                setShowParentModal(true);
              }}
              className="hover:text-emerald-700 text-emerald-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Shield className="w-4 h-4" />
              <span>Parents</span>
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              title={audioMuted ? 'Turn Sound On' : 'Turn Sound Off'}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            >
              {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Kid Avatar Chip */}
            <button
              onClick={() => {
                playPopSound();
                setShowAvatarModal(true);
              }}
              className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all cursor-pointer"
              title="Click to customize avatar"
            >
              <KidAvatarView avatar={currentKid.avatar} size="sm" showPetBadge={true} />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[80px]">
                  {currentKid.displayName}
                </p>
                <p className="text-[10px] text-amber-700 font-semibold leading-none mt-1">
                  Lvl {currentKid.level}
                </p>
              </div>
            </button>

            {/* Log Out / Switch Pal */}
            <button
              onClick={handleLogout}
              title="Log Out or Switch Pal"
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Primary Action Button */}
            <button
              onClick={() => {
                playPopSound();
                setActiveChallengeTag(undefined);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95"
            >
              <Palette className="w-4 h-4" />
              <span>Create Art</span>
            </button>
          </div>
        </div>
      </header>

      {/* Screen Time & Safety Gentle Ribbon */}
      <aside aria-label="Screen time guardian" className="bg-gradient-to-r from-amber-100/80 via-orange-50 to-sky-100/80 border-b border-amber-200/50 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Safe Play Clock:</span>
            </span>
            <span className="font-bold text-amber-900 font-mono tabular-nums">
              {timeRemainingMinutes} mins left today
            </span>
            <span aria-hidden="true" className="text-slate-400">·</span>
            <span className="hidden sm:inline text-slate-600">
              Kindness Points: <strong className="text-amber-800 font-mono">{currentKid.kindnessPoints}</strong> ⭐
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                playPopSound();
                setShowParentModal(true);
              }}
              className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
            >
              <Shield className="w-3 h-3" />
              Parent Safety Active
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Screen Time Limit Reached Screen */}
        {isTimeUp ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white rounded-3xl border-4 border-amber-300 shadow-xl space-y-5 animate-fade-in my-8">
            <div className="w-20 h-20 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-4xl animate-gentle-bounce">
              🌟
            </div>
            <h2 className="text-2xl font-bold text-slate-900 font-heading">
              Great Creative Time Today!
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              You reached your daily screen time goal for WonderPals! Time to play outside, read a story, or play with family.
            </p>
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 font-semibold">
              🐾 "Pip says: Let's run around and play together outside!"
            </div>
            <button
              onClick={() => setShowParentModal(true)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
            >
              Parent PIN Unlock
            </button>
          </div>
        ) : activeTab === 'challenges' ? (
          /* Quests View */
          <ChallengesSection
            challenges={INITIAL_CHALLENGES}
            onSelectChallenge={handleSelectChallenge}
          />
        ) : activeTab === 'mypal' ? (
          /* Pet Pal & Badges View */
          <div className="max-w-3xl mx-auto space-y-6">
            <PetBuddyKindnessCard
              currentKid={currentKid}
              badges={badges}
              onOpenAvatarMaker={() => setShowAvatarModal(true)}
            />
          </div>
        ) : (
          /* Feed / Clubhouse View (Default) */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            {/* Left 8-col feed area */}
            <section className="lg:col-span-8 space-y-6">
              {/* Joyful Treehouse Hero Banner Card */}
              <div className="relative rounded-3xl overflow-hidden border border-amber-200 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 shadow-md p-6 sm:p-8 text-white">
                <div className="relative z-10 max-w-lg space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/25 backdrop-blur-md rounded-full text-xs font-bold text-white shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                    <span>Welcome to the Clubhouse!</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold font-heading leading-tight text-white drop-shadow-xs">
                    Hey {currentKid.displayName}! What will you draw or build today?
                  </h1>
                  <p className="text-xs sm:text-sm text-white/95 leading-relaxed font-medium">
                    Share your creations with safe verified pals. Give high fives, laugh at jokes, and earn kindness stars!
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => {
                        playPopSound();
                        setActiveChallengeTag(undefined);
                        setShowCreateModal(true);
                      }}
                      className="px-5 py-2.5 bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center gap-2 active:scale-95"
                    >
                      <Palette className="w-4 h-4 text-amber-600" />
                      <span>Start Drawing</span>
                    </button>
                    <button
                      onClick={() => {
                        playPopSound();
                        setActiveTab('challenges');
                      }}
                      className="px-4 py-2.5 bg-black/20 hover:bg-black/30 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-sm transition-all flex items-center gap-1.5"
                    >
                      <span>Join Super Quests</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subtle hero art accent in background */}
                <img
                  src={HERO_BANNER_IMG}
                  alt="Kids art treehouse"
                  referrerPolicy="no-referrer"
                  className="absolute right-0 top-0 w-2/3 h-full object-cover opacity-20 pointer-events-none mix-blend-overlay"
                />
              </div>

              {/* Feed Category Segmented Controls (Interactive Buttons Allowed per Rule 1.A) */}
              <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'All Stories', emoji: '🌟' },
                  { id: 'drawing', label: 'Drawings', emoji: '🎨' },
                  { id: 'craft', label: 'Crafts & Toys', emoji: '🤖' },
                  { id: 'voice', label: 'Voice Notes', emoji: '🎙️' },
                  { id: 'joke', label: 'Giggles & Jokes', emoji: '😂' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playPopSound();
                      setCategoryFilter(cat.id as 'all' | PostCategory);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                      categoryFilter === cat.id
                        ? 'bg-amber-400 text-amber-950 shadow-xs font-extrabold scale-102'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>

              {/* Posts Feed List */}
              <div className="space-y-6">
                {filteredPosts.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                    <p className="text-3xl">🎨</p>
                    <h3 className="text-base font-bold text-slate-800">No creations in this category yet!</h3>
                    <p className="text-xs text-slate-500">Be the first pal to share one today!</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl"
                    >
                      Create Now
                    </button>
                  </div>
                ) : (
                  filteredPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      currentKid={currentKid}
                      onReact={handleReactToPost}
                      onAddComment={handleAddComment}
                      onReport={handleReportPost}
                    />
                  ))
                )}
              </div>
            </section>

            {/* Right 4-col Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {/* Pet Companion & Kindness Progress */}
              <PetBuddyKindnessCard
                currentKid={currentKid}
                badges={badges}
                onOpenAvatarMaker={() => setShowAvatarModal(true)}
              />

              {/* Featured Quest Widget */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Featured Quest</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                    2 days left
                  </span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-slate-900 font-heading">
                    Dream Treehouse Quest 🏡
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Draw your ultimate treehouse retreat with rope bridges, a water slide, or a pet hammock!
                  </p>
                </div>

                <button
                  onClick={() => handleSelectChallenge('Dream Treehouse Quest 🏡')}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Submit My Treehouse (+50 pts)</span>
                </button>
              </div>

              {/* Safe Community Promise Card */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-3xl border border-emerald-200 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Shield className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm">WonderPals Safe Pledge</h4>
                </div>
                <ul className="text-xs text-emerald-900/80 space-y-2 font-medium">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Kindness only: High fives & encouraging cheers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>No personal info, phone numbers, or private locations</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Parent PIN dashboard for daily screen time limits</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Pattern 1 from Mobile Design Reference) */}
      <nav className="md:hidden sticky bottom-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1">
        <div className="grid grid-cols-4 items-center h-14">
          <button
            onClick={() => {
              playPopSound();
              setActiveTab('feed');
            }}
            className={`flex flex-col items-center justify-center py-1 ${
              activeTab === 'feed' ? 'text-amber-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Compass className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Clubhouse</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('challenges');
            }}
            className={`flex flex-col items-center justify-center py-1 ${
              activeTab === 'challenges' ? 'text-amber-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Quests</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setActiveTab('mypal');
            }}
            className={`flex flex-col items-center justify-center py-1 ${
              activeTab === 'mypal' ? 'text-amber-600 font-bold' : 'text-slate-500'
            }`}
          >
            <Smile className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Pet Pal</span>
          </button>

          <button
            onClick={() => {
              playPopSound();
              setShowParentModal(true);
            }}
            className="flex flex-col items-center justify-center py-1 text-emerald-600"
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 font-bold">Parents</span>
          </button>
        </div>
      </nav>

      {/* Modals */}
      {showCreateModal && (
        <CreateStudioModal
          currentKid={currentKid}
          initialChallengeTag={activeChallengeTag}
          onPostCreated={handlePostCreated}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showAvatarModal && (
        <AvatarCreatorModal
          currentAvatar={currentKid.avatar}
          onSave={handleAvatarSaved}
          onClose={() => setShowAvatarModal(false)}
        />
      )}

      {showFriendsModal && (
        <FriendsModal
          currentKid={currentKid}
          onClose={() => setShowFriendsModal(false)}
        />
      )}

      {showParentModal && (
        <ParentDashboard
          currentKid={currentKid}
          allKids={kidsList}
          settings={parentSettings}
          onUpdateSettings={(newSettings) => setParentSettings(newSettings)}
          onSelectKid={(kidId) => setCurrentKidId(kidId)}
          onAddNewKid={(newKid) => {
            setKidsList((prev) => [...prev, newKid]);
            setCurrentKidId(newKid.id);
          }}
          onClose={() => setShowParentModal(false)}
        />
      )}
    </div>
  );
}
