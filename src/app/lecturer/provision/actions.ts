"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

// create an admin client to bypass RLS and create users
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type StudentCSV = { matricNumber: string; fullName: string; email: string; };

export async function provisionStudents(data: { courseId: string, students: StudentCSV[] }) {
    const { courseId, students } = data;
    if (!courseId || students.length === 0) return { error: "Missing context parameters." };

    try {
        const results = [];
        for (const s of students) {
            const email = s.email.trim();
            const [firstName, ...lastNames] = s.fullName.trim().split(' ');
            const lastName = lastNames.join(' ') || '-';
            const pwd = Math.random().toString(36).slice(-8);
            
            const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
                email,
                password: pwd,
                email_confirm: true,
                user_metadata: { role: 'STUDENT' }
            });
            
            let userId = authData.user?.id;
            
            if (authError && authError.message.includes('already registered')) {
                const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
                const matchedUser = existing?.users.find(u => u.email === email);
                 if (matchedUser) userId = matchedUser.id;
                 else throw authError;
            } else if (authError) {
                // If it's a structural error during user creation
                throw authError;
            }
            
            if (!userId) throw new Error("Creation crashed");

            const departmentRow = await prisma.course.findUnique({ where: { id: courseId }, select: { departmentId: true } });
            
            if (departmentRow?.departmentId) {
                await prisma.student.upsert({
                    where: { matricNumber: s.matricNumber },
                    update: {
                        email,
                        firstName,
                        lastName,
                        enrollments: {
                            create: { courseId }
                        }
                    },
                    create: {
                        id: userId,
                        matricNumber: s.matricNumber,
                        email,
                        firstName,
                        lastName,
                        level: "100",
                        departmentId: departmentRow.departmentId,
                        enrollments: {
                           create: { courseId }
                        }
                    }
                });
                
                // Stubbed SMTP Dispatch wrapper implicitly avoiding 3rd party secrets output
                console.log(`[Nodemailer Dispatch Simulator] Sent to ${email} - Password: ${pwd}`);
                
                results.push({ email, status: 'Provisioned Active' });
            }
        }

        return { success: true, results };
    } catch (error: any) {
        console.error(error);
        return { error: error?.message || "Execution failed inherently." };
    }
}
