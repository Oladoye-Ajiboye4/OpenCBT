export default function LecturerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header Navbar */}
            <header className="h-16 bg-primary text-white flex items-center justify-between px-8 shadow-md">
                <h1 className="text-xl font-bold">Lecturer Portal</h1>
                <nav className="flex gap-4">
                    <a href="/lecturer/courses" className="hover:text-accent transition">My Courses</a>
                    <a href="/lecturer/exams" className="hover:text-accent transition">Exams</a>
                    <a href="/lecturer/proctoring" className="hover:text-accent transition">Proctor Logs</a>
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
