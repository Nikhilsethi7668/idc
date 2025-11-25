import React from 'react';

export const SimpleMarkdown = ({ children }: { children?: React.ReactNode }) => {
  if (!children || typeof children !== 'string') return null;
  
  const lines = children.split('\n');
  return (
    <div className="space-y-3 font-sans text-sm">
      {lines.map((line, i) => {
        // Headers
        if (line.trim().startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-idc-deepBlue mt-4 mb-2">{line.replace('### ', '')}</h3>;
        if (line.trim().startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-idc-deepBlue mt-6 mb-3 border-b border-gray-200 pb-1">{line.replace('## ', '')}</h2>;
        if (line.trim().startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-idc-deepBlue mt-6 mb-4">{line.replace('# ', '')}</h1>;
        
        // Lists
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={i} className="flex items-start ml-2">
              <span className="mr-2 text-idc-deepBlue">•</span>
              <span className="text-gray-700">{parseBold(line.replace(/^[-*] /, ''))}</span>
            </div>
          );
        }
        
        // Numbered Lists
        const numberedMatch = line.trim().match(/^(\d+)\. /);
        if (numberedMatch) {
          return (
            <div key={i} className="flex items-start ml-2">
              <span className="mr-2 font-bold text-idc-deepBlue min-w-[20px]">{numberedMatch[1]}.</span>
              <span className="text-gray-700">{parseBold(line.replace(/^\d+\. /, ''))}</span>
            </div>
          );
        }

        // Empty lines
        if (!line.trim()) return <div key={i} className="h-2"></div>;

        // Paragraphs
        return (
          <p key={i} className="leading-relaxed text-gray-700">
            {parseBold(line)}
          </p>
        );
      })}
    </div>
  );
};

// Helper to parse **bold** text
const parseBold = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, j) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={j} className="text-slate-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};