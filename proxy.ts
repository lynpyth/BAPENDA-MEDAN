import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/", "/login", "/register", "/informasi", "/layanan", "/pajak-daerah", "/panduan",
  "/api/auth", "/api/tax/check", "/api/gis", "/api/cms/news", "/api/announcements",
  "/api/uploadthing", "/api/chatbot",
];

export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isPublic) return NextResponse.next();

  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/api/profile") || pathname.startsWith("/api/notifications");
  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token?.role as string;

  if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN" && role !== "DEVELOPER" && role !== "OFFICER") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (pathname.startsWith("/dashboard/mahasiswa") && role !== "MAHASISWA" && role !== "ADMIN" && role !== "DEVELOPER") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo-.*\\.webp).*)"],
};
