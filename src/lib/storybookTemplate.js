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
      if (i === 0) {
        const first = escapeHtml(p.charAt(0));
        const rest = escapeHtml(p.slice(1));
        return `<section class="story-section">
  <p class="text-xl md:text-2xl leading-relaxed mb-8" style="color:#e5e2e1"><span style="float:left;font-family:'Geist',sans-serif;font-size:5rem;line-height:0.85;padding-top:6px;padding-right:10px;color:#b0c6ff;font-weight:700">${first}</span>${rest}</p>
</section>`;
      }
      return `<section class="story-section"><p class="text-xl md:text-2xl leading-relaxed mb-8" style="color:#e5e2e1">${safe}</p></section>`;
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
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,600;1,7..72,400&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
<style>
  :root {
    --bg: #131313;
    --surface: #131313;
    --surface-high: #2a2a2a;
    --surface-variant: #353534;
    --on-surface: #e5e2e1;
    --on-surface-muted: #c2c6d8;
    --primary: #b0c6ff;
    --on-primary: #002d6f;
    --primary-container: #568dff;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body {
    background-color: var(--bg);
    color: var(--on-surface);
    font-family: 'Literata', Georgia, serif;
    -webkit-font-smoothing: antialiased;
  }
  .story-section {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s cubic-bezier(0.2,0.8,0.2,1), transform 0.8s cubic-bezier(0.2,0.8,0.2,1);
  }
  .story-section.visible { opacity: 1; transform: translateY(0); }
  .glass-panel {
    background: rgba(42,42,42,0.85);
    backdrop-filter: blur(12px);
    border-top: 1px solid rgba(176,198,255,0.1);
  }
  .progress-track {
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 9999px;
    overflow: hidden;
    flex: 1;
  }
  .progress-fill {
    height: 100%;
    background: var(--primary);
    border-radius: 9999px;
    width: 0%;
    transition: width 0.3s ease;
    box-shadow: 0 0 8px rgba(176,198,255,0.4);
  }
  button { cursor: pointer; border: none; background: none; }
  #play-btn {
    width: 48px; height: 48px;
    border-radius: 9999px;
    background: var(--primary);
    color: var(--on-primary);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 0 20px rgba(176,198,255,0.3);
    transition: transform 0.2s;
  }
  #play-btn:hover { transform: scale(1.05); }
  #begin-btn {
    padding: 16px 40px;
    background: var(--primary);
    color: var(--on-primary);
    border-radius: 9999px;
    font-family: 'Geist', sans-serif;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.05em;
    transition: transform 0.2s, box-shadow 0.2s;
    box-shadow: 0 0 20px rgba(176,198,255,0.2);
  }
  #begin-btn:hover { transform: scale(1.05); box-shadow: 0 0 30px rgba(176,198,255,0.35); }
  #back-btn {
    color: var(--primary);
    font-family: 'Geist', sans-serif;
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-weight: 700;
    opacity: 0.7;
  }
  #back-btn:hover { opacity: 1; }
  #audio-console {
    position: fixed; bottom: 0; left: 0; width: 100%; z-index: 50;
    transform: translateY(100%);
    transition: transform 0.7s cubic-bezier(0.2,0.8,0.2,1);
  }
  #audio-console.visible { transform: translateY(0); }
  .console-inner {
    max-width: 640px;
    margin: 0 auto 24px;
    border-radius: 9999px;
    padding: 10px 28px;
    display: flex;
    align-items: center;
    gap: 16px;
    border: 1px solid rgba(176,198,255,0.1);
  }
  .console-title {
    font-family: 'Literata', serif;
    font-style: italic;
    font-size: 14px;
    white-space: nowrap;
    color: var(--on-surface-muted);
  }
