import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useLanguage } from './LanguageContext';

const MedSchema = Yup.object({
  name: Yup.string().required('Required'),
  dose: Yup.string().required('Required'),
  time: Yup.string().required('Required'), // HH:MM
  status: Yup.string().oneOf(['pending', 'taken', 'missed']).notRequired(),
});

export default function Medications() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  const load = React.useCallback(async () => {
    setError(null);
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API_URL}/medications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setItems(data);
    } catch (e) {
      setError(e.message);
    }
  }, [token]);

  const markAllOverdue = React.useCallback(async () => {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const overdue = items.filter(m => {
      if ((m.status || 'pending') !== 'pending') return false;
      const t = m.time?.slice(0,5);
      if (!t) return false;
      const [hh, mm] = t.split(':').map(n => parseInt(n, 10));
      const medMinutes = (hh * 60) + mm;
      return medMinutes <= nowMinutes;
    });

    if (overdue.length === 0) {
      alert('No overdue pending medications.');
      return;
    }
    if (!window.confirm(`Mark ${overdue.length} overdue medication(s) as missed?`)) return;

    for (const m of overdue) {
      await updateStatus(m.id, 'missed');
    }
  }, [items]);

  useEffect(() => { load(); }, [load]);

  async function create(values, { setSubmitting, resetForm, setStatus }) {
    setStatus(null);
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API_URL}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  async function updateStatus(id, status) {
    try {
      const API_URL = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API_URL}/medications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setItems(prev => prev.map(m => (m.id === id ? data : m)));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div>
      <div className="crumb-wrap card" style={{ marginBottom: 16 }}>
        <div className="crumb">
          <span>{t('home')}</span>
          <span className="sep">›</span>
          <b>{t('medications')}</b>
        </div>

      <div className="card section" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ fontWeight: 600 }}>{t('quickActions')}</div>
  <button className="btn btn-outline" onClick={() => markAllOverdue()}>{t('markAllOverdue')}</button>
      </div>
        <div className="accent-line" />
      </div>

      <div className="card section">
        <h2 style={{ marginTop: 0 }}>{t('addMedication')}</h2>
      <Formik
        initialValues={{ name: '', dose: '', time: '', status: 'pending' }}
        validationSchema={MedSchema}
        onSubmit={create}
      >
        {({ isSubmitting, status }) => (
          <Form className="space-y">
            <label>{t('name')}</label>
            <Field name="name" />
            <div className="error"><ErrorMessage name="name" /></div>

            <label>{t('dose')}</label>
            <Field name="dose" />
            <div className="error"><ErrorMessage name="dose" /></div>

            <label>{t('time')}</label>
            <Field name="time" type="time" />
            <div className="error"><ErrorMessage name="time" /></div>

            <label>{t('status')}</label>
            <Field as="select" name="status">
              <option value="pending">{t('pending')}</option>
              <option value="taken">{t('taken')}</option>
              <option value="missed">{t('missed')}</option>
            </Field>

            {status && <div className="error">{status}</div>}
            <button className="btn" type="submit" disabled={isSubmitting}>{t('addMedication')}</button>
          </Form>
        )}
      </Formik>
      </div>

      {error && <div className="error card" style={{ padding: 12, marginBottom: 12 }}>{error}</div>}

      <ul className="list">
        {items.map(m => {
          const status = (m.status || 'pending');
          const timeStr = m.time?.slice(0,5) || '';
          // Determine overdue (client-side only): pending and scheduled time has passed today
          let isOverdue = false;
          try {
            if (status === 'pending' && timeStr) {
              const [hh, mm] = timeStr.split(':').map(n => parseInt(n, 10));
              const now = new Date();
              const nowMinutes = now.getHours() * 60 + now.getMinutes();
              const medMinutes = (hh * 60) + mm;
              if (medMinutes <= nowMinutes) isOverdue = true;
            }
          } catch {}

          const visualStatus = isOverdue ? 'missed' : status;
          const statusClass = visualStatus === 'taken'
            ? 'badge badge-taken'
            : visualStatus === 'missed'
              ? 'badge badge-missed'
              : 'badge badge-pending';
          const leftColor = visualStatus === 'taken' ? '#34d399' : visualStatus === 'missed' ? '#e5484d' : '#334155';
          return (
            <li key={m.id} className="list-item" style={{ borderLeft: `6px solid ${leftColor}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <div><strong>{m.name}</strong> — {m.dose}</div>
                <span className={statusClass} title={`Status: ${visualStatus}`}>{visualStatus}{isOverdue && status === 'pending' ? ' (overdue)' : ''}</span>
              </div>
              <div>Time: {timeStr}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={() => updateStatus(m.id, 'taken')}>{t('markTaken')}</button>
                <button className="btn btn-outline" onClick={() => updateStatus(m.id, 'missed')}>{t('markMissed')}</button>
                <button className="btn btn-outline" onClick={() => updateStatus(m.id, 'pending')}>{t('reset')}</button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

