import { NextResponse } from 'next/server';
import { readDB, writeDB, calculatePriority, updatePriorities } from '@/lib/mockDb';

export async function GET(req: Request) {
    try {
        updatePriorities();
        const { searchParams } = new URL(req.url);
        const hostel = searchParams.get("hostel");
        const status = searchParams.get("status");

        const db = readDB();
        let complaints = db.complaints;

        if (hostel && hostel !== "All") {
            complaints = complaints.filter(c => c.hostel === hostel);
        }
        if (status && status !== "All") {
            complaints = complaints.filter(c => c.status === status);
        }

        // Sort by priority descending implicitly
        complaints.sort((a, b) => b.priorityScore - a.priorityScore);

        return NextResponse.json({ success: true, complaints });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const db = readDB();

        const severityNum = Number(body.severity) || 1;
        const priority = calculatePriority(severityNum, 0, 0);

        const newComplaint = {
            id: `comp${Date.now()}`,
            ...body,
            severity: severityNum,
            status: "Pending",
            votes: 0,
            daysPending: 0,
            priorityScore: priority.score,
            priorityLabel: priority.label,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        db.complaints.push(newComplaint);
        writeDB(db);

        return NextResponse.json({ success: true, complaint: newComplaint });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
    }
}
