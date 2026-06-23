import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuditService } from "@/lib/services/audit";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !["ADMIN", "DEVELOPER", "OFFICER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nik: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: { select: { taxObjects: true, payments: true } },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("[USERS_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, name, email, phone, nik, role, isActive, password } = await req.json();
    const oldUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!oldUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const data: any = {
      ...(name !== undefined && { name }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(nik !== undefined && { nik }),
      ...(role !== undefined && { role }),
      ...(isActive !== undefined && { isActive }),
    };

    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        nik: true,
        phone: true,
        isActive: true,
      },
    });

    await AuditService.log({
      userId: session.user.id,
      action: "UPDATE_USER",
      table: "User",
      recordId: updated.id,
      oldValue: oldUser || undefined,
      newValue: updated,
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("[USER_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, email, password, role, nik, phone, address, isActive } = await req.json();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
        nik,
        phone,
        address,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    await AuditService.log({
      userId: session.user.id,
      action: "CREATE_USER",
      table: "User",
      recordId: user.id,
      newValue: { id: user.id, email: user.email, role: user.role },
    });

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error("[USER_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
