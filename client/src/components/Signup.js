import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const SignupSchema = Yup.object({
  name: Yup.string().min(2, 'Too short').required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Required'),
  diabetes_type: Yup.string().oneOf(['', 'type1', 'type2', 'gestational', 'prediabetes'], 'Invalid'),
  height_cm: Yup.number().typeError('Must be a number').min(80, 'Too short').max(260, 'Too tall').nullable(),
  weight_kg: Yup.number().typeError('Must be a number').min(20, 'Too low').max(300, 'Too high').nullable(),
  initial_reading_value: Yup.number().typeError('Must be a number').min(40).max(500).nullable(),
  initial_reading_context: Yup.string().oneOf(['pre_meal', 'post_meal']).nullable(),
});

const TYPES = [
  { value: '', label: 'Select (optional)' },
  { value: 'type1', label: 'Type 1' },
  { value: 'type2', label: 'Type 2' },
  { value: 'gestational', label: 'Gestational' },
  { value: 'prediabetes', label: 'Prediabetes' },
];

export default function Signup() {
  const history = useHistory();
  const { setToken, setUser, setEducation, setAdvice, logout } = useAuth();

  // Ensure any existing session is terminated when starting a new signup
  useEffect(() => {
    logout();
    // Clear onboarding so the new user will follow the intended flow
    localStorage.removeItem('onboarding_complete');
  }, []);

  async function handleSubmit(values, { setSubmitting, setStatus }) {
    setStatus(null);
    try {
      const res = await fetch('/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setToken(data.access_token);
      setUser(data.user);
      setEducation(data.education || []);
      setAdvice(data.advice || { nutrition: [], exercise: [], medication: [], bmi_category: null });
      localStorage.setItem('onboarding_complete', 'true');
      history.push('/dashboard');
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
          <b>Signup</b>
        </div>
        <div className="accent-line" />
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Signup</h2>
        <Formik
        initialValues={{ name: '', email: '', password: '', diabetes_type: '', height_cm: '', weight_kg: '', initial_reading_value: '', initial_reading_context: 'pre_meal' }}
        validationSchema={SignupSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, status }) => (
          <Form className="space-y">
            <label>Name</label>
            <Field name="name" />
            <div className="error"><ErrorMessage name="name" /></div>

            <label>Email</label>
            <Field name="email" type="email" />
            <div className="error"><ErrorMessage name="email" /></div>

            <label>Password</label>
            <Field name="password" type="password" />
            <div className="error"><ErrorMessage name="password" /></div>

            <label>Diabetes Type (optional)</label>
            <Field as="select" name="diabetes_type">
              {TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </Field>
            <div className="error"><ErrorMessage name="diabetes_type" /></div>

            <div className="accent-line" />
            <h3 style={{ margin: 0 }}>Health Profile</h3>
            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <label>Height (cm)</label>
                <Field name="height_cm" />
                <div className="error"><ErrorMessage name="height_cm" /></div>
              </div>
              <div>
                <label>Weight (kg)</label>
                <Field name="weight_kg" />
                <div className="error"><ErrorMessage name="weight_kg" /></div>
              </div>
            </div>

            <div className="accent-line" />
            <h3 style={{ margin: 0 }}>First Reading (optional)</h3>
            <div className="grid-2" style={{ gap: 12 }}>
              <div>
                <label>Value (mg/dL)</label>
                <Field name="initial_reading_value" />
                <div className="error"><ErrorMessage name="initial_reading_value" /></div>
              </div>
              <div>
                <label>Context</label>
                <Field as="select" name="initial_reading_context">
                  <option value="pre_meal">Pre-meal</option>
                  <option value="post_meal">Post-meal</option>
                </Field>
                <div className="error"><ErrorMessage name="initial_reading_context" /></div>
              </div>
            </div>

            {status && <div className="error">{status}</div>}
            <button className="btn" type="submit" disabled={isSubmitting}>Create Account</button>

            <div>
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </Form>
        )}
      </Formik>
      </div>
    </div>
  );
}
