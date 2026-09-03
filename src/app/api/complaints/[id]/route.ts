import { NextResponse } from 'next/server';
import { readDB, writeDB } from '@/lib/mockDb';

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const db = readDB();

        const initialLength = db.complaints.length;
        db.complaints = db.complaints.filter((c: any) => c.id !== id);

        if (db.complaints.length === initialLength) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        writeDB(db);

        return NextResponse.json({ success: true, message: 'Complaint deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete complaint' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();
        const db = readDB();

        const complaintIndex = db.complaints.findIndex((c: any) => c.id === id);

        if (complaintIndex === -1) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        db.complaints[complaintIndex] = {
            ...db.complaints[complaintIndex],
            status: body.status,
            updatedAt: new Date().toISOString()
        };

        writeDB(db);

        return NextResponse.json({ success: true, complaint: db.complaints[complaintIndex] });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
    }
}
