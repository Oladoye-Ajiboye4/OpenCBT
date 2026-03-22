"use client";

import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { BookOpen, PlusCircle, Trash2, Edit2, UploadCloud } from "lucide-react";
import { toast } from "react-hot-toast";

import { 
  getFaculties, 
  getDepartments, 
  getCourses, 
  createCourse, 
  deleteCourse 
} from "@/actions/course";
import { LecturerCombobox } from "@/components/admin/LecturerCombobox";
import { BulkCourseUpload } from "@/components/admin/BulkCourseUpload";

export default function ManageCourses() {
  const container = useRef<HTMLDivElement>(null);

  // Filters
  const [faculties, setFaculties] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

  const [loadingCourses, setLoadingCourses] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);

  // Dummy Admin ID for now (Assuming we get from auth)
  const [adminId, setAdminId] = useState("global"); 

  useEffect(() => {
    getFaculties().then(setFaculties);
  }, []);

  useEffect(() => {
    if (selectedFaculty) {
      getDepartments(selectedFaculty).then(setDepartments);
      setSelectedDept("");
      setSelectedLevel("");
      setCourses([]);
    } else {
      setDepartments([]);
      setSelectedDept("");
      setSelectedLevel("");
      setCourses([]);
    }
  }, [selectedFaculty]);

  const fetchCourses = async () => {
    if (selectedFaculty && selectedDept && selectedLevel) {
      setLoadingCourses(true);
      const data = await getCourses({
        facultyId: selectedFaculty,
        departmentId: selectedDept,
        level: selectedLevel
      });
      setCourses(data);
      setLoadingCourses(false);
    } else {
      setCourses([]);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedFaculty, selectedDept, selectedLevel]);

  useGSAP(() => {
    gsap.from(".anim-item", { y: 20, opacity: 0, duration: 0.6, stagger: 0.1, ease: "power3.out" });
  }, { scope: container });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedDept || !selectedLevel) {
      toast.error("Please select a Department and Level from the filters above.");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const code = formData.get("code") as string;
    const title = formData.get("title") as string;
    const lecturerId = formData.get("lecturerId") as string;

    if (!code || !title) {
      toast.error("Code and Title are required.");
      return;
    }

    setIsSubmitting(true);
    const res = await createCourse({
      code,
      title,
      departmentId: selectedDept,
      level: selectedLevel,
      adminId,
      lecturerId: lecturerId || null
    });
    setIsSubmitting(false);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(res.message);
      form.reset();
      fetchCourses();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    const res = await deleteCourse(id);
    if (res.success) {
      toast.success(res.message);
      fetchCourses();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div ref={container} className="max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex justify-between items-end anim-item">
        <div>
          <h1 className="text-4xl font-black text-primary tracking-tight">Manage Courses</h1>
          <p className="text-secondary text-lg mt-2 font-medium">Create enterprise courses and assign designated faculty natively.</p>
        </div>
        <button 
          onClick={() => setIsBulkOpen(true)}
          className="bg-white border-2 border-accent text-primary hover:bg-accent hover:border-primary px-5 py-3 rounded-xl font-bold flex items-center gap-2 transition"
        >
          <UploadCloud className="w-5 h-5" />
          Bulk Upload Courses
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-accent anim-item flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-bold text-secondary mb-2">Faculty</label>
          <select 
            value={selectedFaculty} 
            onChange={e => setSelectedFaculty(e.target.value)}
            className="w-full p-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none transition text-primary font-medium bg-white"
          >
            <option value="">Select Faculty...</option>
            {faculties.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-secondary mb-2">Department</label>
          <select 
            value={selectedDept} 
            onChange={e => setSelectedDept(e.target.value)}
            disabled={!selectedFaculty}
            className="w-full p-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none transition text-primary font-medium bg-white disabled:opacity-50"
          >
            <option value="">Select Department...</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-bold text-secondary mb-2">Level</label>
          <select 
            value={selectedLevel} 
            onChange={e => setSelectedLevel(e.target.value)}
            disabled={!selectedDept}
            className="w-full p-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none transition text-primary font-medium bg-white disabled:opacity-50"
          >
            <option value="">Select Level...</option>
            <option value="100L">100 Level</option>
            <option value="200L">200 Level</option>
            <option value="300L">300 Level</option>
            <option value="400L">400 Level</option>
            <option value="500L">500 Level</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-accent anim-item h-max">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center border border-accent">
              <PlusCircle className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-primary">Deploy Course</h2>
          </div>
          
          {(!selectedDept || !selectedLevel) ? (
            <div className="p-4 bg-accent border border-accent rounded-xl text-center text-sm font-bold text-secondary">
              Select a Department and Level above to create a course.
            </div>
          ) : (
            <form className="space-y-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Course Code</label>
                <input name="code" required className="w-full p-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none transition text-primary font-mono font-bold uppercase tracking-wider" placeholder="CSC301" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Course Title</label>
                <input name="title" required className="w-full p-3 border-2 border-accent rounded-xl focus:border-primary focus:outline-none transition text-primary font-medium" placeholder="Data Structures" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Assign Lecturer</label>
                {/* Need to implement a hidden input to hold the LecturerCombobox value so FormData works */}
                <LecturerComboboxWrapper departmentId={selectedDept} />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-6 bg-primary text-white font-bold rounded-xl hover:bg-primary/85 transition h-14 disabled:opacity-70 disabled:cursor-not-allowed">
                {isSubmitting ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                ) : "Publish Course"}
              </button>
            </form>
          )}
        </div>

        <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-accent overflow-hidden anim-item">
          <div className="p-6 border-b border-accent bg-accent/30">
            <h3 className="text-xl font-bold text-primary">Active Deployments</h3>
          </div>
          <div className="overflow-x-auto min-h-[300px]">
            {(!selectedFaculty || !selectedDept || !selectedLevel) ? (
               <div className="flex flex-col items-center justify-center p-12 text-secondary">
                  <BookOpen className="w-12 h-12 mb-4 opacity-30" />
                  <p className="font-bold text-lg">No Filters Selected</p>
                  <p className="text-sm">Please select completely down to the Level to view courses.</p>
               </div>
            ) : loadingCourses ? (
              <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : courses.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-12 text-secondary">
                  <p className="font-bold text-lg text-primary">No Courses Found</p>
                  <p className="text-sm">There are no courses deployed for {selectedLevel} yet.</p>
               </div>
            ) : (
            <table className="w-full text-left text-sm text-secondary">
              <thead className="bg-accent text-xs uppercase font-bold text-primary">
                <tr>
                  <th className="px-6 py-4">Course Code</th>
                  <th className="px-6 py-4">Course Title</th>
                  <th className="px-6 py-4">Assigned Lecturer</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent">
                {courses.map(c => (
                  <tr key={c.id} className="hover:bg-accent/20 transition group">
                    <td className="px-6 py-4 font-mono font-bold tracking-wide text-primary">{c.code}</td>
                    <td className="px-6 py-4 font-bold">{c.title}</td>
                    <td className="px-6 py-4 font-medium">
                       {c.lecturer ? (
                         <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-primary">
                             {(c.lecturer.name || "L").charAt(0).toUpperCase()}
                           </div>
                           {c.lecturer.name}
                         </div>
                       ) : (
                         <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-500 rounded-md text-xs font-bold border border-gray-200">
                           Unassigned
                         </div>
                       )}
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                         <button className="p-2 text-secondary hover:bg-accent/50 rounded-lg transition" title="Edit (Coming Soon)">
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button onClick={() => handleDelete(c.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition" title="Delete Course">
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>

      <BulkCourseUpload 
        isOpen={isBulkOpen}
        onClose={() => setIsBulkOpen(false)}
        facultyId={selectedFaculty}
        departmentId={selectedDept}
        level={selectedLevel}
        adminId={adminId}
        onSuccess={fetchCourses}
      />
    </div>
  );
}

function LecturerComboboxWrapper({ departmentId }: { departmentId: string }) {
  const [val, setVal] = useState("");
  return (
    <>
      <LecturerCombobox departmentId={departmentId} value={val} onChange={setVal} />
      <input type="hidden" name="lecturerId" value={val} />
    </>
  );
}
