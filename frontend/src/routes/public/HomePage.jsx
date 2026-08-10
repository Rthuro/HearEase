import { useState, useEffect } from 'react'
import Energy from '@/assets/energy.svg'
import Hero_img from '@/assets/HeroImg.svg'
import { Link } from 'react-router-dom'
import { ChevronRight, Zap, CalendarCheck, Clock, ShieldCheck, Users, FileText, BrainCircuit, ArrowRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

// Floating geometric shapes for atmospheric background
function FloatingShape({ className, delay = 0 }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: [0.12, 0.22, 0.12],
        scale: [0.8, 1, 0.8],
        rotate: [0, 90, 180],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        delay,
        ease: 'easeInOut',
      }}
    />
  )
}

// Stat pill component for floating metrics
function StatPill({ icon: Icon, value, label, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-center gap-3 bg-white/80 backdrop-blur-md border border-stone-200/60 rounded-2xl px-5 py-3.5 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      <div className=" size-8 md:w-10 md:h-10 rounded-md md:rounded-xl bg-gradient-to-br from-[#A60C0C] to-[#D4453A] flex items-center justify-center shrink-0">
        <Icon className=" size-5 text-white" strokeWidth={2} />
      </div>
      <div>
        <p className="md:text-lg font-semibold text-stone-900 leading-tight">{value}</p>
        <p className="text-xs text-stone-500 font-medium tracking-wide uppercase">{label}</p>
      </div>
    </motion.div>
  )
}

// AI workflow demo — auto-playing stepped animation
const DEMO_STEPS = [
  { id: 'input', label: 'Case Filing' },
  { id: 'context', label: 'Case Details' },
  { id: 'analyze', label: 'AI Analysis' },
  { id: 'result', label: 'Prediction' },
]

