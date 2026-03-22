"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getLecturers } from "@/actions/course";

interface LecturerComboboxProps {
  departmentId: string;
  value: string;
  onChange: (value: string) => void;
}

export function LecturerCombobox({ departmentId, value, onChange }: LecturerComboboxProps) {
  const [open, setOpen] = useState(false);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!departmentId) {
      setLecturers([]);
      return;
    }

    const fetchLecturers = async () => {
      setLoading(true);
      const data = await getLecturers(departmentId);
      setLecturers(data);
      setLoading(false);
    };

    fetchLecturers();
  }, [departmentId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLecturers = lecturers.filter(l => 
    (l.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (l.staffId && l.staffId.toLowerCase().includes(search.toLowerCase()))
  );

  console.log("Lecturers array:", lecturers);
  const selectedLecturer = lecturers.find(l => l.id === value);
  const displayName = selectedLecturer 
    ? (selectedLecturer.name || "").trim()
    : "Select a Lecturer...";

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none transition text-primary font-medium bg-white disabled:opacity-50"
        disabled={!departmentId}
      >
        {value ? displayName : "Select a Lecturer..."}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-accent rounded-xl shadow-lg max-h-60 flex flex-col overflow-hidden">
          <div className="flex items-center px-3 border-b border-accent">
            <Search className="w-4 h-4 text-secondary mr-2 opacity-50" />
            <input
              className="w-full py-3 text-sm outline-none bg-transparent placeholder:text-secondary/50"
              placeholder="Search by name or Staff ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="overflow-y-auto w-full p-1">
            {loading ? (
              <div className="p-4 text-center text-sm text-secondary">Loading...</div>
            ) : filteredLecturers.length === 0 ? (
              <div className="p-4 text-center text-sm text-secondary">No lecturer found.</div>
            ) : (
              <>
                <div
                  onClick={() => {
                    onChange("");
                    setOpen(false);
                  }}
                  className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer text-red-600 font-bold hover:bg-accent transition ${value === "" ? "bg-accent" : ""}`}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === "" ? "opacity-100" : "opacity-0"}`} />
                  Unassigned
                </div>
                {filteredLecturers.map((lecturer) => (
                  <div
                    key={lecturer.id}
                    onClick={() => {
                      onChange(lecturer.id === value ? "" : lecturer.id);
                      setOpen(false);
                    }}
                    className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer text-primary hover:bg-accent transition ${value === lecturer.id ? "bg-accent" : ""}`}
                  >
                    <Check className={`mr-2 h-4 w-4 ${value === lecturer.id ? "opacity-100" : "opacity-0"}`} />
                    <div className="flex flex-col">
                      <span className="font-semibold">{lecturer.staffId || lecturer.email || lecturer.id}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
