const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export async function generateProgram(profile) {
  const prompt = buildProgramPrompt(profile)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)

  const data = await response.json()
  const text = data.content[0].text

  try {
    const clean = text.replace(/```json\n?|\n?```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return parseProgramFallback(text, profile)
  }
}

export async function coachChat(messages, profile, stats) {
  const systemPrompt = buildCoachSystemPrompt(profile, stats)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: systemPrompt,
      messages,
    }),
  })

  if (!response.ok) throw new Error(`Claude API error: ${response.status}`)
  const data = await response.json()
  return data.content[0].text
}

// ─── PROMPT BUILDERS ─────────────────────────────────────────────────────────

function buildProgramPrompt(profile) {
  const {
    goals = [], raceDate, raceTarget, age, weight, height,
    trainingYears, fitnessLevel, daysPerWeek, sessionLength,
    gymAccess, equipment = [], schedule, constraints,
    sport, currentPRs = {}, wearable, dietaryPrefs
  } = profile

  return `You are an elite hybrid athlete coach (think CBUM for strength, elite Hyrox coaches like those training Cole Learn and Jake Dearden for conditioning). 

Generate a personalised 12-week training program for this athlete. Respond ONLY with valid JSON, no markdown, no preamble.

ATHLETE PROFILE:
- Age: ${age || 25}, Weight: ${weight || 80}kg, Height: ${height || 175}cm
- Training years: ${trainingYears || 3}
- Fitness level: ${fitnessLevel || 'intermediate'}
- Goals: ${goals.join(', ')}
- Race date: ${raceDate || 'June 2026'}
- Race target: ${raceTarget || 'sub-65 min Hyrox'}
- Days per week available: ${daysPerWeek || 6}
- Max session length: ${sessionLength || 90} minutes
- Training window: ${schedule || 'mornings 7-10am'}
- Gym access: ${gymAccess || 'full gym'}
- Equipment: ${equipment.join(', ') || 'full gym equipment'}
- Constraints: ${constraints || 'office 10am-8pm weekdays'}
- Sport focus: ${sport || 'Hyrox + running'}
- Current PRs: ${JSON.stringify(currentPRs)}

COACHING PRINCIPLES TO APPLY:
1. Polarized training (80% Zone 2, 20% high intensity)
2. Every muscle group trained 2x/week minimum  
3. Cover: quads, hamstrings, glutes, chest (flat + incline), back (width + thickness), shoulders (front + side + rear), biceps, triceps, calves, core, rotator cuff
4. Hyrox-specific: SkiErg, sled (or sub), burpee broad jumps, rowing, sandbag lunges, wall balls weekly
5. Running: Z2 base, tempo at race pace, intervals at 88-90% HR
6. Injury prevention: tibialis raises, rotator cuff, hip flexors
7. No calorie deficit on hardest training days
8. Taper 2 weeks before race

Return this EXACT JSON structure:
{
  "programName": "string",
  "athlete": "string (first name)",
  "phases": [
    {
      "phase": 1,
      "name": "BASE",
      "weeks": "1-4",
      "focus": "string",
      "weeklyStructure": {
        "MON": { "label": "Monday", "tag": "RECOVERY", "color": "#3B82F6", "time": "7:00am", "duration": "60 min", "location": "HOME", "title": "string", "note": "string",
          "blocks": [
            { "name": "BLOCK NAME", "duration": "X min", "color": "#hexcolor",
              "exercises": [
                { "name": "Exercise Name", "sets": "3", "reps": "10", "note": "coaching note", "weekProgression": "Wk1: Xkg → Wk4: Ykg" }
              ]
            }
          ]
        },
        "TUE": { "same structure" },
        "WED": { "same structure" },
        "THU": { "same structure" },
        "FRI": { "same structure" },
        "SAT": { "same structure" },
        "SUN": { "same structure" }
      }
    },
    { "phase": 2, "name": "BUILD", "weeks": "5-8", "same structure" },
    { "phase": 3, "name": "PEAK", "weeks": "9-12", "same structure" }
  ],
  "nutrition": {
    "dailyCalories": 2200,
    "protein": 176,
    "carbs": 320,
    "fat": 64,
    "supplements": ["Creatine 5g", "Vitamin D"],
    "highDays": ["TUE", "SAT"],
    "highDayCalories": 2700,
    "refeedDay": "SUN",
    "notes": "string"
  },
  "races": [
    { "name": "string", "date": "string", "target": "string", "color": "#hexcolor" }
  ],
  "coachingNotes": {
    "philosophy": "string",
    "riskPoints": ["string"],
    "keyPrinciples": ["string"]
  }
}`
}

