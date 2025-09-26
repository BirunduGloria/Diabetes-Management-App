import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

export default function FoodInsights() {
  const { token } = useAuth();
  const { t, language } = useLanguage();
  const [foods, setFoods] = useState({});
  const [recommendations, setRecommendations] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    loadData();
  }, [language]);

  async function loadData() {
    setLoading(true);
    try {
      // Load food database
      const foodsRes = await fetch('/kenyan-foods');
      if (foodsRes.ok) {
        const foodsData = await foodsRes.json();
        setFoods(foodsData.foods || {});
      }

      // Load personalized recommendations
      const recRes = await fetch(`/food-recommendations?lang=${language}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (recRes.ok) {
        const recData = await recRes.json();
        setRecommendations(recData);
      }
    } catch (e) {
      console.error('Failed to load food data:', e);
    } finally {
      setLoading(false);
    }
  }

  const getGlucoseImpactColor = (impact) => {
    switch (impact) {
      case 'none': return '#34d399'; // green
      case 'low': return '#34d399';
      case 'medium': return '#fbbf24'; // yellow
      case 'high': return '#f87171'; // red
      case 'very_high': return '#dc2626'; // dark red
      default: return '#9ca3af'; // gray
    }
  };

  // Derived: filtered food entries (stable ordering by name)
  const filteredEntries = Object.entries(foods)
    .filter(([_, f]) => {
      const name = (f?.[`name_${language}`] || f?.name_en || '').toLowerCase();
      return name.includes(query.trim().toLowerCase());
    })
    .sort((a, b) => {
      const an = (a[1]?.[`name_${language}`] || a[1]?.name_en || '').toLowerCase();
      const bn = (b[1]?.[`name_${language}`] || b[1]?.name_en || '').toLowerCase();
      return an.localeCompare(bn);
    });

  const getGlucoseImpactText = (impact) => {
    const impacts = {
      none: { en: 'No Impact', sw: 'Hakuna Athari' },
      low: { en: 'Low Impact', sw: 'Athari Ndogo' },
      medium: { en: 'Medium Impact', sw: 'Athari ya Kati' },
      high: { en: 'High Impact', sw: 'Athari Kubwa' },
      very_high: { en: 'Very High Impact', sw: 'Athari Kubwa Sana' }
    };
    return impacts[impact]?.[language] || impact;
  };

  const getImpactClass = (impact) => {
    switch (impact) {
      case 'none': return 'impact-chip impact-none';
      case 'low': return 'impact-chip impact-low';
      case 'medium': return 'impact-chip impact-medium';
      case 'high': return 'impact-chip impact-high';
      case 'very_high': return 'impact-chip impact-very_high';
      default: return 'impact-chip';
    }
  };

  if (loading) {
    return (
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Loading food insights...</h2>
      </div>
    );
  }

  return (
    <div>
      <div className="crumb-wrap card" style={{ marginBottom: 16 }}>
        <div className="crumb">
          <span>{t('home')}</span>
          <span className="sep">›</span>
          <b>{t('foodInsights')}</b>
        </div>
        <div className="accent-line" />
      </div>

      {/* Personalized Recommendations */}
      {recommendations && (
        <div className="card section">
          <div className="section-header">
            <h3>
              {language === 'sw' ? 'Mapendekezo ya Kibinafsi' : 'Personalized Food Recommendations'}
            </h3>
            <p className="section-subtle">
              <strong>{language === 'sw' ? 'Aina ya Kisukari' : 'Diabetes Type'}:</strong> {recommendations.diabetes_type}
            </p>
          </div>
          <ul className="list">
            {recommendations.recommendations.map((rec, i) => (
              <li key={i} className="list-item">{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Food Categories */}
      <div className="grid-2" style={{ gap: 16, marginBottom: 16 }}>
        {/* Diabetes-Friendly Foods */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {language === 'sw' ? 'Vyakula Rafiki kwa Kisukari' : 'Diabetes-Friendly Foods'}
          </h3>
          <div className="pill-list">
            {recommendations?.diabetes_friendly?.map(foodKey => {
              const food = foods[foodKey];
              if (!food) return null;
              return (
                <button
                  key={foodKey}
                  className="pill"
                  onClick={() => setSelectedFood(food)}
                >
                  {food[`name_${language}`] || food.name_en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Foods to Limit */}
        <div className="card">
          <h3 style={{ marginTop: 0 }}>
            {language === 'sw' ? 'Vyakula vya Kujizuia' : 'Foods to Limit'}
          </h3>
          <div className="pill-list">
            {recommendations?.foods_to_limit?.map(foodKey => {
              const food = foods[foodKey];
              if (!food) return null;
              return (
                <button
                  key={foodKey}
                  className="pill"
                  onClick={() => setSelectedFood(food)}
                >
                  {food[`name_${language}`] || food.name_en}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Search + Table */}
      <div className="card section">
        <h3 style={{ marginTop: 0 }}>
          {language === 'sw' ? 'Hifadhidata ya Vyakula vya Kenya' : 'Kenyan Food Database'}
        </h3>
        {/* Search Bar */}
        <div style={{ position: 'relative', margin: '8px 0 14px' }}>
          <span style={{ position: 'absolute', top: 10, left: 12, color: 'var(--muted)' }} aria-hidden>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="M21 21l-3.6-3.6"/>
            </svg>
          </span>
          <input
            className="input"
            placeholder={language === 'sw' ? 'Tafuta vyakula vya Kenya' : 'Search for Kenyan foods'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingLeft: 38 }}
          />
        </div>

        {/* Table-like list */}
        <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr',
            gap: 0,
            background: '#0f1212',
            borderBottom: '1px solid var(--border)',
            padding: '10px 12px',
            color: 'var(--muted)'
          }}>
            <div>{language === 'sw' ? 'Chakula' : 'Food'}</div>
            <div>{language === 'sw' ? 'Kiasi' : 'Serving Size'}</div>
            <div>{language === 'sw' ? 'Kabohaidreti (g)' : 'Carbs (g)'}</div>
            <div>{language === 'sw' ? 'Kiwango cha Athari' : 'Impact Level'}</div>
          </div>

          {filteredEntries.map(([key, food], idx) => (
            <div
              key={key}
              onClick={() => setSelectedFood(food)}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1.2fr 1fr 1.2fr',
                gap: 0,
                alignItems: 'center',
                padding: '12px',
                borderBottom: idx === filteredEntries.length - 1 ? 'none' : '1px solid var(--border)',
                cursor: 'pointer',
                background: 'transparent'
              }}
            >
              <div style={{ fontWeight: 600 }}>{food?.[`name_${language}`] || food?.name_en}</div>
              <div style={{ color: 'var(--muted)' }}>{food?.serving_size || '—'}</div>
              <div style={{ color: 'var(--text)' }}>{food?.carbs ?? '—'}</div>
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <span className={getImpactClass(food?.glucose_impact)}>
                  {getGlucoseImpactText(food?.glucose_impact)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Food Detail Modal */}
      {selectedFood && (
        <div className="modal-overlay" onClick={() => setSelectedFood(null)}>
          <div className="card modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>
                {selectedFood[`name_${language}`] || selectedFood.name_en}
              </h3>
              <button className="modal-close" onClick={() => setSelectedFood(null)} aria-label="Close">×</button>
            </div>

            {/* Nutritional Info */}
            <div className="kv-grid" style={{ marginBottom: 4 }}>
              <div><strong>{language === 'sw' ? 'Kalori' : 'Calories'}:</strong> {selectedFood.calories}</div>
              <div><strong>{language === 'sw' ? 'Kabohaidreti' : 'Carbs'}:</strong> {selectedFood.carbs}g</div>
              <div><strong>{language === 'sw' ? 'Nyuzi' : 'Fiber'}:</strong> {selectedFood.fiber}g</div>
              <div><strong>{language === 'sw' ? 'Protini' : 'Protein'}:</strong> {selectedFood.protein}g</div>
              <div><strong>{language === 'sw' ? 'Mafuta' : 'Fat'}:</strong> {selectedFood.fat}g</div>
              <div><strong>GI:</strong> {selectedFood.glycemic_index}</div>
            </div>

            {/* Glucose Impact */}
            <div style={{ margin: '8px 0 12px' }}>
              <strong>{language === 'sw' ? 'Athari ya Sukari ya Damu' : 'Blood Sugar Impact'}:</strong>
              <span className={getImpactClass(selectedFood.glucose_impact)} style={{ marginLeft: 8 }}>
                {getGlucoseImpactText(selectedFood.glucose_impact)}
              </span>
            </div>

            {/* Diabetes Tips */}
            <div>
              <h4>{language === 'sw' ? 'Vidokezo vya Kisukari' : 'Diabetes Tips'}</h4>
              <ul>
                {selectedFood.diabetes_tips[language]?.map((tip, i) => (
                  <li key={i}>{tip}</li>
                )) || selectedFood.diabetes_tips.en?.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
