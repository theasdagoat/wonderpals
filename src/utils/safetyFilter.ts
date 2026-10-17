// Safe Moderation and Anti-Bullying Engine for WonderPals

export interface SafetyCheckResult {
  isSafe: boolean;
  reason?: string;
  cleanedText?: string;
  suggestedAlternative?: string;
}

// Banned or sensitive words for kids
const BLOCKED_WORDS = [
  'hate', 'ugly', 'stupid', 'loser', 'dumb', 'idiot', 'shut up', 'fat',
  'kill', 'die', 'punch', 'attack', 'freak', 'worst', 'garbage', 'trash',
  'bad', 'terrible', 'boring', 'poophead', 'smelly', 'butt'
];

// Patterns for private personal data (phone numbers, emails, addresses)
const PHONE_REGEX = /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const ADDRESS_KEYWORDS = ['my address is', 'i live at', 'meet me at', 'street', 'road', 'avenue'];

// Curated Kid-Safe Positive Phrases for 1-Tap Compliments
export const PRESET_SAFE_COMPLIMENTS = [
  { text: "This made me smile! 🌟", category: "kindness", sticker: "🌟" },
  { text: "You are super creative! 🎨", category: "art", sticker: "🎨" },
  { text: "I love the bright colors! 🌈", category: "art", sticker: "🌈" },
  { text: "High five! Awesome job! ✋", category: "cheer", sticker: "✋" },
  { text: "Haha this is so funny! 😂", category: "humor", sticker: "😂" },
  { text: "Can you teach me how to make this? 💡", category: "learning", sticker: "💡" },
  { text: "10 out of 10 sparkles! ✨", category: "cheer", sticker: "✨" },
  { text: "You're a true art master! 🏆", category: "art", sticker: "🏆" },
  { text: "My pet buddy loved this! 🐾", category: "pet", sticker: "🐾" },
  { text: "Keep shining bright! 🚀", category: "cheer", sticker: "🚀" }
];

export const FUN_STICKERS = [
  { id: 'star', emoji: '⭐', label: 'Super Star' },
  { id: 'rainbow', emoji: '🌈', label: 'Rainbow' },
  { id: 'heart', emoji: '💖', label: 'Heart' },
  { id: 'rocket', emoji: '🚀', label: 'Rocket' },
  { id: 'smile', emoji: '😄', label: 'Big Smile' },
  { id: 'paw', emoji: '🐾', label: 'Pet Paw' },
  { id: 'brush', emoji: '🎨', label: 'Art Brush' },
  { id: 'cookie', emoji: '🍪', label: 'Cookie' },
  { id: 'flower', emoji: '🌸', label: 'Flower' },
  { id: 'crown', emoji: '👑', label: 'Crown' },
  { id: 'dino', emoji: '🦖', label: 'Dino' },
  { id: 'sun', emoji: '☀️', label: 'Sunshine' }
];

export function checkKidTextSafety(input: string): SafetyCheckResult {
  const text = input.trim();
  if (!text) {
    return { isSafe: true, cleanedText: '' };
  }

  // 1. Check for personal identifiable information (PII)
  if (PHONE_REGEX.test(text)) {
    return {
      isSafe: false,
      reason: "To stay safe, please don't share phone numbers on WonderPals!",
      suggestedAlternative: "Ask a parent or teacher if you want to share contact info."
    };
  }

  if (EMAIL_REGEX.test(text)) {
    return {
      isSafe: false,
      reason: "Let's keep emails private! Keep your personal info safe.",
      suggestedAlternative: "Share a cool drawing or greeting instead!"
    };
  }

  const lower = text.toLowerCase();
  for (const kw of ADDRESS_KEYWORDS) {
    if (lower.includes(kw)) {
      return {
        isSafe: false,
        reason: "For your safety, never share your home address online.",
        suggestedAlternative: "Tell us about your favorite playground or planet instead!"
      };
    }
  }

  // 2. Check for unkind/mean words
  for (const word of BLOCKED_WORDS) {
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
    if (wordRegex.test(text)) {
      return {
        isSafe: false,
        reason: "Let's keep WonderPals super kind and encouraging! That word isn't friendly.",
        suggestedAlternative: "Try: 'You did your best!' or 'Nice try, keep practicing!'"
      };
    }
  }

  return { isSafe: true, cleanedText: text };
}

export const REPORT_REASONS = [
  "Contains unkind words",
  "Seems like personal information",
  "Scary or not for kids",
  "Other reason for parents to check"
];
