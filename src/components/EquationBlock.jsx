import katex from 'katex';

/**
 * Renders a LaTeX equation using KaTeX.
 */
export default function EquationBlock({ latex }) {
  const html = katex.renderToString(latex, {
    displayMode: true,
    throwOnError: false,
  });
  return (
    <div
      className="overflow-x-auto py-2"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
