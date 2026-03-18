export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Top Navbar */}
            <header className="h-16 bg-white border-b border-secondary/30 flex items-center justify-between px-8 shadow-sm">
                <h1 className="text-2xl font-bold text-primary">OpenCBT</h1>
                <nav className="flex gap-6 items-center">
                    <a href="/student/dashboard" className="text-secondary hover:text-primary transition font-medium">Dashboard</a>
                    <a href="/student/exams" className="text-secondary hover:text-primary transition font-medium">My Exams</a>
                    <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-primary font-bold">ST</div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto p-8">
                {children}
            </main>
        </div>
    );
}
