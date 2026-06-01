import 'katex/dist/katex.min.css';
import katex from 'katex';

const MathRenderer = ({ text }) => {
  // Check if text contains LaTeX patterns or $ delimiters
  const containsMath = /\\[a-zA-Z]+|[\^\{}_]|\$/.test(text);
  
  if (!containsMath) {
    return <span>{text}</span>;
  }
  
  try {
    // Remove $ delimiters if they exist
    let cleanText = text.replace(/\$/g, '');
    const html = katex.renderToString(cleanText, {
      throwOnError: false,
      displayMode: false
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch (error) {
    console.error('KaTeX error:', error);
    return <span>{text}</span>;
  }
};

export default MathRenderer;