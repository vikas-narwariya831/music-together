/**
 * Music Mood & Visualizer Intelligence Utility
 * Analyzes track metadata (title, artist) to extract mood, vibe, tempo, and assigns
 * matching algorithmic visualizer family and custom color themes automatically.
 */

// Core Audio-Visualizer Algorithmic Families
// 0: Equalizer Studio (Upbeat, energetic)
// 1: Liquid Silk Waves (Romantic, gentle, dreamy)
// 2: Stereo Pulse (Deep emotional, heartbeat, sad)
// 3: Stardust Nebula (Lo-Fi, chill, late night, ambient)
// 4: Horizon Radial Rays (Devotional, uplifting, epic)
// 5: Cyber Pixel Grid (Electronic, rap, drill, energetic)
// 6: Neon Oscilloscope (Acoustic, rock, unplugged)
// 7: DNA Acoustic Helix (Sufi, soul, qawwali, vocal heavy)
// 8: Volumetric Fountain (Party, dance, celebration)
// 9: Prism Blade Ribbon (Cinematic, grand, melancholic)

export const MOOD_DEFINITIONS = {
  SAD: {
    label: 'Melancholic & Sad',
    badge: 'Deep Emotion',
    family: 2, // Stereo Pulse (Heartbeat)
    colors: ['#6366f1', '#4338ca', '#312e81', '#1e1b4b'], // Deep blue-indigo
    glowColor: 'rgba(99, 102, 241, 0.25)',
    pulseSpeed: 0.035,
    ambientGlows: {
      primary: 'from-indigo-600/35 via-blue-900/25 to-transparent',
      secondary: 'from-blue-700/30 via-slate-900/20 to-transparent',
      accent: 'from-violet-600/25 to-indigo-950/20'
    },
    keywords: ['sad', 'dard', 'alone', 'broken', 'judaai', 'bewafa', 'cry', 'tears', 'heartbreak', 'tanhai', 'dukh', 'chhod diya', 'yaad', 'rona', 'tujhe bhula diya', 'hamari adhuri', 'agar tum saath ho', 'ae dil hai mushkil', 'bekhayali', 'pachtaoge', 'dil sambhal ja zara']
  },
  ROMANTIC: {
    label: 'Romantic & Soulful',
    badge: 'Love & Romance',
    family: 1, // Liquid Silk Waves
    colors: ['#f43f5e', '#e11d48', '#fb7185', '#fda4af'], // Crimson Rose & Pink
    glowColor: 'rgba(244, 63, 94, 0.3)',
    pulseSpeed: 0.05,
    ambientGlows: {
      primary: 'from-rose-600/35 via-pink-600/25 to-transparent',
      secondary: 'from-fuchsia-600/30 via-rose-950/20 to-transparent',
      accent: 'from-rose-500/25 to-purple-900/20'
    },
    keywords: ['love', 'ishq', 'pyaar', 'mohabbat', 'romantic', 'dil', 'sanam', 'humdum', 'humsafar', 'tum hi ho', 'kesariya', 'gehra hua', 'apna bana le', 'shamat', 'shayad', 'raataan lambiyan', 'tere bin', 'deva deva', 'sweetheart', 'valentine', 'kiss']
  },
  LOFI: {
    label: 'Late Night Lo-Fi & Chill',
    badge: 'Lo-Fi Chill',
    family: 3, // Stardust Nebula
    colors: ['#a855f7', '#8b5cf6', '#c084fc', '#06b6d4'], // Vaporwave Purple & Cyan
    glowColor: 'rgba(168, 85, 247, 0.25)',
    pulseSpeed: 0.03,
    ambientGlows: {
      primary: 'from-purple-600/35 via-indigo-600/25 to-transparent',
      secondary: 'from-cyan-600/30 via-violet-950/20 to-transparent',
      accent: 'from-purple-500/25 to-sky-900/20'
    },
    keywords: ['lo-fi', 'lofi', 'chill', 'night', 'sleep', 'relax', 'slowed', 'reverb', 'late night', 'coffee', 'study', 'peace', 'calm', 'rain', 'meditation', 'drive', 'mashup']
  },
  PARTY: {
    label: 'Party & High Energy',
    badge: 'High Energy Beat',
    family: 8, // Volumetric Fountain
    colors: ['#f59e0b', '#ea580c', '#ef4444', '#facc15'], // Fire & Sunset Amber
    glowColor: 'rgba(234, 88, 12, 0.35)',
    pulseSpeed: 0.08,
    ambientGlows: {
      primary: 'from-amber-500/40 via-orange-600/30 to-transparent',
      secondary: 'from-rose-600/35 via-yellow-600/20 to-transparent',
      accent: 'from-orange-500/30 to-amber-950/20'
    },
    keywords: ['party', 'dance', 'club', 'dj', 'remix', 'dhamaka', 'bhangra', 'nach', 'disco', 'shoki', 'rock', 'blast', 'bass boosted', 'boom', 'makhna', 'kar gayi chull', 'nachde ne saare', 'badtameez dil', 'kala chashma']
  },
  PUNJABI: {
    label: 'Punjabi & Swagger',
    badge: 'Urban Punjabi',
    family: 5, // Cyber Pixel Grid
    colors: ['#eab308', '#ca8a04', '#10b981', '#059669'], // Gold & Emerald
    glowColor: 'rgba(234, 179, 8, 0.3)',
    pulseSpeed: 0.07,
    ambientGlows: {
      primary: 'from-yellow-500/35 via-amber-600/25 to-transparent',
      secondary: 'from-emerald-600/30 via-lime-900/20 to-transparent',
      accent: 'from-amber-400/25 to-emerald-950/20'
    },
    keywords: ['punjabi', 'sidhu', 'moosewala', 'diljit', 'ap dhillon', 'karan aujla', 'shubh', 'jatt', 'pind', 'yaar', 'soorme', '295', 'goat', 'brown munde', 'with you', 'cheques', 'one love', 'daaku', 'gangster']
  },
  SUFI: {
    label: 'Sufi & Devotional Soul',
    badge: 'Spiritual Sufi',
    family: 7, // DNA Acoustic Helix
    colors: ['#0d9488', '#14b8a6', '#059669', '#34d399'], // Mystic Teal & Mint
    glowColor: 'rgba(13, 148, 136, 0.3)',
    pulseSpeed: 0.045,
    ambientGlows: {
      primary: 'from-teal-600/35 via-emerald-600/25 to-transparent',
      secondary: 'from-cyan-700/30 via-teal-950/20 to-transparent',
      accent: 'from-emerald-500/25 to-teal-900/20'
    },
    keywords: ['sufi', 'allah', 'khuda', 'maula', 'rabba', 'fakira', 'arziyan', 'kun faya kun', 'ali', 'qawwali', 'nusrat', 'rahat', 'bhajan', 'krishna', 'ram', 'shiva', 'devotional', 'prayer']
  },
  DEFAULT: {
    label: 'Studio Lossless Streaming',
    badge: 'Acoustic Studio',
    family: 0, // Equalizer Studio Bars
    colors: ['#f43f5e', '#fb7185', '#8b5cf6', '#6366f1'], // Apple Rose-Purple
    glowColor: 'rgba(244, 63, 94, 0.25)',
    pulseSpeed: 0.055,
    ambientGlows: {
      primary: 'from-rose-600/30 via-purple-600/20 to-transparent',
      secondary: 'from-indigo-600/25 via-pink-600/15 to-transparent',
      accent: 'from-violet-600/20 to-rose-950/15'
    },
    keywords: []
  }
};

/**
 * Automatically inspects track title and artist to determine the mood profile.
 */
export function detectTrackMood(title = '', artist = '') {
  const combined = `${title} ${artist}`.toLowerCase();

  for (const [key, profile] of Object.entries(MOOD_DEFINITIONS)) {
    if (key === 'DEFAULT') continue;
    for (const kw of profile.keywords) {
      if (combined.includes(kw)) {
        return {
          moodKey: key,
          ...profile
        };
      }
    }
  }

  // Fallback to DEFAULT with deterministic variation based on title hash
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash + combined.charCodeAt(i) * (i + 1)) % 10;
  }

  return {
    moodKey: 'DEFAULT',
    ...MOOD_DEFINITIONS.DEFAULT,
    family: hash // Varied algorithmic wave family dynamically
  };
}
