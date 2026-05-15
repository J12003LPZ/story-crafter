import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../context/StoryContext.jsx';
import AudioConsole from '../components/AudioConsole.jsx';
import { buildStorybookHtml } from '../lib/storybookTemplate.js';
import { downloadHtml } from '../lib/download.js';

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'story';
}

function tokenize(text) {
  const tokens = [];
  const re = /\S+|\s+/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    tokens.push({ text: m[0], start: m.index, isWord: /\S/.test(m[0]) });
  }
  return tokens;
}

function findActiveWordToken(tokens, charIndex) {
  if (charIndex == null) return -1;
  let active = -1;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (!t.isWord) continue;
    if (t.start <= charIndex) active = i;
    else break;
  }
  return active;
}

export default function Result() {
  const navigate = useNavigate();
  const { story, reset } = useStory();
  const [activeParagraph, setActiveParagraph] = useState(null);
  const [activeChar, setActiveChar] = useState(null);
  const paragraphRefs = useRef([]);
  const activeWordRef = useRef(null);

  const tokenizedParagraphs = useMemo(
    () => (story?.paragraphs || []).map(tokenize),
    [story]
  );

  useEffect(() => {
    if (!story) navigate('/');
  }, [story, navigate]);

  useEffect(() => {
    if (activeParagraph == null) return;
    const el = paragraphRefs.current[activeParagraph];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activeParagraph]);

  useEffect(() => {
    if (activeWordRef.current) {
      activeWordRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeParagraph, activeChar]);

  const handleWordChange = (pIdx, charIdx) => {
    setActiveParagraph(pIdx);
    setActiveChar(charIdx);
  };

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
          <AudioConsole paragraphs={story.paragraphs} onWordChange={handleWordChange} />
          <div className="font-story text-story-lg leading-relaxed space-y-8 pb-24">
            {tokenizedParagraphs.map((tokens, i) => {
              const isActiveParagraph = activeParagraph === i;
              const activeWordIdx = isActiveParagraph ? findActiveWordToken(tokens, activeChar) : -1;
              return (
                <p
                  key={i}
                  ref={(el) => { paragraphRefs.current[i] = el; }}
                  className={[
                    'rounded-xl px-4 py-3 -mx-4 transition-colors duration-500',
                    isActiveParagraph
                      ? 'bg-primary/10 shadow-[0_0_24px_rgba(176,198,255,0.12)] text-on-surface'
                      : 'text-on-surface/70',
                  ].join(' ')}
                >
                  {i === 0 && tokens.length > 0 && (
                    <span className="float-left text-display-lg text-primary font-ui leading-none pr-3 pt-2">
                      {tokens[0].text.charAt(0)}
                    </span>
                  )}
                  {tokens.map((t, ti) => {
                    if (!t.isWord) return <span key={ti}>{t.text}</span>;
                    const isFirstWordOfFirstParagraph = i === 0 && ti === 0;
                    const display = isFirstWordOfFirstParagraph ? t.text.slice(1) : t.text;
                    const isActiveWord = ti === activeWordIdx;
                    return (
                      <span
                        key={ti}
                        ref={isActiveWord ? activeWordRef : null}
                        className={
                          isActiveWord
                            ? 'bg-primary/30 text-on-surface rounded px-1 -mx-1 transition-colors duration-200'
                            : 'transition-colors duration-200'
                        }
                      >
                        {display}
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        </article>
      </main>
    </div>
  );
}
