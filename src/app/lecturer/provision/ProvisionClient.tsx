"use client";

import { useState, useRef } from "react";
import { provisionExamRoster } from "./actions";
import {
  Zap,
  CalendarCheck,
  Building2,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import toast from "react-hot-toast";

type Department = { id: string; name: string };
type Course = {
  id: string;
  code: string;
  title: string;
  level: string;
  department: Department;
};
type Exam = {
  id: string;
  title: string;
  scheduledDate: string | Date;
  status: string;
  course: Course;
};

export function ProvisionClient({ exams }: { exams: Exam[] }) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const selectedExam = exams.find((e) => e.id === selectedExamId) ?? null;

  useGSAP(
    () => {
      gsap.from(".anim-item", {
        y: 24,
        opacity: 0,
        duration: 0.55,
        stagger: 0.1,
        ease: "power3.out",
      });
    },
    { scope: container }
  );

  // Animate in the info card when exam changes
  useGSAP(
    () => {
      if (selectedExam) {
        gsap.fromTo(
          ".info-card",
          { y: 12, opacity: 0, scale: 0.98 },
          { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
        );
      }
    },
    { scope: container, dependencies: [selectedExamId] }
  );

  const handleSync = async () => {
    if (!selectedExamId) {
      toast.error("Please select an upcoming exam first.");
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading("Generating secure tokens...");
    try {
      const result = await provisionExamRoster(selectedExamId);
      if (result.error) {
        toast.error(result.error, { id: toastId });
      } else {
        toast.success(
          `Successfully provisioned ${result.count} student${result.count !== 1 ? "s" : ""} and dispatched emails.`,
          { id: toastId, duration: 6000 }
        );
        setSelectedExamId("");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | Date) =>
    new Date(dateStr).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const levelLabel = (level: string) => {
    const map: Record<string, string> = {
      "100": "100 Level",
      "200": "200 Level",
      "300": "300 Level",
      "400": "400 Level",
      "500": "500 Level",
      "600": "600 Level",
    };
    return map[level] ?? `${level} Level`;
  };

  return (
    <div ref={container} className="p-8 max-w-3xl mx-auto font-sans pb-24">
      {/* Page Header */}
      <div className="anim-item mb-10">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-4">
          <Zap className="w-3.5 h-3.5" />
          Smart Sync
        </div>
        <h1 className="text-4xl font-black text-primary tracking-tight leading-tight">
          Roster Provisioning
        </h1>
        <p className="text-secondary text-lg mt-2 font-medium">
          Automatically enroll students from the Global Registry and dispatch
          secure exam credentials.
        </p>
      </div>

      {/* Step 1: Exam Dropdown */}
      <div className="anim-item bg-white rounded-3xl border border-accent shadow-sm p-8 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <CalendarCheck className="w-4.5 h-4.5 text-white w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-secondary uppercase tracking-widest">
              Step 1
            </p>
            <h2 className="text-lg font-black text-primary leading-tight">
              Select Upcoming Exam
            </h2>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">
              You have no upcoming exams scheduled. Create an exam first in the
              Exams module.
            </p>
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedExamId}
              onChange={(e) => setSelectedExamId(e.target.value)}
              disabled={isSubmitting}
              className="w-full appearance-none p-4 pr-12 border-2 border-accent rounded-2xl focus:border-primary focus:outline-none transition text-primary font-semibold bg-accent hover:border-primary/40 cursor-pointer disabled:opacity-60"
            >
              <option value="">— Choose an upcoming exam —</option>
              {exams.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title} · {exam.course.code} ·{" "}
                  {formatDate(exam.scheduledDate)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
          </div>
        )}
      </div>

      {/* Step 2: Dynamic Info Card */}
      {selectedExam && (
        <div className="info-card anim-item mb-6">
          <div className="bg-gradient-to-br from-primary to-primary/85 rounded-3xl p-px shadow-lg">
            <div className="bg-gradient-to-br from-primary to-primary/85 rounded-3xl p-7">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-4">
                Target Demographic
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2.5 mb-3">
                    <GraduationCap className="w-4 h-4 text-white/60" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                      Level
                    </span>
                  </div>
                  <p className="text-2xl font-black text-white">
                    {levelLabel(selectedExam.course.level)}
                  </p>
                </div>
                <div className="bg-white/10 rounded-2xl p-5 backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Building2 className="w-4 h-4 text-white/60" />
                    <span className="text-xs font-bold uppercase tracking-widest text-white/60">
                      Department
                    </span>
                  </div>
                  <p className="text-lg font-black text-white leading-tight">
                    {selectedExam.course.department.name}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-white/60">
                <span className="font-semibold">
                  Course: {selectedExam.course.code} —{" "}
                  {selectedExam.course.title}
                </span>
                <span className="font-semibold">
                  📅 {formatDate(selectedExam.scheduledDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Sync Button */}
      <div className="anim-item">
        <button
          onClick={handleSync}
          disabled={isSubmitting || !selectedExamId || exams.length === 0}
          className={`
            w-full relative h-16 rounded-2xl font-black text-lg tracking-tight text-white
            transition-all duration-200 shadow-lg
            flex items-center justify-center gap-3
            ${isSubmitting
              ? "bg-primary/70 cursor-wait"
              : selectedExamId
                ? "bg-primary hover:bg-primary/90 active:scale-[0.99] hover:shadow-xl cursor-pointer"
                : "bg-primary/40 cursor-not-allowed"
            }
          `}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin w-5 h-5 text-white/80"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeOpacity="0.3"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Generating Secure Tokens...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Sync Roster &amp; Dispatch Credentials
            </>
          )}
        </button>
        <p className="text-center text-xs text-secondary font-medium mt-3">
          This will match all students in the Global Registry by department &
          level, generate unique exam PINs, and email every student
          automatically.
        </p>
      </div>

      {/* Visual success callout guide */}
      {!selectedExamId && exams.length > 0 && (
        <div className="anim-item mt-8 border border-dashed border-accent rounded-2xl p-6 flex items-start gap-4 text-secondary">
          <CheckCircle2 className="w-5 h-5 text-primary/40 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-primary text-sm mb-1">
              How Smart Sync works
            </p>
            <ol className="text-sm space-y-1 list-decimal list-inside">
              <li>Select an upcoming exam from the dropdown above.</li>
              <li>
                Review the Target Demographic card to confirm the right cohort.
              </li>
              <li>
                Hit <span className="font-bold text-primary">Sync Roster</span> — every matching student gets a unique 6-character PIN emailed to them instantly.
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
