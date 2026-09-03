"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Complaint } from "@/lib/mockDb";
import { Search, Filter, MoreVertical, CheckCircle, AlertCircle } from "lucide-react";
import mockDbData from "@/data/db.json";

export default function AdminTickets() {
    const [issues, setIssues] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        // Hydration safe data initialization
        const initializeData = () => {
            try {
                let merged = [...mockDbData.complaints];

                // 1. Merge locally created complaints
                const localStr = localStorage.getItem("hostel_new_complaints_demo");
                const localComplaints: Complaint[] = localStr ? JSON.parse(localStr) : [];

                const apiIds = new Set(merged.map(c => c.id));
                const newLocal = localComplaints.filter(c => !apiIds.has(c.id));
                merged = [...newLocal, ...merged];

                // 2. Apply admin status overrides
                const statusStr = localStorage.getItem("hostel_status_updates_demo");
                const statusUpdates: Record<string, string> = statusStr ? JSON.parse(statusStr) : {};

                merged = merged.map(c => {
                    if (statusUpdates[c.id]) {
                        return { ...c, status: statusUpdates[c.id] };
                    }
                    return c;
                });

                // 3. Filter out deleted complaints
                const deletedStr = localStorage.getItem("hostel_deleted_complaints_demo");
                if (deletedStr) {
                    const deletedIds = new Set(JSON.parse(deletedStr));
                    merged = merged.filter(c => !deletedIds.has(c.id));
                }

                // Resort by priority
                merged.sort((a, b) => b.priorityScore - a.priorityScore);

                setIssues(merged);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        initializeData();
    }, []);

    // Legacy api call approach removed to prevent hydration mismatch and fix state loading

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            // Optimistic Update & LocalStorage Sync
            const statusStr = localStorage.getItem("hostel_status_updates_demo");
            const statusUpdates: Record<string, string> = statusStr ? JSON.parse(statusStr) : {};
            statusUpdates[id] = newStatus;
            localStorage.setItem("hostel_status_updates_demo", JSON.stringify(statusUpdates));

            // Instantly update the issues state
            setIssues(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));

            const res = await fetch(`/api/complaints/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus })
            });

            if (!res.ok) {
                console.error("Failed to update status on server");
            }
        } catch (e) {
            console.error("Error updating status:", e);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this ticket?")) return;

        // Optimistic UI update
        setIssues(prev => prev.filter(c => c.id !== id));

        // LocalStorage Sync for Deletions
        const localStr = localStorage.getItem("hostel_new_complaints_demo");
        if (localStr) {
            const localComplaints: Complaint[] = JSON.parse(localStr);
            const filteredLocal = localComplaints.filter(c => c.id !== id);
            localStorage.setItem("hostel_new_complaints_demo", JSON.stringify(filteredLocal));
        }

        const deletedStr = localStorage.getItem("hostel_deleted_complaints_demo");
        const deletedIds: string[] = deletedStr ? JSON.parse(deletedStr) : [];
        if (!deletedIds.includes(id)) {
            deletedIds.push(id);
            localStorage.setItem("hostel_deleted_complaints_demo", JSON.stringify(deletedIds));
        }

        try {
            const res = await fetch(`/api/complaints/${id}`, { method: "DELETE" });
            if (!res.ok) {
                console.error("Failed to delete complaint on server");
            }
        } catch (e) {
            console.error("Error deleting complaint:", e);
        }
    };

    const getPriorityColor = (label: string) => {
        if (label.includes("High") || label.includes("Critical")) return "bg-red-50 text-red-600 border-red-200";
        if (label.includes("Medium")) return "bg-blue-50 text-blue-600 border-blue-200";
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    };

    const filteredComplaints = issues.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.hostel.toLowerCase().includes(search.toLowerCase()) ||
            c.room.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = statusFilter === "All" || c.status === statusFilter;
        return matchesSearch && matchesFilter;
    });

    const exportCSV = () => {
        const headers = ["Ticket ID", "Student", "Hostel", "Room", "Priority Score", "Priority Label", "Status", "Date", "Description"];
        const rows = filteredComplaints.map(c => {
            const calculatedScore = (0.4 * c.severity + 0.3 * c.votes + 0.2 * c.daysPending).toFixed(2);
            const safeDesc = `"${(c.description || "").replace(/"/g, '""')}"`;
            return [
                c.id, c.createdBy, c.hostel, c.room, calculatedScore, c.priorityLabel, c.status, new Date(c.createdAt).toLocaleDateString(), safeDesc
            ];
        });
        const csvContent = headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "FixMyHostel_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white shadow-sm p-4 rounded-2xl border border-slate-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-800" />
                    <input
                        type="text"
                        placeholder="Search tickets, rooms, hostels..."
                        value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-none text-sm"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-xl border border-slate-100 glass text-slate-800 focus:outline-none text-sm  transition-colors"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                    <button
                        onClick={exportCSV}
                        className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-blue-600 text-white flex items-center justify-center font-medium text-sm hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-slate-100 rounded-2xl overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50/80 text-slate-800 border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-medium">Ticket / Issue</th>
                            <th className="px-6 py-4 font-medium">Location</th>
                            <th className="px-6 py-4 font-medium">Priority Score</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium">Votes</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="text-center py-10"><div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
                        ) : filteredComplaints.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-10 text-slate-800">No tickets found</td></tr>
                        ) : (
                            <AnimatePresence>
                                {filteredComplaints.map((c, i) => (
                                    <motion.tr
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }} transition={{ delay: i * 0.05 }}
                                        key={c.id}
                                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800 group-hover:text-blue-400 transition-colors">{c.title}</div>
                                            <div className="text-xs text-slate-800">{c.category} • {new Date(c.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>{c.hostel}</div>
                                            <div className="text-xs text-slate-800">Fl. {c.floor} • Rm {c.room}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getPriorityColor(c.priorityLabel)}`}>
                                                {c.priorityLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 min-w-[130px]">
                                                {c.status === 'Resolved' && <CheckCircle className="w-4 h-4 text-emerald-500 hidden sm:block" />}
                                                {c.status !== 'Resolved' && <AlertCircle className={`w-4 h-4 ${c.status === 'Pending' ? 'text-amber-500' : 'text-blue-500'} hidden sm:block`} />}
                                                <select
                                                    value={c.status}
                                                    onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                                    className={`bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors shadow-sm cursor-pointer
                                                        ${c.status === 'Resolved' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                                            c.status === 'In Progress' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                                                                'text-amber-600 bg-amber-50 border-amber-100'}`}
                                                >
                                                    <option value="Pending" className="text-amber-600 font-semibold">Pending</option>
                                                    <option value="In Progress" className="text-blue-600 font-semibold">In Progress</option>
                                                    <option value="Resolved" className="text-emerald-600 font-semibold">Resolved</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{c.votes}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <select className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-500">
                                                    <option>Assign Worker</option>
                                                    <option>Plumber John</option>
                                                    <option>Electrician Mike</option>
                                                </select>
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    className="px-3 py-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:text-red-700 hover:border-red-300 rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                                >
                                                    Delete
                                                </button>
                                                <button className="p-1.5 text-slate-800 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
