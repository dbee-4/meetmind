import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const API_URL = 'https://web-production-eef90.up.railway.app/api/analyze';
const AUTH_URL = 'https://web-production-eef90.up.railway.app/api';

const App = () => {
  // --- Auth State ---
  const [token, setToken] = useState(localStorage.getItem('meetmind_token'));
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState(null);

  // --- Dashboard State ---
  const [formData, setFormData] = useState({
    title: '',
    transcript: '',
    participants: ''
  });

  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // --- History State ---
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // --- Auth Functions ---
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const endpoint = authMode === 'login' ? '/login' : '/register';
    try {
      const response = await axios.post(`${AUTH_URL}${endpoint}`, {
        email: authEmail,
        password: authPassword
      });
      
      const newToken = response.data.access_token;
      setToken(newToken);
      localStorage.setItem('meetmind_token', newToken);
      localStorage.setItem('meetmind_email', authEmail); // Store email for display
      setAuthEmail('');
      setAuthPassword('');
    } catch (err) {
      console.error('Auth failed:', err);
      setAuthError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('meetmind_token');
    localStorage.removeItem('meetmind_email');
    setAnalysis(null);
    setShowHistory(false);
    setFormData({ title: '', transcript: '', participants: '' });
  };

  // --- Dashboard Functions ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const participantsList = formData.participants
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.includes(':'))
      .map(line => {
        const [name, role] = line.split(':');
        return { name: name.trim(), role: role.trim() };
      });

    try {
      const response = await axios.post(API_URL, {
        title: formData.title,
        transcript: formData.transcript,
        participants: participantsList
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAnalysis(response.data);
      setShowHistory(false);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError('Failed to analyze meeting. Make sure the backend is running and your API key is valid.');
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score) => {
    if (score > 70) return '#10b981'; // emerald
    if (score >= 50) return '#f59e0b'; // amber
    return '#ef4444'; // rose
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setShowHistory(true);
    setAnalysis(null);
    try {
      const res = await axios.get(`${AUTH_URL}/meetings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (e) {
      console.error('Failed to fetch history:', e);
    } finally {
      setHistoryLoading(false);
    }
  };

  const chartData = analysis ? Object.entries(analysis.engagement).map(([name, score]) => ({
    name,
    score: typeof score === 'object' ? score.score ?? score.value ?? 0 : score
  })) : [];

  // --- Components ---
  const CircularGauge = ({ score }) => {
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = getHealthColor(score);

    return (
      <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto' }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="90" cy="90" r={radius} fill="none" stroke="#1f2937" strokeWidth="12" />
          <circle 
            cx="90" cy="90" r={radius} 
            fill="none" 
            stroke={color} 
            strokeWidth="12" 
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', 
          transform: 'translate(-50%, -50%)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', fontWeight: '800', color }}>{score}</div>
          <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>Health</div>
        </div>
      </div>
    );
  };

  const Header = () => (
    <nav className="glass" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      borderBottom: '1px solid var(--border)'
    }}>
      <div className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: '800', fontFamily: 'Outfit' }}>
        MeetMind
      </div>
      
      {token && (
        <>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            {localStorage.getItem('meetmind_email') || 'User'}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => showHistory ? setShowHistory(false) : fetchHistory()}
              className="glass"
              style={{
                padding: '8px 16px', borderRadius: '8px', color: 'var(--secondary)',
                border: '1px solid var(--secondary)', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600'
              }}
            >
              {showHistory ? 'Analyzer' : 'History'}
            </button>
            <button 
              onClick={handleLogout}
              className="glass"
              style={{
                padding: '8px 16px', borderRadius: '8px', color: 'var(--text-muted)',
                cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600'
              }}
            >
              Logout
            </button>
          </div>
        </>
      )}
    </nav>
  );

  // --- Auth View ---
  if (!token) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div className="glass card-glow animate-fade" style={{
          width: '100%', maxWidth: '420px', padding: '40px', borderRadius: '24px', textAlign: 'center'
        }}>
          <h1 className="text-gradient" style={{ fontSize: '3rem', color: 'white', marginBottom: '8px' }}>MeetMind</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Elevate your meetings with AI</p>

          <div style={{ display: 'flex', marginBottom: '24px', background: 'var(--bg-input)', borderRadius: '12px', padding: '4px' }}>
            <button 
              onClick={() => {
                setAuthMode('login');
                setAuthEmail('');
                setAuthPassword('');
                setAuthError(null);
                setShowPassword(false);
              }}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: authMode === 'login' ? 'var(--bg-card)' : 'transparent',
                color: authMode === 'login' ? 'white' : 'var(--text-muted)',
                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >Login</button>
            <button 
              onClick={() => {
                setAuthMode('register');
                setAuthEmail('');
                setAuthPassword('');
                setAuthError(null);
                setShowPassword(false);
              }}
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                background: authMode === 'register' ? 'var(--bg-card)' : 'transparent',
                color: authMode === 'register' ? 'white' : 'var(--text-muted)',
                fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
              }}
            >Register</button>
          </div>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input 
              type="email" placeholder="Email address" required
              value={authEmail} onChange={e => setAuthEmail(e.target.value)}
              className="glass"
              style={{'--bg-input': '#1f2937', width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '12px', color: 'white',
                background: 'var(--bg-input)', outline: 'none', border: '1px solid var(--border)'
              }}
            />
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? 'text' : 'password'} placeholder="Password" required
                value={authPassword} onChange={e => setAuthPassword(e.target.value)}
                className="glass"
                style={{'--bg-input': '#1f2937', width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '12px', color: 'white',
                  background: 'var(--bg-input)', outline: 'none', border: '1px solid var(--border)'
                }}
              />
              <button 
                type="button" 
                onMouseDown={() => setShowPassword(true)} onMouseUp={() => setShowPassword(false)}
                onMouseLeave={() => setShowPassword(false)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            <button type="submit" className="btn-gradient" style={{ padding: '14px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem', marginTop: '8px' }} disabled={loading}>
              {loading ? 'Processing...' : (authMode === 'login' ? 'Login' : 'Create Account')}
            </button>
          </form>

          {authError && <div style={{ color: 'var(--danger)', marginTop: '16px', fontSize: '0.875rem' }}>{authError}</div>}
        </div>
      </div>
    );
  }

  // --- Main Dashboard View ---
  return (
    <div style={{ paddingTop: '80px', paddingBottom: '40px', maxWidth: '1200px', margin: '0 auto', paddingLeft: '20px', paddingRight: '20px' }}>
      <Header />

      {showHistory ? (
        <div className="animate-fade">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem' }}>Past Meetings</h2>
            <button onClick={() => setShowHistory(false)} className="glass" style={{ padding: '10px 24px', borderRadius: '12px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
              Back to Analyze
            </button>
          </div>

          {historyLoading ? (
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-glow)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '100px auto' }}></div>
          ) : history.length === 0 ? (
            <div className="glass" style={{ padding: '60px', borderRadius: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No meetings found. Start by analyzing a transcript!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {history.map(m => (
                <div key={m.id} className="glass card-glow" style={{ padding: '24px', borderRadius: '20px', borderTop: `4px solid ${getHealthColor(m.health_score)}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem' }}>{m.title}</h3>
                    <div style={{ color: getHealthColor(m.health_score), fontWeight: '800', fontSize: '1.25rem' }}>{m.health_score}</div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '12px' }}>{new Date(m.created_at).toLocaleDateString()}</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>
                    {m.summary.substring(0, 120)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <section className="glass" style={{ padding: '40px', borderRadius: '24px' }}>
            <h2 style={{ marginBottom: '24px' }}>New Analysis</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Meeting Title</label>
                  <input 
                    name="title" value={formData.title} onChange={handleInputChange} required
                    className="glass" placeholder="e.g. Design Sync"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '12px', background: 'var(--bg-input)', outline: 'none', color: 'white', border: '1px solid var(--border)' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Participants (Name:Role)</label>
                  <textarea 
                    name="participants" value={formData.participants} onChange={handleInputChange} required
                    className="glass" placeholder="Alice:Lead&#10;Bob:Dev"
                    style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '12px', background: 'var(--bg-input)', outline: 'none', color: 'white', height: '100px', resize: 'none', border: '1px solid var(--border)' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)' }}>Transcript</label>
                <textarea 
                  name="transcript" value={formData.transcript} onChange={handleInputChange} required
                  className="glass" placeholder="Paste transcript here..."
                  style={{ width: '100%', boxSizing: 'border-box', padding: '14px', borderRadius: '12px', background: 'var(--bg-input)', outline: 'none', color: 'white', minHeight: '160px', border: '1px solid var(--border)' }}
                />
              </div>
              <button type="submit" className="btn-gradient" style={{ padding: '16px', borderRadius: '14px', fontWeight: '800', fontSize: '1.1rem' }} disabled={loading}>
                {loading ? 'Processing Insights...' : 'Generate Analysis'}
              </button>
            </form>
          </section>

          {loading && (
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--primary-glow)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '40px auto' }}></div>
          )}

          {error && (
            <div className="glass" style={{ padding: '20px', borderRadius: '12px', color: 'var(--danger)', textAlign: 'center', border: '1px solid var(--danger)' }}>
              {error}
            </div>
          )}
          
          {analysis && !loading && (
            <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '32px' }}>
                <div className="glass" style={{ padding: '32px', borderRadius: '24px', textAlign: 'center', borderTop: `4px solid ${getHealthColor(analysis.health_score)}` }}>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.05em' }}>HEALTH SCORE</h3>
                  <CircularGauge score={analysis.health_score} />
                </div>
                <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '700', marginBottom: '16px', letterSpacing: '0.05em' }}>EXECUTIVE SUMMARY</h3>
                  <p style={{ fontSize: '1.25rem', lineHeight: '1.6', color: '#cbd5e1' }}>{analysis.summary}</p>
                </div>
              </div>

              <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.05em' }}>CONTRIBUTION & ENGAGEMENT</h3>
                <div style={{ height: '320px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} dy={10} />
                      <YAxis hide />
                      <Tooltip cursor={{ fill: '#ffffff0a' }} contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '10px' }} />
                      <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={40}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'url(#grad1)' : 'url(#grad2)'} />
                        ))}
                      </Bar>
                      <defs>
                        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                        <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.05em' }}>SENTIMENT ANALYSIS</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {analysis.sentiment_timeline.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-input)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                        <span style={{ fontWeight: '600' }}>{item.speaker}</span>
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', fontWeight: '700',
                          color: item.sentiment === 'positive' ? 'var(--success)' : item.sentiment === 'negative' ? 'var(--danger)' : 'var(--text-muted)'
                        }}>
                          {item.sentiment === 'positive' ? '✅ Positive' : item.sentiment === 'negative' ? '❌ Negative' : '➖ Neutral'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass" style={{ padding: '32px', borderRadius: '24px' }}>
                  <h3 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '700', marginBottom: '24px', letterSpacing: '0.05em' }}>FOLLOW-UP ACTIONS</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {Object.entries(analysis.follow_ups).map(([name, items]) => (
                      <div key={name}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white', marginBottom: '12px', opacity: 0.9 }}>{name}</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {items.map((item, i) => (
                            <div key={i} style={{ padding: '12px 16px', background: '#ffffff05', borderLeft: '3px solid var(--primary)', borderRadius: '0 8px 8px 0', fontSize: '0.875rem', color: '#cbd5e1' }}>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <style>
        {`
          :root {
            --bg-primary: #0f172a;
            --bg-card: #1e293b;
            --bg-input: #1f2937;
            --border: #334155;
            --text-primary: #f8fafc;
            --text-muted: #94a3b8;
            --primary: #3b82f6;
            --primary-glow: #3b82f640;
            --secondary: #0ea5e9;
            --success: #10b981;
            --danger: #ef4444;
          }

          body {
            margin: 0;
            font-family: 'Inter', sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }

          h1, h2, h3, h4, h5, h6 {
            color: var(--text-primary);
          }

          .glass {
            background-color: rgba(30, 41, 59, 0.6); /* bg-card with transparency */
            backdrop-filter: blur(10px);
            border: 1px solid var(--border);
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .card-glow {
            position: relative;
            overflow: hidden;
          }

          .card-glow::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: conic-gradient(
              from 0deg at 50% 50%,
              rgba(59, 130, 246, 0) 0%,
              rgba(59, 130, 246, 0.1) 20%,
              rgba(59, 130, 246, 0.2) 30%,
              rgba(59, 130, 246, 0.1) 40%,
              rgba(59, 130, 246, 0) 50%,
              rgba(59, 130, 246, 0) 100%
            );
            animation: rotateGlow 10s linear infinite;
            z-index: -1;
            opacity: 0.5;
          }

          @keyframes rotateGlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .text-gradient {
            background: linear-gradient(90deg, #38bdf8, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }

          .btn-gradient {
            background: linear-gradient(90deg, #3b82f6, #6366f1);
            color: white;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
          }

          .btn-gradient:hover {
            opacity: 0.9;
            transform: translateY(-1px);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
          }

          .btn-gradient:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }

          .animate-fade {
            animation: fadeIn 0.5s ease-out;
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default App;
