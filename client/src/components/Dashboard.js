import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export default function Dashboard() {
  const { user, education, advice, token } = useAuth();
  const [bmi, setBmi] = useState(null);
  const [bmiError, setBmiError] = useState(null);

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
    loadBMI();
  }, [user, token]);

  if (!user) return <div>Loading...</div>;

  return (
    <div>
      <div className="crumb-wrap card" style={{ marginBottom: 16 }}>
        <div className="crumb">
          <span>Home</span>
          <span className="sep">›</span>
          <b>Dashboard</b>
        </div>
        <div className="accent-line" />
      </div>

      <section className="card section">
        <h3 style={{ marginTop: 0 }}>Welcome, {user.name}</h3>
        <div className="grid-2">
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Diabetes Type:</strong> {user.diabetes_type || 'Not set'}</div>
        </div>
      </section>

      <section className="card section">
        <h3 style={{ marginTop: 0 }}>BMI</h3>
        {!user.height_cm || !user.weight_kg ? (
          <p>Set your height and weight in the Profile page to see your BMI.</p>
        ) : bmi ? (
          <p><strong>{bmi.bmi}</strong> — {bmi.category}</p>
        ) : bmiError ? (
          <p style={{ color: 'crimson' }}>{bmiError}</p>
        ) : (
          <p>Loading BMI...</p>
        )}
      </section>

      <section className="card">
        <h3 style={{ marginTop: 0 }}>Educational Insights</h3>
        {education && education.length > 0 ? (
          <ul>
            {education.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        ) : (
          <p>No specific tips yet. Update your diabetes type in your profile to get tailored insights.</p>
        )}
      </section>

      <section className="card section">
        <h3 style={{ marginTop: 0 }}>Personalized Advice</h3>
        {advice?.bmi_category && (
          <p style={{ marginTop: 0 }}>
            <strong>BMI Category:</strong> {advice.bmi_category}
          </p>
        )}
        <div className="grid-2">
          <div>
            <h4>Nutrition</h4>
            <ul>
              {(advice?.nutrition || []).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Exercise</h4>
            <ul>
              {(advice?.exercise || []).map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="section">
          <h4>Medication</h4>
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
