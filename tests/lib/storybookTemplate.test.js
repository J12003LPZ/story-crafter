import { describe, it, expect } from 'vitest';
import { buildStorybookHtml } from '../../src/lib/storybookTemplate.js';

describe('buildStorybookHtml', () => {
  const story = {
    title: 'The Lantern Keeper',
    subtitle: 'A small light against the rising dark.',
    paragraphs: ['She lit the wick.', 'The dark stepped back.'],
  };

  it('returns a complete HTML document', () => {
    const html = buildStorybookHtml(story);
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toMatch(/<\/html>\s*$/);
  });

  it('inlines the title in <title> and <h1>', () => {
    const html = buildStorybookHtml(story);
    expect(html).toContain('<title>The Lantern Keeper</title>');
    expect(html).toContain('The Lantern Keeper');
  });

  it('inlines every paragraph as a <p>', () => {
    const html = buildStorybookHtml(story);
    expect(html).toContain('She lit the wick.');
    expect(html).toContain('The dark stepped back.');
  });

  it('escapes HTML special characters in user content', () => {
    const html = buildStorybookHtml({
      title: '<script>alert(1)</script>',
      subtitle: 'a & b',
      paragraphs: ['"quoted" & <tagged>'],
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(html).toContain('a &amp; b');
    expect(html).toContain('&quot;quoted&quot; &amp; &lt;tagged&gt;');
  });

  it('includes a speechSynthesis play handler', () => {
    const html = buildStorybookHtml(story);
    expect(html).toContain('speechSynthesis');
    expect(html).toContain('SpeechSynthesisUtterance');
  });

  it('embeds the Tailwind CDN script for standalone styling', () => {
    const html = buildStorybookHtml(story);
    expect(html).toContain('cdn.tailwindcss.com');
  });
});
