"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ThumbsUp, Clock, AlertTriangle, ArrowUpRight, X, Image as ImageIcon, Building, Ticket, AlertCircle, CheckCircle2, Zap, Droplets, Armchair, Sparkles, Wifi, Shield, Bug, MoreHorizontal, CloudUpload } from "lucide-react";
import { Complaint } from "@/lib/mockDb";
import { calculatePriority } from "@/lib/utils";
import mockDbData from "@/data/db.json";

export default function StudentDashboard() {
    const [issues, setIssues] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [votedSet, setVotedSet] = useState<Set<string>>(new Set());
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [activeTab, setActiveTab] = useState("Dashboard");

    // Form State
    const [newComplaint, setNewComplaint] = useState({
        title: "",
        description: "",
        category: "Plumbing",
        severity: 5,
        hostel: "Block A",
        floor: 1,
        room: "",
        imageUrl: "" as string | null
    });
    const [submitting, setSubmitting] = useState(false);

    // Image Upload Logic
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewComplaint(prev => ({ ...prev, imageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        // Data Initialization: On app load, merge the 12 default complaints from db.json with any new complaints found in LocalStorage.
        // Ensure this logic is wrapped in a useEffect hook to prevent Next.js hydration errors.
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

    const handleVote = async (id: string) => {
        if (votedSet.has(id)) return; // Voting lock

        // Optimistic UI update: count increases in the UI instantly
        console.log("Vote Added to:", id);
        setVotedSet(new Set(votedSet).add(id));
        setIssues(prev => {
            const existing = Array.isArray(prev) ? prev : [];
            return existing.map(c => {
                if (c.id === id) {
                    const newVotes = c.votes + 1;
                    const newPriority = calculatePriority(c.severity, newVotes, c.daysPending, c.category);
                    return { ...c, votes: newVotes, priorityScore: newPriority.score, priorityLabel: newPriority.label };
                }
                return c;
            }).sort((a, b) => b.priorityScore - a.priorityScore);
        });

        // Do NOT save votes to LocalStorage so they reset to their original count on refresh.
        try {
            const res = await fetch(`/api/complaints/${id}/vote`, { method: "POST" });
            if (!res.ok) {
                console.error("Failed to persist vote");
            }
        } catch (e) {
            console.error(e);
        }
    };

    const getCalculatedSeverity = (cat: string, desc: string) => {
        if (cat === "Electrical" || cat === "Security" || cat === "Pest Control") return 4;
        if (cat === "Internet") return 5;
        if (cat === "Cleaning" || cat === "Plumbing") return 3;
        if (cat === "Furniture") return 1;

        if (cat === "Other") {
            const lowerDesc = desc.toLowerCase();
            const criticalWords = ['medical', 'fire', 'shock'];
            const highWords = ['leak', 'broken lock'];
            const mediumWords = ['fan', 'wifi', 'water'];

            if (criticalWords.some(w => lowerDesc.includes(w))) return 5;
            if (highWords.some(w => lowerDesc.includes(w))) return 4;
            if (mediumWords.some(w => lowerDesc.includes(w))) return 3;
            return 1;
        }

        return 1;
    };

    const handleTitleDescriptionChange = (field: "title" | "description", value: string) => {
        setNewComplaint(prev => ({ ...prev, [field]: value }));
    };

    const handleCategoryChange = (cat: string) => {
        setNewComplaint(prev => ({ ...prev, category: cat }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        // 1. Complaint Submission Fix
        const newComplaintOptimistic: Complaint = {
            id: `temp-${Date.now()}`,
            title: newComplaint.title,
            description: newComplaint.description,
            category: newComplaint.category,
            severity: newComplaint.severity,
            hostel: newComplaint.hostel,
            imageUrl: newComplaint.imageUrl || undefined,
            room: newComplaint.room.trim() || 'N/A',
            floor: Number(newComplaint.floor),
            createdBy: "student_demo",
            status: "Pending",
            votes: 0,
            daysPending: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            priorityScore: 0,
            priorityLabel: "Normal"
        };
        const calculatedPriority = calculatePriority(newComplaintOptimistic.severity, newComplaintOptimistic.votes, newComplaintOptimistic.daysPending, newComplaintOptimistic.category);
        newComplaintOptimistic.priorityScore = calculatedPriority.score;
        newComplaintOptimistic.priorityLabel = calculatedPriority.label;

        // Immediately add to issues state using functional update
        setIssues(prev => [newComplaintOptimistic, ...(Array.isArray(prev) ? prev : [])].sort((a, b) => b.priorityScore - a.priorityScore));

        // Save persistently to LocalStorage
        const localStr = localStorage.getItem("hostel_new_complaints_demo");
        const localComplaints = localStr ? JSON.parse(localStr) : [];
        localStorage.setItem("hostel_new_complaints_demo", JSON.stringify([newComplaintOptimistic, ...localComplaints]));

        setIsModalOpen(false);
        setNewComplaint({ ...newComplaint, title: "", description: "", severity: 5, room: "", imageUrl: null });

        try {
            const res = await fetch("/api/complaints", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newComplaintOptimistic)
            });
            if (res.ok) {
                const data = await res.json();
                console.log("New Issue Added via API:", data.complaint);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    const getPriorityColor = (label: string) => {
        if (label.includes("Critical")) return "bg-red-50 text-red-600 border-red-200";
        if (label.includes("High")) return "bg-orange-50 text-orange-600 border-orange-200";
        if (label.includes("Medium")) return "bg-blue-50 text-blue-600 border-blue-200";
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Resolved": return "text-emerald-500";
            case "In Progress": return "text-amber-500";
            default: return "text-slate-800";
        }
    };

    const total = issues.length;
    const pending = issues.filter(c => c.status === "Pending").length;
    const inProgress = issues.filter(c => c.status === "In Progress").length;
    const resolved = issues.filter(c => c.status === "Resolved").length;

    let displayComplaints = issues;
    if (activeTab === "My Complaints") {
        displayComplaints = issues.filter(c => c.createdBy === "student_demo" || c.createdBy === "student1");
    } else if (activeTab === "Dashboard") {
        // Show max 4 recent complaints on dashboard
        displayComplaints = issues.slice(0, 4);
    }

    const filteredComplaints = displayComplaints.filter(c => selectedCategory === "All" || c.category === selectedCategory);

    return (
        <div>
            {/* Top Navigation Menu (Tabs) */}
            <div className="flex flex-wrap items-center gap-1 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit mb-8 shadow-sm">
                {["Dashboard", "New Complaint", "My Complaints", "All Issues"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => {
                            if (tab === "New Complaint") {
                                setIsModalOpen(true);
                            } else {
                                setActiveTab(tab);
                                setSelectedCategory("All"); // Reset filter on tab change
                            }
                        }}
                        className={`px-5 py-2 md:px-6 md:py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === tab && tab !== "New Complaint"
                            ? "bg-blue-50 text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                            }`}
                    >
                        {tab === "New Complaint" ? (
                            <span className="flex items-center gap-2 text-primary">
                                <Plus className="w-4 h-4" /> New Complaint
                            </span>
                        ) : tab}
                    </button>
                ))}
            </div>

            {/* KPI Section - Visible only on Dashboard */}
            {activeTab === "Dashboard" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1), inset 0 0 0 1px rgba(59, 130, 246, 0.1)" }} transition={{ duration: 0.2 }} className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer">
                        <div>
                            <div className="text-slate-500 text-sm mb-1">Total Complaints</div>
                            <div className="text-2xl font-bold text-slate-800">{total}</div>
                        </div>
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="p-2.5 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200"><Ticket className="w-5 h-5" /></motion.div>
                    </motion.div>
                    <motion.div whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.1), inset 0 0 0 1px rgba(234, 179, 8, 0.1)" }} transition={{ duration: 0.2 }} className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer">
                        <div>
                            <div className="text-slate-500 text-sm mb-1">Pending</div>
                            <div className="text-2xl font-bold text-slate-800">{pending}</div>
                        </div>
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="p-2.5 bg-yellow-100 text-yellow-600 rounded-xl group-hover:bg-yellow-500 group-hover:text-white transition-colors duration-200"><Clock className="w-5 h-5" /></motion.div>
                    </motion.div>
                    <motion.div whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(249, 115, 22, 0.1), inset 0 0 0 1px rgba(249, 115, 22, 0.1)" }} transition={{ duration: 0.2 }} className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer">
                        <div>
                            <div className="text-slate-500 text-sm mb-1">In Progress</div>
                            <div className="text-2xl font-bold text-slate-800">{inProgress}</div>
                        </div>
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="p-2.5 bg-orange-100 text-orange-600 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors duration-200"><AlertCircle className="w-5 h-5" /></motion.div>
                    </motion.div>
                    <motion.div whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(34, 197, 94, 0.1), inset 0 0 0 1px rgba(34, 197, 94, 0.1)" }} transition={{ duration: 0.2 }} className="p-4 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-between group cursor-pointer">
                        <div>
                            <div className="text-slate-500 text-sm mb-1">Resolved</div>
                            <div className="text-2xl font-bold text-slate-800">{resolved}</div>
                        </div>
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} transition={{ duration: 0.2 }} className="p-2.5 bg-green-100 text-green-600 rounded-xl group-hover:bg-green-500 group-hover:text-white transition-colors duration-200"><CheckCircle2 className="w-5 h-5" /></motion.div>
                    </motion.div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                    {activeTab === "Dashboard" ? "Recent Activity" : activeTab}
                </h2>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
                {["All", "Plumbing", "Electrical", "Internet", "Furniture", "Cleaning"].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full border text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                            ? 'bg-primary text-white border-primary shadow-sm'
                            : 'bg-white border-slate-100 text-slate-800 hover:text-slate-800 hover:bg-slate-50'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <AnimatePresence>
                        {filteredComplaints.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-slate-800">No complaints found for "{selectedCategory}"</div>
                        ) : (
                            filteredComplaints.map((complaint, i) => (
                                <motion.div
                                    key={complaint.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                    whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(59, 130, 246, 0.2)" }}
                                    transition={{ delay: i * 0.05, duration: 0.2 }}
                                    className="glass-card p-6 flex flex-col group relative overflow-hidden cursor-pointer"
                                >
                                    <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-50"></div>

                                    <div className="flex justify-between items-start mb-4">
                                        <div className="w-full">
                                            {complaint.imageUrl && (
                                                <div className="w-full h-32 rounded-xl overflow-hidden mb-4 border border-slate-100 relative">
                                                    <img src={complaint.imageUrl} alt="Issue Evidence" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getPriorityColor(complaint.priorityLabel)}`}>
                                                    {complaint.priorityLabel.includes("Priority") ? complaint.priorityLabel : `${complaint.priorityLabel} Priority`}
                                                </span>
                                                <span className={`text-xs font-semibold ${getStatusColor(complaint.status)}`}>
                                                    • {complaint.status}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{complaint.title}</h3>
                                            <p className="text-slate-500 text-sm mt-1 line-clamp-2">{complaint.description}</p>
                                        </div>
                                    </div>

                                    {activeTab === "My Complaints" && (
                                        <div className="mb-6 px-2">
                                            <div className="relative flex justify-between items-center w-full">
                                                {/* Timeline Background Track */}
                                                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>

                                                {/* Timeline Active Track */}
                                                <div
                                                    className="absolute top-1/2 left-0 h-1 bg-blue-500 -translate-y-1/2 rounded-full z-0 transition-all duration-500"
                                                    style={{
                                                        width: complaint.status === 'Resolved' ? '100%' :
                                                            complaint.status === 'In Progress' ? '66%' :
                                                                '33%'
                                                    }}
                                                ></div>

                                                {/* Stages */}
                                                {['Reported', 'Acknowledged', 'In Progress', 'Resolved'].map((stage, idx) => {
                                                    let isActive = false;
                                                    if (complaint.status === 'Resolved') isActive = true;
                                                    else if (complaint.status === 'In Progress' && idx <= 2) isActive = true;
                                                    else if (complaint.status === 'Pending' && idx <= 1) isActive = true; // Giving them Acknowledged automatically for Pending to show 2 steps out of 4 for better UX, or just 1. Let's make Pending = Reported only.

                                                    // Strict mapping
                                                    isActive = false;
                                                    if (idx === 0) isActive = true; // Reported always active
                                                    else if (idx === 1 && (complaint.status === 'In Progress' || complaint.status === 'Resolved')) isActive = true;
                                                    else if (idx === 2 && (complaint.status === 'In Progress' || complaint.status === 'Resolved')) isActive = true;
                                                    else if (idx === 3 && complaint.status === 'Resolved') isActive = true;

                                                    return (
                                                        <div key={stage} className="relative z-10 flex flex-col items-center gap-2">
                                                            <div className={`w-4 h-4 rounded-full border-2 bg-white transition-colors duration-300 ${isActive ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-300'}`}>
                                                                {isActive && <div className="w-full h-full bg-blue-500 rounded-full scale-50"></div>}
                                                            </div>
                                                            <span className={`text-[10px] sm:text-xs font-semibold absolute top-6 whitespace-nowrap ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                                                                {stage}
                                                            </span>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                            {/* Spacer for the absolute positioned text below the timeline */}
                                            <div className="h-4"></div>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center gap-4 mt-auto pt-4 border-t border-slate-100 text-sm text-slate-800">
                                        <span className="flex items-center gap-1"><Building className="w-4 h-4" /> {complaint.hostel}, Room {complaint.room}</span>
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {complaint.daysPending}d ago</span>

                                        {activeTab === "All Issues" ? (
                                            <button
                                                onClick={() => handleVote(complaint.id)}
                                                disabled={votedSet.has(complaint.id)}
                                                className={`ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all border ${votedSet.has(complaint.id)
                                                    ? "bg-blue-100 text-blue-600 border-primary/50 cursor-not-allowed opacity-80"
                                                    : "bg-white shadow-sm hover:bg-primary/20 hover:text-primary text-slate-800 border-slate-100 active:scale-95"
                                                    }`}
                                            >
                                                <ThumbsUp className="w-4 h-4" />
                                                <span className="font-semibold text-slate-800">{complaint.votes}</span>
                                            </button>
                                        ) : (
                                            <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-slate-50 border-slate-100 text-slate-800 shadow-sm cursor-default">
                                                <ThumbsUp className="w-4 h-4 text-slate-500" />
                                                <span className="font-semibold text-slate-800">{complaint.votes}</span>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )))}
                    </AnimatePresence>
                </div>
            )}

            {/* Raise Complaint Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#f8fafc] w-full max-w-5xl relative z-10 border border-slate-100 shadow-2xl flex flex-col max-h-[90vh] rounded-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center px-8 py-5 border-b border-slate-100 bg-white z-20 shadow-sm relative">
                                <div>
                                    <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                                        <Plus className="w-5 h-5 text-blue-600" />
                                        Raise New Complaint
                                    </h3>
                                    <p className="text-slate-500 text-sm mt-0.5">Please provide details so we can assist you quickly.</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-800 transition-colors bg-slate-50 hover:bg-slate-100 p-2 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 md:p-8 overflow-y-auto hide-scrollbar">
                                <form id="complaint-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    {/* Left Column: Form Details (66%) */}
                                    <div className="lg:col-span-2 space-y-6">

                                        {/* Issue Title */}
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <label className="block text-sm font-semibold text-slate-800 mb-2">Issue Title</label>
                                            <input
                                                required type="text"
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none placeholder:text-slate-400 transition-all"
                                                placeholder="E.g. Leaking pipe in bathroom"
                                                value={newComplaint.title} onChange={e => handleTitleDescriptionChange("title", e.target.value)}
                                            />
                                        </div>

                                        {/* Category Grid */}
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <label className="block text-sm font-semibold text-slate-800 mb-3">Problem Category</label>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {[
                                                    { id: "Electrical", icon: Zap },
                                                    { id: "Plumbing", icon: Droplets },
                                                    { id: "Furniture", icon: Armchair },
                                                    { id: "Cleaning", icon: Sparkles },
                                                    { id: "Internet", icon: Wifi },
                                                    { id: "Security", icon: Shield },
                                                    { id: "Pest Control", icon: Bug },
                                                    { id: "Other", icon: MoreHorizontal }
                                                ].map(cat => (
                                                    <button
                                                        key={cat.id}
                                                        type="button"
                                                        onClick={() => handleCategoryChange(cat.id)}
                                                        className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${newComplaint.category === cat.id
                                                            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/10'
                                                            : 'border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-200'
                                                            }`}
                                                    >
                                                        <cat.icon className="w-5 h-5 mb-1" />
                                                        <span className="text-xs font-semibold">{cat.id}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Severity Level Slider (1 to 10) */}
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-800">
                                                        Severity Level
                                                    </label>
                                                    <p className="text-xs text-slate-400 mt-0.5">Move the slider to specify problem urgency</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-black border tracking-wide transition-all ${
                                                        newComplaint.severity >= 9
                                                            ? 'bg-red-50 text-red-600 border-red-200 shadow-xs animate-pulse'
                                                            : newComplaint.severity >= 7
                                                            ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-xs'
                                                            : newComplaint.severity >= 4
                                                            ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-xs'
                                                            : 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-xs'
                                                    }`}>
                                                        Level {newComplaint.severity} / 10
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2 mt-4">
                                                <input
                                                    type="range"
                                                    min="1"
                                                    max="10"
                                                    step="1"
                                                    value={newComplaint.severity}
                                                    onChange={e => setNewComplaint(prev => ({ ...prev, severity: Number(e.target.value) }))}
                                                    className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none"
                                                />
                                                <div className="flex justify-between text-xs font-semibold text-slate-400 px-1 pt-1">
                                                    <span>1 (Minor)</span>
                                                    <span>5 (Moderate)</span>
                                                    <span>10 (Emergency)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-2">Hostel</label>
                                                <select
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none appearance-none text-sm"
                                                    value={newComplaint.hostel} onChange={e => setNewComplaint({ ...newComplaint, hostel: e.target.value })}
                                                >
                                                    <option>Block A</option><option>Block B</option><option>Block C</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-2">Floor</label>
                                                <input
                                                    required type="number" min="0" max="10"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm"
                                                    value={newComplaint.floor} onChange={e => setNewComplaint({ ...newComplaint, floor: Number(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-2">Room</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none text-sm"
                                                    placeholder="Room (Optional)"
                                                    value={newComplaint.room} onChange={e => setNewComplaint({ ...newComplaint, room: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Description Section */}
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <label className="block text-sm font-semibold text-slate-800 mb-2">Description</label>
                                            <textarea
                                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none placeholder:text-slate-400 transition-all min-h-[120px] resize-y"
                                                placeholder="Please provide additional details about the issue..."
                                                value={newComplaint.description}
                                                onChange={e => handleTitleDescriptionChange("description", e.target.value)}
                                            ></textarea>
                                        </div>

                                        {/* Canva-Style Image Upload */}
                                        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                            <label className="block text-sm font-semibold text-slate-800 mb-2">Photo Evidence</label>
                                            <div className="relative border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors group overflow-hidden flex flex-col items-center justify-center text-center cursor-pointer min-h-[140px]">
                                                {newComplaint.imageUrl ? (
                                                    <div className="absolute inset-0 w-full h-full">
                                                        <img src={newComplaint.imageUrl} alt="Upload Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg backdrop-blur-sm bg-opacity-80">
                                                                Click to Replace Photo
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="py-6 px-4 flex flex-col items-center justify-center text-slate-800 group-hover:text-blue-600 transition-colors">
                                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                            <CloudUpload className="w-6 h-6 text-blue-500" />
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-800">Click to upload photo of the issue</span>
                                                        <span className="text-xs text-slate-400 mt-1">PNG, JPG, GIF up to 5MB</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Priority Preview (33%) */}
                                    <div className="lg:col-span-1 space-y-6">
                                        {(() => {
                                            const isCritical = newComplaint.severity >= 9;
                                            const isHigh = newComplaint.severity >= 7 && newComplaint.severity < 9;
                                            const isMedium = newComplaint.severity >= 4 && newComplaint.severity < 7;

                                            return (
                                                <>
                                                    {/* Live Priority Card Sync */}
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
                                                        <div className="w-full flex justify-between items-center mb-6">
                                                            <h3 className="text-sm font-bold text-slate-800 w-full text-center">Priority Preview</h3>
                                                        </div>

                                                        {/* Priority Orb with Icon */}
                                                        <div className={`w-36 h-36 rounded-full flex items-center justify-center mb-6 transition-all duration-500 ease-out ${
                                                            isCritical ? 'bg-red-50 border-[10px] border-red-100' :
                                                            isHigh ? 'bg-orange-50 border-[10px] border-orange-100' :
                                                            isMedium ? 'bg-blue-50 border-[10px] border-blue-100' :
                                                            'bg-emerald-50 border-[10px] border-emerald-100'
                                                        }`}>
                                                            <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all duration-500 ${
                                                                isCritical ? 'bg-red-500 shadow-red-500/40 text-white scale-110' :
                                                                isHigh ? 'bg-orange-500 shadow-orange-500/40 text-white scale-105' :
                                                                isMedium ? 'bg-blue-500 shadow-blue-500/40 text-white scale-100' :
                                                                'bg-emerald-500 shadow-emerald-500/40 text-white scale-95'
                                                            }`}>
                                                                <AlertTriangle className={`w-9 h-9 transition-transform duration-500 ${isCritical ? 'animate-pulse' : ''}`} />
                                                            </div>
                                                        </div>

                                                        {/* Priority Title */}
                                                        <h4 className={`text-xl font-black mb-2 transition-colors duration-500 ${
                                                            isCritical ? 'text-red-600' :
                                                            isHigh ? 'text-orange-600' :
                                                            isMedium ? 'text-blue-600' :
                                                            'text-emerald-600'
                                                        }`}>
                                                            {isCritical ? 'CRITICAL PRIORITY' :
                                                             isHigh ? 'HIGH PRIORITY' :
                                                             isMedium ? 'MEDIUM PRIORITY' :
                                                             'LOW PRIORITY'}
                                                        </h4>

                                                        <p className="text-xs text-slate-500 leading-relaxed max-w-[220px]">
                                                            {isCritical
                                                                ? 'Immediate emergency escalation for severe safety hazards and facility breakdowns.'
                                                                : isHigh
                                                                ? 'High urgency queue scheduled for rapid technician assignment.'
                                                                : isMedium
                                                                ? 'Standard priority ticket assigned to hostel maintenance staff.'
                                                                : 'Routine request resolved during regular maintenance rounds.'}
                                                        </p>
                                                    </div>

                                                    {/* Priority Guide */}
                                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                                        <h3 className="text-sm font-bold text-slate-800 mb-4">Priority Guide</h3>
                                                        <div className="space-y-3.5 text-xs">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-3 h-3 rounded-full bg-red-500 mt-0.5 shrink-0 ring-4 ring-red-50"></div>
                                                                <div>
                                                                    <div className="font-bold text-slate-800">Critical Priority</div>
                                                                    <div className="text-slate-500 text-xs leading-relaxed">Emergencies like fire, shocks, or severe hazards.</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-3 h-3 rounded-full bg-orange-500 mt-0.5 shrink-0 ring-4 ring-orange-50"></div>
                                                                <div>
                                                                    <div className="font-bold text-slate-800">High Priority</div>
                                                                    <div className="text-slate-500 text-xs leading-relaxed">Urgent issues like active leaks, power cuts, or broken locks.</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-3 h-3 rounded-full bg-blue-500 mt-0.5 shrink-0 ring-4 ring-blue-50"></div>
                                                                <div>
                                                                    <div className="font-bold text-slate-800">Medium Priority</div>
                                                                    <div className="text-slate-500 text-xs leading-relaxed">Standard maintenance (fans, Wi-Fi, room cleaning).</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-3 h-3 rounded-full bg-emerald-500 mt-0.5 shrink-0 ring-4 ring-emerald-50"></div>
                                                                <div>
                                                                    <div className="font-bold text-slate-800">Low Priority</div>
                                                                    <div className="text-slate-500 text-xs leading-relaxed">General queries or minor cosmetic inconveniences.</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </form>
                            </div>

                            {/* Sticky Footer */}
                            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-4 mt-auto z-20">
                                <button
                                    type="button" onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    form="complaint-form" type="submit" disabled={submitting}
                                    className="px-8 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitting ? "Submitting..." : (
                                        <>Submit Complaint <ArrowUpRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
