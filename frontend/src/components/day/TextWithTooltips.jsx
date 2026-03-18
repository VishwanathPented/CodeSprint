import { dictionary } from '../../utils/dictionary';

export default function TextWithTooltips({ text, className }) {
  if (!text) return null;

  // We want to match whole words/phrases case-insensitively.
  const keys = Object.keys(dictionary).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  
  // Sort keys by length descending to match longer phrases (like 'primitive type') 
  // before shorter ones (like 'type')
  keys.sort((a, b) => b.length - a.length);

  const regex = new RegExp(`\\b(${keys.join('|')})\\b`, 'gi');
  const parts = text.split(regex);

  return (
    <p className={className}>
      {parts.map((part, index) => {
        const lowerPart = part.toLowerCase();
        if (dictionary[lowerPart] !== undefined) {
          // If it's a dictionary key, wrap it in a hoverable tooltip
          return (
            <span 
              key={index} 
              className="group relative inline-block border-b border-dashed border-primary-400 dark:border-primary-500 cursor-help text-primary-700 dark:text-primary-400 font-medium transition-colors hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-t-sm px-0.5"
            >
              {part}
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity z-50 text-left font-normal leading-relaxed before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-slate-900">
                <strong className="block text-primary-300 font-bold mb-1 capitalize tracking-wide">{part}</strong>
                {dictionary[lowerPart]}
              </span>
            </span>
          );
        } else {
          // Normal text
          return <span key={index}>{part}</span>;
        }
      })}
    </p>
  );
}
