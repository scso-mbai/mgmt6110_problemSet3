import React from 'react';

interface CardArtProps {
  artId: string;
  inkColor: string;
  name: string;
  className?: string;
}

export const CardArt: React.FC<CardArtProps> = ({ artId, inkColor, name, className = '' }) => {
  const getGradient = () => {
    switch (inkColor) {
      case 'Amethyst':
        return { from: '#581c87', via: '#7e22ce', to: '#c084fc', glow: '#d8b4fe' };
      case 'Ruby':
        return { from: '#7f1d1d', via: '#b91c1c', to: '#f87171', glow: '#fca5a5' };
      case 'Sapphire':
        return { from: '#0c4a6e', via: '#0284c7', to: '#38bdf8', glow: '#7dd3fc' };
      case 'Emerald':
        return { from: '#064e3b', via: '#059669', to: '#34d399', glow: '#6ee7b7' };
      case 'Steel':
        return { from: '#1e293b', via: '#475569', to: '#94a3b8', glow: '#cbd5e1' };
      case 'Amber':
      default:
        return { from: '#78350f', via: '#d97706', to: '#fbbf24', glow: '#fde68a' };
    }
  };

  const colors = getGradient();

  const renderIllustration = () => {
    switch (artId) {
      case 'astral_sorceress':
        return (
          <g>
            <circle cx="100" cy="80" r="45" fill="none" stroke={colors.glow} strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="100" cy="80" r="28" fill="#3b0764" stroke={colors.glow} strokeWidth="2" opacity="0.9" />
            {/* Constellation lines */}
            <path d="M 60 70 L 85 55 L 115 55 L 140 70 L 125 105 L 75 105 Z" fill="none" stroke="#f3e8ff" strokeWidth="1.2" opacity="0.75" />
            {/* Mystic Starburst */}
            <path d="M 100 45 L 103 72 L 130 75 L 105 85 L 115 112 L 100 95 L 85 112 L 95 85 L 70 75 L 97 72 Z" fill="#ffffff" opacity="0.9" />
            {/* Glowing orbs */}
            <circle cx="85" cy="55" r="3.5" fill="#fef08a" />
            <circle cx="115" cy="55" r="3.5" fill="#fef08a" />
            <circle cx="60" cy="70" r="3" fill="#ffffff" />
            <circle cx="140" cy="70" r="3" fill="#ffffff" />
            <circle cx="100" cy="80" r="6" fill="#fbcfe8" />
          </g>
        );

      case 'sunlit_dragonling':
        return (
          <g>
            <circle cx="100" cy="85" r="42" fill="#450a0a" opacity="0.8" />
            {/* Wing Spans */}
            <path d="M 100 85 Q 50 35 35 65 Q 65 85 100 95" fill="#ef4444" opacity="0.85" />
            <path d="M 100 85 Q 150 35 165 65 Q 135 85 100 95" fill="#ef4444" opacity="0.85" />
            {/* Dragon head & horns */}
            <path d="M 100 60 L 88 40 L 96 62 L 104 62 L 112 40 L 100 60 Z" fill="#fef08a" />
            <path d="M 92 65 Q 100 50 108 65 Q 106 85 100 90 Q 94 85 92 65 Z" fill="#f97316" />
            {/* Ember breath burst */}
            <circle cx="100" cy="98" r="14" fill="#fbbf24" opacity="0.9" />
            <circle cx="100" cy="98" r="7" fill="#ffffff" />
            <path d="M 75 115 Q 100 100 125 115" stroke="#fde047" strokeWidth="2.5" fill="none" />
          </g>
        );

      case 'clockwork_sentinel':
        return (
          <g>
            {/* Armor chestplate & gear cog */}
            <circle cx="100" cy="80" r="38" fill="#334155" stroke={colors.glow} strokeWidth="2" />
            {/* Cog teeth */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
              <rect
                key={i}
                x="94"
                y="36"
                width="12"
                height="8"
                fill={colors.glow}
                rx="2"
                transform={`rotate(${angle} 100 80)`}
              />
            ))}
            <circle cx="100" cy="80" r="22" fill="#0f172a" />
            {/* Visor glowing eye slit */}
            <rect x="75" y="76" width="50" height="8" rx="4" fill="#38bdf8" />
            <circle cx="100" cy="80" r="5" fill="#ffffff" />
            {/* Steam vents */}
            <line x1="80" y1="95" x2="80" y2="115" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
            <line x1="120" y1="95" x2="120" y2="115" stroke="#94a3b8" strokeWidth="2" strokeDasharray="3 2" />
          </g>
        );

      case 'tidewalker_siren':
        return (
          <g>
            {/* Sea current waves */}
            <path d="M 25 110 Q 60 70 100 110 T 175 110" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.8" />
            <path d="M 35 90 Q 70 50 100 90 T 165 90" fill="none" stroke="#7dd3fc" strokeWidth="2" opacity="0.6" />
            {/* Oceanic Pearl Shell */}
            <circle cx="100" cy="72" r="32" fill="#075985" opacity="0.9" />
            <path d="M 100 48 C 80 48, 70 70, 100 86 C 130 70, 120 48, 100 48 Z" fill="#0284c7" />
            {/* Radiant pearl */}
            <circle cx="100" cy="68" r="12" fill="#f0fdfa" />
            <circle cx="97" cy="65" r="3.5" fill="#ffffff" />
            {/* Musical water ripples */}
            <circle cx="100" cy="68" r="24" fill="none" stroke="#bae6fd" strokeWidth="1.5" strokeDasharray="3 4" />
          </g>
        );

      case 'verdant_pathfinder':
        return (
          <g>
            {/* Mystic forest canopy */}
            <circle cx="100" cy="80" r="40" fill="#064e3b" opacity="0.8" />
            {/* Leaf canopy / compass rose */}
            <path d="M 100 40 L 112 75 L 145 80 L 112 85 L 100 120 L 88 85 L 55 80 L 88 75 Z" fill="#10b981" />
            <circle cx="100" cy="80" r="14" fill="#022c22" stroke="#6ee7b7" strokeWidth="1.5" />
            {/* Glowing lantern / firefly */}
            <circle cx="100" cy="80" r="5" fill="#fef08a" />
            <path d="M 70 105 Q 100 125 130 105" stroke="#a7f3d0" strokeWidth="2" fill="none" />
          </g>
        );

      case 'crown_paladin':
        return (
          <g>
            {/* Radiant shield & solar dawn */}
            <path d="M 65 50 Q 100 35 135 50 L 135 85 Q 100 125 65 85 Z" fill="#78350f" stroke="#fde68a" strokeWidth="2" />
            <path d="M 75 58 Q 100 46 125 58 L 125 82 Q 100 112 75 82 Z" fill="#d97706" />
            {/* Golden cross / sun insignia */}
            <rect x="95" y="55" width="10" height="42" rx="2" fill="#fef3c7" />
            <rect x="80" y="70" width="40" height="10" rx="2" fill="#fef3c7" />
            <circle cx="100" cy="75" r="7" fill="#ffffff" />
          </g>
        );

      case 'celestial_archive':
        return (
          <g>
            {/* Ancient tome / crystal scroll */}
            <rect x="62" y="48" width="76" height="58" rx="6" fill="#0369a1" stroke="#bae6fd" strokeWidth="2" />
            <line x1="100" y1="48" x2="100" y2="106" stroke="#082f49" strokeWidth="3" />
            <rect x="70" y="58" width="22" height="4" rx="2" fill="#e0f2fe" />
            <rect x="70" y="68" width="20" height="4" rx="2" fill="#e0f2fe" />
            <rect x="70" y="78" width="16" height="4" rx="2" fill="#e0f2fe" />
            <rect x="108" y="58" width="22" height="4" rx="2" fill="#e0f2fe" />
            <rect x="108" y="68" width="18" height="4" rx="2" fill="#e0f2fe" />
            <rect x="108" y="78" width="20" height="4" rx="2" fill="#e0f2fe" />
            {/* Floating glowing crystal atop the tome */}
            <polygon points="100,28 108,40 100,48 92,40" fill="#38bdf8" stroke="#ffffff" strokeWidth="1" />
          </g>
        );

      case 'shadowflame_inversion':
      default:
        return (
          <g>
            {/* Swirling flame vortex */}
            <circle cx="100" cy="80" r="42" fill="#450a0a" opacity="0.85" />
            <path d="M 100 40 Q 140 70 120 100 Q 100 120 80 95 Q 65 70 100 40 Z" fill="#dc2626" opacity="0.8" />
            <path d="M 100 55 Q 125 75 110 95 Q 95 105 85 90 Q 75 75 100 55 Z" fill="#f97316" />
            <circle cx="100" cy="82" r="9" fill="#fef08a" />
            <circle cx="100" cy="82" r="4" fill="#ffffff" />
          </g>
        );
    }
  };

  return (
    <div
      className={`relative w-full aspect-[4/3] rounded-t-xl overflow-hidden bg-gradient-to-br flex items-center justify-center select-none ${className}`}
      style={{
        background: `linear-gradient(135deg, ${colors.from} 0%, ${colors.via} 55%, ${colors.to} 100%)`,
      }}
    >
      {/* Visual background texture pattern */}
      <svg
        className="w-full h-full object-cover"
        viewBox="0 0 200 150"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={`Artwork for ${name}`}
      >
        <defs>
          <radialGradient id={`glow-${artId}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
            <stop offset="100%" stopColor={colors.from} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`frame-${artId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.glow} stopOpacity="0.6" />
            <stop offset="100%" stopColor={colors.to} stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Ambient radial glow */}
        <rect x="0" y="0" width="200" height="150" fill={`url(#glow-${artId})`} />

        {/* Framing border inside art */}
        <rect
          x="10"
          y="10"
          width="180"
          height="130"
          rx="8"
          fill="none"
          stroke={`url(#frame-${artId})`}
          strokeWidth="1.5"
          opacity="0.6"
        />

        {/* Corner flourishes */}
        <path d="M 12 24 L 24 12" stroke={colors.glow} strokeWidth="1.5" opacity="0.8" />
        <path d="M 188 24 L 176 12" stroke={colors.glow} strokeWidth="1.5" opacity="0.8" />
        <path d="M 12 126 L 24 138" stroke={colors.glow} strokeWidth="1.5" opacity="0.8" />
        <path d="M 188 126 L 176 138" stroke={colors.glow} strokeWidth="1.5" opacity="0.8" />

        {/* The Card Specific Illustration */}
        {renderIllustration()}
      </svg>
    </div>
  );
};
