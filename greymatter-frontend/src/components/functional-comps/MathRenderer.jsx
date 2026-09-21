import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathRenderer = ({ text }) => {
  if (typeof text !== 'string' || text.length === 0) {
    return <span>{text}</span>;
  }

  // Split on $...$ (inline) but not on escaped \$ or $$...$$.
  // Pattern: captures $...$ segments (non-greedy).
  const parts = [];
  const regex = /\$([^$]+)\$/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'math', value: match[1] });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  // No math delimiters found — return plain text.
  if (parts.length === 0) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {parts.map((part, i) => {
        if (part.type === 'text') {
          return <span key={i}>{part.value}</span>;
        }

        try {
          const html = katex.renderToString(part.value, {
            throwOnError: false,
            displayMode: false,
          });
          return (
            <span
              key={i}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        } catch (err) {
          console.error('KaTeX error:', err, 'in segment:', part.value);
          return <span key={i}>{part.value}</span>;
        }
      })}
    </span>
  );
};

export default MathRenderer;