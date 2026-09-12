import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Admin authorization required" } },
      { status: 403 }
    );
  }

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: { links: true },
        },
      },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatar: u.avatar,
      createdAt: u.createdAt,
      linksCount: u._count.links,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("[ADMIN_USERS_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to fetch users" } },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Admin authorization required" } },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("id");

    if (!userId) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "User ID is required" } },
        { status: 400 }
      );
    }

    if (userId === user.id) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "You cannot delete your own admin account" } },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({
      success: true,
      data: { message: "User deleted successfully", id: userId },
    });
  } catch (error) {
    console.error("[ADMIN_DELETE_USER_ERROR]", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to delete user" } },
      { status: 500 }
    );
  }
}
