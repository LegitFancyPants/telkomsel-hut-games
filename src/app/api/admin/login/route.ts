import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // Standard Super Admin validation (admin / akutelkomsel or from env)
    const adminUser = process.env.ADMIN_USER || "admin";
    const adminPass = process.env.ADMIN_PASS || "akutelkomsel";

    if (username === adminUser && password === adminPass) {
      const token = await signToken({ role: "admin", username }, "24h");

      const response = NextResponse.json({
        success: true,
        message: "Login admin berhasil",
        token,
      });

      // Set HTTP-Only Cookie
      response.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { error: "Username atau password admin tidak valid" },
      { status: 401 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: "Terjadi kesalahan autentikasi" },
      { status: 500 }
    );
  }
}
