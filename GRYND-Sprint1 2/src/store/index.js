import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // ─── AUTH ──────────────────────────────────────────────
      user: null,
      setUser: (user) => set({ user }),

      // ─── ONBOARDING ────────────────────────────────────────
      onboardingComplete: false,
      profile: null,
      setProfile: (profile) => set({ profile }),
      setOnboardingComplete: (v) => set({ onboardingComplete: v }),

      // ─── PROGRAM ───────────────────────────────────────────
      program: null,
      setProgram: (program) => set({ program }),
      currentPhase: 1,
      currentWeek: 1,
      setCurrentPhase: (p) => set({ currentPhase: p }),
      setCurrentWeek: (w) => set({ currentWeek: w }),

      // ─── STATS ─────────────────────────────────────────────
      stats: {
        vo2: null, hr: null, bf: null, muscle: null,
        weight: null, fiveK: null, bench: null, squat: null,
      },
      statHistory: [],
      updateStats: (newStats, label) => {
        const history = get().statHistory
        set({
          stats: { ...get().stats, ...newStats },
          statHistory: [...history, { ...newStats, label, date: new Date().toISOString() }]
        })
      },

      // ─── TICKS (exercise completion) ───────────────────────
      ticks: {},
      toggleTick: (key) => {
        const ticks = { ...get().ticks }
        ticks[key] = !ticks[key]
        set({ ticks })
      },
      clearDayTicks: (dayKey) => {
        const ticks = { ...get().ticks }
        Object.keys(ticks).forEach(k => { if (k.startsWith(dayKey)) delete ticks[k] })
        set({ ticks })
      },

      // ─── PROGRAM EDITS ─────────────────────────────────────
      programEdits: {},
      saveExerciseEdit: (key, edit) => {
        set({ programEdits: { ...get().programEdits, [key]: edit } })
      },
      resetExerciseEdit: (key) => {
        const edits = { ...get().programEdits }
        delete edits[key]
        set({ programEdits: edits })
      },

      // ─── WORKOUT LOG ───────────────────────────────────────
      workoutLog: [],
      addWorkoutLog: (entry) => set({ workoutLog: [entry, ...get().workoutLog] }),
      deleteWorkoutLog: (i) => {
        const log = [...get().workoutLog]
        log.splice(i, 1)
        set({ workoutLog: log })
      },

      // ─── RACES ─────────────────────────────────────────────
      races: [],
      setRaces: (races) => set({ races }),
      updateRaceResult: (i, result) => {
        const races = [...get().races]
        races[i] = { ...races[i], result }
        set({ races })
      },

      // ─── STREAK ────────────────────────────────────────────
      streak: 0,
      lastActiveDate: null,
      incrementStreak: () => {
        const today = new Date().toDateString()
        const last = get().lastActiveDate
        if (last === today) return
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        set({
          streak: last === yesterday ? get().streak + 1 : 1,
          lastActiveDate: today
        })
      },

      // ─── RESET ─────────────────────────────────────────────
      resetAll: () => set({
        user: null, onboardingComplete: false, profile: null,
        program: null, currentPhase: 1, currentWeek: 1,
        stats: { vo2: null, hr: null, bf: null, muscle: null, weight: null, fiveK: null, bench: null, squat: null },
        statHistory: [], ticks: {}, programEdits: {}, workoutLog: [], races: [], streak: 0
      }),
    }),
    {
      name: 'grynd-store-v1',
      partialize: (state) => ({
        onboardingComplete: state.onboardingComplete,
        profile: state.profile,
        program: state.program,
        currentPhase: state.currentPhase,
        currentWeek: state.currentWeek,
        stats: state.stats,
        statHistory: state.statHistory,
        ticks: state.ticks,
        programEdits: state.programEdits,
        workoutLog: state.workoutLog,
        races: state.races,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
      })
    }
  )
)
