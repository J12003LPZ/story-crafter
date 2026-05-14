import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../context/StoryContext.jsx';
import AudioConsole from '../components/AudioConsole.jsx';
import { buildStorybookHtml } from '../lib/storybookTemplate.js';
import { downloadHtml } from '../lib/download.js';

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'story';
}

export default function Result() {
  const navigate = useNavigate();
  const { story, reset } = useStory();

  useEffect(() => {
    if (!story) navigate('/');
  }, [story, navigate]);

  if (!story) return null;

  const handleDownload = () => {
    const html = buildStorybookHtml(story);
    downloadHtml(`${slugify(story.title)}.html`, html);
  };

  const handleNew = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="w-full px-4 md:px-16 py-6 flex justify-between items-center sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button onClick={handleNew} className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-variant/30">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <span className="text-headline-md font-ui font-bold text-primary tracking-tight">Story Crafter</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleNew} className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors text-ui-lg font-ui">
            <span className="material-symbols-outlined">auto_awesome</span>
            Generate New
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-on-primary text-ui-lg font-ui">
            <span className="material-symbols-outlined">download</span>
            Download HTML
          </button>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center px-4 md:px-16 py-12 max-w-[1200px] mx-auto w-full">
        <article className="max-w-[800px] w-full flex flex-col gap-12">
          <header className="flex flex-col gap-6 text-center mb-8">
            <h1 className="text-display-lg font-ui text-on-surface drop-shadow-[0_0_15px_rgba(176,198,255,0.1)]">{story.title}</h1>
            {story.subtitle && (
              <p className="text-story-lg font-story text-on-surface-variant italic">{story.subtitle}</p>
            )}
            <div className="text-ui-md font-ui text-on-surface-variant/60">
              {story.paragraphs.reduce((acc, p) => acc + p.split(/\s+/).length, 0)} words
            </div>
          </header>
          <AudioConsole paragraphs={story.paragraphs} />
          <div className="font-story text-story-lg text-on-surface/90 leading-relaxed space-y-8 pb-24">
            {story.paragraphs.map((p, i) => (
              <p key={i}>
                {i === 0 ? (
                  <>
                    <span className="float-left text-display-lg text-primary font-ui leading-none pr-3 pt-2">{p.charAt(0)}</span>
                    {p.slice(1)}
                  </>
                ) : (
                  p
                )}
              </p>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
