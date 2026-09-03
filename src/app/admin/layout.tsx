"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Ticket, Users, LogOut, ShieldCheck } from "lucide-react";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated && data.user && data.user.role === "admin") {
                        setUser(data.user);
                    } else {
                        router.push("/auth/admin");
                    }
                } else {
                    router.push("/auth/admin");
                }
            } catch {
                // Let middleware handle
            }
        };
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/auth/login", { method: "DELETE" });
        router.push("/auth/admin");
    };

    const initials = user?.avatar || (user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "AD");

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            {/* Sidebar */}
            <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-100 bg-white z-40 relative md:fixed h-auto md:h-screen transition-all">
                <div className="p-6 flex flex-col h-full">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-10 text-slate-800">
                        <ShieldCheck className="w-6 h-6 text-blue-600" />
                        <span className="hidden md:inline">Admin Center</span>
                    </Link>

                    <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar flex-1">
                        <Link
                            href="/admin"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${pathname === '/admin' ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <LayoutDashboard className="w-5 h-5" />
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            href="/admin/tickets"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${pathname === '/admin/tickets' ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <Ticket className="w-5 h-5" />
                            <span>All Tickets</span>
                        </Link>
                        <Link
                            href="/admin/users"
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${pathname === '/admin/users' ? 'bg-blue-50 text-blue-600 font-bold border border-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                            <Users className="w-5 h-5" />
                            <span>Users</span>
                        </Link>
                    </nav>

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 font-semibold transition-all mt-auto border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 relative min-h-screen bg-slate-50 p-4 md:p-8">
                <div className="max-w-[1400px] mx-auto">
                    <header className="flex justify-between items-center mb-8 border border-slate-100 bg-white shadow-xs backdrop-blur-md px-6 py-4 rounded-2xl">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-slate-800">Command Center</h1>
                            <p className="text-slate-400 text-xs hidden md:block mt-0.5">Real-time facility insights and resolution tracking</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {user && (
                                <div className="hidden sm:flex flex-col text-right">
                                    <span className="text-xs font-bold text-slate-800">{user.name}</span>
                                    <span className="text-[11px] text-blue-600 font-medium">{user.title || "Administrator"}</span>
                                </div>
                            )}
                            <div
                                title={user ? `${user.name} (${user.email})` : "Admin Profile"}
                                className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200 font-bold text-xs text-blue-600 shadow-xs cursor-pointer"
                            >
                                {initials}
                            </div>
                        </div>
                    </header>

                    {children}
                </div>
            </main>
        </div>
    );
}
