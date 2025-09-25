import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const TYPES = [
  { value: '', label: 'Select (optional)' },
  { value: 'type1', label: 'Type 1' },
  { value: 'type2', label: 'Type 2' },
  { value: 'gestational', label: 'Gestational' },
  { value: 'prediabetes', label: 'Prediabetes' },
];

const ProfileSchema = Yup.object({
  diabetes_type: Yup.string().oneOf(['', 'type1', 'type2', 'gestational', 'prediabetes']),
  height_cm: Yup.number().nullable().min(50, 'Too short').max(250, 'Too tall'),
  weight_kg: Yup.number().nullable().min(20, 'Too low').max(400, 'Too high'),
});

export default function Profile() {
  const { token, user, setUser, setEducation, setAdvice } = useAuth();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await fetch('/doctors');
        if (!res.ok) return;
        const data = await res.json();
        setDoctors(data || []);
      } catch {}
    }
    loadDoctors();
  }, []);

  // Render nothing until user info is available
  if (!user) return null;

  async function handleSubmit(values, { setSubmitting, setStatus }) {
    setStatus(null);
    try {
      const res = await fetch('/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          diabetes_type: values.diabetes_type || null,
          height_cm: values.height_cm === '' ? null : values.height_cm,
          weight_kg: values.weight_kg === '' ? null : values.weight_kg,
          doctor_id: values.doctor_id === '' ? null : values.doctor_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      const { education, advice, ...userData } = data;
      setUser(userData);
      if (education) setEducation(education);
      if (advice) setAdvice(advice);
      setStatus('Saved!');
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
          <span>Home</span>
          <span className="sep">›</span>
          <b>Profile</b>
        </div>
        <div className="accent-line" />
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Profile</h2>
        <Formik
        initialValues={{
          diabetes_type: user.diabetes_type || '',
          height_cm: user.height_cm ?? '',
          weight_kg: user.weight_kg ?? '',
          doctor_id: user.doctor_id ?? '',
        }}
        validationSchema={ProfileSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ isSubmitting, status }) => (
          <Form className="space-y">
            <label>Diabetes Type</label>
            <Field as="select" name="diabetes_type">
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Field>
            <div className="error"><ErrorMessage name="diabetes_type" /></div>

            <label>Doctor</label>
            <Field as="select" name="doctor_id">
              <option value="">Unassigned</option>
              {doctors.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.email})</option>
              ))}
            </Field>

            <label>Height (cm)</label>
            <Field name="height_cm" type="number" step="0.1" />
            <div className="error"><ErrorMessage name="height_cm" /></div>

            <label>Weight (kg)</label>
            <Field name="weight_kg" type="number" step="0.1" />
            <div className="error"><ErrorMessage name="weight_kg" /></div>

            {status && <div className={status === 'Saved!' ? 'success' : 'error'}>{status}</div>}
            <button className="btn" type="submit" disabled={isSubmitting}>Save</button>
            <div style={{ marginTop: 12 }}>
              <Link className="btn btn-outline" to="/dashboard">Go to Dashboard</Link>
            </div>
          </Form>
        )}
      </Formik>
      </div>
    </div>
  );
}
