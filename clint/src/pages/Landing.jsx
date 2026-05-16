import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  MapPinned,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  Stars,
  TrendingUp,
  Users2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const features = [
  {
    icon: MapPinned,
    title: "Location-aware reporting",
    copy: "Capture the exact site, attach evidence, and route issues to the right jurisdiction automatically.",
  },
  {
    icon: BellRing,
    title: "Live complaint updates",
    copy: "Keep citizens informed with status transitions, department assignments, and resolution milestones.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based governance",
    copy: "Citizen, officer, and admin views stay cleanly separated with policy-aware access controls.",
  },
  {
    icon: BarChart3,
    title: "Operational analytics",
    copy: "Track trends, SLA pressure, departmental load, and resolution performance from one console.",
  },
];

const steps = [
  { title: "Report", copy: "Submit an issue with image evidence and structured location data." },
  { title: "Route", copy: "The platform assigns the right department, officer, or admin lane." },
  { title: "Resolve", copy: "Citizens receive progress updates, closure confirmation, and rewards." },
];

const testimonials = [
  {
    quote: "It feels like a modern enterprise console, not a civic portal stuck in the past.",
    name: "Aarav Mehta",
    role: "Citizen Reporter",
  },
  {
    quote: "The workflow clarity is excellent. The complaint queue reads like an ops dashboard.",
    name: "Priya Nair",
    role: "District Admin",
  },
  {
    quote: "The interface makes accountability visible without adding noise or clutter.",
    name: "Rohan Das",
    role: "Department Officer",
  },
];

