import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { useHistory } from 'react-router-dom';
import OnboardingStepper from './OnboardingStepper';
import { useLanguage } from './LanguageContext';


const ReadingSchema = Yup.object({
  value: Yup.number().min(40).max(500).required('Required'),
  date: Yup.string().required('Required'), 
  time: Yup.string().required('Required'),
  context: Yup.string().oneOf(['', 'pre_meal', 'post_meal']),
  notes: Yup.string(),
});

function evaluateGlucose(value, context) {
  if (context === 'pre_meal') {
    if (value < 80) return { status: 'low', color: 'goldenrod' };
    if (value <= 130) return { status: 'normal', color: 'green' };
    return { status: 'high', color: 'crimson' };
  }
  // post_meal or unknown
  if (value < 180) return { status: 'normal', color: 'green' };
  return { status: 'high', color: 'crimson' };
}


const TIPS_NORMAL = [
  'Maintain balanced meals with non-starchy veggies, lean protein, and healthy fats.',
  'Stay hydrated and keep up light daily activity.',
  'Aim for consistent meal times and portion control.',
];
const TIPS_HIGH = [
  'Take a 15–30 minute walk and hydrate with water.',
  'Reduce refined carbohydrates; choose low-GI, high-fiber foods.',
  'Include lean proteins and healthy fats to slow glucose spikes.',
  'Discuss supplements with your doctor (e.g., cinnamon, berberine).',
];

function suggestionsFor(value, context) {
  const { status } = evaluateGlucose(value, context);
  if (status === 'normal') return TIPS_NORMAL;
  if (status === 'high') return TIPS_HIGH;
  return [];
}

