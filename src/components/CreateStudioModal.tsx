import React, { useRef, useState, useEffect } from 'react';
import { KidProfile, Post, PostCategory } from '../types';
import { checkKidTextSafety, FUN_STICKERS } from '../utils/safetyFilter';
import {
  playPopSound,
  playSuccessFanfare,
  playChimeSound,
  playDrawingBrushTick,
} from '../utils/soundEffects';
import {
  X,
  Palette,
  Mic,
  Smile,
  Undo2,
  Trash2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

interface CreateStudioModalProps {
  currentKid: KidProfile;
  initialChallengeTag?: string;
  onPostCreated: (post: Post) => void;
  onClose: () => void;
}

type DrawingTool = 'pencil' | 'marker' | 'glow' | 'rainbow' | 'eraser' | 'stamp';

const COLOR_PALETTE = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber/Yellow
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#78350f', // Brown
  '#0f172a', // Black/Slate
  '#ffffff', // White
];

export const CreateStudioModal: React.FC<CreateStudioModalProps> = ({
  currentKid,
  initialChallengeTag,
  onPostCreated,
  onClose,
}) => {
  const [category, setCategory] = useState<PostCategory>('drawing');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [jokeAnswer, setJokeAnswer] = useState('');
  const [challengeTag, setChallengeTag] = useState(initialChallengeTag || '');

  // Drawing state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<DrawingTool>('pencil');
  const [strokeColor, setStrokeColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(10);
  const [selectedSticker, setSelectedSticker] = useState('⭐');
  const [hasDrawnSomething, setHasDrawnSomething] = useState(false);
  const isDrawingRef = useRef(false);
  const historyRef = useRef<ImageData[]>([]);
  const rainbowHueRef = useRef(0);

  // Audio simulation state
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioNoteText, setAudioNoteText] = useState('');
  const audioIntervalRef = useRef<number | null>(null);

  // Safety error state
  const [safetyError, setSafetyError] = useState<{ reason: string; alt?: string } | null>(null);

  // Initialize Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save initial state for undo
    historyRef.current = [ctx.getImageData(0, 0, canvas.width, canvas.height)];
  }, []);

  const saveCanvasState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(current);
    if (historyRef.current.length > 15) {
      historyRef.current.shift();
    }
  };

  const handleUndo = () => {
    playPopSound();
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length <= 1) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    historyRef.current.pop(); // Remove current
    const previous = historyRef.current[historyRef.current.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
    }
  };

  const handleClear = () => {
    playPopSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSomething(false);
    saveCanvasState();
  };

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    const { x, y } = getCanvasCoords(e);

    if (tool === 'stamp') {
      playChimeSound();
      ctx.save();
      ctx.font = `${brushSize * 3.5}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(selectedSticker, x, y);
      ctx.restore();
      setHasDrawnSomething(true);
      saveCanvasState();
      return;
    }

    isDrawingRef.current = true;
    setHasDrawnSomething(true);
    playDrawingBrushTick();

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = brushSize * 1.8;
      ctx.shadowBlur = 0;
    } else if (tool === 'rainbow') {
      rainbowHueRef.current = (rainbowHueRef.current + 8) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 90%, 55%)`;
      ctx.lineWidth = brushSize;
      ctx.shadowBlur = 0;
    } else if (tool === 'glow') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = brushSize;
      ctx.shadowColor = strokeColor;
      ctx.shadowBlur = 12;
    } else if (tool === 'marker') {
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = brushSize * 1.5;
      ctx.shadowBlur = 0;
    } else {
      // Pencil / Regular
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = brushSize;
      ctx.shadowBlur = 0;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas && canvas.hasPointerCapture(e.pointerId)) {
      canvas.releasePointerCapture(e.pointerId);
    }
    saveCanvasState();
  };

  // Audio simulation
  const toggleAudioRecording = () => {
    playPopSound();
    if (isRecordingAudio) {
      // Stop recording
      setIsRecordingAudio(false);
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
      playChimeSound();
    } else {
      // Start recording
      setIsRecordingAudio(true);
      setAudioDuration(1);
      audioIntervalRef.current = window.setInterval(() => {
        setAudioDuration((prev) => {
          if (prev >= 15) {
            setIsRecordingAudio(false);
            if (audioIntervalRef.current) clearInterval(audioIntervalRef.current);
            return 15;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handlePublish = () => {
    // Validate title & text safety
    if (!title.trim()) {
      setSafetyError({ reason: 'Please give your creation a fun title!' });
      return;
    }

    const titleSafety = checkKidTextSafety(title);
    if (!titleSafety.isSafe) {
      setSafetyError({ reason: titleSafety.reason || 'Unsafe words', alt: titleSafety.suggestedAlternative });
      return;
    }

    const descSafety = checkKidTextSafety(description);
    if (!descSafety.isSafe) {
      setSafetyError({ reason: descSafety.reason || 'Unsafe words', alt: descSafety.suggestedAlternative });
      return;
    }

    if (jokeAnswer) {
      const jokeSafety = checkKidTextSafety(jokeAnswer);
      if (!jokeSafety.isSafe) {
        setSafetyError({ reason: jokeSafety.reason || 'Unsafe words', alt: jokeSafety.suggestedAlternative });
        return;
      }
    }

    // Get drawing image if drawn
    let drawingDataUrl: string | undefined = undefined;
    if (category === 'drawing' && hasDrawnSomething && canvasRef.current) {
      drawingDataUrl = canvasRef.current.toDataURL('image/png');
    }

    const newPost: Post = {
      id: 'post-' + Date.now(),
      authorId: currentKid.id,
      authorName: currentKid.displayName,
      authorAge: currentKid.age,
      authorAvatar: currentKid.avatar,
      authorBadge: currentKid.superTitle,
      category,
      title: title.trim(),
      description: description.trim(),
      mediaType: drawingDataUrl ? 'canvas' : category === 'voice' ? 'voice' : 'textOnly',
      drawingDataUrl,
      audioDurationSeconds: category === 'voice' ? audioDuration || 6 : undefined,
      audioNoteText: category === 'voice' ? (audioNoteText || '♪ Listen to my cool voice message! ♪') : undefined,
      jokeAnswer: category === 'joke' ? jokeAnswer.trim() : undefined,
      challengeTag: challengeTag || undefined,
      reactions: {
        highFive: 1,
        superStar: 1,
        warmHug: 0,
        loveIt: 1,
        bigLaugh: 0,
        rainbow: 1,
      },
      userReactions: ['superStar'],
      comments: [],
      createdAt: 'Just now',
      isParentApproved: true,
    };

    playSuccessFanfare();
    onPostCreated(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-amber-200 via-orange-100 to-yellow-100 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-spin-slow">🎨</span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-heading leading-tight">
                WonderStudio: Create & Share
              </h2>
              <p className="text-[11px] text-amber-900/70 font-medium">
                Express your imagination in a safe, friendly space!
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

        {/* Studio Content */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-5">
          {/* Category Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              What do you want to create today?
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'drawing', label: 'Drawing', emoji: '🎨' },
                { id: 'craft', label: 'Craft & Toy', emoji: '🤖' },
                { id: 'voice', label: 'Voice Note', emoji: '🎙️' },
                { id: 'joke', label: 'Giggle Joke', emoji: '😂' },
                { id: 'story', label: 'Mini Tale', emoji: '📖' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    playPopSound();
                    setCategory(c.id as PostCategory);
                  }}
                  className={`py-2 px-1 rounded-2xl border text-center transition-all ${
                    category === c.id
                      ? 'border-amber-500 bg-amber-50 font-bold text-amber-950 ring-2 ring-amber-200 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <div className="text-xl">{c.emoji}</div>
                  <div className="text-[11px] mt-1 truncate">{c.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Canvas Section if Drawing */}
          {category === 'drawing' && (
            <div className="space-y-3">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                {/* Tools */}
                <div className="flex items-center gap-1">
                  {[
                    { id: 'pencil', label: 'Pencil', icon: '✏️' },
                    { id: 'marker', label: 'Marker', icon: '🖍️' },
                    { id: 'glow', label: 'Glow Pen', icon: '✨' },
                    { id: 'rainbow', label: 'Rainbow', icon: '🌈' },
                    { id: 'stamp', label: 'Stickers', icon: '⭐' },
                    { id: 'eraser', label: 'Eraser', icon: '🧽' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        playPopSound();
                        setTool(t.id as DrawingTool);
                      }}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                        tool === t.id
                          ? 'bg-amber-400 text-amber-950 shadow-sm font-bold scale-105'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>{t.icon}</span>
                      <span className="hidden sm:inline">{t.label}</span>
                    </button>
                  ))}
                </div>

                {/* Undo & Clear */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleUndo}
                    title="Undo"
                    className="p-1.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600"
                  >
                    <Undo2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleClear}
                    title="Clear Canvas"
                    className="p-1.5 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tool sub-options: Colors or Stickers */}
              {tool === 'stamp' ? (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl overflow-x-auto border border-amber-200">
                  <span className="text-xs font-bold text-amber-800 shrink-0">Tap sticker, then tap canvas:</span>
                  {FUN_STICKERS.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        playPopSound();
                        setSelectedSticker(s.emoji);
                      }}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0 transition-transform ${
                        selectedSticker === s.emoji
                          ? 'bg-white shadow-md ring-2 ring-amber-400 scale-110'
                          : 'hover:scale-105 bg-white/70'
                      }`}
                    >
                      {s.emoji}
                    </button>
                  ))}
                </div>
              ) : tool !== 'eraser' && tool !== 'rainbow' ? (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl overflow-x-auto border border-slate-200">
                  <span className="text-xs font-bold text-slate-500 shrink-0">Color:</span>
                  <div className="flex items-center gap-1.5">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        onClick={() => {
                          playPopSound();
                          setStrokeColor(c);
                        }}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          strokeColor === c
                            ? 'scale-125 border-slate-900 shadow-md ring-2 ring-amber-300'
                            : 'border-white hover:scale-110'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  {/* Size slider */}
                  <div className="ml-auto flex items-center gap-1.5 shrink-0 text-xs text-slate-500 font-medium">
                    <span>Size:</span>
                    <input
                      type="range"
                      min={4}
                      max={32}
                      value={brushSize}
                      onChange={(e) => setBrushSize(Number(e.target.value))}
                      className="w-20 accent-amber-500"
                    />
                  </div>
                </div>
              ) : null}

              {/* The Drawing Canvas */}
              <div className="relative border-4 border-dashed border-amber-200 rounded-3xl overflow-hidden bg-white shadow-inner flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={380}
                  onPointerDown={startDrawing}
                  onPointerMove={draw}
                  onPointerUp={stopDrawing}
                  onPointerCancel={stopDrawing}
                  className="w-full max-w-full touch-none cursor-crosshair h-64 sm:h-80"
                />
                {!hasDrawnSomething && (
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-slate-300 gap-2">
                    <Palette className="w-10 h-10 opacity-40 animate-gentle-bounce" />
                    <p className="text-sm font-semibold opacity-60">Draw anything you imagine here!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Voice Note Simulation */}
          {category === 'voice' && (
            <div className="p-6 bg-gradient-to-b from-sky-50 to-indigo-50/50 rounded-3xl border-2 border-sky-200 text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-lg border-4 border-sky-300 flex items-center justify-center">
                <Mic className={`w-9 h-9 ${isRecordingAudio ? 'text-rose-500 animate-pulse' : 'text-sky-500'}`} />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {isRecordingAudio ? 'Recording Your Voice Message...' : 'Record a Friendly Voice Greeting!'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sing a song, tell a funny greeting, or share what you did today!
                </p>
              </div>

              {/* Animated waveform bars */}
              {isRecordingAudio && (
                <div className="flex items-center justify-center gap-1.5 h-10 py-1">
                  {[40, 70, 95, 60, 85, 100, 75, 45, 90, 65, 80, 50].map((h, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-rose-500 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 0.08}s`,
                      }}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggleAudioRecording}
                  className={`px-6 py-2.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center gap-2 ${
                    isRecordingAudio
                      ? 'bg-rose-500 hover:bg-rose-600 text-white animate-bounce-gentle'
                      : 'bg-sky-500 hover:bg-sky-600 text-white'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  {isRecordingAudio ? `Stop (${audioDuration}s)` : 'Tap to Record Voice'}
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Optional: What is your voice note about? (e.g., Happy Thursday song!)"
                  value={audioNoteText}
                  onChange={(e) => setAudioNoteText(e.target.value)}
                  className="w-full max-w-md px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>
          )}

          {/* Title & Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Title of your creation <span className="text-amber-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Give your creation an exciting title!"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSafetyError(null);
                }}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Story / Tell pals about it (optional)
              </label>
              <textarea
                rows={2}
                placeholder="What inspired you? Any fun details you want to tell friends?"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setSafetyError(null);
                }}
                className="w-full px-4 py-2 rounded-2xl border border-slate-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-200 text-xs text-slate-700 placeholder-slate-400 outline-none resize-none"
              />
            </div>

            {/* Joke Answer Field */}
            {category === 'joke' && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                <label className="block text-xs font-bold text-amber-900 mb-1">
                  Punchline / Riddle Answer (Pals can tap to reveal!)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Because it had too many problems!"
                  value={jokeAnswer}
                  onChange={(e) => {
                    setJokeAnswer(e.target.value);
                    setSafetyError(null);
                  }}
                  className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 text-xs font-medium text-slate-800 outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            )}

            {/* Challenge Tag */}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Link to a Super Quest Challenge?
              </label>
              <select
                value={challengeTag}
                onChange={(e) => setChallengeTag(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 outline-none focus:ring-2 focus:ring-amber-300"
              >
                <option value="">No challenge (Free creation)</option>
                <option value="Dream Treehouse Quest 🏡">Dream Treehouse Quest 🏡 (+50 points)</option>
                <option value="Recycled Robot Challenge 🤖">Recycled Robot Challenge 🤖 (+40 points)</option>
              </select>
            </div>
          </div>

          {/* Safety Error Banner if triggered */}
          {safetyError && (
            <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-300 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-amber-900">{safetyError.reason}</p>
                {safetyError.alt && (
                  <p className="text-amber-700 mt-1 font-medium">{safetyError.alt}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
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
            onClick={handlePublish}
            className="px-7 py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-sm rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 transform active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            Share with Pals! ✨
          </button>
        </div>
      </div>
    </div>
  );
};
