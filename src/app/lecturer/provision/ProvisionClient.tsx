"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { provisionStudents } from "./actions";
import { UploadCloud, CheckCircle2, AlertCircle, FileSpreadsheet, UserPlus } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import toast from "react-hot-toast";

type Course = { id: string; code: string; title: string; };
interface StudentCSV { matricNumber: string; fullName: string; email: string; }

export function ProvisionClient({ courses }: { courses: Course[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<{ email: string, status: string }[]>([]);
  const [courseId, setCourseId] = useState("");
  const [mode, setMode] = useState<'FILE' | 'MANUAL'>('FILE');
  
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".anim-item", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" });
  }, { scope: container });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleProcessFile = async () => {
    if (!file || !courseId) return setError("Please select a course and upload a file.");
    setIsProcessing(true);
    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (resultsData) => {
        const data = resultsData.data as Record<string, string>[];
        const mappedStudents: StudentCSV[] = data.map(row => ({
            matricNumber: Object.values(row).find(v => typeof v === 'string' && (v.includes("/") || v.length > 5)) || "", // rough adaptive
            fullName: row.fullName || row.name || row.Name || "",
            email: row.email || row.Email || ""
        })).filter(s => s.matricNumber && s.fullName && s.email);
        
        if (mappedStudents.length === 0) {
          setError("No valid records found. We need 'matricNumber', 'fullName', and 'email' columns.");
          setIsProcessing(false);
          return;
        }

        toast.loading(`Provisioning ${mappedStudents.length} students...`, { id: 'prov' });
        const response = await provisionStudents({ courseId, students: mappedStudents });
        
        if (response.error) {
          setError(response.error);
          toast.error(response.error, { id: 'prov' });
        } else if (response.success && response.results) {
          setResults(response.results);
          toast.success("Enrollment & Provisioning Complete!", { id: 'prov' });
          gsap.fromTo(".result-row", { opacity: 0, x: -10 }, { opacity: 1, x: 0, stagger: 0.05, duration: 0.3 });
        }
        
        setIsProcessing(false);
      },
      error: () => {
        setError("Failed to parse CSV document.");
        setIsProcessing(false);
      }
    });
  };

  const handleManualSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
     e.preventDefault();
     if (!courseId) return setError("Please select a course.");
     setError("");
     setIsProcessing(true);
     const fd = new FormData(e.currentTarget);
     const student: StudentCSV = {
         matricNumber: fd.get("matricNumber") as string,
         fullName: fd.get("fullName") as string,
         email: fd.get("email") as string
     };
     toast.loading("Provisioning student...", { id: 'prov' });
     const response = await provisionStudents({ courseId, students: [student] });
     if (response.error) {
         setError(response.error);
         toast.error(response.error, { id: 'prov' });
     } else if (response.success && response.results) {
         setResults(response.results);
         toast.success("Student Provisioned Successfully!", { id: 'prov' });
         (e.target as HTMLFormElement).reset();
     }
     setIsProcessing(false);
  };

  return (
    <div ref={container} className="p-8 max-w-5xl mx-auto font-sans pb-20">
      <h1 className="anim-item text-4xl font-black text-[#4A3131] tracking-tight mb-2">Enrollment & Provisioning</h1>
      <p className="anim-item text-[#5D6065] text-lg mb-8 font-medium">Enrol students mechanically resolving auth credentials securely.</p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-1 space-y-6 flex flex-col">
              <div className="anim-item bg-white p-6 rounded-3xl shadow-sm border border-[#E4D4CC]">
                  <label className="block text-sm font-bold text-[#5D6065] mb-2">Target Course</label>
                  <select value={courseId} onChange={e => setCourseId(e.target.value)} disabled={isProcessing} className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium bg-white">
                     <option value="">Select assigned course...</option>
                     {courses.map(c => <option key={c.id} value={c.id}>{c.code}</option>)}
                  </select>
              </div>
              <div className="anim-item bg-white p-2 rounded-2xl shadow-sm border border-[#E4D4CC] flex gap-2">
                  <button onClick={() => setMode('FILE')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${mode === 'FILE' ? 'bg-[#4A3131] text-white shadow-md' : 'text-[#5D6065] hover:bg-[#F4EFEA]'}`}><FileSpreadsheet className="w-4 h-4"/> Bulk Upload</button>
                  <button onClick={() => setMode('MANUAL')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition ${mode === 'MANUAL' ? 'bg-[#4A3131] text-white shadow-md' : 'text-[#5D6065] hover:bg-[#F4EFEA]'}`}><UserPlus className="w-4 h-4"/> Manual Entry</button>
              </div>
          </div>

          <div className="xl:col-span-2">
              {mode === 'FILE' ? (
                  <div className="anim-item bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC]">
                    <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${file ? 'border-[#4A3131] bg-[#F4EFEA]/50' : 'border-[#E4D4CC] hover:bg-[#F4EFEA]/30'}`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className={`w-12 h-12 mb-4 ${file ? 'text-[#4A3131]' : 'text-[#8c8e91]'}`} />
                        <p className="mb-2 text-sm text-[#5D6065] font-medium">
                          <span className="font-bold text-[#4A3131]">{file ? file.name : "Click to upload"}</span> or drag and drop
                        </p>
                        <p className="text-xs text-[#8c8e91] font-semibold">CSV files containing matricNumber, fullName, and email</p>
                      </div>
                      <input type="file" className="hidden" accept=".csv" onChange={handleFileUpload} />
                    </label>
                    {error && (
                      <div className="mt-4 p-4 rounded-xl flex items-start gap-3 bg-red-50 text-red-600 border border-red-200">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-bold">{error}</p>
                      </div>
                    )}
                    {file && (
                      <button onClick={handleProcessFile} disabled={isProcessing} className="w-full mt-6 py-4 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition-all shadow-md active:scale-[0.99] disabled:opacity-70 flex justify-center items-center h-14">
                        {isProcessing ? "Provisioning..." : "Process Roster"}
                      </button>
                    )}
                  </div>
              ) : (
                  <div className="anim-item bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC]">
                      <form onSubmit={handleManualSubmit} className="space-y-4">
                          <div>
                              <label className="block text-sm font-bold text-[#5D6065] mb-2">Matriculation Number</label>
                              <input name="matricNumber" required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" placeholder="19/1234" />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-[#5D6065] mb-2">Full Name</label>
                              <input name="fullName" required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" placeholder="John Doe" />
                          </div>
                          <div>
                              <label className="block text-sm font-bold text-[#5D6065] mb-2">Student Email Address</label>
                              <input type="email" name="email" required className="w-full p-3 border-2 border-[#E4D4CC] rounded-xl focus:border-[#4A3131] focus:outline-none transition text-[#4A3131] font-medium" placeholder="john@student.edu" />
                          </div>
                          {error && (
                              <div className="p-4 rounded-xl flex items-start gap-3 bg-red-50 text-red-600 border border-red-200">
                                  <AlertCircle className="w-5 h-5 shrink-0" />
                                  <p className="text-sm font-bold">{error}</p>
                              </div>
                          )}
                          <button type="submit" disabled={isProcessing} className="w-full mt-6 py-4 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition-all shadow-md active:scale-[0.99] disabled:opacity-70 flex justify-center items-center h-14">
                              {isProcessing ? "Enrolling..." : "Enroll & Provision Secure Password"}
                          </button>
                      </form>
                  </div>
              )}
          </div>
      </div>

      {results.length > 0 && (
        <div className="anim-item bg-white rounded-3xl shadow-sm border border-[#E4D4CC] overflow-hidden mt-8">
          <div className="p-6 border-b border-[#E4D4CC] bg-[#F4EFEA]/30 flex justify-between items-center">
            <h3 className="text-xl font-bold text-[#4A3131]">Provisioning Report</h3>
            <span className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
               <CheckCircle2 className="w-4 h-4" /> Completed
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#5D6065]">
              <thead className="bg-[#F4EFEA] text-xs uppercase font-bold text-[#4A3131]">
                <tr>
                  <th className="px-6 py-4">Student Email</th>
                  <th className="px-6 py-4 text-right">Provision Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr key={idx} className="result-row bg-white border-b border-[#E4D4CC] hover:bg-[#F4EFEA]/20 transition-[background-color]">
                    <td className="px-6 py-4 font-bold text-[#4A3131]">{row.email}</td>
                    <td className="px-6 py-4 text-right"><span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-xs uppercase tracking-wide">{row.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
