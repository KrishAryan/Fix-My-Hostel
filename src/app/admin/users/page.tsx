"use client";

import { useState, useEffect } from "react";
import { User, Shield, GraduationCap } from "lucide-react";

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white shadow-sm p-4 rounded-2xl border border-slate-100">
                <h2 className="text-xl font-semibold text-slate-800">User Management</h2>
                <div className="text-sm font-medium text-slate-800">Total Users: {users.length}</div>
            </div>

            <div className="bg-white shadow-sm border border-slate-100 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50/80 text-slate-800 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Role</th>
                            <th className="px-6 py-4 font-medium">Email</th>
                            <th className="px-6 py-4 font-medium">Location</th>
                            <th className="px-6 py-4 font-medium">ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan={5} className="text-center py-10 text-slate-800">No users found</td></tr>
                        ) : (
                            users.map((u, i) => (
                                <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-semibold text-slate-800 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            {u.role === 'admin' ? <Shield className="w-4 h-4 text-blue-500" /> : <GraduationCap className="w-4 h-4 text-slate-800" />}
                                        </div>
                                        {u.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${u.role === 'admin' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-800 border-slate-100'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-800">{u.email}</td>
                                    <td className="px-6 py-4 text-slate-800">
                                        {u.hostel ? `${u.hostel} - Rm ${u.room}` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-mono text-slate-800">{u.id}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
