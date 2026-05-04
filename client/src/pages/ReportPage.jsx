import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { serverUrl } from '../App';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { FaArrowLeft, FaBriefcase, FaClock, FaStar, FaCheckCircle, FaTimesCircle, FaExclamationCircle } from 'react-icons/fa';
import { BsLightningChargeFill } from 'react-icons/bs';
import { HiOutlineSparkles } from 'react-icons/hi';

// ── Helpers ────────────────────────────────────────────────────────────────
const scoreColor = (s) => {
  if (s >= 7) return '#34d399';
  if (s >= 4) return '#fbbf24';
  if (s >  0) return '#f87171';
  return '#475569';
};
const scoreLabel = (s) => {
  if (s >= 7) return 'Excellent';
  if (s >= 4) return 'Good';
  if (s >  0) return 'Needs Work';
  return 'Incomplete';
};
const diffColor = { easy: '#34d399', medium: '#fbbf24', hard: '#f87171' };

// Short label for long questions
const shortQ = (q, max = 38) => q?.length > max ? q.slice(0, max) + '…' : q;

// Circular gauge
const Gauge = ({ value, max = 10, size = 130, label }) => {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const pct  = Math.min(value / max, 1);
  const fg   = scoreColor(value);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={fg} strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 8px ${fg}66)` }}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center',
            fontSize: 22, fontWeight: 800, fill: fg,
            fontFamily: "'Bricolage Grotesque', sans-serif" }}>
          {value?.toFixed(1) ?? '—'}
        </text>
        <text x="50%" y="65%" textAnchor="middle" dominantBaseline="central"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center',
            fontSize: 10, fill: '#475569', fontFamily: 'sans-serif' }}>
          /10
        </text>
      </svg>
      {label && <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{label}</span>}
    </div>
  );
};

// Custom tooltip for bar chart
const BarTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#e2e8f0',
    }}>
      <p style={{ color: '#94a3b8', marginBottom: 4 }}>{payload[0]?.payload?.shortQ}</p>
      <p style={{ color: scoreColor(payload[0]?.value), fontWeight: 700, fontSize: 15 }}>
        {payload[0]?.value?.toFixed(2)} / 10
      </p>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const ReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = useSelector((state) => state?.user?.userData);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  if (!userData) return <Navigate to="/auth" replace />;

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(
          `${serverUrl}/api/interview/get-report/${id}`,
          { withCredentials: true }
        );
        setReport(res.data);
      } catch (e) {
        console.error('Error fetching report:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#07090f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 44, height: 44, border: '3px solid rgba(99,102,241,0.2)',
        borderTopColor: '#6366f1', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <p style={{ color: '#475569', fontFamily: 'sans-serif', fontSize: 14 }}>Loading report…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!report) return (
    <div style={{ minHeight: '100vh', background: '#07090f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#475569' }}>Report not found.</p>
    </div>
  );

  const { finalScore, communication, confidence, correctness, questionWiseScore = [] } = report;

  // Chart data
  const radarData = [
    { metric: 'Correctness',    value: correctness    ?? 0 },
    { metric: 'Communication',  value: communication  ?? 0 },
    { metric: 'Confidence',     value: confidence     ?? 0 },
    { metric: 'Avg Score',      value: finalScore     ?? 0 },
  ];

  const barData = questionWiseScore.map((q, i) => ({
    name:   `Q${i + 1}`,
    shortQ: shortQ(q.question),
    score:  q.score,
    diff:   q.difficulty,
  }));

  const lineData = questionWiseScore.map((q, i) => ({
    name:       `Q${i + 1}`,
    score:      q.score,
    confidence: q.confidence,
  }));

  const overallColor = scoreColor(finalScore);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rp-root {
          font-family: 'Instrument Sans', sans-serif;
          min-height: 100vh;
          background: #07090f;
          background-image:
            radial-gradient(ellipse 55% 35% at 5%   0%,  rgba(99,102,241,0.14) 0%, transparent 55%),
            radial-gradient(ellipse 45% 30% at 95% 100%, rgba(16,185,129,0.1)  0%, transparent 55%);
          color: #e2e8f0;
          padding-bottom: 80px;
        }
        .rp-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 22px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          background: rgba(7,9,15,0.75);
          position: sticky; top: 0; z-index: 20;
        }
        .rp-content { max-width: 1100px; margin: 0 auto; padding: 36px 40px 0; }
        .glass-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 28px;
          animation: fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) both;
        }
        .glass-card:hover { border-color: rgba(99,102,241,0.2); }
        .section-label {
          font-family: 'Bricolage Grotesque', sans-serif;
          font-size: 15px; font-weight: 700; color: #f1f5f9;
          letter-spacing: -0.3px; margin-bottom: 20px;
        }
        .q-row {
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 16px 18px;
          margin-bottom: 10px;
          transition: border-color 0.2s, background 0.2s;
          cursor: default;
        }
        .q-row:hover {
          border-color: rgba(99,102,241,0.2);
          background: rgba(99,102,241,0.04);
        }
        .diff-badge {
          font-size: 10px; font-weight: 700; letter-spacing: 0.6px;
          padding: 2px 9px; border-radius: 99px; text-transform: uppercase;
        }
        .back-btn {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; border-radius: 10px;
          padding: 8px 16px; font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'Instrument Sans', sans-serif;
          transition: all 0.18s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
        @media (max-width: 768px) {
          .rp-topbar  { padding: 16px 20px; }
          .rp-content { padding: 20px 20px 0; }
        }
      `}</style>

      <div className="rp-root">

        {/* ── TOP BAR ── */}
        <div className="rp-topbar">
          <button className="back-btn" onClick={() => navigate('/history')}>
            <FaArrowLeft size={11} /> Back to History
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <HiOutlineSparkles color="#a5b4fc" size={16} />
            <span style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontWeight: 700, fontSize: 15, color: '#f8fafc', letterSpacing: '-0.3px',
            }}>
              Interview Report
            </span>
          </div>
          <div style={{ width: 110 }} /> {/* spacer */}
        </div>

        <div className="rp-content">

          {/* ── HERO SCORE ── */}
          <div className="glass-card" style={{ animationDelay: '0s', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>

              {/* Big gauge */}
              <Gauge value={finalScore} size={140} />

              {/* Verdict */}
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{
                    background: `${overallColor}18`,
                    border: `1px solid ${overallColor}35`,
                    color: overallColor,
                    borderRadius: 99, padding: '4px 14px',
                    fontSize: 12, fontWeight: 700, letterSpacing: '0.5px',
                  }}>
                    {scoreLabel(finalScore).toUpperCase()}
                  </span>
                  <span style={{ fontSize: 12, color: '#334155' }}>
                    {questionWiseScore.length} questions answered
                  </span>
                </div>
                <h1 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 28, fontWeight: 800, color: '#f8fafc',
                  letterSpacing: '-0.8px', marginBottom: 6, lineHeight: 1.2,
                }}>
                  Overall Score: <span style={{ color: overallColor }}>{finalScore?.toFixed(2)}</span>
                  <span style={{ fontSize: 16, color: '#334155' }}> / 10</span>
                </h1>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>
                  {finalScore >= 7
                    ? 'Outstanding performance! You demonstrated strong command across all areas.'
                    : finalScore >= 4
                    ? 'Solid attempt with room for improvement. Review the weaker questions below.'
                    : 'Keep practicing — focus on clarity, structure, and technical depth.'}
                </p>
              </div>

              {/* Mini metric gauges */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <Gauge value={correctness}   size={88} label="Correctness"   />
                <Gauge value={communication} size={88} label="Communication" />
                <Gauge value={confidence}    size={88} label="Confidence"    />
              </div>
            </div>
          </div>

          {/* ── CHARTS ROW ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Radar */}
            <div className="glass-card" style={{ animationDelay: '0.1s' }}>
              <p className="section-label">🕸 Skill Radar</p>
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={85}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="metric"
                    tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Instrument Sans' }} />
                  <PolarRadiusAxis domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25}
                    dot={{ r: 4, fill: '#818cf8', strokeWidth: 0 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Score vs Confidence line */}
            <div className="glass-card" style={{ animationDelay: '0.15s' }}>
              <p className="section-label">📈 Score vs Confidence</p>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: '#94a3b8' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
                  <Line type="monotone" dataKey="score"      stroke="#6366f1" strokeWidth={2.5}
                    dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="confidence" stroke="#34d399" strokeWidth={2.5}
                    dot={{ fill: '#34d399', r: 4 }} activeDot={{ r: 6 }} strokeDasharray="5 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar chart — full width */}
          <div className="glass-card" style={{ animationDelay: '0.2s', marginBottom: 20 }}>
            <p className="section-label">📊 Per-Question Score</p>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 12 }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={52}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={scoreColor(entry.score)}
                      style={{ filter: `drop-shadow(0 0 6px ${scoreColor(entry.score)}55)` }} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── QUESTION BREAKDOWN ── */}
          <div className="glass-card" style={{ animationDelay: '0.25s' }}>
            <p className="section-label">🔍 Question-by-Question Breakdown</p>

            {questionWiseScore.map((q, i) => {
              const qColor = scoreColor(q.score);
              const Icon = q.score >= 7 ? FaCheckCircle : q.score >= 4 ? FaExclamationCircle : FaTimesCircle;

              return (
                <div key={i} className="q-row">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Index + icon */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0, paddingTop: 2 }}>
                      <span style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontSize: 13, fontWeight: 700, color: '#334155',
                      }}>Q{i + 1}</span>
                      <Icon size={15} color={qColor} />
                    </div>

                    {/* Question + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, marginBottom: 10 }}>
                        {q.question}
                      </p>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="diff-badge" style={{
                          background: `${diffColor[q.difficulty]}18`,
                          color: diffColor[q.difficulty],
                          border: `1px solid ${diffColor[q.difficulty]}30`,
                        }}>
                          {q.difficulty}
                        </span>
                        <span style={{ fontSize: 11, color: '#334155', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <FaClock size={10} /> {q.timeLimit}s
                        </span>
                        <span style={{ fontSize: 11, color: '#334155' }}>
                          Confidence: <strong style={{ color: scoreColor(q.confidence) }}>{q.confidence?.toFixed(1)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Score chip */}
                    <div style={{
                      flexShrink: 0,
                      background: `${qColor}12`,
                      border: `1px solid ${qColor}30`,
                      borderRadius: 12,
                      padding: '8px 16px',
                      textAlign: 'center',
                      minWidth: 72,
                    }}>
                      <p style={{
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                        fontSize: 20, fontWeight: 800, color: qColor, lineHeight: 1,
                      }}>
                        {q.score?.toFixed(2)}
                      </p>
                      <p style={{ fontSize: 10, color: '#334155', marginTop: 2 }}>/10</p>
                    </div>
                  </div>

                  {/* Mini score bar */}
                  <div style={{
                    marginTop: 12, height: 3,
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: 99, overflow: 'hidden',
                  }}>
                    <div style={{
                      width: `${(q.score / 10) * 100}%`,
                      height: '100%',
                      background: qColor,
                      borderRadius: 99,
                      transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                      boxShadow: `0 0 8px ${qColor}66`,
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
};

export default ReportPage;