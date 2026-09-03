import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { findAuthUser, verifyUserPassword } from "@/lib/auth-users";

const JWT_SECRET = process.env.JWT_SECRET || "fix_my_hostel_super_secure_jwt_secret_2026";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const { email, password, role } = body || {};

    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    // 1. Look up user by email and expected role
    const expectedRole = role ? String(role).toLowerCase() : undefined;
    const user = findAuthUser(email, expectedRole);

    if (!user) {
      return NextResponse.json(
        { error: `Account not found for ${email}${expectedRole ? ` with role '${expectedRole}'` : ""}. Please check your credentials.` },
        { status: 401 }
      );
    }

    // 2. Verify password with bcrypt hash
    const isValid = await verifyUserPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    // 3. Create safe profile
    const { passwordHash, ...safeUser } = user;

    // 4. Sign JWT session token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hostel: user.hostel,
        room: user.room,
        studentId: user.studentId,
        title: user.title,
        avatar: user.avatar,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Build response and set HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Authentication successful",
        user: safeUser,
        token,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error("[Auth API] Login exception:", error);
    return NextResponse.json(
      { error: "An unexpected server error occurred during login." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.delete("auth_token");
  return response;
}
