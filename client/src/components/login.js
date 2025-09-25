import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const API_URL = process.env.REACT_APP_API_URL || '';
const LoginSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  password: Yup.string().min(6, 'Min 6 characters').required('Required'),
});

export default function Login() {
  const history = useHistory();
  const { setToken, setUser, setEducation, setAdvice } = useAuth();

  async function handleSubmit(values, { setSubmitting, setStatus }) {
    setStatus(null);
    try {
      const res = await fetch(API_URL+'/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      setToken(data.access_token);
      setUser(data.user);
      setEducation(data.education || []);
      setAdvice(data.advice || { nutrition: [], exercise: [], medication: [], bmi_category: null });
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
          <b>Login</b>
        </div>
        <div className="accent-line" />
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Login</h2>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
          <Form className="space-y">
            <label>Email</label>
            <Field name="email" type="email" />
            <div className="error"><ErrorMessage name="email" /></div>

            <label>Password</label>
            <Field name="password" type="password" />
            <div className="error"><ErrorMessage name="password" /></div>

            {status && <div className="error">{status}</div>}
            <button className="btn" type="submit" disabled={isSubmitting}>Login</button>

            <div>
              No account? <Link to="/signup">Create one</Link>
            </div>
          </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
