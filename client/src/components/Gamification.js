import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export default function Gamification() {

  const { token } = useAuth();
  const { language } = useLanguage();
  const [progress, setProgress] = useState(null);
  const [badges, setBadges] = useState([]);
  const [dailyChallenges, setDailyChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadProgress = useCallback(async () => {
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API_URL}/user-progress?lang=${language}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProgress(data.progress);
        setBadges(data.badges);
        setDailyChallenges(data.daily_challenges);
      }
    } catch (e) {
      console.error('Failed to load progress:', e);
    } finally {
      setLoading(false);
    }
  }, [language, token]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  if (loading) {
    return <div className="card">Loading...</div>;
  }

  const common = { width: 28, height: 28, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

  const Icons = {
    streak: (
      <svg {...common}>
        <path d="M12 2c2 3 2 5.5 0 7.5S9 13 9 15.5 10.5 22 12 22s3-2.5 3-6.5S10 9 12 2Z"/>
      </svg>
    ),
    readings: (
      <svg {...common}>
        <path d="M3 3v18h18"/>
        <path d="M7 15l3-3 3 3 4-5"/>
      </svg>
    ),
    star: (
      <svg {...common}><path d="M12 2l3.09 6.26L22 9.27l-5 4.88L18.18 22 12 18.77 5.82 22 7 14.15l-5-4.88 6.91-1.01L12 2z"/></svg>
    ),
    medal: (
      <svg {...common}><circle cx="12" cy="13" r="4"/><path d="M8 2h8l-2 4h-4L8 2z"/></svg>
    ),
  };

  function renderIcon(token) {
    switch (token) {
      case '🔥':
        return Icons.streak;
      case '📊':
        return Icons.readings;
      case '🏆':
      case '⭐':
        return Icons.star;
      default:
        return Icons.medal;
    }
  }

  return (
    <div>
      <div className="crumb-wrap card" style={{ marginBottom: 16 }}>
        <div className="crumb">
          <span>Home</span>
          <span className="sep">›</span>
          <b>{language === 'sw' ? 'Maendeleo' : 'Progress'}</b>
        </div>
        <div className="accent-line" />
      </div>

      {/* Level & Stats */}
      <div className="card section">
        <h3 style={{ marginTop: 0 }}>
          {language === 'sw' ? 'Kiwango' : 'Level'} {progress?.level?.level}: {progress?.level?.title}
        </h3>
        <div className="grid-2" style={{ gap: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'grid', placeItems: 'center', color: 'var(--cyan)' }}>{Icons.streak}</div>
            <div style={{ fontWeight: 'bold' }}>{progress?.current_streak}</div>
            <div>{language === 'sw' ? 'Siku mfululizo' : 'Day Streak'}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'grid', placeItems: 'center', color: 'var(--cyan)' }}>{Icons.readings}</div>
            <div style={{ fontWeight: 'bold' }}>{progress?.total_readings}</div>
            <div>{language === 'sw' ? 'Jumla ya Vipimo' : 'Total Readings'}</div>
          </div>
        </div>
      </div>

      {/* Daily Challenges */}
      <div className="card section">
        <h3 style={{ marginTop: 0 }}>
          {language === 'sw' ? 'Changamoto za Leo' : 'Today\'s Challenges'}
        </h3>
        {dailyChallenges.map(challenge => (
          <div key={challenge.id} className="list-item" style={{ 
            borderLeft: `4px solid ${challenge.status.completed ? '#10b981' : '#6b7280'}` 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ display: 'grid', placeItems: 'center', color: 'var(--cyan)' }}>{renderIcon(challenge.icon)}</span>
              <div>
                <strong>{challenge.name}</strong>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  {challenge.description}
                </div>
                {challenge.status.completed && (
                  <span style={{ color: '#10b981' }}>✓ Complete</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="card section">
          <h3 style={{ marginTop: 0 }}>
            {language === 'sw' ? 'Tuzo Zako' : 'Your Badges'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {badges.map(badge => (
              <div key={badge.id} className="list-item" style={{ textAlign: 'center' }}>
                <div style={{ display: 'grid', placeItems: 'center', color: 'var(--cyan)' }}>{renderIcon(badge.icon)}</div>
                <div style={{ fontWeight: 'bold' }}>{badge.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
