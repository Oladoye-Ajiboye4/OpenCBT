"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { UserPlus, FileSpreadsheet, UploadCloud } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const lecturerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  staffId: z.string().min(1, "Staff ID is required"),
  email: z.string().email("Valid email is required"),
  password: z.string().min(8, "Temporary password must be 8+ chars"),
});

type LecturerFormValues = z.infer<typeof lecturerSchema>;

export default function ManageLecturers() {
  const container = useRef<HTMLDivElement>(null);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [lecturers, setLecturers] = useState([
    { id: "1", name: "Dr. Alan Turing", email: "alan@opencbt.edu", staffId: "FAC-1001", status: "Active" },
    { id: "2", name: "Dr. Grace Hopper", email: "grace@opencbt.edu", staffId: "FAC-1002", status: "Active" },
  ]);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<LecturerFormValues>({
    resolver: zodResolver(lecturerSchema)
  });

  useGSAP(() => {
    gsap.from(".anim-item", {
      y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out"
    });
  }, { scope: container });

  const onSubmit = async (data: LecturerFormValues) => {
    await new Promise(r => setTimeout(r, 1000));
    setLecturers(prev => [...prev, { id: Date.now().toString(), name: data.name, email: data.email, staffId: data.staffId, status: "Pending" }]);
    reset();
  };

  return (
    <div ref={container} className="max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-end anim-item">
        <div>
          <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">Manage Faculty</h1>
          <p className="text-[#5D6065] text-lg mt-2 font-medium">Provision Lecturer credentials and manage institutional access.</p>
        </div>
        <button onClick={() => setShowCSVModal(true)} className="px-6 py-3 bg-[#E4D4CC]/50 text-[#4A3131] font-bold rounded-xl hover:bg-[#E4D4CC] transition flex items-center gap-2 border border-[#E4D4CC]">
          <FileSpreadsheet className="w-5 h-5" /> Bulk CSV Upload
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Provision Form Section */}
        <div className="xl:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] anim-item h-max">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F4EFEA] rounded-lg flex items-center justify-center border border-[#E4D4CC]">
              <UserPlus className="w-5 h-5 text-[#4A3131]" />
            </div>
            <h2 className="text-xl font-bold text-[#4A3131]">Add Lecturer</h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Full Name</label>
              <input {...register("name")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" placeholder="e.g. Dr. Jane Doe" />
              {errors.name && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Inst. Email</label>
              <input {...register("email")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" placeholder="jane@opencbt.edu" />
              {errors.email && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Staff ID</label>
              <input {...register("staffId")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium uppercase" placeholder="FAC-2051" />
              {errors.staffId && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.staffId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Temporary Password</label>
              <input type="password" {...register("password")} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" />
              {errors.password && <p className="text-red-500 text-xs mt-1.5 font-bold">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition active:scale-[0.98] shadow-md shadow-[#4A3131]/20 disabled:opacity-70 flex justify-center items-center">
              {isSubmitting ? "Provisioning..." : "Provision Access"}
            </button>
          </form>
        </div>

        {/* Data Table */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-[#E4D4CC] overflow-hidden anim-item">
          <div className="p-6 border-b border-[#E4D4CC] bg-[#F4EFEA]/30">
            <h3 className="text-xl font-bold text-[#4A3131]">Registered Faculty Registry</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#5D6065]">
              <thead className="bg-[#F4EFEA] text-xs uppercase font-bold text-[#4A3131]">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Staff ID</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4D4CC]">
                {lecturers.map(l => (
                  <tr key={l.id} className="hover:bg-[#F4EFEA]/20 transition">
                    <td className="px-6 py-4 font-bold text-[#4A3131]">{l.name}</td>
                    <td className="px-6 py-4 font-medium">{l.email}</td>
                    <td className="px-6 py-4 font-mono font-bold tracking-wide">{l.staffId}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2.5 py-1 rounded-lg font-bold text-xs uppercase tracking-wide ${l.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-[#E4D4CC] text-[#5D6065]'}`}>{l.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Basic CSV Modal Placeholder */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
             <h2 className="text-2xl font-bold text-[#4A3131] mb-2">Bulk CSV Provisioning</h2>
             <p className="text-[#5D6065] mb-6 font-medium text-sm">Upload a Papaparse compatible CSV containing Name, Email, and Staff ID.</p>
             <div className="border-2 border-dashed border-[#E4D4CC] rounded-2xl h-40 flex items-center justify-center flex-col hover:bg-[#F4EFEA]/30 transition cursor-pointer mb-6">
               <UploadCloud className="w-8 h-8 text-[#8c8e91] mb-2" />
               <span className="font-bold text-[#5D6065]">Select CSV Roster</span>
             </div>
             <button onClick={() => setShowCSVModal(false)} className="w-full py-3.5 bg-[#E4D4CC] text-[#4A3131] font-bold rounded-xl hover:bg-[#d5c2b8] transition">Cancel Upload</button>
           </div>
        </div>
      )}
    </div>
  );
}
