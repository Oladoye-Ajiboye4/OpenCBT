"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, CheckCircle2, AlertCircle } from "lucide-react";
import Papa from "papaparse";
import { toast } from "react-hot-toast";
import { bulkUploadCourses } from "@/actions/course";

interface BulkCourseUploadProps {
  facultyId: string;
  departmentId: string;
  level: string;
  adminId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkCourseUpload({
  facultyId,
  departmentId,
  level,
  adminId,
  isOpen,
  onClose,
  onSuccess
}: BulkCourseUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const validateAndUpload = async (file: File) => {
    if (!facultyId || !departmentId || !level) {
      toast.error("Please select Faculty, Department, and Level first.");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data as any[];
        
        // Validate headers
        const requiredHeaders = ["courseCode", "courseTitle"];
        const headers = results.meta.fields || [];
        const missing = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missing.length > 0) {
          toast.error(`Missing required CSV columns: ${missing.join(", ")}`);
          return;
        }

        const payload = data.map(row => ({
          courseCode: String(row.courseCode).trim(),
          courseTitle: String(row.courseTitle).trim(),
          staffId: row.staffId ? String(row.staffId).trim() : undefined,
          adminId,
          departmentId,
          level
        }));

        setIsUploading(true);
        const res = await bulkUploadCourses(payload);
        setIsUploading(false);

        if (res.success) {
          toast.success(res.message);
          onSuccess();
          onClose();
        } else {
          toast.error(res.message);
        }
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      }
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/20 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-accent animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-5 border-b border-accent/60 bg-accent/30">
          <h3 className="font-bold text-xl text-primary">Bulk Upload Courses</h3>
          <button onClick={onClose} disabled={isUploading} className="text-secondary hover:text-primary transition bg-white rounded-full p-1.5 shadow-sm border border-accent">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8">
          {(!facultyId || !departmentId || !level) ? (
            <div className="flex flex-col items-center justify-center text-center p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
              <AlertCircle className="w-10 h-10 mb-2 opacity-80" />
              <p className="font-bold">Missing Filters</p>
              <p className="text-sm">Please select a Faculty, Department, and Level from the main page before uploading.</p>
            </div>
          ) : (
            <>
              <div className="bg-accent p-4 rounded-xl border border-accent mb-6 flex justify-between items-center">
                <div>
                   <p className="text-xs font-bold text-secondary uppercase">Target</p>
                   <p className="font-bold text-primary">{level} Level</p>
                </div>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition ${isDragging ? "border-primary bg-accent/50" : "border-accent hover:border-primary hover:bg-accent/30"}`}
              >
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      validateAndUpload(e.target.files[0]);
                    }
                  }}
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="animate-pulse flex flex-col items-center">
                    <UploadCloud className="w-12 h-12 text-primary mb-4 opacity-50" />
                    <p className="font-bold text-primary">Processing CSV...</p>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-12 h-12 text-primary mb-4" />
                    <p className="font-bold text-primary text-lg">Click or Drag CSV to upload</p>
                    <p className="text-sm text-secondary mt-2">Required headers: courseCode, courseTitle</p>
                    <p className="text-sm text-secondary">Optional: staffId</p>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
