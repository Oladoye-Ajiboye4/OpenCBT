"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import { Building2, Layers, Trash2, ShieldCheck, Loader2, KeyRound } from "lucide-react";
import { createFaculty, deleteFaculty, createDepartment, deleteDepartment, updateInstitutionProfile } from "@/actions/institution";
import { resetPasswordForEmail } from "@/actions/auth";
import toast from "react-hot-toast";

type Faculty = { id: string; name: string };
type Department = { id: string; name: string; facultyId: string; faculty: Faculty };
type Profile = { id: string; name: string; ictEmail: string; matricMode: string } | null;

interface SettingsClientProps {
  initialFaculties: Faculty[];
  initialDepartments: Department[];
  initialProfile: Profile;
}

export function SettingsClient({ initialFaculties, initialDepartments, initialProfile }: SettingsClientProps) {
  const container = useRef<HTMLDivElement>(null);
  
  const [isSubmittingFac, setIsSubmittingFac] = useState(false);
  const [isSubmittingDept, setIsSubmittingDept] = useState(false);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const [isResettingAuth, setIsResettingAuth] = useState(false);

  useGSAP(() => {
    gsap.from(".anim-item", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
  }, { scope: container });

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingProfile(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await updateInstitutionProfile(formData);
      if (res?.error) toast.error(res.error);
      else toast.success("Institution Profile updated!");
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleAdminPasswordReset = async () => {
    if (!initialProfile?.ictEmail) return toast.error("ICT Email not set");
    if (!confirm(`Send password reset to ${initialProfile.ictEmail}?`)) return;
    
    setIsResettingAuth(true);
    try {
      const fd = new FormData();
      fd.append("email", initialProfile.ictEmail);
      const res = await resetPasswordForEmail(fd);
      if (res?.error) toast.error(res.error);
      else toast.success("Password reset link sent!");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setIsResettingAuth(false);
    }
  };

  const handleCreateFaculty = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmittingFac(true);
    try {
      const formData = new FormData(form);
      const res = await createFaculty(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Faculty added successfully!");
        form.reset();
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmittingFac(false);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmittingDept(true);
    try {
      const formData = new FormData(form);
      const res = await createDepartment(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Department added successfully!");
        form.reset();
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmittingDept(false);
    }
  };

  const handleDeleteFaculty = async (id: string) => {
    if (!confirm("Are you sure? This will delete all associated departments, students, and courses.")) return;
    try {
      const res = await deleteFaculty(id);
      if (res?.error) toast.error(res.error);
      else toast.success("Faculty deleted successfully!");
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    if (!confirm("Are you sure? This will delete all associated students and courses.")) return;
    try {
      const res = await deleteDepartment(id);
      if (res?.error) toast.error(res.error);
      else toast.success("Department deleted successfully!");
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div ref={container} className="max-w-7xl mx-auto space-y-8 font-sans">
      <div className="anim-item">
        <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">Institution Configuration</h1>
        <p className="text-[#5D6065] text-lg mt-2 font-medium">Manage hierarchical academic structures and global settings.</p>
      </div>

      {/* Institution Profile */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] anim-item h-max">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#F4EFEA] rounded-lg flex items-center justify-center border border-[#E4D4CC]">
            <ShieldCheck className="w-5 h-5 text-[#4A3131]" />
          </div>
          <h2 className="text-xl font-bold text-[#4A3131]">Institution Profile</h2>
        </div>
        <form onSubmit={handleUpdateProfile}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Institution Name</label>
              <input name="name" defaultValue={initialProfile?.name || ""} required placeholder="e.g. OpenCBT University" className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none transition text-[#4A3131] font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">ICT Official Email</label>
              <input type="email" name="ictEmail" defaultValue={initialProfile?.ictEmail || ""} required placeholder="e.g. ict@opencbt.edu" className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none transition text-[#4A3131] font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Matriculation Mode</label>
              <select name="matricMode" defaultValue={initialProfile?.matricMode || "MANUAL"} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none transition text-[#4A3131] font-medium bg-white">
                <option value="MANUAL">Manual Entry</option>
                <option value="AUTO">Auto-Generate (YYYY + Serial)</option>
              </select>
            </div>
          </div>
          <button type="submit" disabled={isSubmittingProfile} className="px-8 py-3 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition active:scale-[0.98] disabled:opacity-70 flex items-center gap-2">
            {isSubmittingProfile ? <><Loader2 className="w-5 h-5 animate-spin"/> Saving...</> : "Save Profile"}
          </button>
        </form>
      </div>

      {/* Security Actions */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] anim-item h-max">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-[#F4EFEA] rounded-lg flex items-center justify-center border border-[#E4D4CC]">
            <KeyRound className="w-5 h-5 text-[#4A3131]" />
          </div>
          <h2 className="text-xl font-bold text-[#4A3131]">Security</h2>
        </div>
        <p className="text-[#5D6065] font-medium mb-4">Request a secure password reset link for the active administrator account.</p>
        <button onClick={handleAdminPasswordReset} disabled={isResettingAuth} className="px-8 py-3 bg-red-600/10 text-red-600 font-bold rounded-xl hover:bg-red-600/20 shadow-none hover:shadow-sm transition active:scale-[0.98] border border-red-600/20 disabled:opacity-70 flex items-center gap-2">
          {isResettingAuth ? <><Loader2 className="w-5 h-5 animate-spin"/> Processing...</> : "Send Password Reset Link"}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Manage Faculties */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] anim-item flex flex-col h-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F4EFEA] rounded-lg flex items-center justify-center border border-[#E4D4CC]">
              <Building2 className="w-5 h-5 text-[#4A3131]" />
            </div>
            <h2 className="text-xl font-bold text-[#4A3131]">Manage Faculties</h2>
          </div>
          
          <form onSubmit={handleCreateFaculty} className="flex gap-3 mb-8">
            <input name="name" required placeholder="e.g. Science and Technology" className="flex-1 p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" />
            <button type="submit" disabled={isSubmittingFac} className="px-6 py-3 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition active:scale-[0.98] disabled:opacity-70 flex items-center gap-2">
              {isSubmittingFac ? <><Loader2 className="w-5 h-5 animate-spin"/> Adding...</> : "Add Faculty"}
            </button>
          </form>

          <div className="flex-1 overflow-y-auto border border-[#E4D4CC] rounded-2xl bg-[#F4EFEA]/30 p-2">
            {initialFaculties.length === 0 ? (
              <p className="text-[#5D6065] text-center p-4">No faculties found.</p>
            ) : (
              <ul className="space-y-2">
                {initialFaculties.map(fac => (
                  <li key={fac.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-[#E4D4CC]">
                    <span className="font-bold text-[#4A3131]">{fac.name}</span>
                    <button onClick={() => handleDeleteFaculty(fac.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Manage Departments */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] anim-item flex flex-col h-[600px]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F4EFEA] rounded-lg flex items-center justify-center border border-[#E4D4CC]">
              <Layers className="w-5 h-5 text-[#4A3131]" />
            </div>
            <h2 className="text-xl font-bold text-[#4A3131]">Manage Departments</h2>
          </div>
          
          <form onSubmit={handleCreateDepartment} className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Select Faculty</label>
              <select name="facultyId" required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium bg-white">
                <option value="">-- Choose Faculty --</option>
                {initialFaculties.map(fac => (
                  <option key={fac.id} value={fac.id}>{fac.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <input name="name" required placeholder="e.g. Computer Science" className="flex-1 p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" />
              <button type="submit" disabled={isSubmittingDept} className="px-6 py-3 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition active:scale-[0.98] disabled:opacity-70 flex items-center gap-2">
                {isSubmittingDept ? <><Loader2 className="w-5 h-5 animate-spin"/> Adding...</> : "Add Dept"}
              </button>
            </div>
          </form>

          <div className="flex-1 overflow-y-auto border border-[#E4D4CC] rounded-2xl bg-[#F4EFEA]/30 p-2">
            {initialDepartments.length === 0 ? (
              <p className="text-[#5D6065] text-center p-4">No departments found.</p>
            ) : (
              <ul className="space-y-2">
                {initialDepartments.map(dept => (
                  <li key={dept.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-[#E4D4CC]">
                    <div>
                      <span className="font-bold text-[#4A3131] block">{dept.name}</span>
                      <span className="text-xs text-[#5D6065] font-bold uppercase tracking-wide">{dept.faculty?.name}</span>
                    </div>
                    <button onClick={() => handleDeleteDepartment(dept.id)} className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
