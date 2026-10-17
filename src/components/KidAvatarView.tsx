import React from 'react';
import { KidAvatar } from '../types';

interface KidAvatarViewProps {
  avatar: KidAvatar;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPetBadge?: boolean;
  className?: string;
}

export const KidAvatarView: React.FC<KidAvatarViewProps> = ({
  avatar,
  size = 'md',
  showPetBadge = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  const petEmojis: Record<string, string> = {
    spacePup: '🐶',
    starKitten: '🐱',
    happyDino: '🦖',
    magicBunny: '🐰',
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      {/* Background glow circle */}
      <div
        className="w-full h-full rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: avatar.shirtColor + '25' }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Head & Neck */}
          <circle cx="50" cy="52" r="28" fill={avatar.skinColor} />
          <path
            d="M32 78 C32 68, 68 68, 68 78 L68 100 L32 100 Z"
            fill={avatar.shirtColor}
          />
          {/* Shirt Collar */}
          <circle cx="50" cy="74" r="7" fill={avatar.skinColor} />

          {/* Hair back / Afro */}
          {avatar.hairStyle === 'afro' && (
            <circle cx="50" cy="44" r="34" fill={avatar.hairColor} opacity="0.95" />
          )}

          {/* Hair styles */}
          {avatar.hairStyle === 'spiky' && (
            <path
              d="M26 44 L34 22 L42 34 L50 18 L58 34 L66 22 L74 44 C72 26 28 26 26 44 Z"
              fill={avatar.hairColor}
            />
          )}

          {avatar.hairStyle === 'curls' && (
            <g fill={avatar.hairColor}>
              <circle cx="28" cy="38" r="10" />
              <circle cx="40" cy="26" r="11" />
              <circle cx="54" cy="24" r="11" />
              <circle cx="68" cy="28" r="10" />
              <circle cx="74" cy="40" r="9" />
            </g>
          )}

          {avatar.hairStyle === 'braids' && (
            <g fill={avatar.hairColor}>
              <path d="M26 42 Q50 20 74 42 Q50 30 26 42 Z" />
              {/* Left braid */}
              <rect x="22" y="44" width="8" height="28" rx="4" />
              {/* Right braid */}
              <rect x="70" y="44" width="8" height="28" rx="4" />
            </g>
          )}

          {avatar.hairStyle === 'smooth' && (
            <path
              d="M24 44 C24 24 76 24 76 44 C66 32 34 32 24 44 Z"
              fill={avatar.hairColor}
            />
          )}

          {avatar.hairStyle === 'bob' && (
            <g fill={avatar.hairColor}>
              <path d="M22 45 C22 22 78 22 78 45 L80 60 C80 60 74 62 70 56 L70 42 C50 32 30 42 30 56 C26 62 20 60 20 60 Z" />
            </g>
          )}

          {/* Rosy Cheeks */}
          <ellipse cx="37" cy="56" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4" />
          <ellipse cx="63" cy="56" rx="4" ry="2.5" fill="#f43f5e" opacity="0.4" />

          {/* Eyes & Expression */}
          {avatar.expression === 'winking' ? (
            <g fill="#1e293b">
              {/* Left open eye */}
              <circle cx="40" cy="50" r="3.5" />
              <circle cx="41.5" cy="48.5" r="1" fill="#ffffff" />
              {/* Right winking eye */}
              <path d="M57 51 Q62 46 67 51" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </g>
          ) : avatar.expression === 'excited' ? (
            <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M36 50 Q41 45 46 50" />
              <path d="M54 50 Q59 45 64 50" />
            </g>
          ) : (
            <g fill="#1e293b">
              <circle cx="40" cy="50" r="3.5" />
              <circle cx="41.5" cy="48.5" r="1" fill="#ffffff" />
              <circle cx="60" cy="50" r="3.5" />
              <circle cx="61.5" cy="48.5" r="1" fill="#ffffff" />
            </g>
          )}

          {/* Mouth */}
          <path
            d="M43 59 Q50 67 57 59"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="#e11d48"
          />

          {/* Accessories */}
          {avatar.accessory === 'glasses' && (
            <g stroke="#0284c7" strokeWidth="2.5" fill="rgba(255,255,255,0.25)">
              <rect x="33" y="44" width="14" height="12" rx="3" />
              <rect x="53" y="44" width="14" height="12" rx="3" />
              <line x1="47" y1="50" x2="53" y2="50" />
            </g>
          )}

          {avatar.accessory === 'bearEars' && (
            <g fill="#92400e" stroke="#78350f" strokeWidth="1">
              <circle cx="28" cy="22" r="9" />
              <circle cx="28" cy="22" r="5" fill="#fbcfe8" />
              <circle cx="72" cy="22" r="9" />
              <circle cx="72" cy="22" r="5" fill="#fbcfe8" />
            </g>
          )}

          {avatar.accessory === 'starHat' && (
            <g>
              <polygon points="50,6 60,32 40,32" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
              <circle cx="50" cy="6" r="3" fill="#ef4444" />
              <rect x="34" y="30" width="32" height="6" rx="2" fill="#ef4444" />
            </g>
          )}

          {avatar.accessory === 'spaceHelmet' && (
            <g fill="none" stroke="#38bdf8" strokeWidth="3">
              <circle cx="50" cy="48" r="38" opacity="0.75" />
              <path d="M26 30 Q34 22 46 22" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
            </g>
          )}

          {avatar.accessory === 'crown' && (
            <polygon
              points="34,28 38,16 50,22 62,16 66,28"
              fill="#fbbf24"
              stroke="#d97706"
              strokeWidth="1.5"
            />
          )}
        </svg>
      </div>

      {/* Pet Buddy Badge */}
      {showPetBadge && avatar.petBuddy && (
        <span
          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-xs border border-amber-200"
          title={`Pet: ${avatar.petBuddy}`}
        >
          {petEmojis[avatar.petBuddy] || '🐾'}
        </span>
      )}
    </div>
  );
};
