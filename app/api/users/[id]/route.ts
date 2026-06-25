import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AuditService } from "@/lib/services/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Users can only update their own profile; admins can update anyone
    if (session.user.id !== id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, phone, address } = body;

    const oldUser = await prisma.user.findUnique({ where: { id } });
    if (!oldUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
      },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true },
    });

    await AuditService.log({
      userId: session.user.id,
      action: "UPDATE_PROFILE",
      table: "User",
      recordId: id,
      oldValue: oldUser,
      newValue: updated,
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("[USER_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    if (id === session.user.id) {
       return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const oldUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!oldUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has relations to prevent database constraint errors and preserve financial history
    const hasRelations = await prisma.user.findFirst({
      where: {
        id,
        OR: [
          { taxObjects: { some: {} } },
          { payments: { some: {} } },
          { sppts: { some: {} } },
          { taxSubmissions: { some: {} } },
        ]
      }
    });

    if (hasRelations) {
      await prisma.user.update({
        where: { id },
        data: { isActive: false }
      });

      await AuditService.log({
        userId: session.user.id,
        action: "SOFT_DELETE_USER",
        table: "User",
        recordId: id,
        oldValue: oldUser,
        newValue: { ...oldUser, isActive: false },
      });
    } else {
      await prisma.user.delete({ where: { id } });

      await AuditService.log({
        userId: session.user.id,
        action: "DELETE_USER",
        table: "User",
        recordId: id,
        oldValue: oldUser,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[USER_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
