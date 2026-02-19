import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";

export async function GET() {
  const settings = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = {};
  for (const s of settings) {
    settingsMap[s.key] = s.value;
  }
  return NextResponse.json(settingsMap);
}

export async function PUT(request: Request) {
  const authError = await requireAuth();
  if (authError) return authError;

  const body = await request.json();
  const { key, value } = body;

  if (!key || typeof value !== "string") {
    return NextResponse.json(
      { error: "key and value are required" },
      { status: 400 }
    );
  }

  const setting = await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json(setting);
}