</style>
</head>
<body>
  <!-- Hero -->
  <header style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px;text-align:center;position:relative;overflow:hidden">
    <div style="position:absolute;inset:0;pointer-events:none">
      <div style="position:absolute;top:25%;left:25%;width:500px;height:500px;background:rgba(176,198,255,0.04);border-radius:9999px;filter:blur(80px)"></div>
      <div style="position:absolute;bottom:25%;right:25%;width:400px;height:400px;background:rgba(0,227,253,0.03);border-radius:9999px;filter:blur(80px)"></div>
    </div>
    <div style="position:relative;max-width:800px;width:100%">
      <p style="font-family:'Geist',sans-serif;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:var(--primary);margin-bottom:24px;font-weight:600">A Digital Storybook</p>
      <h1 style="font-family:'Geist',sans-serif;font-size:clamp(2.5rem,8vw,5rem);font-weight:700;line-height:1.1;letter-spacing:-0.02em;color:var(--on-surface);margin-bottom:24px;text-shadow:0 0 40px rgba(176,198,255,0.1)">${safeTitle}</h1>
      <p style="font-family:'Literata',serif;font-style:italic;font-size:1.25rem;line-height:1.7;color:var(--on-surface-muted);max-width:520px;margin:0 auto 48px">${safeSubtitle}</p>
      <button id="begin-btn" onclick="document.getElementById('story-start').scrollIntoView({behavior:'smooth'}); showConsole();">Begin Reading</button>
    </div>
    <div style="position:absolute;bottom:40px;left:50%;transform:translateX(-50%);opacity:0.3;animation:bounce 2s infinite">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
    </div>
  </header>

  <!-- Story -->
  <main id="story-start" style="max-width:720px;margin:0 auto;padding:96px 24px;display:flex;flex-direction:column;gap:64px">
${sections}
    <div style="padding-top:80px;padding-bottom:120px;text-align:center">
      <div style="height:1px;width:80px;background:rgba(176,198,255,0.2);margin:0 auto 48px"></div>
      <h2 style="font-family:'Geist',sans-serif;font-size:2rem;font-weight:700;color:var(--on-surface);margin-bottom:24px">The End</h2>
      <button id="back-btn" onclick="window.scrollTo({top:0,behavior:'smooth'})">Back to Top</button>
    </div>
  </main>

  <!-- Audio Console -->
  <div id="audio-console">
    <div class="glass-panel console-inner">
      <button id="play-btn" onclick="togglePlay()" aria-label="Play narration">
        <span id="play-icon" class="material-symbols-outlined" style="font-size:28px;font-variation-settings:'FILL' 1">play_arrow</span>
        <span id="pause-icon" class="material-symbols-outlined" style="font-size:28px;font-variation-settings:'FILL' 1;display:none">pause</span>
      </button>
      <span class="console-title">${safeTitle}</span>
      <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
    </div>
  </div>

  <style>
    @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-8px)} }
  </style>

  <script>
    const PARAGRAPHS = ${narrationScriptData};
    let speaking = false;
    let currentIdx = 0;
    let chosenVoice = null;

    function pickVoice() {
      const voices = window.speechSynthesis.getVoices();
      const preferred = ['Google UK English Female','Google US English','Samantha','Karen','Moira','Tessa'];
      for (const name of preferred) {
        const v = voices.find(v => v.name === name);
        if (v) return v;
      }
      return voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
        || voices.find(v => v.lang.startsWith('en'))
        || null;
    }

    window.speechSynthesis.addEventListener('voiceschanged', () => { chosenVoice = pickVoice(); });
    chosenVoice = pickVoice();

    function showConsole() { document.getElementById('audio-console').classList.add('visible'); }

    function speakFrom(i) {
      if (i >= PARAGRAPHS.length) { stopPlay(); return; }
      currentIdx = i;
      const u = new SpeechSynthesisUtterance(PARAGRAPHS[i]);
      u.rate = 0.88;
      u.pitch = 1.05;
      const v = chosenVoice || pickVoice();
      if (v) { u.voice = v; chosenVoice = v; }
      u.onend = () => {
        document.getElementById('progress-fill').style.width = (((i + 1) / PARAGRAPHS.length) * 100) + '%';
        if (speaking) speakFrom(i + 1);
      };
      window.speechSynthesis.speak(u);
    }

    function togglePlay() {
      if (!('speechSynthesis' in window)) { alert('Speech synthesis not supported in this browser.'); return; }
      if (speaking) { stopPlay(); } else { startPlay(); }
    }

    function startPlay() {
      speaking = true;
      document.getElementById('play-icon').style.display = 'none';
      document.getElementById('pause-icon').style.display = '';
      speakFrom(currentIdx);
    }

    function stopPlay() {
      speaking = false;
      document.getElementById('play-icon').style.display = '';
      document.getElementById('pause-icon').style.display = 'none';
      window.speechSynthesis.cancel();
    }

    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.story-section').forEach(s => obs.observe(s));

    window.addEventListener('scroll', () => { if (window.scrollY > 300) showConsole(); });
  <\/script>
</body>
</html>`;
}
