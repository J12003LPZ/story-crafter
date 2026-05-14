function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildStorybookHtml({ title, subtitle, paragraphs }) {
  const safeTitle = escapeHtml(title || 'Untitled');
  const safeSubtitle = escapeHtml(subtitle || '');
  const sections = (paragraphs || [])
    .map((p, i) => {
      const safe = escapeHtml(p);
      const dropCap = i === 0 ? ' drop-cap' : '';
      return `<section class="story-section"><p class="${dropCap} text-xl md:text-2xl leading-relaxed text-library-text mb-8">${safe}</p></section>`;
    })
    .join('\n');

  const narrationScriptData = JSON.stringify(paragraphs || []);

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${safeTitle}</title>
<script src="https://cdn.tailwindcss.com"><\/script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,700;1,700&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
<script>
  tailwind.config = {
    theme: { extend: {
      colors: { library: { bg: '#121417', paper: '#1a1d21', accent: '#c5a059', text: '#e2e8f0', muted: '#94a3b8' } },
      fontFamily: { display: ['"Playfair Display"', 'serif'], body: ['"Lora"', 'serif'], ui: ['"Inter"', 'sans-serif'] }
    } }
  };
<\/script>
<style>
  body { background-color: #121417; color: #e2e8f0; -webkit-font-smoothing: antialiased; font-family: 'Lora', serif; }
  .drop-cap::first-letter { float: left; font-family: 'Playfair Display', serif; font-size: 5.5rem; line-height: 0.8; padding-top: 8px; padding-right: 12px; color: #c5a059; font-weight: 700; }
  .glass-panel { background: rgba(26,29,33,0.85); backdrop-filter: blur(12px); border-top: 1px solid rgba(255,255,255,0.05); }
  .story-section { opacity: 0; transform: translateY(20px); transition: all 0.8s cubic-bezier(0.2,0.8,0.2,1); }
  .story-section.visible { opacity: 1; transform: translateY(0); }
</style>
</head>
<body class="selection:bg-library-accent selection:text-library-bg">
  <header class="min-h-screen flex flex-col items-center justify-center px-6 text-center">
    <div class="max-w-4xl">
      <span class="uppercase tracking-[0.3em] text-library-accent text-sm mb-6 block">A Digital Storybook</span>
      <h1 class="text-6xl md:text-8xl mb-8 leading-tight italic font-display">${safeTitle}</h1>
      <p class="text-library-muted max-w-lg mx-auto text-lg leading-relaxed mb-12">${safeSubtitle}</p>
      <button onclick="document.getElementById('story-start').scrollIntoView({behavior:'smooth'}); showConsole();" class="px-10 py-4 font-semibold text-library-bg bg-library-accent rounded-full hover:scale-105 transition-transform">Begin Reading</button>
    </div>
  </header>
  <main id="story-start" class="max-w-3xl mx-auto px-6 py-24 space-y-24">
${sections}
    <div class="pt-20 pb-32 text-center">
      <div class="h-px w-24 bg-library-accent/30 mx-auto mb-12"></div>
      <h2 class="text-4xl italic font-display mb-6">The End</h2>
      <button onclick="window.scrollTo({top:0,behavior:'smooth'})" class="text-library-accent tracking-widest uppercase text-xs font-bold">Back to Top</button>
    </div>
  </main>
  <div id="audio-console" class="fixed bottom-0 left-0 w-full z-50 transform translate-y-full transition-transform duration-700">
    <div class="glass-panel mx-auto max-w-2xl mb-6 rounded-full p-2 px-8 flex items-center gap-4">
      <button id="play-btn" class="w-12 h-12 flex items-center justify-center rounded-full bg-library-accent text-library-bg">
        <svg id="play-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        <svg id="pause-icon" class="hidden" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
      </button>
      <div class="font-display italic text-sm whitespace-nowrap">${safeTitle}</div>
      <div class="flex-1 h-1 bg-white/10 rounded-full overflow-hidden"><div id="progress-bar" class="h-full bg-library-accent w-0 transition-all"></div></div>
    </div>
  </div>
  <script>
    const PARAGRAPHS = ${narrationScriptData};
    const playBtn = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const progressBar = document.getElementById('progress-bar');
    const consoleEl = document.getElementById('audio-console');
    let speaking = false;
    let currentIdx = 0;

    function showConsole() { consoleEl.classList.remove('translate-y-full'); }

    function speakFrom(i) {
      if (i >= PARAGRAPHS.length) { stop(); return; }
      currentIdx = i;
      const u = new SpeechSynthesisUtterance(PARAGRAPHS[i]);
      u.rate = 0.95;
      u.onend = () => {
        progressBar.style.width = (((i + 1) / PARAGRAPHS.length) * 100) + '%';
        if (speaking) speakFrom(i + 1);
      };
      window.speechSynthesis.speak(u);
    }

    function start() {
      speaking = true;
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      speakFrom(currentIdx);
    }

    function stop() {
      speaking = false;
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      window.speechSynthesis.cancel();
    }

    playBtn.addEventListener('click', () => {
      if (!('speechSynthesis' in window)) { alert('Your browser does not support speech synthesis.'); return; }
      if (speaking) { stop(); } else { start(); }
    });

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.story-section').forEach(s => obs.observe(s));

    window.addEventListener('scroll', () => { if (window.scrollY > 300) showConsole(); });
  <\/script>
</body>
</html>`;
}
