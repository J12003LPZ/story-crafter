import { createContext, useContext, useState, useCallback } from 'react';
import { generateStory } from '../lib/openrouter.js';

const StoryContext = createContext(null);

export function StoryProvider({ children }) {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('idle');
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);

  const submit = useCallback(async (p) => {
    setPrompt(p);
    setStatus('loading');
    setError(null);
    setStory(null);
    try {
      const result = await generateStory(p);
      setStory(result);
      setStatus('ready');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }, []);

  const reset = useCallback(() => {
    setPrompt('');
    setStatus('idle');
    setStory(null);
    setError(null);
  }, []);

  return (
    <StoryContext.Provider value={{ prompt, status, story, error, submit, reset }}>
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error('useStory must be used within StoryProvider');
  return ctx;
}
