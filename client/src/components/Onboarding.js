import React, { useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export default function Onboarding() {
  const history = useHistory();
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [hasReading, setHasReading] = useState(false);
  const [hasMedication, setHasMedication] = useState(false);
  const [step, setStep] = useState(0); // 0..5
  const [animKey, setAnimKey] = useState(0);

  // Profile form state
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [bmiInfo, setBmiInfo] = useState(null); // { bmi, category }
  const [profileAdvice, setProfileAdvice] = useState(null); // { nutrition:[], exercise:[], medication:[], bmi_category }
  const [profileError, setProfileError] = useState(null);

  // Glucose form state
  const now = useMemo(() => new Date(), []);
  const [gValue, setGValue] = useState('');
  const [gContext, setGContext] = useState('pre_meal');
  const [gSubmitting, setGSubmitting] = useState(false);
  const [gEval, setGEval] = useState(null); // { status, color, suggestions }
  const [gError, setGError] = useState(null);

  useEffect(() => {
    async function checkProgress() {
      const API_URL = process.env.REACT_APP_API_URL || '';
      try {
        const r = await fetch(`${API_URL}/readings`, { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) {
          const data = await r.json();
          setHasReading(Array.isArray(data) && data.length > 0);
        }
      } catch {}
      try {
        const m = await fetch(`${API_URL}/medications`, { headers: { Authorization: `Bearer ${token}` } });
        if (m.ok) {
          const data = await m.json();
          setHasMedication(Array.isArray(data) && data.length > 0);
        }
      } catch {}
    }
    checkProgress();
  }, [token]);

  useEffect(() => {
    const done = localStorage.getItem('onboarding_complete') === 'true';
    if (done) history.replace('/dashboard');
  }, [history]);

  function goTo(next) {
    setAnimKey(k => k + 1);
    setStep(next);
  }

  async function saveProfile() {
    setProfileError(null);
    setProfileLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API_URL}/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ height_cm: height ? Number(height) : null, weight_kg: weight ? Number(weight) : null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setProfileAdvice(data.advice || null);
      // Fetch BMI
      const bmiRes = await fetch(`${API_URL}/me/bmi`, { headers: { Authorization: `Bearer ${token}` } });
      if (bmiRes.ok) {
        const bmiData = await bmiRes.json();
        setBmiInfo(bmiData);
      } else {
        setBmiInfo(null);
      }
    } catch (e) {
      setProfileError(e.message);
    } finally {
      setProfileLoading(false);
    }
  }

  async function submitGlucose() {
    setGError(null);
    setGSubmitting(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const dateStr = new Date().toISOString().slice(0,10);
      const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      const res = await fetch(`${API_URL}/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ value: Number(gValue), date: dateStr, time: timeStr, context: gContext })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save reading');
      setGEval(data.evaluation || null);
    } catch (e) {
      setGError(e.message);
    } finally {
      setGSubmitting(false);
    }
  }

  function complete() {
    localStorage.setItem('onboarding_complete', 'true');
    history.push('/dashboard');
  }

  const cards = [
    {
      key: 'welcome',
      title: language === 'sw' ? 'Karibu' : 'Welcome',
      body: language === 'sw'
        ? 'Tuanze na kuandaa wasifu wako na kipimo cha kwanza.'
        : 'Let’s start by setting up your profile and first reading.',
      primary: { label: language === 'sw' ? 'Endelea' : 'Continue', action: () => goTo(1) },
    },
    {
      key: 'profile',
      title: language === 'sw' ? 'Wasifu wa Afya' : 'Health Profile',
      body: language === 'sw' ? 'Weka urefu na uzito ili kukokotoa BMI yako.' : 'Enter height and weight to calculate your BMI.',
      custom: (
        <div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div>
              <label>{t('height')}</label>
              <input value={height} onChange={e=>setHeight(e.target.value)} inputMode="decimal" className="input" placeholder="170" />
            </div>
            <div>
              <label>{t('weight')}</label>
              <input value={weight} onChange={e=>setWeight(e.target.value)} inputMode="decimal" className="input" placeholder="70" />
            </div>
          </div>
          {profileError && <div className="error" style={{ marginTop: 8 }}>{profileError}</div>}
          <div style={{ display:'flex', gap: 8, marginTop: 12, flexWrap:'wrap' }}>
            <button className="btn" onClick={saveProfile} disabled={profileLoading || (!height && !weight)}>
              {profileLoading ? (language==='sw'?'Inahifadhi...':'Saving...') : (language==='sw'?'Hifadhi':'Save')}
            </button>
            <button className="btn btn-outline" onClick={() => goTo(2)}>{language==='sw'?'Baadaye':'Later'}</button>
          </div>
          {(bmiInfo || profileAdvice) && (
            <div className="card section" style={{ marginTop: 12 }}>
              {bmiInfo && (
                <p style={{ marginTop: 0 }}><strong>{t('bmi')}:</strong> {bmiInfo.bmi} — {bmiInfo.category}</p>
              )}
              {profileAdvice && (
                <div className="grid-2" style={{ gap: 12 }}>
                  <div>
                    <h4 style={{ marginTop: 0 }}>{t('nutrition')}</h4>
                    <ul>{(profileAdvice.nutrition||[]).map((x,i)=>(<li key={i}>{x}</li>))}</ul>
                  </div>
                  <div>
                    <h4 style={{ marginTop: 0 }}>{t('exercise')}</h4>
                    <ul>{(profileAdvice.exercise||[]).map((x,i)=>(<li key={i}>{x}</li>))}</ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ),
      primary: { label: language === 'sw' ? 'Endelea' : 'Continue', action: () => goTo(2) },
      secondary: { label: language === 'sw' ? 'Rudi' : 'Back', action: () => goTo(0) },
    },
    {
      key: 'glucose',
      title: language === 'sw' ? 'Kipimo cha Sukari' : 'Glucose Reading',
      body: language === 'sw' ? 'Ongeza kipimo chako cha kwanza.' : 'Add your first reading.',
      custom: (
        <div>
          <div className="grid-2" style={{ gap: 12 }}>
            <div>
              <label>{t('value')}</label>
              <input value={gValue} onChange={e=>setGValue(e.target.value)} inputMode="decimal" className="input" placeholder="120" />
            </div>
            <div>
              <label>{t('context')}</label>
              <select value={gContext} onChange={e=>setGContext(e.target.value)} className="input">
                <option value="pre_meal">{t('preMeal')}</option>
                <option value="post_meal">{t('postMeal')}</option>
              </select>
            </div>
          </div>
          {gError && <div className="error" style={{ marginTop: 8 }}>{gError}</div>}
          <div style={{ display:'flex', gap: 8, marginTop: 12, flexWrap:'wrap' }}>
            <button className="btn" onClick={submitGlucose} disabled={gSubmitting || !gValue}>{gSubmitting?(language==='sw'?'Inatuma...':'Submitting...'):(language==='sw'?'Hifadhi':'Save')}</button>
            <button className="btn btn-outline" onClick={() => goTo(3)}>{language==='sw'?'Baadaye':'Later'}</button>
          </div>
          {gEval && (
            <div className="card section" style={{ marginTop: 12, borderLeft: `6px solid ${gEval.color||'#999'}` }}>
              <div><strong>{(gEval.status||'').toUpperCase()}</strong></div>
              <ul style={{ marginTop: 6 }}>
                {(gEval.suggestions||[]).map((s,i)=>(<li key={i}>{s}</li>))}
              </ul>
            </div>
          )}
        </div>
      ),
      primary: { label: language === 'sw' ? 'Endelea' : 'Continue', action: () => goTo(3) },
      secondary: { label: language === 'sw' ? 'Rudi' : 'Back', action: () => goTo(1) },
    },
    {
      key: 'med',
      title: t('addMedication'),
      body: language === 'sw' ? 'Weka kikumbusho chako cha dawa (hiari).' : 'Set your medication reminder (optional).',
      primary: hasMedication
        ? { label: language === 'sw' ? 'Imekamilika' : 'Done', action: () => goTo(4) }
        : { label: language === 'sw' ? 'Nenda kwa Dawa' : 'Go to Medications', action: () => history.push('/medications') },
      secondary: { label: language === 'sw' ? 'Baadaye' : 'Later', action: () => goTo(4) },
    },
    {
      key: 'alerts',
      title: language === 'sw' ? 'Arifa Mahiri' : 'Smart Alerts',
      body: language === 'sw' ? 'Washa arifa za utabiri ili kupata msaada wa wakati.' : 'Enable predictive alerts for timely guidance.',
      primary: { label: language === 'sw' ? 'Nenda kwa Arifa' : 'Go to Alerts', action: () => history.push('/smart-alerts') },
      secondary: { label: language === 'sw' ? 'Baadaye' : 'Later', action: () => goTo(5) },
    },
    {
      key: 'done',
      title: language === 'sw' ? 'Uko Tayari' : 'You’re All Set',
      body: language === 'sw' ? 'Endelea kwenye dashibodi yako.' : 'Head to your dashboard to continue.',
      primary: { label: language === 'sw' ? 'Endelea' : 'Continue', action: complete },
    },
  ];

  const current = cards[step];

  return (
    <div key={animKey} className="card section fade-step" style={{ maxWidth: 640, margin: '16px auto' }}>
      <h2 style={{ marginTop: 0 }}>{current.title}</h2>
      <p>{current.body}</p>
      {current.custom}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {current.primary && (
          <button className="btn" onClick={current.primary.action}>{current.primary.label}</button>
        )}
        {current.secondary && (
          <button className="btn btn-outline" onClick={current.secondary.action}>{current.secondary.label}</button>
        )}
      </div>
    </div>
  );
} 