"use client";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { ShieldAlert, EyeOff } from "lucide-react";

gsap.registerPlugin(useGSAP);

export default function ProctorResults() {
  const container = useRef<HTMLDivElement>(null);
  
  const flaggedRecords = [
    { id: "1", matric: "CSC-2024-001", exam: "Midterm Assessment", severity: "High", infraction: "Force-Tab Switch", time: "11:42 AM" },
    { id: "2", matric: "CSC-2024-052", exam: "Midterm Assessment", severity: "Medium", infraction: "Face Dropped Tracking", time: "11:15 AM" }
  ];

  useGSAP(() => {
    gsap.from(".anim-item", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
  }, { scope: container });

  return (
    <div ref={container} className="max-w-6xl mx-auto space-y-8 font-sans">
      <div className="anim-item">
        <h1 className="text-4xl font-black text-[#4A3131] tracking-tight">AI Proctoring Flags</h1>
        <p className="text-[#5D6065] text-lg mt-2 font-medium">Review unverified session anomalies reported natively by OpenCBT computer vision layers.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#E4D4CC] overflow-hidden anim-item">
        <div className="p-6 border-b border-[#E4D4CC] bg-[#F4EFEA]/30 flex justify-between items-center">
           <h3 className="text-xl font-bold text-[#4A3131]">Incident Timeline Registry</h3>
           <span className="flex items-center gap-2 text-sm font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
               <ShieldAlert className="w-4 h-4" /> Priority Review
           </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#5D6065]">
            <thead className="bg-[#F4EFEA] text-xs uppercase font-bold text-[#4A3131]">
              <tr>
                <th className="px-6 py-4">Matriculation Entity</th>
                <th className="px-6 py-4">Environment</th>
                <th className="px-6 py-4">Security Violation</th>
                <th className="px-6 py-4">Severity Array</th>
                <th className="px-6 py-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4D4CC]">
              {flaggedRecords.map(r => (
                <tr key={r.id} className="hover:bg-red-50/50 transition">
                  <td className="px-6 py-4 font-mono font-bold tracking-wide text-[#4A3131]">{r.matric}</td>
                  <td className="px-6 py-4 font-bold">{r.exam}</td>
                  <td className="px-6 py-4 font-medium flex items-center gap-2"><EyeOff className="w-4 h-4 text-[#8c8e91]"/> {r.infraction}</td>
                  <td className="px-6 py-4">
                     <span className={`px-2.5 py-1 rounded-lg font-bold text-xs uppercase tracking-wide ${r.severity === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{r.severity}</span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{r.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
