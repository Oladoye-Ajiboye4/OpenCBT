export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar */}
            <aside className="w-64 bg-primary text-white flex flex-col items-center py-8">
                <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>
                <nav className="flex flex-col gap-4 w-full px-4">
                    <a href="/admin/courses" className="p-3 bg-accent/20 rounded hover:bg-accent/40 transition">Manage Courses</a>
                    <a href="/admin/users" className="p-3 bg-accent/20 rounded hover:bg-accent/40 transition">Manage Users</a>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="border-b border-secondary pb-4 mb-4">
                    <h1 className="text-3xl font-semibold">Super Admin Dashboard</h1>
                </header>
                {children}
            </main>
        </div>
    );
}
