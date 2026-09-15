
import React from 'react';
import { USER_BADGES, BADGE_METADATA } from '../../utils/constants/badgeConfig';
import { getCardMetrics } from '../../utils/layout/cardMetrics';

function AchievementBadge({ type, alt }) {
  return (
    <img 
      src={`${process.env.PUBLIC_URL}/images/${type}.png`}
      alt={alt}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'contain',
      }}
    />
  );
}

export default function UserBadges({ name, cardHeight }) {
  const userBadges = USER_BADGES[name] || [];
  const { imageHeight, badgeSize } = getCardMetrics(cardHeight);
  return (
    <div style={{
      position: 'absolute',
      top: `${imageHeight - badgeSize * 0.55}px`,
      right: `${Math.max(3, cardHeight * 0.02)}px`,
      width: `${badgeSize}px`,
      height: `${badgeSize}px`,
      zIndex: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: `${Math.max(2, badgeSize * 0.07)}px`
    }}>
      {userBadges
        .sort((a, b) => BADGE_METADATA[a].priority - BADGE_METADATA[b].priority)
        .map((badgeType) => (
          <AchievementBadge 
            key={badgeType}
            type={badgeType}
            alt={BADGE_METADATA[badgeType].alt}
          />
        ))}
    </div>
  );
}
