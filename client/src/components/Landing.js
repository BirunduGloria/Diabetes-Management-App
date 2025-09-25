import React, { useEffect } from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export default function Landing() {
  const history = useHistory();
  const { isAuthed } = useAuth();
  const { language } = useLanguage();

  useEffect(() => {
    if (isAuthed) history.replace('/dashboard');
  }, [isAuthed, history]);

  return (
    <div className="card section" style={{ maxWidth: 860, margin: '16px auto' }}>
      <h1 style={{ marginTop: 0 }}>
        {language === 'sw' ? 'Huduma ya Kudhibiti Kisukari ya Kenya' : 'Kenyan Diabetes Management'}
      </h1>
      <p style={{ marginBottom: 16 }}>
        {language === 'sw'
          ? 'Fuata sukari ya damu, kumbusho za dawa, BMI, vyakula vya wenye kisukari, na arifa mahiri.'
          : 'Track blood sugar, medication reminders, BMI, diabetes-friendly foods, and smart alerts.'}
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/login" className="btn">{language === 'sw' ? 'Ingia' : 'Login'}</Link>
        <Link to="/signup" className="btn btn-outline">{language === 'sw' ? 'Jisajili' : 'Create Account'}</Link>
      </div>
    </div>
  );
} 