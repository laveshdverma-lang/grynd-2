import { useState } from 'react'
import { useStore } from '../store'
import { generateProgram } from '../lib/claude'

const STEPS = [
  { id: 'goals', title: 'WHAT ARE YOU\nTRAINING FOR?', sub: 'Select all that apply — your plan adapts to every goal' },
  { id: 'body', title: 'ABOUT\nYOU', sub: 'This lets us set the right intensity and nutrition targets' },
  { id: 'schedule', title: 'YOUR\nSCHEDULE', sub: 'We build around your real life, not an ideal one' },
  { id: 'race', title: 'YOUR\nTARGET RACE', sub: 'Give us a date and we reverse-engineer your training' },
  { id: 'constraints', title: 'ANYTHING\nELSE?', sub: 'Injuries, dietary preferences, equipment — tell us everything' },
]

const GOAL_OPTIONS = [
  { id: 'hyrox', label: '🏆 Hyrox Competition', desc: 'Amateur to Pro' },
  { id: '10k', label: '🏃 10K Race', desc: 'Sub-45 and beyond' },
  { id: 'halfMarathon', label: '🏃 Half Marathon', desc: '21km goal' },
  { id: 'buildMuscle', label: '💪 Build Muscle', desc: 'Recomp or bulk' },
  { id: 'vo2max', label: '⚡ Improve VO2max', desc: 'Cardio base' },
  { id: 'macros', label: '🥗 Track Macros', desc: 'Nutrition control' },
  { id: 'hybrid', label: '⚔️ Hybrid Athlete', desc: 'Strength + cardio' },
  { id: 'beginner', label: '🌱 General Fitness', desc: 'Just get started' },
]

const EQUIPMENT_OPTIONS = [
  'Full gym', 'Barbell + rack', 'Dumbbells', 'SkiErg',
  'Rowing machine', 'Sled', 'Kettlebells', 'Pull-up bar',
  'Resistance bands', 'Home only'
]

