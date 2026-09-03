import { NextResponse } from 'next/server';
import { readDB, writeDB, calculatePriority } from '@/lib/mockDb';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const db = readDB();
        const complaintIndex = db.complaints.findIndex(c => c.id === params.id);

        if (complaintIndex === -1) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        const complaint = db.complaints[complaintIndex];
        complaint.votes += 1;

        // Recalculate priority
        const priority = calculatePriority(complaint.severity, complaint.votes, complaint.daysPending, complaint.category);
        complaint.priorityScore = priority.score;
        complaint.priorityLabel = priority.label;

        db.complaints[complaintIndex] = complaint;
        writeDB(db);

        return NextResponse.json({ success: true, complaint });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to vote' }, { status: 500 });
    }
}
