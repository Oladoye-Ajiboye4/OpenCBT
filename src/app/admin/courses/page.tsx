"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { BookOpen, PlusCircle } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const courseSchema = z.object({
  code: z.string().min(3, "Course code required (e.g. CSC301)"),
  title: z.string().min(3, "Title required"),
  lecturerId: z.string().min(1, "Assign a Lecturer"),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function ManageCourses() {
  const container = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState([
    { id: "1", code: "CSC301", title: "Data Structures", lecturer: "Dr. Alan Turing" }
  ]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema)
  });

  useGSAP(() => {
    gsap.from(".anim-item", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
  }, { scope: container });

  const onSubmit = async (data: CourseFormValues) => {
    await new Promise(r => setTimeout(r, 1000));
    setCourses(prev => [...prev, { id: Date.now().toString(), code: data.code, title: data.title, lecturer: data.lecturerId }]);
    reset();
  };

  return (
    <div ref={container} className="max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-end anim-item">
        <div>
          <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">Manage Courses</h1>
          <p className="text-[#5D6065] text-lg mt-2 font-medium">Create enterprise courses and assign designated faculty natively.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] anim-item h-max">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F4EFEA] rounded-lg flex items-center justify-center border border-[#E4D4CC]">
              <PlusCircle className="w-5 h-5 text-[#4A3131]" />
            </div>
            <h2 className="text-xl font-bold text-[#4A3131]">Deploy Course</h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Course Code</label>
              <input {...register("code")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-mono font-bold uppercase tracking-wider" placeholder="CSC301" />
              {errors.code && <p className="text-red-500 text-xs mt-1 font-bold">{errors.code.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Course Title</label>
              <input {...register("title")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" placeholder="Data Structures" />
              {errors.title && <p className="text-red-500 text-xs mt-1 font-bold">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Assign Lecturer</label>
              <select {...register("lecturerId")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium bg-white appearance-none">
                 <option value="">Select Faculty...</option>
                 <option value="Dr. Alan Turing">Dr. Alan Turing</option>
                 <option value="Dr. Grace Hopper">Dr. Grace Hopper</option>
              </select>
              {errors.lecturerId && <p className="text-red-500 text-xs mt-1 font-bold">{errors.lecturerId.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition h-14">
              {isSubmitting ? "Deploying..." : "Publish Course"}
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-[#E4D4CC] overflow-hidden anim-item">
          <div className="p-6 border-b border-[#E4D4CC] bg-[#F4EFEA]/30">
            <h3 className="text-xl font-bold text-[#4A3131]">Active Deployments</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#5D6065]">
              <thead className="bg-[#F4EFEA] text-xs uppercase font-bold text-[#4A3131]">
                <tr>
                  <th className="px-6 py-4">Course Code</th>
                  <th className="px-6 py-4">Course Title</th>
                  <th className="px-6 py-4">Assigned Faculty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4D4CC]">
                {courses.map(c => (
                  <tr key={c.id} className="hover:bg-[#F4EFEA]/20 transition">
                    <td className="px-6 py-4 font-mono font-bold tracking-wide text-[#4A3131]">{c.code}</td>
                    <td className="px-6 py-4 font-bold">{c.title}</td>
                    <td className="px-6 py-4 font-medium flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-[#E4D4CC] flex items-center justify-center text-[10px] font-bold text-[#4A3131]">FC</div>
                       {c.lecturer}
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
