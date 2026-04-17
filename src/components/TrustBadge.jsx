import React from 'react';
import { theme } from '../theme';

export default function TrustBadge({ score }) {
  // Score is 0-100
  const getColor = () => {
    if (score >= 75) return theme.trustGreen;
    if (score >= 50) return theme.trustYellow;
    return theme.trustRed;
  };

  const getLabel = () => {
    if (score >= 75) return 'Trusted';
    if (score >= 50) return 'Moderate';
    return 'Low Trust';
  };

  const getIcon = () => {
    if (score >= 75) return '✅';
    if (score >= 50) return '⚠️';
    return '❌';
  };

  const color = getColor();

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 14px',
        backgroundColor: `${color}15`,
        border: `2px solid ${color}`,
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        color: color,
      }}
    >
      <span style={{ fontSize: '18px' }}>{getIcon()}</span>
      <span>Trust Score: {score}/100</span>
    </div>
  );
}
