import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export default function Landing() {
  const history = useHistory();
  const { isAuthed } = useAuth();
  const { language } = useLanguage();

  const t = {
    title_en: 'Manage Your Diabetes,\nEmbrace Your Life',
    title_sw: 'Dhibiti Kisukari Chako,\nKumbatia Maisha Yako',
    subtitle_en: 'Empowering you with personalized insights, reminders, and support designed with the Kenyan experience in mind.',
    subtitle_sw: 'Tunakupa maarifa, vikumbusho, na usaidizi binafsi ulioundwa kwa mazingira ya Kenya.',
    getStarted_en: 'Get Started',
    getStarted_sw: 'Anza Sasa',
    features_title_en: 'Your Health, Simplified',
    features_title_sw: 'Afya Yako, Imerahisishwa',
    features_sub_en: 'A comprehensive suite to make diabetes management easier and more effective.',
    features_sub_sw: 'Vifurushi kamili kurahisisha usimamizi wa kisukari.',
    designed_title_en: 'Designed for You',
    designed_title_sw: 'Imetengenezwa Kwa Ajili Yako',
    designed_sub_en: 'Built for Kenyan contexts — from culturally relevant content to intuitive design.',
    designed_sub_sw: 'Imezaliwa kwa muktadha wa Kenya — kuanzia maudhui ya kitamaduni hadi muundo rahisi.',
    ready_title_en: 'Ready to Take Control?',
    ready_title_sw: 'Uko Tayari Kuchukua Usukani?',
    ready_sub_en: 'Start your journey to better diabetes management today.',
    ready_sub_sw: 'Anza safari yako ya kusimamia kisukari vyema leo.',
    download_en: 'Download the App',
    download_sw: 'Pakua Programu',
  };

  const isSw = language === 'sw';

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero card">
        <div className="hero-media" aria-hidden>
          {/* Royalty-free scenic image for Kenyan feel */}
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop"
            alt="Savannah sunset backdrop"
          />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            {(isSw ? t.title_sw : t.title_en).split('\n').map((line, i) => (
              <span key={i}>{line}<br/></span>
            ))}
          </h1>
          <p className="hero-sub">{isSw ? t.subtitle_sw : t.subtitle_en}</p>
          <div className="hero-cta">
            {isAuthed ? (
              <>
                <Link to="/dashboard" className="btn">{isSw ? 'Nenda kwenye Dashibodi' : 'Go to Dashboard'}</Link>
                <Link to="/profile" className="btn btn-outline">{isSw ? 'Wasifu' : 'Profile'}</Link>
              </>
            ) : (
              <>
                <Link to="/signup" className="btn">{isSw ? t.getStarted_sw : t.getStarted_en}</Link>
                <Link to="/login" className="btn btn-outline">{isSw ? 'Ingia' : 'Login'}</Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container">
        <div className="section text-center">
          <h2 className="section-title">{isSw ? t.features_title_sw : t.features_title_en}</h2>
          <p className="section-sub">{isSw ? t.features_sub_sw : t.features_sub_en}</p>
        </div>

        <div className="features-grid">
          <FeatureCard icon="💡" title={isSw ? 'Maarifa Binafsi' : 'Personalized Insights'} desc={isSw ? 'Pata mapendekezo kulingana na data yako ya afya.' : 'Receive tailored recommendations and insights based on your health data.'} />
          <FeatureCard icon="⏰" title={isSw ? 'Vikumbusho vya Dawa' : 'Medication Reminders'} desc={isSw ? 'Kamwe usikose dozi tena kwa vikumbusho vinavyofaa.' : 'Never miss a dose with friendly reminders for your medications.'} />
          <FeatureCard icon="🤝" title={isSw ? 'Jumuiya' : 'Community Support'} desc={isSw ? 'Ungana na Wakenya wenzako katika safari ya kudhibiti kisukari.' : 'Connect with a supportive community of fellow Kenyans on their diabetes journey.'} />
          <FeatureCard icon="📈" title={isSw ? 'Ufuatiliaji wa Maendeleo' : 'Progress Tracking'} desc={isSw ? 'Fuatilia mienendo na malengo kwa dashibodi rahisi.' : 'Track your progress and achieve your goals with intuitive tracking.'} />
        </div>
      </section>

      {/* Designed for you */}
      <section className="container">
        <div className="section text-center">
          <h2 className="section-title">{isSw ? t.designed_title_sw : t.designed_title_en}</h2>
          <p className="section-sub">{isSw ? t.designed_sub_sw : t.designed_sub_en}</p>
        </div>

        <div className="designed-grid">
          <DesignedCard
            img="https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=800&auto=format&fit=crop"
            title={isSw ? 'Maudhui Yanayohusiana na Utamaduni' : 'Culturally Relevant Content'}
            desc={isSw ? 'Taarifa zinazofaa mazingira ya Kenya, ikiwa ni pamoja na lishe na mtindo wa maisha.' : 'Access information tailored to the Kenyan context, including dietary advice and lifestyle tips.'}
          />
          <DesignedCard
            img="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"
            title={isSw ? 'Kiolesura Rahisi' : 'Easy-to-Use Interface'}
            desc={isSw ? 'Uzoefu rahisi unaokuwezesha kuzingatia kile kilicho muhimu.' : 'A user-friendly experience designed for simplicity and focus.'}
          />
          <DesignedCard
            img="https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=800&auto=format&fit=crop"
            title={isSw ? 'Mwongozo wa Wataalamu' : 'Expert Guidance'}
            desc={isSw ? 'Pata mwongozo kutoka kwa wataalamu wa afya waliobobea.' : 'Benefit from expert guidance and resources from healthcare professionals.'}
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="container">
        <div className="cta card text-center">
          <h3 className="section-title">{isSw ? t.ready_title_sw : t.ready_title_en}</h3>
          <p className="section-sub">{isSw ? t.ready_sub_sw : t.ready_sub_en}</p>
          <Link to="/signup" className="btn">{isSw ? t.download_sw : t.download_en}</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer container">
        <div className="footer-inner">
          <nav className="footer-links">
            <Link to="#">Privacy Policy</Link>
            <Link to="#">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
          </nav>
          <div className="muted">© {new Date().getFullYear()} AfyaCheck. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature card">
      <div className="feature-icon" aria-hidden>{icon}</div>
      <div>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-desc">{desc}</p>
      </div>
    </div>
  );
}

function DesignedCard({ img, title, desc }) {
  return (
    <div className="designed card">
      <div className="designed-media">
        <img src={img} alt="" />
      </div>
      <div className="designed-body">
        <h4>{title}</h4>
        <p>{desc}</p>
      </div>
    </div>
  );
}