export default function Readings() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
 
  const [setReminder, setSetReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const history = useHistory();

  const { t } = useLanguage();

  // Initialize default date/time
  const now = new Date();
  const defaultDate = now.toISOString().slice(0, 10);
  const curH = now.getHours();
  const curM = now.getMinutes();
  const defaultMeridiem = curH >= 12 ? 'PM' : 'AM';
  const defaultTime24 = `${String(curH).padStart(2, '0')}:${String(curM).padStart(2, '0')}`;

  // AM/PM selection for time input
  const [meridiem, setMeridiem] = useState(defaultMeridiem);
  const [reminderMeridiem, setReminderMeridiem] = useState('AM');


  const fetchReadings = useCallback(async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API_URL}/readings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setItems(data);
    } catch (e) {
      setError(e.message);
    }
  }, [token]);

  useEffect(() => { fetchReadings(); }, [fetchReadings]);

  // Prefetch educational insights to warm up Education screen
  useEffect(() => {
    async function prefetchEducation() {
      if (!token) return;
      try {
        const API_URL = process.env.REACT_APP_API_URL || '';
        await fetch(`${API_URL}/educational-insights`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    prefetchEducation();
  }, [token]);

  async function handleDelete(id) {
    if (!window.confirm('Delete this reading?')) return;
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API_URL}/readings/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status !== 204) {
        const data = await res.json();
        throw new Error(data.error || 'Delete failed');
      }
      setItems(items.filter(r => r.id !== id));
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleCreate(values, { setSubmitting, resetForm, setStatus }) {
    setStatus(null);
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      // Convert time + meridiem to 24-hour HH:MM if needed
      let hhmm = values.time;
      if (!hhmm) throw new Error('Time is required');
      let [hStr, mStr] = hhmm.split(':');
      let h = parseInt(hStr, 10);
      const m = parseInt(mStr, 10);
      if (Number.isNaN(h) || Number.isNaN(m)) throw new Error('Invalid time');
      // If user entered 1-12 hour, apply meridiem conversion. If >12, assume already 24h input and ignore meridiem.
      if (h >= 1 && h <= 12) {
        if (meridiem === 'PM' && h < 12) h += 12;
        if (meridiem === 'AM' && h === 12) h = 0;
      }
      const time24 = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;

      const payload = { ...values, time: time24 };

      const res = await fetch(`${API_URL}/readings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setItems(prev => [...prev, data]);
      resetForm();

      // Optional: create a reminder and navigate to Education
      if (setReminder) {
        try {
          // Convert reminder time based on reminderMeridiem
          let [rhStr, rmStr] = reminderTime.split(':');
          let rh = parseInt(rhStr, 10);
          const rm = parseInt(rmStr, 10);
          if (!Number.isNaN(rh) && !Number.isNaN(rm)) {
            if (rh >= 1 && rh <= 12) {
              if (reminderMeridiem === 'PM' && rh < 12) rh += 12;
              if (reminderMeridiem === 'AM' && rh === 12) rh = 0;
            }
          }
          const reminderTime24 = `${String(rh).padStart(2,'0')}:${String(rm).padStart(2,'0')}`;
          await fetch(`${API_URL}/reminders`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              reminder_type: 'glucose',
              title: 'Next glucose check',
              message: 'Time to measure your blood sugar',
              scheduled_time: reminderTime24,
              frequency: 'daily',
            }),
          });
        } catch {}
      }
      history.push('/education');
    } catch (e) {
      setStatus(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <OnboardingStepper currentStep="readings" />
      <div className="crumb-wrap card" style={{ marginBottom: 16 }}>
        <div className="crumb">
          <span>{t('home')}</span>
          <span className="sep">›</span>
          <b>{t('readings')}</b>
        </div>
        <div className="accent-line" />
      </div>

      <div className="card section">
        <h2 style={{ marginTop: 0 }}>{t('addReading')}</h2>
        <Formik
          initialValues={{ value: '', date: defaultDate, time: defaultTime24, context: '', notes: '' }}
          validationSchema={ReadingSchema}
          onSubmit={handleCreate}
        >
          {({ isSubmitting, status }) => (
            <Form className="space-y">
              <label>{t('value')}</label>
              <Field name="value" type="number" step="1" />
              <div className="error"><ErrorMessage name="value" /></div>

              <label>{t('date')}</label>
              <Field name="date" type="date" />
              <div className="error"><ErrorMessage name="date" /></div>

              <label>{t('time')}</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <Field name="time" type="time" />
                <select
                  aria-label="AM/PM"
                  value={meridiem}
                  onChange={(e) => setMeridiem(e.target.value)}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
              <div className="error"><ErrorMessage name="time" /></div>

              <label>{t('context')} ({t('optional')})</label>
              <Field as="select" name="context">
                <option value="">{t('select')}</option>
                <option value="pre_meal">{t('preMeal')}</option>
                <option value="post_meal">{t('postMeal')}</option>
              </Field>
              <div className="error"><ErrorMessage name="context" /></div>

 
              <label>Notes (optional)</label>
          <Field name="notes" as="textarea" rows={2} />

          {status && <div className="error">{status}</div>}
          <div className="card section" style={{ marginTop: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={setReminder} onChange={(e) => setSetReminder(e.target.checked)} />
              Set reminder for next reading
            </label>
            {setReminder && (
              <div style={{ marginTop: 8 }}>
                <label>Reminder Time</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
                  <select aria-label="Reminder AM/PM" value={reminderMeridiem} onChange={(e)=> setReminderMeridiem(e.target.value)}>
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn" type="submit" disabled={isSubmitting}>Add Reading</button>
            <button className="btn btn-outline" type="button" onClick={() => history.push('/education')}>Skip & Continue</button>
          </div>
        </Form>
      )}
{/* / */}
 
        </Formik>
      </div>

      {error && <div className="error card" style={{ padding: 12, marginBottom: 12 }}>{error}</div>}

      <ul className="list">
        {items.map(r => {
          const { status, color } = evaluateGlucose(r.value, r.context);
          const tips = (r.evaluation && r.evaluation.suggestions) ? r.evaluation.suggestions : suggestionsFor(r.value, r.context);
          return (
            <li key={r.id} className="list-item" style={{ borderLeft: `6px solid ${color}` }}>
              <div><strong>{r.date}</strong> {r.time?.slice(0,5)} — {r.context || 'n/a'}</div>
              <div>Value: <strong style={{ color }}>{r.value}</strong> ({status})</div>
              {r.notes && <div>Notes: {r.notes}</div>}
              {tips.length > 0 && (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontWeight: 600 }}>Suggestions</div>
                  <ul>
                    {tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              <button className="btn btn-outline" onClick={() => handleDelete(r.id)} style={{ marginTop: 6 }}>Delete</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
