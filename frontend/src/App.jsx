import React, { useState, useEffect } from 'react'

const API = 'http://localhost:8000'
const USER = 'demo_user'

const MOCK_APPS = [
  {
    id: 'food_app', name: 'QuickBite', icon: '🍔', color: '#f97316', bg: '#fff7ed',
    tagline: 'Food delivery',
    actions: [
      { label: 'Find restaurants near me', data_type: 'location',    purpose: 'delivery',  icon: '📍' },
      { label: 'Invite friends',           data_type: 'contacts',    purpose: 'marketing', icon: '👥' },
    ]
  },
  {
    id: 'health_app', name: 'VitalTrack', icon: '❤️', color: '#ef4444', bg: '#fef2f2',
    tagline: 'Health tracker',
    actions: [
      { label: 'Log health metrics',   data_type: 'health_data', purpose: 'emergency',  icon: '🩺' },
      { label: 'Track my location',    data_type: 'location',    purpose: 'analytics',  icon: '📍' },
    ]
  },
  {
    id: 'social_app', name: 'Sphere', icon: '🌐', color: '#8b5cf6', bg: '#f5f3ff',
    tagline: 'Social network',
    actions: [
      { label: 'Find nearby friends', data_type: 'location',  purpose: 'analytics', icon: '📍' },
      { label: 'Sync my contacts',    data_type: 'contacts',  purpose: 'marketing', icon: '👥' },
    ]
  }
]

const DATA_TYPES = ['location','contacts','health_data','camera','microphone','storage']
const PURPOSES   = ['delivery','analytics','emergency','marketing','research']
const APP_IDS    = ['food_app','health_app','social_app','maps_app','fitness_app']

