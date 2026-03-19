"use client";

import { useState, useRef } from "react";
import { Share2, Link as LinkIcon, X, Check, Mail } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

// Mock Data
const MOCK_COURSES = [
  { id: "c1", title: "Introduction to Computer Science", description: "Fundamentals of programming and algorithms.", createdAt: new Date("2025-01-10") },
  { id: "c2", title: "Advanced Calculus II", description: "Limits, integration, and multivariate calculus.", createdAt: new Date("2025-02-14") },
  { id: "c3", title: "Modern Physics", description: "Quantum mechanics and relativity basics.", createdAt: new Date("2025-03-01") },
];

export default function CourseTable() {
  const tableRef = useRef<HTMLTableElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<typeof MOCK_COURSES[0] | null>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // GSAP Staggered Animation for Table Rows
  useGSAP(() => {
    gsap.from("tbody tr", {
      y: 15,
      opacity: 0,
      duration: 0.5,
      ease: "power2.out",
      stagger: 0.1,
      delay: 0.2 // slightly after the main container fades in
    });
  }, { scope: tableRef });

  const openModal = (course: typeof MOCK_COURSES[0]) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
    setMessage("");
    setEmail("");
    setCopied(false);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setMessage("Lecturer successfully assigned (Mocked).");
      setLoading(false);
      setTimeout(closeModal, 1500);
    }, 800);
  };

  const handleCopyLink = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl shadow-sm bg-white border border-[#E4D4CC]/50">
        <table ref={tableRef} className="w-full text-left border-collapse">
          <thead className="bg-[#E4D4CC]/30 border-b border-[#E4D4CC]">
            <tr>
              <th className="p-5 font-bold text-[#4A3131]">Course Title</th>
              <th className="p-5 font-bold text-[#4A3131]">Description</th>
              <th className="p-5 font-bold text-[#4A3131]">Date Created</th>
              <th className="p-5 font-bold text-[#4A3131] text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_COURSES.map(course => (
              <tr key={course.id} className="border-b border-[#E4D4CC]/30 hover:bg-[#F4EFEA]/60 transition-colors">
                <td className="p-5 font-semibold text-[#4A3131]">{course.title}</td>
                <td className="p-5 text-[#5D6065] max-w-md truncate">{course.description}</td>
                <td className="p-5 text-[#5D6065]">{course.createdAt.toLocaleDateString()}</td>
                <td className="p-5 text-right">
                  <button
                    onClick={() => openModal(course)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#E4D4CC]/40 text-[#4A3131] hover:bg-[#4A3131] hover:text-white transition-all shadow-sm"
                    title="Delegate Access"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#5D6065]/20 backdrop-blur-sm p-4">
          {/* We could animate this modal entrance with GSAP, but standard Tailwind animate works or we can just apply a simple scale */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#E4D4CC] animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 py-5 border-b border-[#E4D4CC]/60 bg-[#F4EFEA]/30">
              <h3 className="font-bold text-xl text-[#4A3131]">Delegate to Lecturer</h3>
              <button onClick={closeModal} className="text-[#5D6065] hover:text-[#4A3131] transition bg-white rounded-full p-1.5 shadow-sm border border-[#E4D4CC]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="bg-[#F4EFEA] p-4 rounded-xl border border-[#E4D4CC]/50">
                <p className="text-sm font-medium text-[#5D6065] uppercase tracking-wider mb-1">Course target</p>
                <p className="font-bold text-lg text-[#4A3131]">{selectedCourse.title}</p>
              </div>

              <form onSubmit={handleAssign} className="space-y-4">
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-[#5D6065]">
                    Lecturer Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-[#5D6065]/60" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="lecturer@opencbt.edu"
                      className="w-full pl-12 p-3.5 border-2 border-[#E4D4CC] rounded-xl focus:outline-none focus:border-[#4A3131] bg-white text-[#4A3131] font-medium transition"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 mt-2 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
                  >
                    {loading ? "Assigning Access..." : "Grant Lecturer Access"}
                  </button>
                </div>
                {message && (
                  <div className="p-3 rounded-xl text-sm font-semibold bg-[#E4D4CC]/50 text-[#4A3131] text-center border border-[#E4D4CC]">
                    {message}
                  </div>
                )}
              </form>

              <div className="pt-6 border-t border-[#E4D4CC]/60">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border-2 border-[#E4D4CC]/80 rounded-xl hover:bg-[#F4EFEA] transition text-[#5D6065] hover:text-[#4A3131] font-bold bg-white shadow-sm"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <LinkIcon className="w-5 h-5" />}
                  {copied ? "Link Copied!" : "Copy Private Course Link"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
