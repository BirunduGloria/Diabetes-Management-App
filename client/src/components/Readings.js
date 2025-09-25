import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
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
  const { t } = useLanguage();

  async function fetchReadings() {
    try {
      const res = await fetch('/readings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setItems(data);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => { fetchReadings(); }, []);

  async function handleDelete(id) {
    if (!window.confirm('Delete this reading?')) return;
    try {
      const res = await fetch(`/readings/${id}`, {
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
      const res = await fetch('/readings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Create failed');
      setItems(prev => [...prev, data]);
      resetForm();
    } catch (e) {
      setStatus(e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
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
          initialValues={{ value: '', date: '', time: '', context: '', notes: '' }}
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
              <Field name="time" type="time" />
              <div className="error"><ErrorMessage name="time" /></div>

              <label>{t('context')} ({t('optional')})</label>
              <Field as="select" name="context">
                <option value="">{t('select')}</option>
                <option value="pre_meal">{t('preMeal')}</option>
                <option value="post_meal">{t('postMeal')}</option>
              </Field>
              <div className="error"><ErrorMessage name="context" /></div>

              <label>{t('notes')} ({t('optional')})</label>
              <Field name="notes" as="textarea" rows={2} />

              {status && <div className="error">{status}</div>}
              <button className="btn" type="submit" disabled={isSubmitting}>{t('addReading')}</button>
            </Form>
          )}
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
