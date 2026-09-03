import { NextResponse } from "next/server";
import { getSafeUsersList } from "@/lib/auth-users";

export async function GET() {
  try {
    const users = getSafeUsersList();
    return NextResponse.json({ success: true, users });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}
