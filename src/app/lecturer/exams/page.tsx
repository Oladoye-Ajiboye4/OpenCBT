"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { FileText, PlusCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const examSchema = z.object({
  title: z.string().min(3, "Title required"),
  courseId: z.string().min(1, "Select Assigned Course"),
  duration: z.string().min(1, "Specify minutes"),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function LecturerExams() {
  const container = useRef<HTMLDivElement>(null);
  const [exams, setExams] = useState([
    { id: "1", title: "Midterm Assessment", course: "CSC301", duration: "120 Mins", status: "Upcoming" }
  ]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema)
  });

  useGSAP(() => {
    gsap.from(".anim-item", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
  }, { scope: container });

  const onSubmit = async (data: ExamFormValues) => {
    await new Promise(r => setTimeout(r, 1000));
    setExams(prev => [...prev, { id: Date.now().toString(), title: data.title, course: data.courseId, duration: `${data.duration} Mins`, status: "Pending" }]);
    reset();
  };

  return (
    <div ref={container} className="max-w-7xl mx-auto space-y-8 font-sans">
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
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Examination Title</label>
              <input {...register("title")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" placeholder="Midterm Assessment" />
              {errors.title && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Target Course</label>
              <select {...register("courseId")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium bg-white appearance-none">
                 <option value="">Select Course...</option>
                 <option value="CSC301">CSC301</option>
                 <option value="CSC305">CSC305</option>
              </select>
              {errors.courseId && <p className="text-red-500 text-xs mt-1 font-bold">{errors.courseId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Duration (Minutes)</label>
              <input type="number" {...register("duration")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" placeholder="120" />
              {errors.duration && <p className="text-red-500 text-xs mt-1 font-bold">{errors.duration.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition h-14 active:scale-[0.98]">
              {isSubmitting ? "Deploying..." : "Initialize Session"}
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-[#E4D4CC] overflow-hidden anim-item">
          <div className="p-6 border-b border-[#E4D4CC] bg-[#F4EFEA]/30">
            <h3 className="text-xl font-bold text-[#4A3131]">Scheduled Examinations</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#5D6065]">
              <thead className="bg-[#F4EFEA] text-xs uppercase font-bold text-[#4A3131]">
                <tr>
                  <th className="px-6 py-4">Linked Course</th>
                  <th className="px-6 py-4">Exam Title</th>
                  <th className="px-6 py-4">Duration Constraints</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4D4CC]">
                {exams.map(e => (
                  <tr key={e.id} className="hover:bg-[#F4EFEA]/20 transition">
                    <td className="px-6 py-4 font-mono font-bold tracking-wide text-[#4A3131]">{e.course}</td>
                    <td className="px-6 py-4 font-bold">{e.title}</td>
                    <td className="px-6 py-4 font-medium">{e.duration}</td>
                    <td className="px-6 py-4 text-right">
                       <span className="px-2.5 py-1 bg-[#E4D4CC]/50 text-[#4A3131] rounded-lg font-bold text-xs uppercase tracking-wide">{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
