export function parseStory(rawText) {
  if (typeof rawText !== 'string') {
    return { title: 'Untitled', subtitle: '', paragraphs: [] };
  }

  let text = rawText.trim();
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/, '').trim();
  }

  const lines = text.split('\n');
  let title = 'Untitled';
  let subtitle = '';
  let bodyStart = 0;

  for (let i = 0; i < Math.min(lines.length, 4); i++) {
    const line = lines[i].trim();
    const titleMatch = line.match(/^TITLE\s*:\s*(.+)$/i);
    const subtitleMatch = line.match(/^SUBTITLE\s*:\s*(.+)$/i);
    if (titleMatch) {
      title = titleMatch[1].trim();
      bodyStart = Math.max(bodyStart, i + 1);
    } else if (subtitleMatch) {
      subtitle = subtitleMatch[1].trim();
      bodyStart = Math.max(bodyStart, i + 1);
    }
  }

  const body = lines.slice(bodyStart).join('\n');
  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 0);

  return { title, subtitle, paragraphs };
}
