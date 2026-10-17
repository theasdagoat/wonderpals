import React, { useState } from 'react';
import { Post, ReactionType, KidProfile, SafeComment } from '../types';
import { KidAvatarView } from './KidAvatarView';
import {
  playHighFiveBoing,
  playStarTwinkle,
  playPopSound,
  playChimeSound,
} from '../utils/soundEffects';
import {
  PRESET_SAFE_COMPLIMENTS,
  checkKidTextSafety,
  REPORT_REASONS,
  FUN_STICKERS,
} from '../utils/safetyFilter';
import {
  Heart,
  Volume2,
  VolumeX,
  Play,
  Pause,
  MessageCircle,
  ShieldAlert,
  Sparkles,
  Send,
  Eye,
  CheckCircle,
  HelpCircle,
  X,
} from 'lucide-react';

interface PostCardProps {
  post: Post;
  currentKid: KidProfile;
  onReact: (postId: string, reactionType: ReactionType) => void;
  onAddComment: (postId: string, comment: SafeComment) => void;
  onReport: (postId: string, reason: string) => void;
}

const REACTION_CONFIGS: {
  type: ReactionType;
  label: string;
  emoji: string;
  bgColor: string;
  textColor: string;
  ringColor: string;
}[] = [
  { type: 'highFive', label: 'High Five', emoji: '✋', bgColor: 'bg-amber-50', textColor: 'text-amber-800', ringColor: 'ring-amber-300' },
  { type: 'superStar', label: 'Star', emoji: '⭐', bgColor: 'bg-yellow-50', textColor: 'text-yellow-800', ringColor: 'ring-yellow-300' },
  { type: 'warmHug', label: 'Hug', emoji: '🤗', bgColor: 'bg-sky-50', textColor: 'text-sky-800', ringColor: 'ring-sky-300' },
  { type: 'loveIt', label: 'Love it', emoji: '💖', bgColor: 'bg-rose-50', textColor: 'text-rose-800', ringColor: 'ring-rose-300' },
  { type: 'bigLaugh', label: 'Giggle', emoji: '😂', bgColor: 'bg-purple-50', textColor: 'text-purple-800', ringColor: 'ring-purple-300' },
  { type: 'rainbow', label: 'Magic', emoji: '🌈', bgColor: 'bg-emerald-50', textColor: 'text-emerald-800', ringColor: 'ring-emerald-300' },
];

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentKid,
  onReact,
  onAddComment,
  onReport,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [revealedJoke, setRevealedJoke] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [commentError, setCommentError] = useState<string | null>(null);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Audio Playback Simulation
  const handlePlayAudio = () => {
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
      return;
    }
    playChimeSound();
    setIsPlayingAudio(true);
    setAudioProgress(0);

    const duration = post.audioDurationSeconds || 6;
    const interval = 200;
    const steps = (duration * 1000) / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      setAudioProgress((step / steps) * 100);
      if (step >= steps) {
        clearInterval(timer);
        setIsPlayingAudio(false);
        setAudioProgress(100);
      }
    }, interval);
  };

  const handleReactionClick = (reactionType: ReactionType) => {
    if (reactionType === 'highFive') {
      playHighFiveBoing();
    } else if (reactionType === 'superStar' || reactionType === 'rainbow') {
      playStarTwinkle();
    } else {
      playPopSound();
    }
    onReact(post.id, reactionType);
  };

  const handleSendPresetComment = (presetText: string, sticker?: string) => {
    playPopSound();
    const newComment: SafeComment = {
      id: 'c-' + Date.now(),
      authorId: currentKid.id,
      authorName: currentKid.displayName,
      authorAvatar: currentKid.avatar,
      text: presetText,
      sticker: sticker || selectedSticker || undefined,
      timestamp: 'Just now',
    };
    onAddComment(post.id, newComment);
    setSelectedSticker(null);
  };

  const handleSendCustomComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const safety = checkKidTextSafety(commentInput);
    if (!safety.isSafe) {
      setCommentError(safety.reason || 'Please use friendly words!');
      return;
    }

    playPopSound();
    const newComment: SafeComment = {
      id: 'c-' + Date.now(),
      authorId: currentKid.id,
      authorName: currentKid.displayName,
      authorAvatar: currentKid.avatar,
      text: commentInput.trim(),
      sticker: selectedSticker || undefined,
      timestamp: 'Just now',
    };
    onAddComment(post.id, newComment);
    setCommentInput('');
    setSelectedSticker(null);
    setCommentError(null);
  };

  const categoryEmojis: Record<string, string> = {
    drawing: '🎨 Drawing',
    craft: '🤖 Craft & Build',
    voice: '🎙️ Voice Note',
    joke: '😂 Joke & Riddle',
    story: '📖 Mini Tale',
  };

  return (
    <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <KidAvatarView avatar={post.authorAvatar} size="md" showPetBadge={true} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                {post.authorName}
              </h3>
              <span className="text-xs text-slate-500 shrink-0">Age {post.authorAge}</span>
            </div>
            {/* Super Title / Badge */}
            {post.authorBadge && (
              <p className="text-xs text-amber-700 font-semibold truncate">
                {post.authorBadge}
              </p>
            )}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{categoryEmojis[post.category] || post.category}</span>
              <span aria-hidden="true">·</span>
              <span>{post.createdAt}</span>
            </div>
          </div>
        </div>

        {/* Safety / Report Button */}
        <button
          onClick={() => {
            playPopSound();
            setShowReportModal(true);
          }}
          title="Safe Guard: Report to Parent or Moderator"
          className="text-slate-400 hover:text-amber-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors shrink-0"
        >
          <ShieldAlert className="w-4 h-4" />
        </button>
      </div>

      {/* Post Title & Description */}
      <div className="px-4 sm:px-5 pb-3">
        <h4 className="text-base sm:text-lg font-bold text-slate-900 font-heading">
          {post.title}
        </h4>
        {post.description && (
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            {post.description}
          </p>
        )}
        {post.challengeTag && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-xl border border-amber-200 text-xs font-bold text-amber-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quest: {post.challengeTag}</span>
          </div>
        )}
      </div>

      {/* Media Slot */}
      {/* 1. Canvas Drawing or Uploaded Image */}
      {(post.drawingDataUrl || post.imageUrl) && (
        <div className="relative px-4 sm:px-5 pb-3">
          <div
            onClick={() => setLightboxOpen(true)}
            className="group relative rounded-2xl overflow-hidden border border-slate-200/80 bg-slate-50 cursor-pointer max-h-96 flex items-center justify-center shadow-inner"
          >
            <img
              src={post.drawingDataUrl || post.imageUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="w-full object-cover max-h-96 group-hover:scale-[1.01] transition-transform duration-300"
            />
            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Zoom Artwork</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Voice Note Player */}
      {post.category === 'voice' && (
        <div className="px-4 sm:px-5 pb-3">
          <div className="p-4 bg-gradient-to-r from-sky-50 via-indigo-50 to-purple-50 rounded-2xl border border-sky-200/80 flex items-center gap-4">
            <button
              onClick={handlePlayAudio}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all shrink-0"
            >
              {isPlayingAudio ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white ml-0.5" />
              )}
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                <span>{isPlayingAudio ? 'Listening to Pal Voice...' : 'Play Voice Greeting'}</span>
                <span>{post.audioDurationSeconds || 6}s</span>
              </div>

              {/* Progress bar with animated waveform simulation */}
              <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-sky-200 flex items-center p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-indigo-500 rounded-full transition-all duration-200"
                  style={{ width: `${isPlayingAudio ? audioProgress : 0}%` }}
                />
              </div>

              {post.audioNoteText && (
                <p className="text-xs text-indigo-900 font-medium italic mt-2">
                  "{post.audioNoteText}"
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Joke & Riddle Tap to Reveal */}
      {post.category === 'joke' && post.jokeAnswer && (
        <div className="px-4 sm:px-5 pb-3">
          <div
            onClick={() => {
              playPopSound();
              setRevealedJoke(!revealedJoke);
            }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-center select-none ${
              revealedJoke
                ? 'bg-amber-50 border-amber-300'
                : 'bg-purple-50 border-dashed border-purple-300 hover:bg-purple-100/70'
            }`}
          >
            {revealedJoke ? (
              <div>
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
                  Punchline:
                </p>
                <p className="text-base sm:text-lg font-bold text-slate-900 animate-gentle-bounce">
                  {post.jokeAnswer}
                </p>
                <p className="text-[11px] text-amber-600 mt-2 font-medium">
                  Tap to hide again
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-purple-700 font-bold text-sm">
                <span>🙈</span>
                <span>Tap here to reveal the funny answer!</span>
                <span>✨</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Positivity Reaction Bar */}
      <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
          {REACTION_CONFIGS.map((rx) => {
            const hasReacted = post.userReactions.includes(rx.type);
            const count = post.reactions[rx.type] || 0;
            return (
              <button
                key={rx.type}
                onClick={() => handleReactionClick(rx.type)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 active:scale-90 ${
                  hasReacted
                    ? `${rx.bgColor} ${rx.textColor} ring-2 ${rx.ringColor} shadow-sm font-extrabold scale-105`
                    : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span className="text-base">{rx.emoji}</span>
                <span className="font-mono tabular-nums">{count}</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              playPopSound();
              setShowComments(!showComments);
            }}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-mono tabular-nums">{post.comments.length}</span>
            <span className="hidden sm:inline">Compliments</span>
          </button>
        </div>
      </div>

      {/* Comments & Kind Compliments Area */}
      {showComments && (
        <div className="px-4 sm:px-5 py-4 bg-slate-50 border-t border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>💖 Encouraging Words & Compliments</span>
            </h5>
            <span className="text-[11px] text-slate-400">Kid-Safe Moderated</span>
          </div>

          {/* Quick 1-Tap Compliments Carousel */}
          <div>
            <p className="text-[11px] font-semibold text-slate-500 mb-2">
              Tap a friendly cheer to send instantly:
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {PRESET_SAFE_COMPLIMENTS.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendPresetComment(preset.text, preset.sticker)}
                  className="px-3 py-1.5 bg-white hover:bg-amber-50 hover:border-amber-300 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition-all shrink-0 active:scale-95 shadow-2xs"
                >
                  {preset.text}
                </button>
              ))}
            </div>
          </div>

          {/* Sticker picker for comments */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 shrink-0">Add Sticker:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {FUN_STICKERS.slice(0, 8).map((stk) => (
                <button
                  key={stk.id}
                  onClick={() => {
                    playPopSound();
                    setSelectedSticker(selectedSticker === stk.emoji ? null : stk.emoji);
                  }}
                  className={`w-7 h-7 rounded-lg text-base flex items-center justify-center transition-transform ${
                    selectedSticker === stk.emoji
                      ? 'bg-amber-200 ring-2 ring-amber-400 scale-110'
                      : 'hover:bg-slate-200/70'
                  }`}
                >
                  {stk.emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Safe Input Form */}
          <form onSubmit={handleSendCustomComment} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={selectedSticker ? `Sending with ${selectedSticker}... Type a kind message` : "Type something kind..."}
                value={commentInput}
                onChange={(e) => {
                  setCommentInput(e.target.value);
                  setCommentError(null);
                }}
                className="w-full px-4 py-2.5 bg-white rounded-2xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 shadow-2xs"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

          {commentError && (
            <p className="text-xs font-bold text-amber-700 bg-amber-100/70 p-2 rounded-xl">
              ⚠️ {commentError}
            </p>
          )}

          {/* Comment List */}
          <div className="space-y-2.5 pt-2">
            {post.comments.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-2">
                Be the first to share an encouraging cheer! ✨
              </p>
            ) : (
              post.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="flex items-start gap-2.5 p-2.5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs"
                >
                  <KidAvatarView avatar={comment.authorAvatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 truncate">
                        {comment.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                      {comment.text}
                      {comment.sticker && <span className="ml-1.5 text-sm">{comment.sticker}</span>}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Artwork Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-4xl max-h-[90vh] bg-white rounded-3xl p-3 shadow-2xl flex flex-col items-center">
            <button
              onClick={() => {
                playPopSound();
                setLightboxOpen(false);
              }}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-900/70 text-white hover:bg-slate-900 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={post.drawingDataUrl || post.imageUrl}
              alt={post.title}
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto rounded-2xl object-contain"
            />
            <div className="mt-2 text-center">
              <h4 className="font-bold text-slate-800">{post.title}</h4>
              <p className="text-xs text-slate-500">By {post.authorName} (Age {post.authorAge})</p>
            </div>
          </div>
        </div>
      )}

      {/* Kid Safety Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border-4 border-amber-300 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700">
                <ShieldAlert className="w-6 h-6" />
                <h3 className="font-bold text-slate-900 font-heading text-lg">
                  Safety Guardian
                </h3>
              </div>
              <button
                onClick={() => {
                  playPopSound();
                  setShowReportModal(false);
                  setReportSubmitted(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSubmitted ? (
              <div className="text-center py-4 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce-gentle" />
                <h4 className="font-bold text-slate-900 text-base">
                  Thank You for Keeping Us Safe!
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  You did the right thing! We sent a friendly notification to the safety team and parent dashboard to check this post right away.
                </p>
                <button
                  onClick={() => {
                    playPopSound();
                    setShowReportModal(false);
                    setReportSubmitted(false);
                  }}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Back to WonderPals
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Did something on this post make you feel uncomfortable or unsafe? Tell us why and our guardian team will check it immediately:
                </p>
                <div className="space-y-2">
                  {REPORT_REASONS.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        playChimeSound();
                        onReport(post.id, r);
                        setReportSubmitted(true);
                      }}
                      className="w-full p-3 text-left rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50 text-xs font-semibold text-slate-700 transition-all flex items-center justify-between"
                    >
                      <span>{r}</span>
                      <span className="text-amber-500">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
};
