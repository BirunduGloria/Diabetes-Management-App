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
});

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
      const API_URL = process.env.REACT_APP_API_URL || '';
      const res = await fetch(`${API_URL}/signup`, {
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
      // After account creation, direct the user to complete their profile
      localStorage.removeItem('onboarding_complete');
      history.push('/profile');
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
        initialValues={{ name: '', email: '', password: '' }}
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

            {/* Simplified signup: only basic account fields */}

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
