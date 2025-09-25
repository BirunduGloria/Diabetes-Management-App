import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';

export default function Education() {
  const { language } = useLanguage();
  const [selectedModule, setSelectedModule] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});

  const modules = {
    basics: {
      title: { en: 'Diabetes Basics', sw: 'Misingi ya Kisukari' },
      icon: '🩺',
      content: {
        en: [
          'Diabetes affects over 458,000 Kenyans.',
          'Your body cannot properly use sugar from food.',
          'With proper care, you can live a healthy life.'
        ],
        sw: [
          'Kisukari kinaathiri Wakenya zaidi ya 458,000.',
          'Mwili wako hauwezi kutumia sukari kutoka chakula vizuri.',
          'Kwa utunzaji mzuri, unaweza kuishi maisha mazuri.'
        ]
      },
      quiz: {
        question: { en: 'How many Kenyans have diabetes?', sw: 'Wakenya wangapi wana kisukari?' },
        options: { en: ['Over 458,000', '100,000', '50,000'], sw: ['Zaidi ya 458,000', '100,000', '50,000'] },
        correct: 0
      }
    },
    foods: {
      title: { en: 'Kenyan Foods', sw: 'Vyakula vya Kikenya' },
      icon: '🥗',
      content: {
        en: [
          'Sukuma wiki is excellent for diabetes.',
          'Limit ugali and chapati portions.',
          'Avoid mandazi and fried foods.'
        ],
        sw: [
          'Sukuma wiki ni bora kwa kisukari.',
          'Punguza vipimo vya ugali na chapati.',
          'Epuka mandazi na vyakula vya kukaanga.'
        ]
      },
      quiz: {
        question: { en: 'Which is best for diabetes?', sw: 'Ni kipi bora kwa kisukari?' },
        options: { en: ['Sukuma wiki', 'Mandazi', 'White ugali'], sw: ['Sukuma wiki', 'Mandazi', 'Ugali mweupe'] },
        correct: 0
      }
    }
  };

  const handleQuiz = (moduleId, answer) => {
    setQuizAnswers(prev => ({ ...prev, [moduleId]: answer }));
  };

  return (
    <div>
      <div className="crumb-wrap card" style={{ marginBottom: 16 }}>
        <div className="crumb">
          <span>Home</span>
          <span className="sep">›</span>
          <b>{language === 'sw' ? 'Elimu' : 'Education'}</b>
        </div>
        <div className="accent-line" />
      </div>

      {!selectedModule ? (
        <div>
          <div className="card section">
            <h2 style={{ marginTop: 0 }}>
              {language === 'sw' ? 'Chagua Mada' : 'Choose Topic'}
            </h2>
          </div>
          <div className="grid-2" style={{ gap: 16 }}>
            {Object.entries(modules).map(([id, module]) => (
              <div key={id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelectedModule(id)}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem' }}>{module.icon}</div>
                  <h3>{module.title[language]}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="card section">
            <button className="btn btn-outline" onClick={() => setSelectedModule(null)}>
              ← {language === 'sw' ? 'Rudi' : 'Back'}
            </button>
            <h2>{modules[selectedModule].title[language]}</h2>
            
            {modules[selectedModule].content[language].map((text, i) => (
              <p key={i}>{text}</p>
            ))}

            <div style={{ backgroundColor: 'rgba(47, 243, 224, 0.1)', padding: 16, borderRadius: 8 }}>
              <h4>{language === 'sw' ? 'Jaribio' : 'Quiz'}</h4>
              <p><strong>{modules[selectedModule].quiz.question[language]}</strong></p>
              {modules[selectedModule].quiz.options[language].map((option, i) => (
                <button
                  key={i}
                  className="btn btn-outline"
                  style={{ 
                    display: 'block', 
                    width: '100%', 
                    marginBottom: 8,
                    backgroundColor: quizAnswers[selectedModule] === i ? 
                      (i === modules[selectedModule].quiz.correct ? '#10b981' : '#ef4444') : 'transparent'
                  }}
                  onClick={() => handleQuiz(selectedModule, i)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
