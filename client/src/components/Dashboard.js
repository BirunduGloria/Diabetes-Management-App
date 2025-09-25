import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export default function Dashboard() {
  const { user, education, advice, token } = useAuth();
  const [bmi, setBmi] = useState(null);
  const [bmiError, setBmiError] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadBMI() {
      if (!user) return;
      if (!user.height_cm || !user.weight_kg) return; // needs profile data
      try {
        const res = await fetch('/me/bmi', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setBmi(data);
        else setBmiError(data.error || 'Could not load BMI');
      } catch (e) {
        setBmiError(e.message);
      }
    }

    async function loadDoctor() {
      if (!user?.doctor_id) return;
      try {
        const res = await fetch('/doctors');
        if (res.ok) {
          const data = await res.json();
          const assignedDoctor = data.find(d => d.id === user.doctor_id);
          setDoctor(assignedDoctor);
        }
      } catch (e) {
        console.error('Failed to load doctor:', e);
      }
    }

    loadBMI();
    loadDoctor();
  }, [user, token]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <div className="crumb-wrap card" style={{ marginBottom: 16 }}>
        <div className="crumb">
          <span>{t('home')}</span>
          <span className="sep">›</span>
          <b>{t('dashboard')}</b>
        </div>
        <div className="accent-line" />
      </div>

      <section className="card section">
        <h3 style={{ marginTop: 0 }}>{t('welcome')}, {user.name}</h3>
        <div className="grid-2">
          <div><strong>{t('emailLabel')}:</strong> {user.email}</div>
          <div><strong>{t('diabetesTypeLabel')}:</strong> {user.diabetes_type || t('notSet')}</div>
          <div><strong>{t('doctorLabel')}:</strong> {doctor ? `${doctor.name} (${doctor.email})` : t('notAssigned')}</div>
          <div><strong>{t('statusLabel')}:</strong> <span style={{ color: 'var(--cyan)' }}>{t('activePatient')}</span></div>
        </div>
      </section>

      <section className="card section">
        <h3 style={{ marginTop: 0 }}>{t('bmi')}</h3>
        {!user.height_cm || !user.weight_kg ? (
          <p>{t('setProfileForBMI')}</p>
        ) : bmi ? (
          <p><strong>{bmi.bmi}</strong> — {bmi.category}</p>
        ) : bmiError ? (
          <p style={{ color: 'crimson' }}>{bmiError}</p>
        ) : (
          <p>{t('loadingBMI')}</p>
        )}
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>{t('educationalInsights')}</h3>
        {education && education.length > 0 ? (
          <ul>
            {education.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        ) : (
          <p> Update your diabetes type in your profile to get tailored insights.</p>
        )}
      </section>

      <section className="card section">
        <h3 style={{ marginTop: 0 }}>{t('personalizedAdvice')}</h3>
        {advice?.bmi_category && (
          <p style={{ marginTop: 0 }}>
            <strong>{t('bmiCategory')}:</strong> {advice.bmi_category}
          </p>
        )}
        <div className="grid-2">
          <div>
            <h4>{t('nutrition')}</h4>
            <ul>
              {(advice?.nutrition || []).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>{t('exercise')}</h4>
            <ul>
              {(advice?.exercise || []).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="section">
          <h4>{t('medication')}</h4>
          <ul>
            {(advice?.medication || []).map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
