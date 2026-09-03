"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building, LogOut, User } from "lucide-react";

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (res.ok) {
                    const data = await res.json();
                    if (data.authenticated && data.user) {
                        setUser(data.user);
                    } else {
                        router.push("/auth/student");
                    }
                } else {
                    router.push("/auth/student");
                }
            } catch {
                // Ignore network errors or let middleware handle
            }
        };
        checkAuth();
    }, [router]);

    const handleLogout = async () => {
        await fetch("/api/auth/login", { method: "DELETE" });
        router.push("/auth/student");
    };

    const initials = user?.avatar || (user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() : "ST");

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                    <Building className="w-6 h-6 text-primary" />
                    <span className="text-slate-800 hidden sm:inline">Fix My Hostel</span>
                </Link>
                <div className="flex items-center gap-4 sm:gap-6">
                    {user && (
                        <div className="hidden sm:flex flex-col text-right">
                            <span className="text-xs font-bold text-slate-800">{user.name}</span>
                            <span className="text-[11px] text-slate-400">{user.hostel} • Rm {user.room}</span>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1.5 transition-colors py-1.5 px-2.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Sign Out</span>
                    </button>
                    <div
                        title={user ? `${user.name} (${user.email})` : "Student Profile"}
                        className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center border border-blue-200 font-bold text-xs text-blue-600 shadow-xs cursor-pointer"
                    >
                        {initials}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
                {children}
            </main>
        </div>
    );
}
