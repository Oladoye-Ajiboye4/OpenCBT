"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { PlusCircle, Calendar, Clock, PlayCircle, CheckCircle2 } from "lucide-react";
import { createExam, updateExamStatus } from "@/actions/exam";
import toast from "react-hot-toast";

type Course = { id: string; code: string; title: string; };
type Exam = { id: string; title: string; duration: number; scheduledDate: Date; status: string; course: { code: string; } };

export function ExamsClient({ courses, initialExams }: { courses: Course[], initialExams: Exam[] }) {
  const container = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useGSAP(() => {
    gsap.from(".anim-item", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
  }, { scope: container });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await createExam(fd);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Exam deployed successfully");
        e.currentTarget.reset();
      }
    } catch {
      toast.error("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const setStatus = async (id: string, status: string) => {
    toast.loading(`Updating status to ${status}...`, { id: "status" });
    const res = await updateExamStatus(id, status);
    if (res?.error) toast.error(res.error, { id: "status" });
    else toast.success(`Exam Marked as ${status}`, { id: "status" });
  };

  return (
    <div ref={container} className="max-w-7xl mx-auto space-y-8 font-sans pb-20">
      <div className="flex justify-between items-end anim-item">
        <div>
          <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">Examination Hub</h1>
          <p className="text-[#5D6065] text-lg mt-2 font-medium">Create and distribute zero-trust examination sessions securely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] anim-item h-max">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F4EFEA] rounded-lg flex items-center justify-center border border-[#E4D4CC]">
              <PlusCircle className="w-5 h-5 text-[#4A3131]" />
            </div>
            <h2 className="text-xl font-bold text-[#4A3131]">Deploy Exam</h2>
          </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Examination Title</label>
              <input name="title" required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" placeholder="Midterm Assessment" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Target Course</label>
              <select name="courseId" required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium bg-white appearance-none">
                 <option value="">Select Course...</option>
                 {courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Duration (Minutes)</label>
              <input type="number" name="duration" required min="1" className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" placeholder="120" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Scheduled Date & Time</label>
              <input type="datetime-local" name="scheduledDate" required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium bg-white" />
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition h-14 active:scale-[0.98] disabled:opacity-70">
              {isSubmitting ? "Deploying..." : "Initialize Session"}
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-[#E4D4CC] overflow-hidden anim-item">
          <div className="p-6 border-b border-[#E4D4CC] bg-[#F4EFEA]/30">
            <h3 className="text-xl font-bold text-[#4A3131]">Scheduled Examinations</h3>
          </div>
          <div className="overflow-x-auto">
            {initialExams.length === 0 ? (
               <p className="text-[#5D6065] text-center p-8 font-medium">No exams deployed yet.</p>
            ) : (
                <table className="w-full text-left text-sm text-[#5D6065]">
                  <thead className="bg-[#F4EFEA] text-xs uppercase font-bold text-[#4A3131]">
                    <tr>
                      <th className="px-6 py-4">Linked Course</th>
                      <th className="px-6 py-4">Exam Title</th>
                      <th className="px-6 py-4">Schedule & Duration</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E4D4CC]">
                    {initialExams.map(e => (
                      <tr key={e.id} className="hover:bg-[#F4EFEA]/20 transition group">
                        <td className="px-6 py-4 font-mono font-bold tracking-wide text-[#4A3131]">{e.course.code}</td>
                        <td className="px-6 py-4 font-bold text-[#4A3131]">{e.title}</td>
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-[#5D6065] mb-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(e.scheduledDate).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-[#5D6065]">
                                <Clock className="w-3.5 h-3.5" />
                                {e.duration} Mins
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                           <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider ${e.status === 'UPCOMING' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : e.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border border-green-200 shadow-sm animate-pulse' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>{e.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           {e.status === 'UPCOMING' && (
                               <button onClick={() => setStatus(e.id, 'ACTIVE')} className="text-green-600 hover:text-green-700 p-2 rounded-lg hover:bg-green-50 transition" title="Launch Exam">
                                   <PlayCircle className="w-5 h-5" />
                               </button>
                           )}
                           {e.status === 'ACTIVE' && (
                               <button onClick={() => setStatus(e.id, 'COMPLETED')} className="text-[#4A3131] hover:text-[#5a3f3f] p-2 rounded-lg hover:bg-[#E4D4CC]/40 transition" title="Complete Exam">
                                   <CheckCircle2 className="w-5 h-5" />
                               </button>
                           )}
                           {e.status === 'COMPLETED' && (
                               <span className="text-xs font-medium text-[#5D6065] italic mr-2">Locked</span>
                           )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
