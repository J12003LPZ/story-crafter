import { useEffect, useRef, useState } from 'react';

const PREFERRED_VOICES = [
  'Google UK English Female',
  'Microsoft Libby Online (Natural) - English (United Kingdom)',
  'Microsoft Sonia Online (Natural) - English (United Kingdom)',
  'Microsoft Hazel - English (Great Britain)',
  'Microsoft Susan - English (Great Britain)',
  'Google US English',
  'Samantha',
  'Karen',
  'Moira',
  'Tessa',
];

function pickVoice(voices) {
  for (const name of PREFERRED_VOICES) {
    const match = voices.find((v) => v.name === name);
    if (match) return match;
  }
  return (
    voices.find((v) => v.lang === 'en-GB' && v.name.toLowerCase().includes('female')) ||
    voices.find((v) => v.lang === 'en-GB') ||
    voices.find((v) => v.lang.startsWith('en') && v.name.toLowerCase().includes('female')) ||
    voices.find((v) => v.lang.startsWith('en')) ||
    null
  );
}

// Returns a promise that resolves to the best available voice.
// Chrome loads voices async; this waits up to 2s for them.
function resolveVoice() {
  return new Promise((resolve) => {
    const immediate = window.speechSynthesis.getVoices();
    if (immediate.length > 0) return resolve(pickVoice(immediate));
    const onChanged = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
      resolve(pickVoice(window.speechSynthesis.getVoices()));
    };
    window.speechSynthesis.addEventListener('voiceschanged', onChanged);
    // Fallback if event never fires
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
      resolve(pickVoice(window.speechSynthesis.getVoices()));
    }, 2000);
  });
}

export default function AudioConsole({ paragraphs, onParagraphChange, onWordChange }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const idxRef = useRef(0);
  const speakingRef = useRef(false);

  useEffect(() => {
    return () => {
      speakingRef.current = false;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speakFrom = async (i) => {
    if (i >= paragraphs.length) {
      speakingRef.current = false;
      setPlaying(false);
      setProgress(100);
      idxRef.current = 0;
      onParagraphChange?.(null);
      onWordChange?.(null, null);
      return;
    }
    idxRef.current = i;
    onParagraphChange?.(i);
    const voice = await resolveVoice();
    // Check if cancelled while waiting for voice
    if (!speakingRef.current) return;

    const u = new SpeechSynthesisUtterance(paragraphs[i]);
    u.rate = 0.88;
    u.pitch = 1.05;
    if (voice) u.voice = voice;
    u.onboundary = (e) => {
      if (e.name && e.name !== 'word') return;
      onWordChange?.(i, e.charIndex);
    };
    u.onend = () => {
      setProgress(Math.round(((i + 1) / paragraphs.length) * 100));
      if (speakingRef.current) speakFrom(i + 1);
    };
    window.speechSynthesis.speak(u);
  };

  const toggle = () => {
    if (!supported) return;
    if (playing) {
      speakingRef.current = false;
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
      speakingRef.current = true;
      setPlaying(true);
      speakFrom(idxRef.current);
    }
  };

  return (
    <div className="bg-surface-container-high/50 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex items-center gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
      <button
        onClick={toggle}
        disabled={!supported}
        className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-on-primary hover:scale-105 transition-transform shadow-[0_0_20px_rgba(176,198,255,0.3)] shrink-0 disabled:opacity-40"
      >
        <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {playing ? 'pause' : 'play_arrow'}
        </span>
      </button>
      <div className="flex-grow w-full flex flex-col gap-2">
        <div className="flex justify-between items-end">
          <span className="text-ui-lg font-ui text-primary">Audio Narration</span>
          <span className="text-ui-md font-ui text-on-surface-variant">
            {supported ? `${progress}%` : 'Not supported in this browser'}
          </span>
        </div>
        <div className="h-2 w-full bg-surface-variant rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
