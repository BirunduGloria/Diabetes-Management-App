import React from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Home() {
  const { isAuthed } = useAuth();
  const history = useHistory();

  function handleGetStarted() {
    history.push(isAuthed ? '/profile' : '/signup');
  }

  return (
    <div className="landing" style={{
backgroundImage: 'url("https://i.pinimg.com/736x/de/61/62/de616273e14c5c0ce42a0f681e47d982.jpg")',  minHeight: '100vh'
}}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
                <h1 style={{ marginTop: 0 }}>Diabetes Management</h1>
        <p>Track glucose, understand trends, get local food advice, and stay connected with your doctor.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn" onClick={handleGetStarted}>{isAuthed ? 'Continue' : 'Get Started'}</button>
          {!isAuthed && <NavLink to="/login" className="btn btn-outline">Log In</NavLink>}
        </div>
      </div>

     <div style={{ padding: '20px' }}>
       <div>
          <h3 style={{ marginTop: 0 }}>Simple Onboarding</h3>
          <ul>
            <li>Set up your profile (age, gender, height, weight)</li>
            <li>Auto BMI as you input</li>
            <li>Next-step guidance</li>
          </ul>
        </div>
        <div style={{ padding: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Smart Tracking</h3>
          <ul>
            <li>Pre-meal / Post-meal glucose</li>
            <li>Flag abnormal values</li>
            <li>Reminders for check-ins</li>
          </ul>
        </div>
        <div style={{ padding: '20px' }}>
          <h3 style={{ marginTop: 0 }}>Local Insights</h3>
          <ul>
            <li>Kenyan food tips and swaps</li>
            <li>Actionable exercise suggestions</li>
            <li>Doctor contact and emergency</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
