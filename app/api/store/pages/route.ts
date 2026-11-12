import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const website = await prisma.storeWebsite.findUnique({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website toko belum dibuat." },
        { status: 404 }
      );
    }

    const pages = await prisma.storePage.findMany({
      where: { websiteId: website.id },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { sections: true } },
      },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("GET STORE PAGES ERROR:", error);
    return NextResponse.json(
      { error: "Gagal mengambil halaman website." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const website = await prisma.storeWebsite.findUnique({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website toko belum dibuat." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const title =
      typeof body.title === "string" ? body.title.trim() : "";

    const path =
      typeof body.path === "string"
        ? body.path.trim().toLowerCase()
        : "";

    if (title.length < 2 || title.length > 60) {
      return NextResponse.json(
        { error: "Judul halaman harus 2–60 karakter." },
        { status: 400 }
      );
    }

    if (
      !/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) ||
      path.length > 80 ||
      path === "/"
    ) {
      return NextResponse.json(
        { error: "Path harus seperti /about atau /kontak." },
        { status: 400 }
      );
    }

    const existingPage = await prisma.storePage.findUnique({
      where: {
        websiteId_path: {
          websiteId: website.id,
          path,
        },
      },
    });

    if (existingPage) {
      return NextResponse.json(
        { error: "Path halaman sudah digunakan." },
        { status: 409 }
      );
    }

    const lastPage = await prisma.storePage.findFirst({
      where: { websiteId: website.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const page = await prisma.storePage.create({
      data: {
        websiteId: website.id,
        title,
        path,
        isHome: false,
        status: "DRAFT",
        sortOrder: (lastPage?.sortOrder ?? 0) + 1,
      },
    });

    return NextResponse.json(
      {
        message: "Halaman berhasil dibuat.",
        page,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST STORE PAGE ERROR:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Path halaman sudah digunakan." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Gagal membuat halaman." },
      { status: 500 }
    );
  }
}