export default function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_25%),radial-gradient(circle_at_80%_15%,rgba(59,130,246,0.18),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(15,118,110,0.12),transparent_22%)]" />

      <Motion.header
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Building2 size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-cyan-300/80">CityHelp</p>
              <p className="text-sm text-slate-300">Premium civic-tech operations</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-slate-300 md:flex">
            <a href="#features" className="transition hover:text-white">Features</a>
            <a href="#workflow" className="transition hover:text-white">Workflow</a>
            <a href="#screens" className="transition hover:text-white">Screens</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
              Login
            </Link>
            <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:translate-y-[-1px]">
              Get Started <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Motion.header>

      <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-10 sm:px-6 lg:px-8">
        <section className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Motion.div initial="hidden" animate="visible" variants={stagger} className="space-y-8">
            <Motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              <Sparkles size={14} /> Government-grade SaaS for modern cities
            </Motion.div>

            <Motion.div variants={fadeUp} className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
                A premium civic-tech platform for complaint resolution and city accountability.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                CityHelp gives citizens a polished way to report issues, track progress, and stay engaged while giving administrators a clean, enterprise-grade command center.
              </p>
            </Motion.div>

            <Motion.div variants={fadeUp} className="flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:translate-y-[-1px]">
                Launch the platform <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                View dashboard
              </Link>
            </Motion.div>

            <Motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-3">
              {[
                ["98%", "complaint traceability"],
                ["24/7", "real-time tracking"],
                ["Role-aware", "governance + access"],
              ].map(([value, label]) => (
                <div key={label} className="surface-soft p-4">
                  <p className="text-2xl font-semibold text-white">{value}</p>
                  <p className="mt-1 text-sm text-slate-400">{label}</p>
                </div>
              ))}
            </Motion.div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="surface relative overflow-hidden p-4 sm:p-5"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.16),transparent_30%)]" />
            <div className="relative space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="surface-soft p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Live service level</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-semibold text-white">94.2%</p>
                      <p className="mt-1 text-sm text-slate-400">resolved this month</p>
                    </div>
                    <TrendingUp className="text-cyan-300" size={22} />
                  </div>
                </div>

                <div className="surface-soft p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Citizen satisfaction</p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-semibold text-white">4.8/5</p>
                      <p className="mt-1 text-sm text-slate-400">feedback score</p>
                    </div>
                    <Stars className="text-amber-300" size={22} />
                  </div>
                </div>
              </div>

              <div className="surface-soft p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">Complaint resolution pipeline</p>
                    <p className="text-xs text-slate-400">Submitted to closure in a clean, auditable workflow</p>
                  </div>
                  <ClipboardCheck className="text-cyan-300" size={18} />
                </div>
                <div className="mt-4 space-y-3">
                  {[
                    ["SUBMITTED", 100],
                    ["VERIFIED", 82],
                    ["ASSIGNED", 64],
                    ["IN_PROGRESS", 44],
                  ].map(([label, width]) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
                        <span>{label}</span>
                        <span>{width}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/8">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="surface-soft p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Notifications</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-300">
                    <div className="flex items-start gap-3"><BellRing size={16} className="mt-0.5 text-cyan-300" /><span>New complaint routed to Public Works.</span></div>
                    <div className="flex items-start gap-3"><CheckCircle2 size={16} className="mt-0.5 text-emerald-300" /><span>Streetlight complaint marked resolved.</span></div>
                  </div>
                </div>
                <div className="surface-soft p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Participation</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200"><Users2 size={18} /></div>
                    <div>
                      <p className="text-lg font-semibold text-white">47k citizens</p>
                      <p className="text-sm text-slate-400">using CityHelp to report issues</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Motion.div>
        </section>

        <section id="features" className="mt-24 space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">Platform features</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">Every surface is designed to feel calm, fast, and trustworthy.</h2>
          </div>
          <Motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Motion.div key={feature.title} variants={fadeUp} className="surface-soft p-5 transition hover:-translate-y-0.5 hover:border-white/20">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{feature.copy}</p>
                </Motion.div>
              );
            })}
          </Motion.div>
        </section>

        <section id="workflow" className="mt-24 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="surface p-6 sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">How it works</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">A complaint workflow that stays legible from first report to final closure.</h2>
            <div className="mt-8 space-y-4">
              {steps.map((step, index) => (
                <div key={step.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-sm font-bold text-cyan-200">0{index + 1}</div>
                  <div>
                    <p className="font-semibold text-white">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-300">{step.copy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Analytics", "View complaint trends, department load, and resolution momentum at a glance."],
              ["Notifications", "Push status changes and feedback requests through a clean, unified channel."],
              ["Rewards", "Encourage community participation with points and achievement milestones."],
              ["Administration", "Manage departments, users, and queues without leaving the console."],
            ].map(([title, copy]) => (
              <div key={title} className="surface-soft p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-white/6 text-cyan-200">
                  <CheckCircle2 size={18} />
                </div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="screens" className="mt-24 space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">App screenshots</p>
            <h2 className="text-3xl font-semibold text-white sm:text-4xl">A product surface that feels like a funded startup dashboard.</h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="surface p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">Citizen dashboard</p>
                  <p className="text-xs text-slate-400">Timeline, status, rewards, and live updates in one place</p>
                </div>
                <Clock3 className="text-cyan-300" size={18} />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  ["Resolved", "84"],
                  ["Active", "12"],
                  ["Rewards", "1,420"],
                ].map(([label, value]) => (
                  <div key={label} className="surface-soft p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{label}</p>
                    <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 surface-soft p-4">
                <div className="h-2 rounded-full bg-white/8">
                  <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-300">Open complaints</p><p className="text-2xl font-semibold text-white">18</p></div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-300">SLA compliance</p><p className="text-2xl font-semibold text-white">96%</p></div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="surface p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-cyan-400/10 p-3 text-cyan-200"><MessagesSquare size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-white">Smart notifications</p>
                    <p className="text-xs text-slate-400">Quiet, structured, and easy to scan</p>
                  </div>
                </div>
              </div>
              <div className="surface p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-200"><ClipboardCheck size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-white">Admin action center</p>
                    <p className="text-xs text-slate-400">Moderation, assignment, and department workflows</p>
                  </div>
                </div>
              </div>
              <div className="surface p-5">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-200"><Stars size={18} /></div>
                  <div>
                    <p className="text-sm font-semibold text-white">Reward engine</p>
                    <p className="text-xs text-slate-400">Community participation becomes visible and motivating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-24 grid gap-4 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="surface-soft p-6">
              <div className="mb-4 flex items-center gap-2 text-amber-300">
                {Array.from({ length: 5 }).map((_, index) => <span key={index}>★</span>)}
              </div>
              <p className="text-sm leading-7 text-slate-200">{item.quote}</p>
              <div className="mt-5">
                <p className="font-semibold text-white">{item.name}</p>
                <p className="text-sm text-slate-400">{item.role}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mt-24 surface overflow-hidden p-8 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-300/80">Ready to launch</p>
              <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Make city operations feel modern, accountable, and fast.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                CityHelp is built to showcase strong UX, serious data hierarchy, and a platform-grade experience that can stand next to modern SaaS products.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:translate-y-[-1px]">
                Start reporting <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Access dashboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} CityHelp. Built for modern civic operations.</p>
          <p>Trustworthy. Minimal. Enterprise-ready.</p>
        </div>
      </footer>
    </div>
  );
}
