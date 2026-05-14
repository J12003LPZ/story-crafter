import { useState } from 'react';

export default function PromptInput({ onSubmit, disabled }) {
  const [value, setValue] = useState('');
  const canSubmit = value.trim().length > 0 && !disabled;

  return (
    <div className="w-full relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-primary-container via-secondary-container to-primary-container rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000" />
      <div className="relative w-full bg-surface-container-high/80 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden p-1 flex flex-col">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What story should the AI weave today? Describe the setting, the protagonist, the central conflict..."
          className="w-full bg-transparent border-none text-on-surface text-story-lg font-story p-6 focus:ring-0 placeholder:text-on-surface-variant/50 resize-none min-h-[200px] outline-none"
        />
        <div className="flex justify-end items-center p-4 border-t border-white/5 bg-surface-container-high/50">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmit(value.trim())}
            className="bg-primary hover:bg-primary-container text-on-primary text-ui-lg font-ui px-8 py-3 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(176,198,255,0.15)] hover:shadow-[0_0_25px_rgba(176,198,255,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
            Generate Story
          </button>
        </div>
      </div>
    </div>
  );
}