// ── Intercept overlay ──────────────────────────────────────────
function InterceptDialog({ request, onClose }) {
  const [phase, setPhase]   = useState('checking')
  const [result, setResult] = useState(null)
  const app = MOCK_APPS.find(a => a.id === request.app_id) || MOCK_APPS[0]

  useEffect(() => {
    fetch(`${API}/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: USER, ...request })
    })
      .then(r => r.json())
      .then(data => setTimeout(() => { setResult(data); setPhase('result') }, 1200))
      .catch(() => setTimeout(() => {
        setResult({ decision: 'deny', reason: 'Backend not reachable', explanation: 'Could not reach consent server.' })
        setPhase('result')
      }, 1200))
  }, [])

  const cfg = result && {
    allow: { color: '#16a34a', bg: '#dcfce7', border: '#86efac', icon: '✓', label: 'Request Approved'  },
    deny:  { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', icon: '✕', label: 'Request Blocked'   },
    flag:  { color: '#d97706', bg: '#fef3c7', border: '#fcd34d', icon: '⚠', label: 'Request Flagged'   },
  }[result.decision]

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
      backdropFilter:'blur(4px)', display:'flex', alignItems:'center',
      justifyContent:'center', zIndex:1000, animation:'fadeIn .15s ease' }}>
      <div style={{ background:'#fff', borderRadius:20, width:360,
        overflow:'hidden', boxShadow:'0 25px 60px rgba(0,0,0,0.35)',
        animation:'slideUp .2s ease' }}>

        <div style={{ background:'#0f172a', padding:'12px 18px',
          display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#22d3ee',
            boxShadow:'0 0 8px #22d3ee' }} />
          <span style={{ color:'#94a3b8', fontSize:11, letterSpacing:1, fontFamily:'monospace' }}>
            CONSENT LAYER — INTERCEPTED REQUEST
          </span>
        </div>

        <div style={{ padding:'22px 24px' }}>
          {/* App identity */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18,
            padding:'14px 16px', background:app.bg, borderRadius:12,
            border:`1px solid ${app.color}30` }}>
            <div style={{ fontSize:28, width:50, height:50, display:'flex', alignItems:'center',
              justifyContent:'center', background:'#fff', borderRadius:12,
              boxShadow:'0 2px 8px rgba(0,0,0,0.1)' }}>{app.icon}</div>
            <div>
              <div style={{ fontWeight:700, fontSize:16 }}>{app.name}</div>
              <div style={{ fontSize:13, color:'#6b7280' }}>is requesting your</div>
              <div style={{ fontWeight:700, fontSize:15, color:app.color, marginTop:2 }}>
                {request.data_type.replace('_',' ')}
              </div>
            </div>
          </div>

          <div style={{ fontSize:13, color:'#6b7280', marginBottom:16 }}>
            Stated purpose:{' '}
            <span style={{ color:'#374151', fontWeight:600 }}>"{request.purpose}"</span>
          </div>

          {/* Checking animation */}
          {phase === 'checking' ? (
            <div style={{ padding:'18px 0', textAlign:'center' }}>
              <div style={{ display:'flex', justifyContent:'center', gap:6, marginBottom:12 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width:9, height:9, borderRadius:'50%', background:'#2563eb',
                    animation:`bounce .9s ${i*.15}s ease-in-out infinite` }} />
                ))}
              </div>
              <div style={{ fontSize:13, color:'#6b7280', fontWeight:500 }}>Checking consent rules…</div>
              <div style={{ fontSize:11, color:'#9ca3af', marginTop:4, fontFamily:'monospace' }}>
                {request.app_id} × {request.data_type} × {request.purpose}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ padding:'14px', borderRadius:12, border:`1px solid ${cfg.border}`,
                background:cfg.bg, marginBottom:14,
                display:'flex', alignItems:'flex-start', gap:12 }}>
                <div style={{ fontSize:22, fontWeight:700, color:cfg.color, lineHeight:1 }}>{cfg.icon}</div>
                <div>
                  <div style={{ fontWeight:700, color:cfg.color, fontSize:15 }}>{cfg.label}</div>
                  <div style={{ fontSize:13, color:'#374151', marginTop:4, lineHeight:1.5 }}>
                    {result.explanation}
                  </div>
                </div>
              </div>
              <div style={{ fontSize:11, color:'#94a3b8', fontFamily:'monospace',
                background:'#f8fafc', padding:'8px 12px', borderRadius:8, marginBottom:14 }}>
                reason: {result.reason}
              </div>
            </div>
          )}

          <button onClick={() => onClose(result)} style={{
            width:'100%', padding:'11px', borderRadius:10, border:'none',
            background: phase==='result' ? '#0f172a' : '#e5e7eb',
            color: phase==='result' ? '#fff' : '#9ca3af',
            cursor: phase==='result' ? 'pointer' : 'default',
            fontSize:15, fontWeight:600, transition:'all .2s'
          }}>
            {phase==='checking' ? 'Verifying…' : 'Dismiss'}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn  { from{opacity:0}          to{opacity:1} }
        @keyframes slideUp { from{transform:translateY(28px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes bounce  { 0%,80%,100%{transform:scale(.6)} 40%{transform:scale(1)} }
      `}</style>
    </div>
  )
}

// ── Mock app card ──────────────────────────────────────────────
function MockAppCard({ app, onRequest }) {
  const [results, setResults] = useState({})
  const handleClose = (label, r) => {
    if (r) setResults(p => ({ ...p, [label]: r }))
  }
  return (
    <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16,
      overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ padding:'14px 16px', borderBottom:'1px solid #f3f4f6',
        background:app.bg, display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ fontSize:24, width:44, height:44, display:'flex', alignItems:'center',
          justifyContent:'center', background:'#fff', borderRadius:12,
          boxShadow:`0 2px 6px ${app.color}30` }}>{app.icon}</div>
        <div>
          <div style={{ fontWeight:700, fontSize:14 }}>{app.name}</div>
          <div style={{ fontSize:11, color:'#9ca3af' }}>{app.tagline}</div>
        </div>
        <span style={{ marginLeft:'auto', fontSize:10, color:app.color,
          background:`${app.color}18`, padding:'2px 7px', borderRadius:20, fontWeight:700 }}>LIVE</span>
      </div>
      <div style={{ padding:'12px 14px', display:'flex', flexDirection:'column', gap:8 }}>
        {app.actions.map(action => {
          const res = results[action.label]
          return (
            <div key={action.label}>
              <button onClick={() => onRequest(
                { app_id: app.id, data_type: action.data_type, purpose: action.purpose },
                (r) => handleClose(action.label, r)
              )} style={{ width:'100%', padding:'9px 12px', borderRadius:9,
                border:'1px solid #e5e7eb', background:'#f9fafb', cursor:'pointer',
                textAlign:'left', display:'flex', alignItems:'center', gap:8, fontSize:13 }}>
                <span>{action.icon}</span>
                <span style={{ color:'#374151', fontWeight:500 }}>{action.label}</span>
                <span style={{ marginLeft:'auto', fontSize:10, color:'#d1d5db' }}>tap →</span>
              </button>
              {res && (
                <div style={{ marginTop:5, padding:'6px 10px', borderRadius:7, fontSize:12, fontWeight:600,
                  background: res.decision==='allow'?'#dcfce7': res.decision==='deny'?'#fee2e2':'#fef3c7',
                  color:      res.decision==='allow'?'#15803d': res.decision==='deny'?'#dc2626':'#d97706' }}>
                  {res.decision==='allow' ? '✓ Access granted' : res.decision==='deny' ? '✕ Blocked by Consent Layer' : '⚠ Flagged — purpose mismatch'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Live audit feed ────────────────────────────────────────────
function AuditFeed() {
  const [log, setLog] = useState([])
  useEffect(() => {
    const load = () => fetch(`${API}/audit/${USER}`).then(r=>r.json()).then(setLog).catch(()=>{})
    load()
    const t = setInterval(load, 2000)
    return () => clearInterval(t)
  }, [])
  const col = d => d==='allow'?'#16a34a': d==='deny'?'#dc2626':'#d97706'
  const icon = d => d==='allow'?'✓': d==='deny'?'✕':'⚠'
  return (
    <div style={{ background:'#0f172a', borderRadius:16, padding:'18px', height:'100%', minHeight:380 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:'#22d3ee',
          boxShadow:'0 0 8px #22d3ee', animation:'pulse 2s infinite' }} />
        <span style={{ color:'#94a3b8', fontSize:11, letterSpacing:1, fontFamily:'monospace' }}>
          LIVE CONSENT EVENTS
        </span>
      </div>
      {log.length===0 && (
        <div style={{ color:'#334155', fontSize:13, fontFamily:'monospace',
          textAlign:'center', paddingTop:40 }}>
          no events yet<br/><span style={{fontSize:11}}>tap an app button to start</span>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
        {log.slice(0,12).map((a,i) => (
          <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <div style={{ width:22, height:22, borderRadius:'50%', background:col(a.decision),
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:11, color:'#fff', fontWeight:700, flexShrink:0, marginTop:1 }}>
              {icon(a.decision)}
            </div>
            <div>
              <div style={{ fontSize:12, color:'#e2e8f0', fontFamily:'monospace', lineHeight:1.4 }}>
                <span style={{ color:'#7dd3fc' }}>{a.app_id}</span>{' → '}
                <span style={{ color:'#fbbf24' }}>{a.data_type}</span>
              </div>
              <div style={{ fontSize:11, color:'#64748b', marginTop:2, lineHeight:1.3 }}>
                {a.explanation || a.reason}
              </div>
              <div style={{ fontSize:10, color:'#334155', marginTop:1 }}>{a.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
    </div>
  )
}

// ── Manage consents panel ──────────────────────────────────────
function ManagePanel() {
  const [consents, setConsents] = useState([])
  const [rules, setRules]       = useState([])
  const [cf, setCf] = useState({ app_id:'food_app', data_type:'location', purpose:'delivery' })
  const [rf, setRf] = useState({ data_type:'contacts', rule_type:'block' })

  const load = () => {
    fetch(`${API}/consents/${USER}`).then(r=>r.json()).then(setConsents).catch(()=>{})
    fetch(`${API}/rules/${USER}`).then(r=>r.json()).then(setRules).catch(()=>{})
  }
  useEffect(() => { load() }, [])

  const sel = (val, opts, fn) => (
    <select value={val} onChange={e=>fn(e.target.value)}
      style={{ padding:'6px 8px', borderRadius:7, border:'1px solid #e5e7eb', fontSize:13, background:'#fff' }}>
      {opts.map(o=><option key={o}>{o}</option>)}
    </select>
  )

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
      <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
        {/* Consents */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'18px 20px' }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Active Consents</div>
          {consents.filter(c=>c.status==='active').length===0 &&
            <div style={{ color:'#9ca3af', fontSize:13 }}>No active consents.</div>}
          {consents.filter(c=>c.status==='active').map(c => (
            <div key={c.id} style={{ display:'flex', alignItems:'center', gap:8,
              padding:'8px 0', borderBottom:'1px solid #f3f4f6', fontSize:13 }}>
              <div style={{ width:7, height:7, borderRadius:'50%', background:'#22c55e' }} />
              <b>{c.app_id}</b><span style={{color:'#9ca3af'}}>→</span>
              <b>{c.data_type}</b><span style={{color:'#9ca3af'}}>for</span><b>{c.purpose}</b>
              <button onClick={async()=>{ await fetch(`${API}/consents/${c.id}`,{method:'DELETE'}); load() }}
                style={{ marginLeft:'auto', background:'none', border:'none',
                  color:'#ef4444', cursor:'pointer', fontSize:12 }}>Revoke</button>
            </div>
          ))}
          <div style={{ display:'flex', gap:6, marginTop:14, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:12, color:'#9ca3af' }}>Grant:</span>
            {sel(cf.app_id, APP_IDS, v=>setCf(p=>({...p,app_id:v})))}
            {sel(cf.data_type, DATA_TYPES, v=>setCf(p=>({...p,data_type:v})))}
            {sel(cf.purpose, PURPOSES, v=>setCf(p=>({...p,purpose:v})))}
            <button onClick={async()=>{
              await fetch(`${API}/consents`,{method:'POST',headers:{'Content-Type':'application/json'},
                body:JSON.stringify({user_id:USER,...cf})})
              load()
            }} style={{ padding:'6px 14px', borderRadius:8, border:'none',
              background:'#2563eb', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>
              Grant
            </button>
          </div>
        </div>

        {/* Rules */}
        <div style={{ background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:'18px 20px' }}>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:14 }}>Privacy Rules</div>
          {rules.map(r=>(
            <div key={r.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px',
              background:'#fef2f2', borderRadius:8, border:'1px solid #fecaca', marginBottom:8, fontSize:13 }}>
              <span>🚫</span><span>Block <b>{r.data_type}</b> for all apps</span>
              <button onClick={async()=>{ await fetch(`${API}/rules/${r.id}`,{method:'DELETE'}); load() }}
                style={{ marginLeft:'auto', background:'none', border:'none',
                  color:'#dc2626', cursor:'pointer', fontSize:12 }}>Remove</button>
            </div>
          ))}
          <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap', alignItems:'center' }}>
            <span style={{ fontSize:12, color:'#9ca3af' }}>Block:</span>
            {sel(rf.data_type, DATA_TYPES, v=>setRf(p=>({...p,data_type:v})))}
            <button onClick={async()=>{
              await fetch(`${API}/rules`,{method:'POST',headers:{'Content-Type':'application/json'},
                body:JSON.stringify({user_id:USER,...rf})})
              load()
            }} style={{ padding:'6px 14px', borderRadius:8, border:'none',
              background:'#dc2626', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600 }}>
              Add Rule
            </button>
          </div>
        </div>
      </div>
      <AuditFeed />
    </div>
  )
}

// ── Root ───────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]         = useState('live')
  const [intercept, setIntercept] = useState(null)

  const handleRequest = (request, cb) => setIntercept({ request, cb })
  const handleClose   = (result) => { intercept?.cb?.(result); setIntercept(null) }

  return (
    <div style={{ minHeight:'100vh', background:'#f1f5f9', fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* Nav */}
      <div style={{ background:'#0f172a', padding:'0 28px' }}>
        <div style={{ maxWidth:1140, margin:'0 auto', display:'flex', alignItems:'center', height:56, gap:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8,
              background:'linear-gradient(135deg,#22d3ee,#2563eb)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>🔒</div>
            <span style={{ color:'#f1f5f9', fontWeight:700, fontSize:16 }}>ConsentLayer</span>
            <span style={{ color:'#22d3ee', fontSize:10, letterSpacing:1, fontWeight:700,
              border:'1px solid #22d3ee40', padding:'2px 7px', borderRadius:4 }}>DPDP</span>
          </div>
          <div style={{ display:'flex', gap:2 }}>
            {[['live','Live Demo'],['manage','Manage Consents']].map(([t,label])=>(
              <button key={t} onClick={()=>setTab(t)} style={{
                padding:'7px 16px', borderRadius:8, border:'none', cursor:'pointer', fontSize:14,
                background: tab===t ? '#1e293b' : 'transparent',
                color: tab===t ? '#f8fafc' : '#64748b', fontWeight: tab===t ? 600 : 400
              }}>{label}</button>
            ))}
          </div>
          <div style={{ marginLeft:'auto', fontSize:11, color:'#475569', fontFamily:'monospace' }}>
            session: demo_user
          </div>
        </div>
      </div>

      {/* Page */}
      <div style={{ maxWidth:1140, margin:'0 auto', padding:'28px 16px' }}>
        {tab==='live' && (
          <>
            <div style={{ marginBottom:22 }}>
              <h1 style={{ margin:'0 0 6px', fontSize:22, fontWeight:700, color:'#0f172a' }}>
                Real-time Consent Interception
              </h1>
              <p style={{ margin:0, color:'#64748b', fontSize:14 }}>
                Each button below simulates a real app requesting your data.
                The Consent Layer intercepts it before access is granted.
              </p>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1.1fr', gap:16, alignItems:'start' }}>
              {MOCK_APPS.map(app => (
                <MockAppCard key={app.id} app={app} onRequest={handleRequest} />
              ))}
              <AuditFeed />
            </div>

            {/* Flow strip */}
            <div style={{ marginTop:20, padding:'16px 22px', background:'#fff',
              border:'1px solid #e5e7eb', borderRadius:14,
              display:'flex', alignItems:'center', gap:0, flexWrap:'wrap', rowGap:10 }}>
              {[
                { n:'1', t:'App requests data',          c:'#2563eb' },
                null,
                { n:'2', t:'Consent Layer intercepts',   c:'#7c3aed' },
                null,
                { n:'3', t:'Rules & consent checked',    c:'#7c3aed' },
                null,
                { n:'4', t:'Allow / Deny / Flag',        c:'#16a34a' },
                null,
                { n:'5', t:'Receipt logged',             c:'#d97706' },
              ].map((s,i) => s===null
                ? <div key={i} style={{ color:'#d1d5db', fontSize:18, padding:'0 10px' }}>→</div>
                : (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:26, height:26, borderRadius:'50%', background:s.c,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:'#fff', fontSize:12, fontWeight:700 }}>{s.n}</div>
                    <span style={{ fontSize:13, color:'#374151', fontWeight:500, whiteSpace:'nowrap' }}>{s.t}</span>
                  </div>
                )
              )}
            </div>
          </>
        )}
        {tab==='manage' && <ManagePanel />}
      </div>

      {intercept && <InterceptDialog request={intercept.request} onClose={handleClose} />}
    </div>
  )
}
