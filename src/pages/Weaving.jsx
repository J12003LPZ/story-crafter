import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../context/StoryContext.jsx';

export default function Weaving() {
  const navigate = useNavigate();
  const { status, error } = useStory();

  useEffect(() => {
    if (status === 'ready') navigate('/result');
    if (status === 'idle') navigate('/');
  }, [status, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <main className="relative z-10 flex flex-col items-center justify-center gap-12 p-8 w-full max-w-lg">
        {status === 'error' ? (
          <div className="flex flex-col items-center gap-6 text-center">
            <h1 className="text-headline-lg font-ui text-on-surface">The weave unraveled.</h1>
            <p className="text-story-md font-story text-on-surface-variant max-w-md">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-primary text-on-primary font-ui text-ui-lg px-6 py-3 rounded-lg"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 bg-primary opacity-20 blur-[50px] rounded-full animate-pulse" />
              <div className="absolute inset-4 border border-primary/30 rounded-full animate-ping" />
              <div className="absolute inset-10 border border-secondary/20 rounded-full animate-ping" style={{ animationDelay: '1.5s' }} />
              <div className="absolute w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary blur-[4px] animate-pulse opacity-80" />
              <div className="absolute w-16 h-16 rounded-full bg-surface flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-3xl animate-spin" style={{ animationDuration: '4s', fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-headline-lg font-ui text-on-surface tracking-tight">Weaving your tale...</h1>
              <p className="text-ui-lg font-ui text-on-surface-variant opacity-80 uppercase tracking-widest">
                Synthesizing narrative threads
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
