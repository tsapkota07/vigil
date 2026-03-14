import { useNavigate } from 'react-router-dom'

const accessibilityIssues = [
  { severity: 'red', title: 'Missing alt text on 6 images', desc: 'Screen readers cannot describe these images to visually impaired users. WCAG 2.1 violation.' },
  { severity: 'red', title: 'Low color contrast on nav links', desc: 'Text contrast ratio is 2.8:1 — minimum required is 4.5:1 under WCAG AA.' },
  { severity: 'yellow', title: 'No skip navigation link', desc: 'Keyboard users must tab through the entire nav on every page load.' },
]

const securityIssues = [
  { severity: 'red', title: 'Missing Content-Security-Policy header', desc: 'XSS attacks are not mitigated. Add a CSP header to your server config.' },
  { severity: 'red', title: 'X-Frame-Options not set', desc: 'Site is vulnerable to clickjacking attacks.' },
  { severity: 'yellow', title: 'Mixed content detected', desc: '2 resources loading over HTTP on an HTTPS page.' },
]

const dot = { red: 'bg-red-500', yellow: 'bg-amber-400', green: 'bg-green-400' }

export default function AuditResults() {
  const navigate = useNavigate()

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
        <div className="font-mono text-lg font-bold cursor-pointer" onClick={() => navigate('/')}>SAT<span className="text-blue-500">sec</span></div>
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2 font-mono text-xs text-[#7a9ab8]">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          45press.com
        </div>
        <div className="flex gap-3">
         <button onClick={() => navigate('/')} className="border border-white/10 hover:border-white/25 text-[#8899aa] hover:text-[#e8edf5] text-sm px-4 py-2 rounded-lg transition-all">
            ← New Audit
         </button>
         <button onClick={() => navigate('/dashboard')} className="border border-white/10 hover:border-white/25 text-[#8899aa] hover:text-[#e8edf5] text-sm px-4 py-2 rounded-lg transition-all">
            Dashboard
         </button>
         <button onClick={() => navigate('/settings')} className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            Schedule Monitoring
         </button>
        </div>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-xl font-medium text-[#f0f4fa] mb-1">Audit Results — 45press.com</h2>
          <p className="text-sm text-[#4a6070] font-mono">// scanned March 13, 2026 at 11:42 AM · 3.2s scan time</p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { score: 94, label: 'Performance', color: 'text-green-400', ring: 'border-green-500/30 bg-green-500/10', tag: 'Healthy', tagColor: 'bg-green-500/10 text-green-400' },
            { score: 88, label: 'SEO',         color: 'text-green-400', ring: 'border-green-500/30 bg-green-500/10', tag: 'Healthy', tagColor: 'bg-green-500/10 text-green-400' },
            { score: 61, label: 'Accessibility', color: 'text-amber-400', ring: 'border-amber-500/30 bg-amber-500/10', tag: 'At Risk', tagColor: 'bg-amber-500/10 text-amber-400' },
            { score: 43, label: 'Security',    color: 'text-red-400',   ring: 'border-red-500/30 bg-red-500/10',     tag: 'Critical', tagColor: 'bg-red-500/10 text-red-400' },
          ].map(({ score, label, color, ring, tag, tagColor }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 text-center hover:-translate-y-1 transition-transform">
              <div className={`w-16 h-16 rounded-full border-2 ${ring} flex items-center justify-center mx-auto mb-3`}>
                <span className={`font-mono text-2xl font-bold ${color}`}>{score}</span>
              </div>
              <div className="text-sm font-medium text-[#c8d8e8] mb-2">{label}</div>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${tagColor}`}>{tag}</span>
            </div>
          ))}
        </div>

        {/* AI Summary */}
        <div className="bg-purple-500/[0.06] border border-purple-500/20 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-500/15 border border-purple-500/30 text-purple-300 font-mono text-xs px-3 py-1 rounded-md tracking-wider">AI SUMMARY</span>
          </div>
          <p className="text-sm text-[#c8d8e8] leading-7 font-light">
            Your site performs well overall with a strong <span className="text-white font-medium">94 performance score</span> and solid SEO fundamentals.
            However, there are <span className="text-white font-medium">3 accessibility issues</span> that represent legal risk under ADA — two of them are fixable in under an hour.
            More urgently, your security headers are missing, which leaves the site exposed to common browser-based attacks.
            We recommend addressing the security issues today and scheduling a developer to fix the accessibility flags this week.
          </p>
        </div>

        {/* Issues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {[
            { title: 'Performance Issues', items: [
            { severity: 'red', title: 'Render-blocking scripts', desc: '2 scripts are blocking page render and slowing load time.' },
            { severity: 'red', title: 'Uncompressed images', desc: '4 images are not compressed — reducing page load speed.' },
            { severity: 'red', title: 'No lazy loading on images', desc: 'Images below the fold are loading immediately, slowing initial page load.' },
        ]},
            { title: 'SEO Issues', items: [
            { severity: 'red', title: 'Missing canonical tags', desc: '3 pages are missing canonical tags — may cause duplicate content issues.' },
            { severity: 'red', title: 'Images missing alt attributes', desc: '6 images have no alt text which hurts SEO ranking.' },
            { severity: 'red', title: 'Duplicate meta descriptions', desc: '2 pages share the same meta description — search engines may penalize this.' },
        ]},
            { title: 'Accessibility Issues', items: [
            { severity: 'red', title: 'Missing alt text on 6 images', desc: 'Screen readers cannot describe these images to visually impaired users. WCAG 2.1 violation.' },
            { severity: 'red', title: 'Low color contrast on nav links', desc: 'Text contrast ratio is 2.8:1 — minimum required is 4.5:1 under WCAG AA.' },
            { severity: 'red', title: 'No skip navigation link', desc: 'Keyboard users must tab through the entire nav on every page load.' },
        ]},
            { title: 'Security Issues', items: [
            { severity: 'red', title: 'Missing Content-Security-Policy header', desc: 'XSS attacks are not mitigated. Add a CSP header to your server config.' },
            { severity: 'red', title: 'X-Frame-Options not set', desc: 'Site is vulnerable to clickjacking attacks.' },
            { severity: 'red', title: 'Mixed content detected', desc: '2 resources loading over HTTP on an HTTPS page.' },
        ]},
        ].map(({ title, items }) => (
            <div key={title} className="bg-white/[0.025] border border-white/[0.06] rounded-2xl p-6">
            <p className="text-xs font-mono text-[#8899aa] uppercase tracking-widest mb-4">{title}</p>
            {items.map(({ severity, title: t, desc }) => (
                <div key={t} className="flex gap-3 py-3 border-b border-white/[0.04] last:border-0">
                <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dot[severity]}`} />
                <div>
                    <p className="text-sm font-medium text-[#c8d8e8] mb-1">{t}</p>
                    <p className="text-xs text-[#5a7080] leading-relaxed">{desc}</p>
                </div>
                </div>
            ))}
            </div>
        ))}
        </div>

        {/* CTA */}
        <div className="bg-blue-500/[0.06] border border-blue-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-medium text-[#e8edf5] mb-1">Keep watching this site automatically</h3>
            <p className="text-sm text-[#4a6070]">Set up scheduled monitoring and get alerted the moment a score drops.</p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button onClick={() => navigate('/dashboard')} className="border border-white/10 hover:border-white/25 text-[#8899aa] text-sm px-4 py-2 rounded-lg transition-all">View Trends</button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Schedule → Every 6hrs</button>
          </div>
        </div>

        <p className="text-center text-xs text-[#2e4050] font-mono mt-8">// SATsec audit engine v1.0 · axe-core + Lighthouse + BeautifulSoup</p>
      </div>
    </div>
  )
}