import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../context/StoryContext.jsx';
import PromptInput from '../components/PromptInput.jsx';

const SUGGESTIONS = [
  'A cyber-noir detective story...',
  'High fantasy in a dying world...',
  'A quiet romance on a space station...',
];

function formatNumber(n) {
  return new Intl.NumberFormat('en-US').format(Math.round(n));
}

function CreditsBadge() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/credits')
      .then((r) => r.json())
      .then((json) => { if (!cancelled) setData(json); })
      .catch(() => { if (!cancelled) setData({ available: false }); });
    return () => { cancelled = true; };
  }, []);

  if (!data || !data.available) return null;

  const pct = data.dailyFree > 0 ? (data.remaining / data.dailyFree) * 100 : 0;
  const low = pct < 20;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-ui-md font-ui">
      <span
        className={`material-symbols-outlined text-[18px] ${low ? 'text-amber-400' : 'text-primary'}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        bolt
      </span>
      <span className="text-on-surface-variant">
        <span className={low ? 'text-amber-400' : 'text-on-surface'}>{formatNumber(data.remaining)}</span>
        <span className="text-on-surface-variant/60"> / {formatNumber(data.dailyFree)} neurons today</span>
      </span>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { submit, status } = useStory();

  const handleSubmit = (prompt) => {
    submit(prompt);
    navigate('/weaving');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex justify-between items-center w-full px-4 md:px-16 py-4 sticky top-0 z-50 bg-surface/80 backdrop-blur-xl border-b border-white/10">
        <div className="text-headline-md font-ui font-bold text-primary tracking-tight">Story Crafter</div>
        <CreditsBadge />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-16 relative">
        <div className="absolute inset-0 z-0 pointer-events-none flex justify-center items-center opacity-30">
          <div className="w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl absolute top-1/4 left-1/4" />
          <div className="w-[500px] h-[500px] bg-secondary-container/5 rounded-full blur-3xl absolute bottom-1/4 right-1/4" />
        </div>
        <div className="w-full max-w-[800px] z-10 flex flex-col items-center text-center space-y-12">
          <div className="space-y-4">
            <h1 className="text-display-lg font-ui text-on-surface">The Canvas Awaits.</h1>
            <p className="text-story-lg font-story text-on-surface-variant max-w-2xl mx-auto">
              Whisper your concept to the digital architect. We will weave it into a narrative.
            </p>
          </div>
          <PromptInput onSubmit={handleSubmit} disabled={status === 'loading'} />
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => handleSubmit(s)}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-on-surface-variant text-ui-md font-ui transition-colors border border-white/5"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
