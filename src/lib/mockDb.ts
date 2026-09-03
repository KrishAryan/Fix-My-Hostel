import fs from 'fs';
import path from 'path';
import { getCategoryWeight, calculatePriority } from './utils';

export { calculatePriority, getCategoryWeight };

// Define the data paths
const dataFile = path.join(process.cwd(), 'src', 'data', 'db.json');

// Interface definition
export interface User {
  id: string;
  name: string;
  role: string;
  email: string;
  password?: string;
  hostel?: string;
  room?: string;
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: number;
  hostel: string;
  floor: number;
  room: string;
  imageUrl?: string;
  status: string; // "Pending", "In Progress", "Resolved"
  votes: number;
  daysPending: number;
  priorityScore: number;
  priorityLabel: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Database {
  users: User[];
  complaints: Complaint[];
}

let memoryDb: Database | null = null;

export const readDB = (): Database => {
  if (memoryDb) return memoryDb;
  try {
    const rawData = fs.readFileSync(dataFile, 'utf8');
    memoryDb = JSON.parse(rawData);
    return memoryDb as Database;
  } catch (err) {
    console.error("Error reading mock DB", err);
    return { users: [], complaints: [] };
  }
};

export const writeDB = (data: Database): void => {
  // Only update in-memory storage, do not write to file system
  memoryDb = data;
};



export const updatePriorities = () => {
  const db = readDB();
  db.complaints = db.complaints.map(complaint => {
    if (complaint.status !== "Resolved") {
      const daysPending = Math.floor((new Date().getTime() - new Date(complaint.createdAt).getTime()) / (1000 * 3600 * 24));
      const newPriority = calculatePriority(complaint.severity, complaint.votes, daysPending, complaint.category);
      return {
        ...complaint,
        daysPending,
        priorityScore: newPriority.score,
        priorityLabel: newPriority.label
      };
    }
    return complaint;
  });
  writeDB(db);
};
