import { useEffect, useRef, useState } from 'react';

export default function AudioConsole({ paragraphs }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const idxRef = useRef(0);

  useEffect(() => {
    return () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); };
  }, []);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speakFrom = (i) => {
    if (i >= paragraphs.length) {
      setPlaying(false);
      setProgress(100);
      idxRef.current = 0;
      return;
    }
    idxRef.current = i;
    const u = new SpeechSynthesisUtterance(paragraphs[i]);
    u.rate = 0.95;
    u.onend = () => {
      setProgress(Math.round(((i + 1) / paragraphs.length) * 100));
      speakFrom(i + 1);
    };
    window.speechSynthesis.speak(u);
  };

  const toggle = () => {
    if (!supported) return;
    if (playing) {
      window.speechSynthesis.cancel();
      setPlaying(false);
    } else {
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
