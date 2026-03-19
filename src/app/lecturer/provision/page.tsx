"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { generateExamTokens } from "./actions";
import { UploadCloud, CheckCircle2, AlertCircle } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

export default function BulkProvisionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<{ matricNumber: string, pin: string }[]>([]);
  
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(".anim-item", {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power2.out"
    });
  }, { scope: container });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError("");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (resultsData) => {
        const data = resultsData.data as Record<string, string>[];
        // Adapt rigorously to minor CSV header formatting changes implicitly 
        const matricCol = Object.keys(data[0] || {}).find(k => k.toLowerCase().includes('matric'));
        
        if (!matricCol) {
          setError("Could not find a column named 'matricNumber' in the CSV.");
          setIsProcessing(false);
          return;
        }

        const matricNumbers = data.map(row => row[matricCol]).filter(Boolean);
        
        if (matricNumbers.length === 0) {
          setError("No valid matric numbers found in the Document.");
          setIsProcessing(false);
          return;
        }

        const response = await generateExamTokens(matricNumbers);
        
        if (response.error) {
          setError(response.error);
        } else if (response.success && response.tokens) {
          setResults(response.tokens);
          gsap.fromTo(".result-row", { opacity: 0, x: -10 }, { opacity: 1, x: 0, stagger: 0.05, duration: 0.3 });
        }
        
        setIsProcessing(false);
      },
      error: (err) => {
        setError("Failed to parse localized CSV binary.");
        setIsProcessing(false);
      }
    });
  };

  return (
    <div ref={container} className="p-8 max-w-5xl mx-auto font-sans">
      <h1 className="anim-item text-4xl font-black text-[#4A3131] tracking-tight mb-2">CSV Provisioning</h1>
      <p className="anim-item text-[#5D6065] text-lg mb-8 font-medium">Upload a roster to batch-generate zero-trust One-Time Pins (OTPs).</p>

      {/* Modern CSV Dropzone Interface */}
      <div className="anim-item bg-white p-8 rounded-3xl shadow-sm border border-[#E4D4CC] mb-8">
        <label className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-colors ${file ? 'border-[#4A3131] bg-[#F4EFEA]/50' : 'border-[#E4D4CC] hover:bg-[#F4EFEA]/30'}`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud className={`w-12 h-12 mb-4 ${file ? 'text-[#4A3131]' : 'text-[#8c8e91]'}`} />
            <p className="mb-2 text-sm text-[#5D6065] font-medium">
              <span className="font-bold text-[#4A3131]">{file ? file.name : "Click to upload"}</span> or drag and drop
            </p>
            <p className="text-xs text-[#8c8e91] font-semibold">CSV files only (must contain 'matricNumber' header)</p>
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
          <button 
            onClick={handleProcess} 
            disabled={isProcessing}
            className="w-full mt-6 py-4 bg-[#4A3131] text-white font-bold rounded-xl hover:bg-[#5a3f3f] transition-all shadow-md active:scale-[0.99] disabled:opacity-70 flex justify-center items-center"
          >
            {isProcessing ? "Processing Roster Arrays..." : "Generate One-Time Pins"}
          </button>
        )}
      </div>

      {/* OTP Visualization Datatable */}
      {results.length > 0 && (
        <div className="anim-item bg-white rounded-3xl shadow-sm border border-[#E4D4CC] overflow-hidden">
          <div className="p-6 border-b border-[#E4D4CC] bg-[#F4EFEA]/30 flex justify-between items-center">
            <h3 className="text-xl font-bold text-[#4A3131]">Generated Tokens</h3>
            <span className="flex items-center gap-2 text-sm font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
               <CheckCircle2 className="w-4 h-4" /> {results.length} Pins Issued
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[#5D6065]">
              <thead className="bg-[#F4EFEA] text-xs uppercase font-bold text-[#4A3131]">
                <tr>
                  <th className="px-6 py-4">Matriculation Number</th>
                  <th className="px-6 py-4">Auth PIN (OTP)</th>
                  <th className="px-6 py-4 text-right">Expiration Constraints</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, idx) => (
                  <tr key={idx} className="result-row bg-white border-b border-[#E4D4CC] hover:bg-[#F4EFEA]/20 transition-colors">
                    <td className="px-6 py-4 font-bold text-[#4A3131]">{row.matricNumber}</td>
                    <td className="px-6 py-4 font-mono font-bold tracking-widest text-[#4A3131] bg-[#F4EFEA]/50 px-3 rounded-lg w-max">{row.pin}</td>
                    <td className="px-6 py-4 text-right"><span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-lg font-bold text-xs uppercase tracking-wide">+24 Hours</span></td>
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