function buildCoachSystemPrompt(profile, stats) {
  return `You are GRYND Coach — an elite AI fitness coach for hybrid athletes. You're direct, data-driven, and specific. No fluff.

Athlete: ${profile?.name || 'Athlete'}, ${profile?.age || 25}yo, ${profile?.weight || 80}kg
Goals: ${profile?.goals?.join(', ') || 'Hyrox + running'}
Current stats: VO2max ${stats?.vo2 || 52}, Resting HR ${stats?.hr || 47}, BF% ${stats?.bf || 18}%
Current week: ${stats?.currentWeek || 1}/12, Phase: ${stats?.phase || 'BASE'}

Keep responses under 100 words. Be specific with numbers (paces, weights, HRs). Reference their actual data.`
}

function parseProgramFallback(text, profile) {
  // Return a sensible default program if JSON parse fails
  return {
    programName: '12-Week Hybrid Performance Program',
    athlete: profile?.name || 'Athlete',
    phases: getDefaultPhases(profile),
    nutrition: { dailyCalories: 2200, protein: 176, carbs: 320, fat: 64, supplements: ['Creatine 5g', 'Vitamin D'], highDays: ['TUE','SAT'], highDayCalories: 2700, refeedDay: 'SUN', notes: 'Calorie cycling based on training load.' },
    races: [
      { name: 'Target Race', date: profile?.raceDate || 'June 2026', target: profile?.raceTarget || 'Sub-65:00', color: '#00C896' }
    ],
    coachingNotes: {
      philosophy: 'Polarized training: 80% Zone 2, 20% high intensity. Every session has a purpose tied to race day.',
      riskPoints: ['Don\'t skip Zone 2 discipline', 'Taper properly', 'Fuel hard sessions adequately'],
      keyPrinciples: ['Progressive overload', 'Aerobic base first', 'Race-specific simulation weekly']
    }
  }
}

function getDefaultPhases(profile) {
  const days = ['MON','TUE','WED','THU','FRI','SAT','SUN']
  const defaultDay = (day) => ({
    label: day,
    tag: ['MON'].includes(day) ? 'RECOVERY' : ['TUE','SAT'].includes(day) ? 'HARD' : ['WED','SUN'].includes(day) ? 'EASY' : 'MODERATE',
    color: ['TUE','SAT'].includes(day) ? '#EF4444' : ['WED','SUN'].includes(day) ? '#10B981' : ['MON'].includes(day) ? '#3B82F6' : '#F59E0B',
    time: day === 'SAT' ? '9:00am' : day === 'SUN' ? '6:00am' : '8:15am',
    duration: ['SAT'].includes(day) ? '2.5–3 hrs' : ['SUN'].includes(day) ? '2–3 hrs' : '90 min',
    location: ['WED','THU','FRI','SUN'].includes(day) ? 'ROAD' : ['MON'].includes(day) ? 'HOME' : 'GYM',
    title: 'Training Session',
    note: 'Follow program as prescribed.',
    blocks: []
  })
  
  return [1,2,3].map(phase => ({
    phase,
    name: phase===1?'BASE':phase===2?'BUILD':'PEAK',
    weeks: phase===1?'1-4':phase===2?'5-8':'9-12',
    focus: phase===1?'Aerobic foundation + movement patterns':phase===2?'Race-specific intensity':'Peak performance + taper',
    weeklyStructure: Object.fromEntries(days.map(d => [d, defaultDay(d)]))
  }))
}
