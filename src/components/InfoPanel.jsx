import EquationBlock from './EquationBlock';

/**
 * Card with description text and a KaTeX equation.
 */
export default function InfoPanel({ title, description, equation }) {
  return (
    <div className="bg-usna-card border border-usna-grid rounded-lg p-5">
      {title && (
        <h3 className="text-usna-gold font-semibold text-base mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-usna-text text-sm leading-relaxed mb-3">{description}</p>
      )}
      {equation && <EquationBlock latex={equation} />}
    </div>
  );
}
