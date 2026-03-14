import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState('6h')
  const [threshold, setThreshold] = useState(70)
  const [email, setEmail] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

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
          <button onClick={() => navigate('/dashboard')} className="border border-white/10 hover:border-white/25 text-[#8899aa] hover:text-[#e8edf5] text-sm px-4 py-2 rounded-lg transition-all">
            Dashboard
          </button>
          <button onClick={() => navigate('/results')} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Latest Report
          </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-10">
          <h2 className="text-xl font-medium text-[#f0f4fa] mb-1">Monitoring Settings</h2>
          <p className="text-sm text-[#4a6070] font-mono">// configure schedule and alerts for 45press.com</p>
        </div>

        {/* Schedule */}
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 mb-4">
          <p className="text-xs font-mono text-[#8899aa] uppercase tracking-widest mb-6">Scan Schedule</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '6h', label: 'Every 6 Hours', desc: 'Recommended for production sites' },
              { value: 'daily', label: 'Daily', desc: 'Morning report, lighter touch' },
              { value: 'weekly', label: 'Weekly', desc: 'SEO-focused, slow-changing sites' },
            ].map(({ value, label, desc }) => (
              <div
                key={value}
                onClick={() => setSchedule(value)}
                className={`border rounded-xl p-4 cursor-pointer transition-all ${
                  schedule === value
                    ? 'border-blue-500/50 bg-blue-500/10'
                    : 'border-white/[0.07] hover:border-white/15 bg-white/[0.02]'
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${schedule === value ? 'text-blue-300' : 'text-[#c8d8e8]'}`}>
                  {label}
                </div>
                <div className="text-xs text-[#4a6070] leading-relaxed">{desc}</div>
                {schedule === value && (
                  <div className="mt-2 text-xs text-blue-400 font-mono">// active</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Alert Threshold */}
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-xs font-mono text-[#8899aa] uppercase tracking-widest">Alert Threshold</p>
            <span className={`font-mono text-lg font-bold ${
              threshold >= 80 ? 'text-green-400' : threshold >= 60 ? 'text-amber-400' : 'text-red-400'
            }`}>{threshold}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            className="w-full accent-blue-500 mb-4"
          />
          <div className="flex justify-between text-xs font-mono text-[#3a5068]">
            <span>0 — alert always</span>
            <span>100 — alert never</span>
          </div>
          <div className="mt-4 bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
            <p className="text-sm text-[#8899aa]">
              SATsec will email you if <span className="text-white font-medium">any score drops below {threshold}</span>.
              {threshold < 50 && <span className="text-red-400"> This is a very sensitive threshold.</span>}
              {threshold >= 80 && <span className="text-green-400"> This is a healthy threshold.</span>}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6 mb-6">
          <p className="text-xs font-mono text-[#8899aa] uppercase tracking-widest mb-6">Alert Email</p>
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@agency.com"
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-[#e8edf5] placeholder-[#3a4f63] outline-none focus:border-blue-500/50 transition-colors font-mono"
            />
            <button className="border border-white/10 hover:border-white/25 text-[#8899aa] text-sm px-4 py-3 rounded-xl transition-all">
              + Add Another
            </button>
          </div>
          <p className="text-xs text-[#3a5068] font-mono mt-3">// alerts will be sent to this address when scores drop</p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className={`w-full py-4 rounded-xl text-sm font-medium transition-all ${
            saved
              ? 'bg-green-500/20 border border-green-500/30 text-green-400'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {saved ? '✓ Settings Saved — Monitoring Active' : 'Save & Start Monitoring'}
        </button>

        <p className="text-center text-xs text-[#2e4050] font-mono mt-6">// SATsec will run its first scan within the next scheduled window</p>
      </div>
    </div>
  )
}