function AIDemoAnimation() {
  const [step, setStep] = useState(0)
  const [typedComplainant, setTypedComplainant] = useState('')
  const [typedRespondent, setTypedRespondent] = useState('')

  const complainant = 'Maria Santos'
  const respondent = 'Juan Dela Cruz'

  // Auto-advance steps
  useEffect(() => {
    const durations = [3200, 2800, 2600, 3400]
    const timer = setTimeout(() => {
      setStep((s) => (s + 1) % DEMO_STEPS.length)
    }, durations[step])
    return () => clearTimeout(timer)
  }, [step])

  // Typing effect for step 0
  useEffect(() => {
    if (step === 0) {
      setTypedComplainant('')
      setTypedRespondent('')
      let ci = 0
      let ri = 0
      const typeComplainant = setInterval(() => {
        if (ci < complainant.length) {
          setTypedComplainant(complainant.slice(0, ci + 1))
          ci++
        } else {
          clearInterval(typeComplainant)
          // Start typing respondent after complainant finishes
          const typeRespondent = setInterval(() => {
            if (ri < respondent.length) {
              setTypedRespondent(respondent.slice(0, ri + 1))
              ri++
            } else {
              clearInterval(typeRespondent)
            }
          }, 55)
        }
      }, 55)
      return () => clearInterval(typeComplainant)
    }
  }, [step])

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="mt-24 md:mt-32"
    >
      {/* Section header */}
      <div className="text-center mb-10">
        <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#A60C0C] mb-3">
          How It Works
        </p>
        <h2
          className="text-3xl md:text-5xl text-stone-900"
          style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
        >
          AI-Powered <span className="italic text-stone-600">Case Prediction</span>
        </h2>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-1 md:gap-2 mb-8">
        {DEMO_STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 md:gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-500 ${
              i === step
                ? 'bg-[#A60C0C] text-white shadow-[0_2px_12px_rgba(166,12,12,0.3)]'
                : i < step
                ? 'bg-[#A60C0C]/10 text-[#A60C0C]'
                : 'bg-stone-100 text-stone-400'
            }`}>
              <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">
                {i < step ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < DEMO_STEPS.length - 1 && (
              <ArrowRight className={`w-3 h-3 transition-colors duration-500 ${
                i < step ? 'text-[#A60C0C]' : 'text-stone-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Demo card */}
      <div className="relative max-w-2xl mx-auto">
        {/* Glow */}
        <div className="absolute -inset-4 bg-gradient-to-br from-[#A60C0C]/[0.04] via-transparent to-[#A60C0C]/[0.02] rounded-[2rem] blur-xl" />

        <div className="relative bg-white border border-stone-200/80 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.06)] overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50/50">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#A60C0C]" />
              <span className="text-sm font-semibold text-stone-700">HearEase AI Engine</span>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-stone-200" />
              <div className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${
                step === 2 ? 'bg-amber-400 animate-pulse' : step === 3 ? 'bg-emerald-400' : 'bg-stone-200'
              }`} />
            </div>
          </div>

          {/* Card body — fixed height to prevent layout shift */}
          <div className="px-6 py-8 min-h-[280px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {/* STEP 0: Input names */}
              {step === 0 && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full space-y-5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-[#A60C0C]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Party Information</span>
                  </div>
                  {/* Complainant field */}
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1.5 block">Complainant</label>
                    <div className="relative">
                      <div className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 font-medium">
                        {typedComplainant}
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                          className="inline-block w-[2px] h-4 bg-[#A60C0C] ml-0.5 align-middle"
                        />
                      </div>
                    </div>
                  </div>
                  {/* Respondent field */}
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1.5 block">Respondent</label>
                    <div className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50/50 text-sm text-stone-800 font-medium">
                      {typedRespondent}
                      {typedComplainant.length === complainant.length && (
                        <motion.span
                          animate={{ opacity: [1, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity }}
                          className="inline-block w-[2px] h-4 bg-[#A60C0C] ml-0.5 align-middle"
                        />
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* STEP 1: Case context */}
              {step === 1 && (
                <motion.div
                  key="context"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full space-y-5"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-[#A60C0C]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">Case Details</span>
                  </div>
                  {/* Relationship */}
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1.5 block">Relationship</label>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="px-4 py-3 rounded-xl border border-[#A60C0C]/20 bg-[#A60C0C]/[0.03] text-sm font-medium text-stone-700"
                    >
                      Neighbors
                    </motion.div>
                  </div>
                  {/* Nature of complaint */}
                  <div>
                    <label className="text-xs font-medium text-stone-500 mb-1.5 block">Nature of Complaint</label>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="px-4 py-3 rounded-xl border border-[#A60C0C]/20 bg-[#A60C0C]/[0.03] text-sm font-medium text-stone-700"
                    >
                      Property Boundary Dispute
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: AI analyzing */}
              {step === 2 && (
                <motion.div
                  key="analyze"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center text-center py-4"
                >
                  {/* Pulsing brain icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        '0 0 0 0 rgba(166,12,12,0.1)',
                        '0 0 0 20px rgba(166,12,12,0)',
                        '0 0 0 0 rgba(166,12,12,0)',
                      ],
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#A60C0C] to-[#D4453A] flex items-center justify-center mb-5"
                  >
                    <BrainCircuit className="w-8 h-8 text-white" />
                  </motion.div>
                  <p className="text-sm font-semibold text-stone-700 mb-2">Analyzing Case Data</p>
                  <p className="text-xs text-stone-400 max-w-xs">
                    Deep Neural Network examining party relationship, complaint history, and historical resolution patterns...
                  </p>
                  {/* Animated progress dots */}
                  <div className="flex gap-1.5 mt-5">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        animate={{
                          scale: [1, 1.4, 1],
                          backgroundColor: ['#d6d3d1', '#A60C0C', '#d6d3d1'],
                        }}
                        transition={{
                          duration: 1.2,
                          repeat: Infinity,
                          delay: i * 0.2,
                          ease: 'easeInOut',
                        }}
                        className="w-2 h-2 rounded-full bg-stone-300"
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Results */}
              {step === 3 && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles className="w-4 h-4 text-[#A60C0C]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">AI Prediction Results</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Est. Hearings', value: '3', sub: 'sessions' },
                      { label: 'Resolution Time', value: '4', sub: 'weeks' },
                      { label: 'Target Date', value: 'Sep 8', sub: '2026' },
                    ].map((item, i) => (
                      <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="bg-gradient-to-br from-stone-50 to-white border border-stone-200/80 rounded-xl p-4 text-center"
                      >
                        <p className="text-2xl md:text-3xl font-bold text-[#A60C0C] leading-none mb-1"
                           style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
                        >
                          {item.value}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">{item.sub}</p>
                        <p className="text-xs text-stone-500 mt-1.5 font-medium">{item.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Confidence bar */}
                  <div className="mt-5 px-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-stone-500 font-medium">Model Confidence</span>
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-emerald-600 font-bold"
                      >
                        87%
                      </motion.span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: '87%' }}
                        transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="h-full rounded-full bg-gradient-to-r from-[#A60C0C] to-[#D4453A]"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function HomePage() {
  return (
    <section className="relative w-full overflow-hidden">
      {/* === Atmospheric Background === */}
      <div className="absolute inset-0 -z-10">
        {/* Warm gradient base */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8F5] via-[#FFF1EB] to-white" />

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #A60C0C 1px, transparent 1px),
              linear-gradient(to bottom, #A60C0C 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Large radial glow */}
        <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,_rgba(166,12,12,0.06)_0%,_transparent_70%)]" />

        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,_rgba(212,69,58,0.05)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_bottom_left,_rgba(166,12,12,0.04)_0%,_transparent_60%)]" />

        {/* Floating geometric shapes */}
        <FloatingShape
          className="absolute top-[15%] left-[8%] w-16 h-16 border-2 border-[#A60C0C]/10 rounded-xl"
          delay={0}
        />
        <FloatingShape
          className="absolute top-[10%] right-[12%] w-12 h-12 border-2 border-[#D4453A]/10 rounded-full"
          delay={3}
        />
        <FloatingShape
          className="absolute bottom-[30%] left-[5%] w-10 h-10 bg-[#A60C0C]/[0.04] rounded-lg"
          delay={6}
        />
        <FloatingShape
          className="absolute bottom-[20%] right-[8%] w-20 h-20 border border-[#A60C0C]/[0.06] rounded-2xl"
          delay={9}
        />
      </div>

      {/* === Main Content === */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-8 md:pt-16 pb-12">
        {/* Tagline badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 bg-[#A60C0C]/[0.07] border border-[#A60C0C]/15 rounded-full px-5 py-2">
            <Zap className="w-3.5 h-3.5 text-[#A60C0C]" fill="#A60C0C" />
            <span className="text-xs font-semibold tracking-[0.08em] uppercase text-[#A60C0C]">
              AI-Powered Barangay Hearings
            </span>
          </div>
        </motion.div>

        {/* Hero headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-6"
        >
          <h1
            className="text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight text-stone-900"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Making{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#A60C0C]">Hearings</span>
              {/* Underline accent */}
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute bottom-1 md:bottom-2 left-0 right-0 h-[6px] md:h-[8px] bg-[#A60C0C]/15 rounded-full origin-left"
              />
            </span>
            <br />
            <span className="italic text-stone-700">Easier</span>
            <motion.img
              src={Energy}
              alt=""
              aria-hidden="true"
              initial={{ opacity: 0, rotate: -20, scale: 0 }}
              animate={{ opacity: 1, rotate: 12, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.6, type: 'spring', bounce: 0.5 }}
              className="inline-block h-10 md:h-14 lg:h-16 ml-2 md:ml-4 -mt-2 md:-mt-4"
            />
          </h1>
        </motion.div>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="text-center text-base md:text-lg text-stone-500 max-w-xl mx-auto mb-10 leading-relaxed"
        >
          Streamline barangay case scheduling with AI that predicts resolution
          timelines — so communities spend less time waiting and more time
          resolving.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
        >
          <Link
            to="/Login"
            className="group relative inline-flex items-center gap-2 bg-[#A60C0C] hover:bg-[#8B0A0A] text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(166,12,12,0.3)] hover:shadow-[0_8px_30px_rgba(166,12,12,0.4)] hover:-translate-y-0.5"
          >
            Get Started
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Hero Image with floating stats */}
        <div className="relative max-w-4xl mx-[10%] md:mx-auto">
          {/* Floating stat cards — desktop only */}
          <div className="block">
            <div className="absolute -left-12 lg:-left-20 top-[15%] z-10">
              <StatPill icon={CalendarCheck} value="Auto-Scheduled" label="Hearing Dates" delay={0.7} />
            </div>
            <div className="absolute -right-8 lg:-right-16 top-[35%] z-10">
              <StatPill icon={Clock} value="AI Predicted" label="Resolution Time" delay={0.9} />
            </div>
            <div className="absolute -left-6 lg:-left-14 bottom-[20%] z-10">
              <StatPill icon={ShieldCheck} value="Digitized" label="Case Records" delay={1.1} />
            </div>
          </div>

          {/* Main hero image */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            {/* Glow behind image */}
            <div className="absolute inset-x-8 bottom-0 h-[60%] bg-gradient-to-t from-[#A60C0C]/[0.06] via-[#A60C0C]/[0.03] to-transparent rounded-3xl blur-2xl" />

            <img
              src={Hero_img}
              alt="HearEase dashboard showing barangay hearing management"
              className="relative w-full max-w-3xl mx-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>

        {/* === AI Demo Animation === */}
        <AIDemoAnimation />

        {/* === Features Section === */}
        <div id="features" className="mt-24 md:mt-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-14"
          >
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#A60C0C] mb-3">
              Why HearEase
            </p>
            <h2
              className="text-3xl md:text-5xl text-stone-900"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Built for the <span className="italic text-stone-600">Lupong Tagapamayapa</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: CalendarCheck,
                title: 'Smart Scheduling',
                desc: 'AI automatically suggests optimal hearing dates based on predicted case complexity and Lupon member availability.',
                accent: 'from-[#A60C0C] to-[#D4453A]',
              },
              {
                icon: Clock,
                title: 'Resolution Prediction',
                desc: 'Deep neural networks analyze historical data to forecast how long each case will take to resolve.',
                accent: 'from-[#8B4513] to-[#CD853F]',
              },
              {
                icon: ShieldCheck,
                title: 'Digital Case Files',
                desc: 'Complete digitization of complaints, summons, and certificates — secure, searchable, and always accessible.',
                accent: 'from-[#2F4F4F] to-[#5F8A8B]',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="group relative bg-white/70 backdrop-blur-sm border border-stone-200/60 rounded-2xl p-7 hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1"
              >
                {/* Subtle top border accent on hover */}
                <div className={`absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r ${feature.accent} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`} />

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.accent} flex items-center justify-center mb-5 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Band */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 md:mt-28 relative overflow-hidden rounded-3xl bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 p-10 md:p-14 text-center"
        >
          {/* Decorative grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(to right, white 1px, transparent 1px),
                linear-gradient(to bottom, white 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px',
            }}
          />
          {/* Red glow accent */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle_at_top_right,_rgba(166,12,12,0.15)_0%,_transparent_60%)]" />

          <div className="relative z-10">
            <h2
              className="text-3xl md:text-4xl text-white mb-4"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Ready to modernize your <span className="italic text-red-300">barangay hearings</span>?
            </h2>
            <p className="text-stone-400 text-sm md:text-base max-w-lg mx-auto mb-8">
              Join Barangay Tetuan in bringing AI-powered scheduling and case management to your community.
            </p>
            <Link
              to="/Login"
              className="group inline-flex items-center gap-2 bg-[#A60C0C] hover:bg-[#C41515] text-white font-semibold text-sm px-8 py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(166,12,12,0.4)] hover:shadow-[0_8px_35px_rgba(166,12,12,0.5)] hover:-translate-y-0.5"
            >
              Start Now
              <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>

        {/* Footer tagline */}
        <div className="mt-16 mb-8 text-center">
          <p className="text-xs text-stone-400 tracking-wide">
            A project by students of Western Mindanao State University · Barangay Tetuan, Zamboanga City
          </p>
        </div>
      </div>
    </section>
  )
}