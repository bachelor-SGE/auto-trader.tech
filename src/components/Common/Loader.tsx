import React from 'react';

export const Loader: React.FC<{text?: string}> = ({ text }) => (
  <div className="loader-root">
    <div className="loader-spinner">
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="#4f8cff"
          strokeWidth="6"
          fill="none"
          strokeDasharray="44 88"
          strokeLinecap="round"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 32 32"
            to="360 32 32"
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
    {text && <div className="loader-text">{text}</div>}
    <style>{`
      .loader-root {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 40vh;
        color: var(--color-text-secondary);
      }
      .loader-spinner {
        margin-bottom: 18px;
      }
      .loader-text {
        font-size: 1.2rem;
        color: var(--color-text-secondary);
        letter-spacing: 0.04em;
        margin-top: 8px;
      }
    `}</style>
  </div>
); 