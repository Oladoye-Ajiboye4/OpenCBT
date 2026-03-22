"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import {
  ShieldCheck,
  Users,
  WifiOff,
  CheckCircle2,
  Radar,
  GraduationCap,
  Clock3,
  Mail,
  Cpu,
  BarChart3,
  Lock,
  ArrowRight,
} from "lucide-react";

gsap.registerPlugin(useGSAP);

export default function HomePage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".hero-anim", {
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.2,
    });

    gsap.from(".feature-card", {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
      stagger: 0.2,
      delay: 0.6,
    });

    gsap.from(".section-anim", {
      y: 28,
      opacity: 0,
      duration: 0.7,
      ease: "power3.out",
      stagger: 0.12,
      delay: 0.9,
    });
  }, { scope: container });

  return (
    <div ref={container} className="min-h-screen bg-accent font-sans overflow-hidden">
      <nav className="absolute top-0 w-full p-6 md:p-8 flex justify-between items-center z-50">
        <div className="text-2xl font-black text-primary tracking-tighter">OpenCBT</div>
        <div className="flex gap-3 md:gap-4 items-center">
          <Link href="/sign-in" className="px-3 md:px-5 py-2.5 font-bold text-secondary hover:text-primary transition">Log In</Link>
          <Link href="/sign-up" className="px-4 md:px-5 py-2.5 font-bold bg-primary text-white rounded-xl shadow-md hover:bg-primary/85 transition">Get Started</Link>
        </div>
      </nav>

      <section className="relative pt-40 pb-20 px-6 flex flex-col items-center justify-center text-center min-h-[70vh]">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-200 h-200 bg-accent rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          <span className="hero-anim px-4 py-1.5 mb-6 text-sm font-bold bg-accent/50 text-primary border border-accent rounded-full uppercase tracking-wider">
            Now in Early Access
          </span>
          <h1 className="hero-anim text-5xl md:text-7xl font-black text-primary tracking-tight leading-[1.1] mb-6">
            Academic Integrity for the Distance Learning Era.
          </h1>
          <p className="hero-anim text-xl md:text-2xl text-secondary font-medium max-w-2xl mb-12">
            A secure, multi-tenant CBT platform for institutions that need trusted exams, automated provisioning, and AI-powered proctoring at scale.
          </p>

          <div className="hero-anim flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/sign-up" className="px-8 py-4 bg-primary text-white text-lg font-bold rounded-xl shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl hover:bg-primary/85 transition-all duration-300">
              Start Free Trial
            </Link>
            <Link href="/sign-in" className="px-8 py-4 bg-transparent border-2 border-accent text-primary text-lg font-bold rounded-xl hover:bg-accent/30 hover:border-primary/30 transition-all duration-300">
              Sign In to Dashboard
            </Link>
          </div>

          <div className="hero-anim mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
            <div className="bg-white/70 border border-accent rounded-xl px-4 py-3 text-left">
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">Security</p>
              <p className="font-black text-primary">Zero-Trust Runtime</p>
            </div>
            <div className="bg-white/70 border border-accent rounded-xl px-4 py-3 text-left">
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">Proctoring</p>
              <p className="font-black text-primary">ML Face + Lighting Checks</p>
            </div>
            <div className="bg-white/70 border border-accent rounded-xl px-4 py-3 text-left">
              <p className="text-xs font-bold text-secondary uppercase tracking-wider">Results</p>
              <p className="font-black text-primary">Tiered Publication Workflow</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-anim relative z-10 max-w-7xl mx-auto px-6 pb-14">
        <div className="bg-white border border-accent rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs font-bold text-secondary/80 uppercase tracking-widest">Institutions</p>
            <p className="text-3xl font-black text-primary mt-2">35+</p>
          </div>
          <div>
            <p className="text-xs font-bold text-secondary/80 uppercase tracking-widest">Students Proctored</p>
            <p className="text-3xl font-black text-primary mt-2">120K+</p>
          </div>
          <div>
            <p className="text-xs font-bold text-secondary/80 uppercase tracking-widest">Auto-Grade Speed</p>
            <p className="text-3xl font-black text-primary mt-2">&lt; 2s</p>
          </div>
          <div>
            <p className="text-xs font-bold text-secondary/80 uppercase tracking-widest">Exam Uptime</p>
            <p className="text-3xl font-black text-primary mt-2">99.9%</p>
          </div>
        </div>
      </section>

      <section className="section-anim relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="bg-white border border-accent rounded-3xl p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary/80">How It Works</p>
            <h2 className="mt-3 text-3xl font-black text-primary">From setup to verified publication</h2>
            <div className="mt-6 space-y-5">
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-black">1</div>
                <div>
                  <p className="font-black text-primary">Provision Exam Roster</p>
                  <p className="text-secondary font-medium">Sync enrolled students and dispatch unique access pins via email.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-black">2</div>
                <div>
                  <p className="font-black text-primary">Conduct Secure Session</p>
                  <p className="text-secondary font-medium">Track behavior anomalies, heartbeat, and evidence snapshots in real time.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-black">3</div>
                <div>
                  <p className="font-black text-primary">Auto-Grade and Verify</p>
                  <p className="text-secondary font-medium">Results move through lecturer approval before admin publication and email dispatch.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent/35 border border-accent rounded-3xl p-8">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary/80">Platform Modules</p>
            <h3 className="mt-3 text-2xl font-black text-primary">Everything you need in one control plane</h3>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-accent p-4">
                <Cpu className="w-5 h-5 text-primary" />
                <p className="mt-2 font-bold text-primary">ML Vision</p>
                <p className="text-sm text-secondary">Face and lighting anomaly checks.</p>
              </div>
              <div className="bg-white rounded-2xl border border-accent p-4">
                <Radar className="w-5 h-5 text-primary" />
                <p className="mt-2 font-bold text-primary">Live Monitor</p>
                <p className="text-sm text-secondary">Waiting, active, and flagged streams.</p>
              </div>
              <div className="bg-white rounded-2xl border border-accent p-4">
                <Mail className="w-5 h-5 text-primary" />
                <p className="mt-2 font-bold text-primary">Email Dispatch</p>
                <p className="text-sm text-secondary">OTP, credentials, and result notices.</p>
              </div>
              <div className="bg-white rounded-2xl border border-accent p-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <p className="mt-2 font-bold text-primary">Result Workflow</p>
                <p className="text-sm text-secondary">Lecturer review and admin publication.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="feature-card bg-accent/40 border border-accent p-10 rounded-3xl hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-3">Granular Course Delegation</h3>
            <p className="text-secondary text-lg leading-relaxed font-medium">
              Super Admins can invite Lecturers via email, granting strictly scoped access to specific courses instantly. Avoid monolithic permissions.
            </p>
          </div>

          <div className="feature-card bg-accent/40 border border-accent p-10 rounded-3xl hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-3">Real-Time AI Proctoring</h3>
            <p className="text-secondary text-lg leading-relaxed font-medium">
              Continuously monitor students using face-loss and tab-switch heuristics. Every infraction is securely logged immediately to the automated dashboard.
            </p>
          </div>

          <div className="feature-card bg-accent/40 border border-accent p-10 rounded-3xl hover:shadow-lg transition-shadow duration-300">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <WifiOff className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-primary mb-3">Offline-Resilient Exam Portal</h3>
            <p className="text-secondary text-lg leading-relaxed font-medium">
              Students experience a highly optimized examination environment that caches critical state to survive brief dropouts in network connectivity gracefully.
            </p>
          </div>
        </div>
      </section>

      <section className="section-anim relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-white border border-accent rounded-3xl p-8 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary/80">Why Institutions Choose OpenCBT</p>
            <h3 className="mt-3 text-3xl font-black text-primary">Built for high-stakes assessment operations</h3>
            <div className="mt-6 space-y-3">
              <p className="flex items-center gap-3 text-primary font-bold"><CheckCircle2 className="w-5 h-5" /> Zero-trust student session lifecycle</p>
              <p className="flex items-center gap-3 text-primary font-bold"><Clock3 className="w-5 h-5" /> Auto-save and timed cloud sync</p>
              <p className="flex items-center gap-3 text-primary font-bold"><Lock className="w-5 h-5" /> Server-side grading and publication control</p>
              <p className="flex items-center gap-3 text-primary font-bold"><GraduationCap className="w-5 h-5" /> Lecturer and admin role separation</p>
            </div>
          </div>

          <div className="bg-accent border border-accent rounded-2xl p-6">
            <p className="text-sm font-bold text-secondary uppercase tracking-widest">Operator Testimonial</p>
            <p className="mt-4 text-xl leading-relaxed font-bold text-primary">
              "We moved from fragmented invigilation to one verified workflow. OpenCBT reduced malpractice disputes and shortened publication cycles from days to minutes."
            </p>
            <p className="mt-6 text-sm text-secondary font-semibold">Assessment Office, Faculty Operations</p>
          </div>
        </div>
      </section>

      <section className="section-anim relative z-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-primary text-white rounded-3xl p-8 md:p-12 text-center">
          <p className="text-xs uppercase tracking-[0.2em] font-bold text-accent">Ready To Deploy</p>
          <h3 className="mt-3 text-4xl md:text-5xl font-black">Launch secure institution-wide exams</h3>
          <p className="mt-4 max-w-2xl mx-auto text-white/90 font-medium">
            Start with one faculty, scale across departments, and keep every exam session traceable from access pin to final publication.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-primary font-black hover:bg-accent transition">
              Create Institution Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/sign-in" className="px-8 py-4 rounded-xl border border-accent text-white font-bold hover:bg-primary/85 transition">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="section-anim border-t border-accent bg-white/60">
        <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-2xl font-black text-primary tracking-tight">OpenCBT</p>
            <p className="mt-2 text-sm font-medium text-secondary">Enterprise Examination and AI Proctoring Platform</p>
          </div>
          <div>
            <p className="text-sm font-black text-primary uppercase tracking-widest">Platform</p>
            <ul className="mt-3 space-y-2 text-sm text-secondary font-semibold">
              <li><Link href="/sign-up" className="hover:text-primary">Institution Onboarding</Link></li>
              <li><Link href="/sign-in" className="hover:text-primary">Portal Login</Link></li>
              <li><Link href="/portal" className="hover:text-primary">Student Access</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-black text-primary uppercase tracking-widest">Security</p>
            <ul className="mt-3 space-y-2 text-sm text-secondary font-semibold">
              <li>Session Telemetry</li>
              <li>Snapshot Evidence Logs</li>
              <li>Role-Based Publication Workflow</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
