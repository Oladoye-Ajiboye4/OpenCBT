"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { UserPlus, FileSpreadsheet, UploadCloud } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const studentSchema = z.object({
  firstName: z.string().min(1, "First Name required"),
  lastName: z.string().min(1, "Last Name required"),
  matricNumber: z.string().min(1, "Matriculation required"),
  department: z.string().min(1, "Department required"),
  level: z.string().min(1, "Level required"),
});

type StudentFormValues = z.infer<typeof studentSchema>;

export default function ManageStudents() {
  const container = useRef<HTMLDivElement>(null);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [students, setStudents] = useState([
    { id: "1", firstName: "Alice", lastName: "Smith", matricNumber: "CSC-2024-001", department: "Computer Science", level: "300L" }
  ]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema)
  });

  useGSAP(() => {
    gsap.from(".anim-item", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
  }, { scope: container });

  const onSubmit = async (data: StudentFormValues) => {
    await new Promise(r => setTimeout(r, 1000)); // Mocking API Latency
    setStudents(prev => [...prev, { id: Date.now().toString(), ...data }]);
    reset();
  };

  return (
    <div ref={container} className="max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-end anim-item">
        <div>
          <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">Manage Students</h1>
          <p className="text-[#5D6065] text-lg mt-2 font-medium">Provision localized standalone Student entities globally.</p>
        </div>
        <button onClick={() => setShowCSVModal(true)} className="px-6 py-3 bg-[#E4D4CC]/50 text-[#4A3131] font-bold rounded-xl hover:bg-[#E4D4CC] transition flex items-center gap-2 border border-[#E4D4CC]">
          <FileSpreadsheet className="w-5 h-5" /> Bulk CSV Upload
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] anim-item h-max">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F4EFEA] rounded-lg flex items-center justify-center border border-[#E4D4CC]">
              <UserPlus className="w-5 h-5 text-[#4A3131]" />
            </div>
            <h2 className="text-xl font-bold text-[#4A3131]">Add Student</h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-[#5D6065] mb-2">First Name</label>
                <input {...register("firstName")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-[#5D6065] mb-2">Last Name</label>
                <input {...register("lastName")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1 font-bold">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Matriculation</label>
              <input {...register("matricNumber")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium uppercase" />
              {errors.matricNumber && <p className="text-red-500 text-xs mt-1 font-bold">{errors.matricNumber.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Department</label>
              <input {...register("department")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" />
              {errors.department && <p className="text-red-500 text-xs mt-1 font-bold">{errors.department.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Level</label>
              <input {...register("level")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" />
              {errors.level && <p className="text-red-500 text-xs mt-1 font-bold">{errors.level.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition h-14">
              {isSubmitting ? "Enrolling..." : "Enroll Student"}
            </button>
          </form>
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-[#E4D4CC] overflow-hidden anim-item">
          <div className="p-6 border-b border-[#E4D4CC] bg-[#F4EFEA]/30">
            <h3 className="text-xl font-bold text-[#4A3131]">Universal Student Registry</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#5D6065]">
              <thead className="bg-[#F4EFEA] text-xs uppercase font-bold text-[#4A3131]">
                <tr>
                  <th className="px-6 py-4">Matric No.</th>
                  <th className="px-6 py-4">Full Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4D4CC]">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-[#F4EFEA]/20 transition">
                    <td className="px-6 py-4 font-mono font-bold tracking-wide text-[#4A3131]">{s.matricNumber}</td>
                    <td className="px-6 py-4 font-bold">{s.firstName} {s.lastName}</td>
                    <td className="px-6 py-4 font-medium">{s.department}</td>
                    <td className="px-6 py-4 font-medium">{s.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showCSVModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
             <h2 className="text-2xl font-bold text-[#4A3131] mb-2">Student CSV Upload</h2>
             <p className="text-[#5D6065] mb-6 font-medium text-sm">Upload a Papaparse compatible CSV assigning standalone matric records.</p>
             <div className="border-2 border-dashed border-[#E4D4CC] rounded-2xl h-40 flex items-center justify-center flex-col hover:bg-[#F4EFEA]/30 transition cursor-pointer mb-6">
               <UploadCloud className="w-8 h-8 text-[#8c8e91] mb-2" />
               <span className="font-bold text-[#5D6065]">Select Roster</span>
             </div>
             <button onClick={() => setShowCSVModal(false)} className="w-full py-3.5 bg-[#E4D4CC] text-[#4A3131] font-bold rounded-xl hover:bg-[#d5c2b8] transition">Cancel</button>
           </div>
        </div>
      )}
    </div>
  );
}
