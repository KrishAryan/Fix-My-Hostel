"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { AlertCircle, CheckCircle2, Clock, Ticket } from "lucide-react";
import { Complaint } from "@/lib/mockDb";
import mockDbData from "@/data/db.json";

const COLORS = ['#2563eb', '#db2777', '#ca8a04', '#16a34a', '#9333ea', '#ea580c'];
const PRIORITY_COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#3b82f6', Low: '#71717a' };

export default function AdminDashboard() {
    const [issues, setIssues] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Overview");

    useEffect(() => {
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

    if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div></div>;

    // Derived Analytics Data
    const total = issues.length;
    const critical = issues.filter(c => c.priorityLabel === "Critical").length;
    const resolved = issues.filter(c => c.status === "Resolved").length;
    const avgResolutionTime = "1.2 Days"; // Mocked for demo

    // Category Breakdown Data
    const categoryCounts = issues.reduce((acc: any, c) => {
        acc[c.category] = (acc[c.category] || 0) + 1;
        return acc;
    }, {});
    const categoryData = Object.keys(categoryCounts).map(k => ({ name: k, value: categoryCounts[k] }));

    // Status Data
    const statusCounts = issues.reduce((acc: any, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {});
    const statusData = Object.keys(statusCounts).map(k => ({ name: k, value: statusCounts[k] }));

    // Priority Data
    const priorityCounts = issues.reduce((acc: any, c) => {
        acc[c.priorityLabel] = (acc[c.priorityLabel] || 0) + 1;
        return acc;
    }, {});
    const priorityData = Object.keys(priorityCounts).map(k => ({ name: k, value: priorityCounts[k] }));

    // Resolution Trend Data
    const resolutionData = [
        { name: 'Mon', avgDays: 1.1 }, { name: 'Tue', avgDays: 1.3 }, { name: 'Wed', avgDays: 0.9 },
        { name: 'Thu', avgDays: 1.5 }, { name: 'Fri', avgDays: 1.2 }, { name: 'Sat', avgDays: 1.0 }, { name: 'Sun', avgDays: 1.2 }
    ];

    // 30-Day Trend Data
    const trendData = Array.from({ length: 30 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const dayStr = `${date.getMonth() + 1}/${date.getDate()}`;
        // Base volume plus some randomness based on the day
        const base = 5 + Math.floor(Math.random() * 10) + (i % 7 === 0 ? -3 : 2);
        return {
            name: dayStr,
            Total: base,
            Resolved: Math.floor(base * 0.7),
            Pending: Math.floor(base * 0.3)
        };
    });

    // Per-Block Distribution (Hostel Comparison)
    const hostelData = [
        { name: 'Block A', Plumbing: 4, Electrical: 2, Internet: 1 },
        { name: 'Block B', Plumbing: 2, Electrical: 5, Internet: 3 },
        { name: 'Block C', Plumbing: 1, Electrical: 1, Internet: 4 },
    ];

    // Weekly Trend Data (New vs Resolved)
    const weeklyTrendData = [
        { name: 'Mon', New: 12, Resolved: 8 },
        { name: 'Tue', New: 15, Resolved: 10 },
        { name: 'Wed', New: 8, Resolved: 12 },
        { name: 'Thu', New: 14, Resolved: 11 },
        { name: 'Fri', New: 10, Resolved: 9 },
        { name: 'Sat', New: 5, Resolved: 14 },
        { name: 'Sun', New: 6, Resolved: 8 },
    ];

    // Category Resolution Time
    const categoryResolutionData = [
        { name: 'Plumbing', avgDays: 1.5 },
        { name: 'Electrical', avgDays: 1.2 },
        { name: 'Internet', avgDays: 0.8 },
        { name: 'Furniture', avgDays: 2.1 },
        { name: 'Cleaning', avgDays: 0.5 }
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), inset 0 0 0 1px rgba(59, 130, 246, 0.1)" }} transition={{ duration: 0.2 }} className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200"><Ticket className="w-6 h-6" /></motion.div>
                        <div>
                            <div className="text-slate-500 text-sm">Total Tickets</div>
                            <div className="text-2xl font-bold text-slate-800">{total}</div>
                        </div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.1), inset 0 0 0 1px rgba(239, 68, 68, 0.1)" }} transition={{ delay: 0.1, duration: 0.2 }} className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="p-3 bg-red-100 text-red-600 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors duration-200"><AlertCircle className="w-6 h-6" /></motion.div>
                        <div>
                            <div className="text-slate-500 text-sm">Critical Issues</div>
                            <div className="text-2xl font-bold text-slate-800">{critical}</div>
                        </div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.1), inset 0 0 0 1px rgba(34, 197, 94, 0.1)" }} transition={{ delay: 0.2, duration: 0.2 }} className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="p-3 bg-green-100 text-green-600 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-colors duration-200"><CheckCircle2 className="w-6 h-6" /></motion.div>
                        <div>
                            <div className="text-slate-500 text-sm">Resolved</div>
                            <div className="text-2xl font-bold text-slate-800">{resolved}</div>
                        </div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.1), inset 0 0 0 1px rgba(234, 179, 8, 0.1)" }} transition={{ delay: 0.3, duration: 0.2 }} className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="p-3 bg-yellow-100 text-yellow-600 rounded-xl group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-200"><Clock className="w-6 h-6" /></motion.div>
                        <div>
                            <div className="text-slate-500 text-sm">Avg Resolution</div>
                            <div className="text-2xl font-bold text-slate-800">{avgResolutionTime}</div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mt-8 mb-6 border-b border-slate-100 pb-2">
                {["Overview", "Analytics"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all ${activeTab === tab
                            ? "bg-blue-50 text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === "Overview" && (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        {/* Weekly Trend (Full Width in Overview now) */}
                        <motion.div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
                            <h3 className="text-lg font-semibold mb-6 text-slate-800">Weekly Complaints (New vs Resolved)</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer>
                                    <LineChart data={weeklyTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="name" stroke="#1e293b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#1e293b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} itemStyle={{ color: '#1e293b' }} />
                                        <Legend wrapperStyle={{ fontSize: '12px', color: '#1e293b' }} />
                                        <Line type="monotone" dataKey="New" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </motion.div>

                        {/* Charts Grid Row 1: Status & Priority (Side-by-side) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col items-center">
                                <h3 className="text-lg font-semibold mb-6 w-full text-slate-800">Status Split (Pie Chart)</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={statusData} innerRadius={0} outerRadius={80} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={{ stroke: '#1e293b' }}>
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} itemStyle={{ color: '#1e293b' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col items-center">
                                <h3 className="text-lg font-semibold mb-6 w-full text-slate-800">Priority Levels (Doughnut)</h3>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie data={priorityData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label={false}>
                                                {priorityData.map((entry) => (
                                                    // @ts-ignore
                                                    <Cell key={`cell-${entry.name}`} fill={PRIORITY_COLORS[entry.name] || '#888'} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} itemStyle={{ color: '#1e293b' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex gap-4 mt-4 flex-wrap justify-center text-sm">
                                    {Object.keys(PRIORITY_COLORS).map(rk => (
                                        <div key={rk} className="flex items-center gap-1.5 text-slate-800">
                                            {/* @ts-ignore */}
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PRIORITY_COLORS[rk] }}></div>
                                            {rk}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === "Analytics" && (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Block-wise Breakdown (Using Bar Chart as approximation) */}
                            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
                                <h3 className="text-lg font-semibold mb-6 text-slate-800">Block-wise Distribution</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer>
                                        <BarChart data={hostelData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                            <XAxis dataKey="name" stroke="#1e293b" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis stroke="#1e293b" fontSize={12} tickLine={false} axisLine={false} />
                                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} itemStyle={{ color: '#1e293b' }} />
                                            <Legend wrapperStyle={{ fontSize: '12px', color: '#1e293b' }} />
                                            <Bar dataKey="Plumbing" stackId="a" fill="#3b82f6" />
                                            <Bar dataKey="Electrical" stackId="a" fill="#f59e0b" />
                                            <Bar dataKey="Internet" stackId="a" fill="#8b5cf6" />
                                            <Bar dataKey="Furniture" stackId="a" fill="#64748b" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Resolution Time by Category */}
                            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
                                <h3 className="text-lg font-semibold mb-6 text-slate-800">Avg Resolution Time by Category</h3>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer>
                                        <BarChart layout="vertical" data={categoryResolutionData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                                            <XAxis type="number" stroke="#1e293b" fontSize={12} tickLine={false} axisLine={false} />
                                            <YAxis type="category" dataKey="name" stroke="#1e293b" fontSize={12} tickLine={false} axisLine={false} width={80} />
                                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} itemStyle={{ color: '#1e293b' }} />
                                            <Bar dataKey="avgDays" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24} name="Avg Days" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Charts Grid Row 2: 30-Day Trend (Full Width) */}
                        <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-100">
                            <h3 className="text-lg font-semibold mb-6 text-slate-800">30-Day Trend: Complaints Volume</h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer>
                                    <AreaChart data={trendData}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                        <XAxis dataKey="name" stroke="#1e293b" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#1e293b" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }} itemStyle={{ color: '#1e293b' }} />
                                        <Area type="monotone" dataKey="Total" stroke="#94a3b8" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                                        <Area type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
                                        <Area type="monotone" dataKey="Pending" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorPending)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
