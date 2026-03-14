import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const data = [
  { date: 'Mar 6',  performance: 91, seo: 85, accessibility: 72, security: 40 },
  { date: 'Mar 7',  performance: 89, seo: 86, accessibility: 70, security: 40 },
  { date: 'Mar 8',  performance: 92, seo: 84, accessibility: 68, security: 42 },
  { date: 'Mar 9',  performance: 88, seo: 87, accessibility: 65, security: 41 },
  { date: 'Mar 10', performance: 60, seo: 80, accessibility: 63, security: 38 },
  { date: 'Mar 11', performance: 62, seo: 81, accessibility: 61, security: 40 },
  { date: 'Mar 12', performance: 90, seo: 86, accessibility: 61, security: 42 },
  { date: 'Mar 13', performance: 94, seo: 88, accessibility: 61, security: 43 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1520] border border-white/10 rounded-xl p-4 text-xs font-mono">
        <p className="text-[#7a9ab8] mb-2">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }} className="mb-1">
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [active, setActive] = useState('all')

  const latest = data[data.length - 1]
  const prev = data[data.length - 2]

  const scores = [
    { key: 'performance', label: 'Performance', color: '#22c55e', value: latest.performance, prev: prev.performance },
    { key: 'seo',         label: 'SEO',         color: '#3b82f6', value: latest.seo,         prev: prev.seo },
    { key: 'accessibility', label: 'Accessibility', color: '#f59e0b', value: latest.accessibility, prev: prev.accessibility },
    { key: 'security',   label: 'Security',    color: '#ef4444', value: latest.security,    prev: prev.security },
  ]

  const visibleLines = active === 'all' ? scores.map(s => s.key) : [active]

  return (
    <div className="min-h-screen bg-[#080c14] text-[#e8edf5] font-sans">

      {/* Grid bg */}
      <div className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,179,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.03) 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-12 py-4 border-b border-white/[0.06]">
        <div className="font-mono text-lg font-bold cursor-pointer" onClick={() => navigate('/')}>
         SAT<span className="text-blue-500">sec</span>
        </div>
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 font-mono text-xs text-[#7a9ab8]">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          45press.com
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/results')} className="border border-white/10 hover:border-white/25 text-[#8899aa] hover:text-[#e8edf5] text-sm px-4 py-2 rounded-lg transition-all">
            Latest Report
          </button>
          <button onClick={() => navigate('/')} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            + New Audit
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-[#f0f4fa] mb-1">Trend Dashboard</h2>
          <p className="text-sm text-[#4a6070] font-mono">// 8-day score history · 45press.com</p>
        </div>

        {/* Score Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {scores.map(({ key, label, color, value, prev: p }) => {
            const diff = value - p
            return (
              <div
                key={key}
                onClick={() => setActive(active === key ? 'all' : key)}
                className={`bg-white/[0.03] border rounded-2xl p-5 cursor-pointer transition-all ${
                  active === key ? 'border-white/20 bg-white/[0.06]' : 'border-white/[0.07] hover:border-white/15'
                }`}
              >
                <div className="text-3xl font-mono font-bold mb-1" style={{ color }}>{value}</div>
                <div className="text-xs text-[#8899aa] mb-2">{label}</div>
                <div className={`text-xs font-mono ${diff >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {diff >= 0 ? '▲' : '▼'} {Math.abs(diff)} from yesterday
                </div>
              </div>
            )
          })}
        </div>

        {/* Alert Banner */}
        <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-xl px-5 py-3 mb-6 flex items-center gap-3">
          <span className="text-amber-400 text-sm">⚠</span>
          <p className="text-sm text-[#c8a84a]">
            <span className="font-medium">Performance dropped 28 points</span> on Mar 10 at 2:14 AM — likely caused by a deploy. Recovered by Mar 12.
          </p>
        </div>

        {/* Chart */}
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-mono text-[#8899aa] uppercase tracking-widest">Score History</p>
            <div className="flex gap-2">
              {['all', ...scores.map(s => s.key)].map(k => (
                <button
                  key={k}
                  onClick={() => setActive(k)}
                  className={`text-xs px-3 py-1 rounded-full transition-all font-mono ${
                    active === k
                      ? 'bg-white/10 text-white'
                      : 'text-[#4a6070] hover:text-[#8899aa]'
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#4a6070', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#4a6070', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {scores.map(({ key, color }) =>
                visibleLines.includes(key) && (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ fill: color, r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Audit Log */}
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6">
          <p className="text-xs font-mono text-[#8899aa] uppercase tracking-widest mb-4">Recent Audits</p>
          {data.slice().reverse().slice(0, 5).map((d, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-[#8899aa] font-mono">{d.date} · Auto scan</span>
              </div>
              <div className="flex gap-4 text-xs font-mono">
                <span className="text-green-400">{d.performance}</span>
                <span className="text-blue-400">{d.seo}</span>
                <span className="text-amber-400">{d.accessibility}</span>
                <span className="text-red-400">{d.security}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}