"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState, useMemo } from "react";
import { UserPlus, FileSpreadsheet, UploadCloud, Search, Trash2, Edit2, Loader2 } from "lucide-react";
import { createStudent, deleteStudent, updateStudent, getStudents, uploadStudentsCSV } from "@/actions/student";
import Papa from "papaparse";
import toast from "react-hot-toast";

type Department = { id: string; name: string; facultyId: string };
type Faculty = { id: string; name: string; departments: Department[] };
type Student = { id: string; firstName: string; lastName: string; matricNumber: string; departmentId: string; level: string; department: Department };

const LEVELS = ["100L", "200L", "300L", "400L", "500L"];

export function StudentsClient({ faculties, matricMode }: { faculties: Faculty[], matricMode: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters State
  const [filterFacultyId, setFilterFacultyId] = useState("");
  const [filterDeptId, setFilterDeptId] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  // Create Form State
  const [createFacId, setCreateFacId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // CSV Modal State
  const [csvDeptId, setCsvDeptId] = useState("");
  const [csvLevel, setCsvLevel] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Derived Departments for dropdowns
  const filterDepartments = useMemo(() => faculties.find(f => f.id === filterFacultyId)?.departments || [], [filterFacultyId, faculties]);
  const createDepartments = useMemo(() => faculties.find(f => f.id === createFacId)?.departments || [], [createFacId, faculties]);

  useGSAP(() => {
    gsap.from(".anim-item", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
  }, { scope: container });

  const handleFilter = async () => {
    if (!filterDeptId || !filterLevel) return toast.error("Please select Department and Level to filter.");
    setIsLoading(true);
    try {
      const res = await getStudents({ departmentId: filterDeptId, level: filterLevel });
      if (res?.error) toast.error(res.error);
      else if (res.students) setStudents(res.students as unknown as Student[]);
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    try {
      const formData = new FormData(form);
      const res = await createStudent(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Student created successfully!");
        form.reset();
        setCreateFacId("");
        if (filterDeptId && filterLevel) handleFilter(); // refresh table
      }
    } catch {
      toast.error("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await deleteStudent(id);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Student deleted successfully.");
        setStudents(prev => prev.filter(s => s.id !== id));
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateStudent(id, formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Student updated successfully!");
        setEditingId(null);
        handleFilter();
      }
    } catch {
      toast.error("Network error. Please try again.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!csvDeptId || !csvLevel) return toast.error("Please select a Department and Level first.");

    setIsUploading(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const data = results.data;
          const res = await uploadStudentsCSV(data, csvDeptId, csvLevel);
          if (res?.error) toast.error(res.error);
          else {
            toast.success("CSV Uploaded successfully!");
            setShowCSVModal(false);
            if (filterDeptId === csvDeptId && filterLevel === csvLevel) handleFilter();
          }
        } catch {
          toast.error("Network error. Please check your connection and try again.");
        } finally {
          setIsUploading(false);
        }
      },
      error: (error) => {
        toast.error("Error reading CSV: " + error.message);
        setIsUploading(false);
      }
    });
  };

  return (
    <div ref={container} className="max-w-7xl mx-auto space-y-8 font-sans pb-10">
      <div className="flex justify-between items-end anim-item">
        <div>
          <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">Manage Students</h1>
          <p className="text-[#5D6065] text-lg mt-2 font-medium">Provision and manage student records hierarchically.</p>
        </div>
        <button onClick={() => setShowCSVModal(true)} className="px-6 py-3 bg-[#E4D4CC] text-[#4A3131] font-bold rounded-xl hover:bg-[#d5c2b8] transition flex items-center gap-2 border border-[#E4D4CC] shadow-sm">
          <FileSpreadsheet className="w-5 h-5" /> Bulk CSV Upload
        </button>
      </div>

      {/* 3-Step Filter */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-[#E4D4CC] anim-item flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-bold text-[#5D6065] mb-2">1. Select Faculty</label>
          <select value={filterFacultyId} onChange={(e) => { setFilterFacultyId(e.target.value); setFilterDeptId(""); }} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium bg-white">
            <option value="">-- Faculty --</option>
            {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-[#5D6065] mb-2">2. Select Department</label>
          <select value={filterDeptId} onChange={(e) => setFilterDeptId(e.target.value)} disabled={!filterFacultyId} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium bg-white disabled:opacity-50">
            <option value="">-- Department --</option>
            {filterDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-[#5D6065] mb-2">3. Select Level</label>
          <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium bg-white">
            <option value="">-- Level --</option>
            {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <button onClick={handleFilter} disabled={!filterDeptId || !filterLevel || isLoading} className="px-8 py-3.5 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition active:scale-[0.98] disabled:opacity-70 flex items-center gap-2">
          {isLoading ? "Loading..." : <><Search className="w-5 h-5"/> Fetch</>}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Add Student Form */}
        <div className="xl:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] anim-item h-max">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#F4EFEA] rounded-lg flex items-center justify-center border border-[#E4D4CC]">
              <UserPlus className="w-5 h-5 text-[#4A3131]" />
            </div>
            <h2 className="text-xl font-bold text-[#4A3131]">Add Student</h2>
          </div>
          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-bold text-[#5D6065] mb-2">First Name</label>
                <input name="firstName" required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium" />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#5D6065] mb-2">Last Name</label>
                <input name="lastName" required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Matriculation Number</label>
              <input 
                name="matricNumber" 
                required={matricMode === "MANUAL"}
                disabled={matricMode === "AUTO"}
                placeholder={matricMode === "AUTO" ? "Auto-Generated by System" : "e.g. 190022"} 
                className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none transition text-[#4A3131] font-medium disabled:bg-[#F4EFEA] disabled:text-[#5D6065]/60" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Faculty</label>
              <select value={createFacId} onChange={(e) => setCreateFacId(e.target.value)} required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium bg-white">
                <option value="">-- Faculty --</option>
                {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Department</label>
              <select name="departmentId" required disabled={!createFacId} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium bg-white disabled:opacity-50">
                <option value="">-- Department --</option>
                {createDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-[#5D6065] mb-2">Level</label>
              <select name="level" required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium bg-white">
                <option value="">-- Level --</option>
                {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition shadow-md shadow-[#4A3131]/20 disabled:opacity-70 flex justify-center items-center gap-2">
              {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Enrolling...</> : "Enroll Student"}
            </button>
          </form>
        </div>

        {/* Dynamic Table */}
        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-[#E4D4CC] overflow-hidden anim-item h-max">
          <div className="p-6 border-b border-[#E4D4CC] bg-[#F4EFEA]/30">
            <h3 className="text-xl font-bold text-[#4A3131]">Universal Student Registry</h3>
          </div>
          <div className="overflow-x-auto min-h-[300px]">
            {students.length === 0 ? (
              <div className="p-10 text-center text-[#5D6065] font-medium">
                {filterDeptId && filterLevel ? "No students found for this selection." : "Apply filters above to view students."}
              </div>
            ) : (
              <table className="w-full text-left text-sm text-[#5D6065]">
                <thead className="bg-[#F4EFEA] text-xs uppercase font-bold text-[#4A3131]">
                  <tr>
                    <th className="px-6 py-4">Matric No.</th>
                    <th className="px-6 py-4">Full Name</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4D4CC]">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-[#F4EFEA]/20 transition group">
                      {editingId === s.id ? (
                        <td colSpan={3} className="px-6 py-4">
                          <form onSubmit={(e) => handleUpdate(e, s.id)} className="flex items-center gap-3 w-full">
                            <input name="matricNumber" defaultValue={s.matricNumber} required className="p-2 border-2 border-[#E4D4CC] rounded-lg flex-1" />
                            <input name="firstName" defaultValue={s.firstName} required className="p-2 border-2 border-[#E4D4CC] rounded-lg flex-1" />
                            <input name="lastName" defaultValue={s.lastName} required className="p-2 border-2 border-[#E4D4CC] rounded-lg flex-1" />
                            <button type="submit" className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700">Save</button>
                            <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">Cancel</button>
                          </form>
                        </td>
                      ) : (
                        <>
                          <td className="px-6 py-4 font-mono font-bold tracking-wide text-[#4A3131] uppercase">{s.matricNumber}</td>
                          <td className="px-6 py-4 font-bold">{s.firstName} {s.lastName}</td>
                          <td className="px-6 py-4 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                            <button onClick={() => setEditingId(s.id)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Upload CSV Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
             <h2 className="text-2xl font-bold text-[#4A3131] mb-2">Student CSV Upload</h2>
             <p className="text-[#5D6065] mb-6 font-medium text-sm">Target Department and Level are required before uploading.</p>
             
             <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-[#5D6065] mb-2">Faculty (Filter)</label>
                  <select onChange={(e) => { setFilterFacultyId(e.target.value); setCsvDeptId(""); }} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium bg-white">
                    <option value="">-- Faculty --</option>
                    {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#5D6065] mb-2">Target Department</label>
                  <select value={csvDeptId} onChange={(e) => setCsvDeptId(e.target.value)} disabled={!filterFacultyId} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium bg-white disabled:opacity-50">
                    <option value="">-- Department --</option>
                    {filterDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#5D6065] mb-2">Target Level</label>
                  <select value={csvLevel} onChange={(e) => setCsvLevel(e.target.value)} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] outline-none text-[#4A3131] font-medium bg-white">
                    <option value="">-- Level --</option>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
             </div>

             {csvDeptId && csvLevel ? (
               <label className="border-2 border-dashed border-[#E4D4CC] rounded-2xl h-40 flex items-center justify-center flex-col hover:bg-[#F4EFEA]/30 transition cursor-pointer mb-6">
                 {isUploading ? (
                   <span className="font-bold text-[#5D6065]">Uploading...</span>
                 ) : (
                   <>
                    <UploadCloud className="w-8 h-8 text-[#8c8e91] mb-2" />
                    <span className="font-bold text-[#5D6065]">Select Roster (CSV)</span>
                    <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                   </>
                 )}
               </label>
             ) : (
               <div className="border-2 border-dashed border-[#E4D4CC] rounded-2xl h-40 flex items-center justify-center flex-col bg-[#F4EFEA]/30 mb-6 opacity-50">
                 <span className="font-bold text-[#5D6065] text-center px-4">Select Target Department & Level to reveal upload</span>
               </div>
             )}

             <button onClick={() => setShowCSVModal(false)} className="w-full py-3.5 bg-[#E4D4CC] text-[#4A3131] font-bold rounded-xl hover:bg-[#d5c2b8] transition">Cancel</button>
           </div>
        </div>
      )}
    </div>
  );
}