export default function OnboardingPage() {
  const [step, setStep] = useState(0)
  const [generating, setGenerating] = useState(false)
  const [genMessage, setGenMessage] = useState('')
  const setProfile = useStore(s => s.setProfile)
  const setProgram = useStore(s => s.setProgram)
  const setOnboardingComplete = useStore(s => s.setOnboardingComplete)
  const setRaces = useStore(s => s.setRaces)
  const updateStats = useStore(s => s.updateStats)

  const [form, setForm] = useState({
    goals: [], name: '', age: '', weight: '', height: '', trainingYears: '',
    fitnessLevel: 'intermediate', daysPerWeek: '6', sessionLength: '90',
    gymAccess: 'full gym', equipment: [], schedule: 'mornings 7-10am',
    raceType: '', raceDate: '', raceTarget: '', raceName: '',
    constraints: '', injuries: '', dietaryPrefs: '', wearable: '',
    vo2: '', hr: '', currentWeight: '',
  })

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const toggleArr = (key, val) => setForm(f => ({ ...f, [key]: f[key].includes(val) ? f[key].filter(x => x !== val) : [...f[key], val] }))

  const genMessages = [
    'Analysing your profile...',
    'Calculating race pace targets...',
    'Building your strength progression...',
    'Designing Hyrox simulation schedule...',
    'Applying polarized training model...',
    'Finalising your 12-week program...',
  ]

  async function handleFinish() {
    setGenerating(true)
    let msgIdx = 0
    setGenMessage(genMessages[0])
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % genMessages.length
      setGenMessage(genMessages[msgIdx])
    }, 1800)

    try {
      const profile = { ...form, sport: form.goals.join(', ') }
      const program = await generateProgram(profile)
      setProfile(profile)
      setProgram(program)
      if (program.races) setRaces(program.races)
      if (form.vo2 || form.weight) {
        updateStats({ vo2: Number(form.vo2) || null, weight: Number(form.currentWeight) || Number(form.weight) || null, hr: Number(form.hr) || null }, 'Baseline')
      }
      setOnboardingComplete(true)
    } catch (err) {
      console.error(err)
      setOnboardingComplete(true)
    } finally {
      clearInterval(msgInterval)
      setGenerating(false)
    }
  }

  if (generating) return (
    <div className="loading-screen">
      <div className="loading-logo">GRYND</div>
      <div className="loading-bar-wrap"><div className="loading-bar" /></div>
      <div className="loading-msg">{genMessage}</div>
      <div style={{ fontSize: 11, color: 'var(--grey)', marginTop: 8 }}>Building your personalised program with AI...</div>
    </div>
  )

  const current = STEPS[step]
  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="onboard-wrap">
      {/* Progress */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="onboard-step-label">STEP {step + 1} OF {STEPS.length}</div>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ background: 'none', border: 'none', color: 'var(--grey)', fontSize: 13, cursor: 'pointer' }}>← Back</button>}
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%`, background: 'var(--lime)' }} /></div>
        <div className="step-dots" style={{ marginTop: 8 }}>
          {STEPS.map((_, i) => <div key={i} className={`step-dot ${i === step ? 'active' : i < step ? 'done' : ''}`} />)}
        </div>
      </div>

      <div className="onboard-top">
        <div className="onboard-title">{current.title}</div>
        <div className="onboard-sub">{current.sub}</div>

        {/* STEP 1: GOALS */}
        {step === 0 && (
          <div className="option-grid">
            {GOAL_OPTIONS.map(opt => (
              <button key={opt.id} className={`option-btn ${form.goals.includes(opt.id) ? 'selected' : ''}`}
                onClick={() => toggleArr('goals', opt.id)}>
                <span style={{ flex: 1 }}>
                  <span style={{ display: 'block', fontWeight: 600 }}>{opt.label}</span>
                  <span style={{ fontSize: 11, opacity: 0.7 }}>{opt.desc}</span>
                </span>
                <span className="check">{form.goals.includes(opt.id) && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#080A0F" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>}</span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: BODY */}
        {step === 1 && (
          <div>
            <div className="form-group">
              <label className="form-label">YOUR FIRST NAME</label>
              <input className="form-input" placeholder="Arjun" value={form.name} onChange={e => update('name', e.target.value)} />
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">AGE</label>
                <input className="form-input" type="number" placeholder="25" value={form.age} onChange={e => update('age', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">WEIGHT (kg)</label>
                <input className="form-input" type="number" placeholder="80" value={form.weight} onChange={e => update('weight', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">HEIGHT (cm)</label>
                <input className="form-input" type="number" placeholder="175" value={form.height} onChange={e => update('height', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">TRAINING YEARS</label>
                <input className="form-input" type="number" placeholder="3" value={form.trainingYears} onChange={e => update('trainingYears', e.target.value)} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">FITNESS LEVEL</label>
              <select className="form-input" value={form.fitnessLevel} onChange={e => update('fitnessLevel', e.target.value)}>
                <option value="beginner">Beginner — just starting out</option>
                <option value="intermediate">Intermediate — training 1-3 years</option>
                <option value="advanced">Advanced — competitive level</option>
                <option value="elite">Elite — professional / national level</option>
              </select>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">VO2MAX (if known)</label>
                <input className="form-input" type="number" placeholder="52" value={form.vo2} onChange={e => update('vo2', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">RESTING HR (bpm)</label>
                <input className="form-input" type="number" placeholder="47" value={form.hr} onChange={e => update('hr', e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SCHEDULE */}
        {step === 2 && (
          <div>
            <div className="form-group">
              <label className="form-label">DAYS AVAILABLE PER WEEK</label>
              <select className="form-input" value={form.daysPerWeek} onChange={e => update('daysPerWeek', e.target.value)}>
                {[3,4,5,6,7].map(d => <option key={d} value={d}>{d} days/week</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">MAX SESSION LENGTH</label>
              <select className="form-input" value={form.sessionLength} onChange={e => update('sessionLength', e.target.value)}>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="75">75 minutes</option>
                <option value="90">90 minutes</option>
                <option value="120">2 hours</option>
                <option value="180">3+ hours (weekends)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">TRAINING WINDOW</label>
              <select className="form-input" value={form.schedule} onChange={e => update('schedule', e.target.value)}>
                <option value="early mornings 5-7am">Early mornings 5–7am</option>
                <option value="mornings 7-10am">Mornings 7–10am</option>
                <option value="lunch 12-1pm">Lunch 12–1pm</option>
                <option value="afternoons 4-6pm">Afternoons 4–6pm</option>
                <option value="evenings 7-9pm">Evenings 7–9pm</option>
                <option value="flexible anytime">Flexible — anytime works</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">GYM ACCESS</label>
              <select className="form-input" value={form.gymAccess} onChange={e => update('gymAccess', e.target.value)}>
                <option value="full gym">Full commercial gym</option>
                <option value="home gym">Home gym</option>
                <option value="limited equipment">Limited equipment</option>
                <option value="no gym bodyweight only">No gym — bodyweight only</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">EQUIPMENT AVAILABLE</label>
              <div className="option-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                {EQUIPMENT_OPTIONS.map(eq => (
                  <button key={eq} className={`option-btn ${form.equipment.includes(eq) ? 'selected' : ''}`}
                    style={{ padding: '8px 12px' }} onClick={() => toggleArr('equipment', eq)}>
                    <span style={{ fontSize: 12 }}>{eq}</span>
                    <span className="check">{form.equipment.includes(eq) && <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#080A0F" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: RACE */}
        {step === 3 && (
          <div>
            <div className="form-group">
              <label className="form-label">RACE TYPE</label>
              <select className="form-input" value={form.raceType} onChange={e => update('raceType', e.target.value)}>
                <option value="">Select race type</option>
                <option value="Hyrox Pro">Hyrox Pro</option>
                <option value="Hyrox Doubles">Hyrox Doubles</option>
                <option value="Hyrox Open">Hyrox Open</option>
                <option value="5K">5K</option>
                <option value="10K">10K</option>
                <option value="Half Marathon">Half Marathon</option>
                <option value="Marathon">Marathon</option>
                <option value="No specific race">No specific race</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">RACE NAME (optional)</label>
              <input className="form-input" placeholder="e.g. TCS Bengaluru 10K" value={form.raceName} onChange={e => update('raceName', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">RACE DATE</label>
              <input className="form-input" type="date" value={form.raceDate} onChange={e => update('raceDate', e.target.value)} style={{ colorScheme: 'dark' }} />
            </div>
            <div className="form-group">
              <label className="form-label">TARGET TIME / GOAL</label>
              <input className="form-input" placeholder="e.g. Sub-45:00, Sub-65 min, Top 10%" value={form.raceTarget} onChange={e => update('raceTarget', e.target.value)} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--grey)', marginTop: -8, lineHeight: 1.5 }}>
              No race planned? Leave empty — your program will focus on general performance.
            </div>
          </div>
        )}

        {/* STEP 5: CONSTRAINTS */}
        {step === 4 && (
          <div>
            <div className="form-group">
              <label className="form-label">INJURIES OR LIMITATIONS</label>
              <input className="form-input" placeholder="e.g. Right knee, lower back — or 'none'" value={form.injuries} onChange={e => update('injuries', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">OTHER CONSTRAINTS</label>
              <input className="form-input" placeholder="e.g. Office 10am-8pm, no gym weekdays" value={form.constraints} onChange={e => update('constraints', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">DIETARY PREFERENCES</label>
              <select className="form-input" value={form.dietaryPrefs} onChange={e => update('dietaryPrefs', e.target.value)}>
                <option value="no restrictions">No restrictions</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="high protein">High protein focus</option>
                <option value="intermittent fasting">Intermittent fasting</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">WEARABLE DEVICE</label>
              <select className="form-input" value={form.wearable} onChange={e => update('wearable', e.target.value)}>
                <option value="">None / not sure</option>
                <option value="Coros Pace 3">Coros Pace 3</option>
                <option value="Whoop 4.0">Whoop 4.0</option>
                <option value="Garmin">Garmin</option>
                <option value="Apple Watch">Apple Watch</option>
                <option value="Fitbit">Fitbit</option>
                <option value="Polar">Polar</option>
              </select>
            </div>
            <div className="card" style={{ background: 'var(--lime-ghost)', borderColor: 'rgba(200,241,53,0.25)' }}>
              <div style={{ fontSize: 11, color: 'var(--lime)', fontWeight: 700, letterSpacing: 2, marginBottom: 6 }}>READY TO BUILD YOUR PLAN</div>
              <div style={{ fontSize: 12, color: 'var(--grey)', lineHeight: 1.6 }}>Claude AI will now generate your personalised 12-week program based on everything you've told us. Takes about 10 seconds.</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div style={{ marginTop: 24 }}>
        {step < STEPS.length - 1 ? (
          <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}
            disabled={step === 0 && form.goals.length === 0}>
            NEXT →
          </button>
        ) : (
          <button className="btn btn-primary" onClick={handleFinish}>
            BUILD MY PROGRAM →
          </button>
        )}
      </div>
    </div>
  )
}
