import bcrypt from "bcryptjs";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin";
  passwordHash: string;
  studentId?: string;
  hostel?: string;
  floor?: number;
  room?: string;
  title?: string;
  avatar?: string;
}

// Pre-computed bcrypt hash (10 salt rounds) for password: "password"
// Verified with bcrypt.compareSync("password", BCRYPT_PASSWORD_HASH) === true
const BCRYPT_PASSWORD_HASH = "$2b$10$R9BDSqXG8U0DfSCTTt/p2eJR8hzaQLZQQooK2Nft7VOZWHznLLBfe";

export const SEEDED_USERS: AuthUser[] = [
  // --- Student Accounts ---
  {
    id: "stu-001",
    name: "Aarav Sharma",
    email: "student1@hostel.edu",
    role: "student",
    passwordHash: BCRYPT_PASSWORD_HASH,
    studentId: "STU2026-001",
    hostel: "Block A",
    floor: 1,
    room: "101",
    avatar: "AS",
  },
  {
    id: "stu-002",
    name: "Ananya Iyer",
    email: "student2@hostel.edu",
    role: "student",
    passwordHash: BCRYPT_PASSWORD_HASH,
    studentId: "STU2026-002",
    hostel: "Block B",
    floor: 2,
    room: "204",
    avatar: "AI",
  },
  {
    id: "stu-003",
    name: "Rohan Verma",
    email: "student3@hostel.edu",
    role: "student",
    passwordHash: BCRYPT_PASSWORD_HASH,
    studentId: "STU2026-003",
    hostel: "Block A",
    floor: 3,
    room: "312",
    avatar: "RV",
  },
  {
    id: "stu-004",
    name: "Sneha Patel",
    email: "student4@hostel.edu",
    role: "student",
    passwordHash: BCRYPT_PASSWORD_HASH,
    studentId: "STU2026-004",
    hostel: "Block C",
    floor: 1,
    room: "108",
    avatar: "SP",
  },
  {
    id: "student1",
    name: "John Doe",
    email: "student@hostel.com",
    role: "student",
    passwordHash: BCRYPT_PASSWORD_HASH,
    studentId: "STU2026-000",
    hostel: "Block A",
    floor: 1,
    room: "101",
    avatar: "JD",
  },

  // --- Admin Accounts ---
  {
    id: "adm-001",
    name: "Dr. Vikram Seth",
    email: "admin1@hostel.edu",
    role: "admin",
    passwordHash: BCRYPT_PASSWORD_HASH,
    title: "Chief Hostel Administrator",
    avatar: "VS",
  },
  {
    id: "adm-002",
    name: "Prof. Rajesh Mehra",
    email: "warden@hostel.edu",
    role: "admin",
    passwordHash: BCRYPT_PASSWORD_HASH,
    title: "Resident Warden - Block A & B",
    avatar: "RM",
  },
  {
    id: "admin1",
    name: "System Admin",
    email: "admin@hostel.com",
    role: "admin",
    passwordHash: BCRYPT_PASSWORD_HASH,
    title: "Facilities Command Center",
    avatar: "SA",
  },
];

/**
 * Look up user by email (case-insensitive) and role
 */
export function findAuthUser(email: string, role?: string): AuthUser | undefined {
  const normalizedEmail = email.trim().toLowerCase();
  return SEEDED_USERS.find(
    (u) =>
      u.email.toLowerCase() === normalizedEmail &&
      (!role || u.role.toLowerCase() === role.toLowerCase())
  );
}

/**
 * Verify plain password against user's bcrypt hash
 */
export async function verifyUserPassword(plainPassword: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hash);
  } catch (err) {
    console.error("[Auth] Bcrypt comparison error:", err);
    return false;
  }
}

/**
 * Return sanitized user profile list without password hashes
 */
export function getSafeUsersList() {
  return SEEDED_USERS.map(({ passwordHash, ...safeUser }) => safeUser);
}
