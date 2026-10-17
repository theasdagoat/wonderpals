export type PostCategory = 'drawing' | 'craft' | 'voice' | 'joke' | 'story';

export type ReactionType = 'highFive' | 'superStar' | 'warmHug' | 'loveIt' | 'bigLaugh' | 'rainbow';

export interface ReactionConfig {
  type: ReactionType;
  label: string;
  emoji: string;
  color: string;
  sound: string;
}

export interface KidAvatar {
  skinColor: string;
  hairStyle: 'curls' | 'spiky' | 'braids' | 'smooth' | 'afro' | 'bob';
  hairColor: string;
  accessory: 'none' | 'glasses' | 'bearEars' | 'starHat' | 'spaceHelmet' | 'crown';
  shirtColor: string;
  expression: 'happy' | 'winking' | 'excited' | 'cool';
  petBuddy: 'spacePup' | 'starKitten' | 'happyDino' | 'magicBunny';
}

export interface KidProfile {
  id: string;
  username: string;
  displayName: string;
  age: number;
  avatar: KidAvatar;
  kindnessPoints: number;
  level: number;
  superTitle: string;
  unlockedBadges: string[];
  friendsCount: number;
  dailyTimeLimitMinutes: number;
  minutesUsedToday: number;
  picturePasscode?: string[];
}

export interface AuthSession {
  role: 'kid' | 'parent';
  kidId?: string;
  parentEmail?: string;
}

export interface SafeComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: KidAvatar;
  text: string;
  sticker?: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAge: number;
  authorAvatar: KidAvatar;
  authorBadge?: string;
  category: PostCategory;
  title: string;
  description: string;
  mediaType: 'canvas' | 'image' | 'voice' | 'textOnly';
  drawingDataUrl?: string;
  imageUrl?: string;
  audioDurationSeconds?: number;
  audioNoteText?: string;
  jokeAnswer?: string;
  challengeTag?: string;
  reactions: Record<ReactionType, number>;
  userReactions: ReactionType[];
  comments: SafeComment[];
  createdAt: string;
  isParentApproved: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  category: PostCategory;
  description: string;
  imagePrompt: string;
  imageUrl: string;
  badgeReward: string;
  pointsReward: number;
  participantsCount: number;
  endsIn: string;
}

export interface KindnessBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  currentProgress: number;
  targetProgress: number;
  unlocked: boolean;
}

export interface ParentSettings {
  pin: string;
  dailyScreenLimitMinutes: number;
  safetyMode: 'strict_phrases_only' | 'smart_filtered_text';
  requireApprovalForPosting: boolean;
  quietHoursActive: boolean;
  quietHoursStart: string; // "20:00"
  quietHoursEnd: string; // "07:00"
  allowAudioNotes: boolean;
}

export interface ParentActivityLog {
  id: string;
  action: string;
  timestamp: string;
  kidName: string;
  category: 'screen_time' | 'post' | 'reaction' | 'friend';
}
