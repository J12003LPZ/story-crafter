import { describe, it, expect } from 'vitest';
import { parseStory } from '../../src/lib/storyParser.js';

describe('parseStory', () => {
  it('extracts title, subtitle, and paragraphs from well-formed output', () => {
    const raw = `TITLE: The Lantern Keeper
SUBTITLE: A small light against the rising dark.

The lantern flickered once, then steadied.

She had walked this path a thousand times before.`;

    const result = parseStory(raw);

    expect(result.title).toBe('The Lantern Keeper');
    expect(result.subtitle).toBe('A small light against the rising dark.');
    expect(result.paragraphs).toEqual([
      'The lantern flickered once, then steadied.',
      'She had walked this path a thousand times before.',
    ]);
  });

  it('falls back to "Untitled" when no TITLE line is present', () => {
    const raw = `Just a paragraph of text with no header.\n\nAnd another one.`;
    const result = parseStory(raw);
    expect(result.title).toBe('Untitled');
    expect(result.subtitle).toBe('');
    expect(result.paragraphs).toEqual([
      'Just a paragraph of text with no header.',
      'And another one.',
    ]);
  });

  it('trims whitespace and ignores blank paragraphs', () => {
    const raw = `TITLE:   Spaces  \nSUBTITLE:  hook \n\n  para one  \n\n\n\npara two\n\n   \n`;
    const result = parseStory(raw);
    expect(result.title).toBe('Spaces');
    expect(result.subtitle).toBe('hook');
    expect(result.paragraphs).toEqual(['para one', 'para two']);
  });

  it('strips surrounding markdown code fences if the model wrapped its output', () => {
    const raw = '```\nTITLE: Fenced\nSUBTITLE: hook\n\nbody.\n```';
    const result = parseStory(raw);
    expect(result.title).toBe('Fenced');
    expect(result.paragraphs).toEqual(['body.']);
  });
});
