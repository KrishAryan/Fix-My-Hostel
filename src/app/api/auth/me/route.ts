import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { findAuthUser } from "@/lib/auth-users";

const JWT_SECRET = process.env.JWT_SECRET || "fix_my_hostel_super_secure_jwt_secret_2026";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = findAuthUser(decoded.email, decoded.role);
    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const { passwordHash, ...safeUser } = user;

    return NextResponse.json({
      authenticated: true,
      user: safeUser,
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 });
  }
}
