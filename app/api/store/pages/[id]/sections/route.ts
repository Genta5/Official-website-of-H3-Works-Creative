import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    id: string;
  };
};

const allowedSections = [
  "HEADER",
  "HERO",
  "RICH_TEXT",
  "IMAGE",
  "IMAGE_GALLERY",
  "PRODUCT_GRID",
  "FEATURED_PRODUCT",
  "CATEGORIES",
  "PROMO_BANNER",
  "TESTIMONIALS",
  "FAQ",
  "FOOTER",
];

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const page = await prisma.storePage.findFirst({
      where: {
        id: params.id,
        website: {
          merchantId: merchant.id,
        },
      },
      select: { id: true },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Halaman tidak ditemukan." },
        { status: 404 }
      );
    }

    const sections = await prisma.storeSection.findMany({
      where: { pageId: page.id },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ sections });
  } catch (error) {
    console.error("GET STORE SECTIONS ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil sections." },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const page = await prisma.storePage.findFirst({
      where: {
        id: params.id,
        website: {
          merchantId: merchant.id,
        },
      },
      select: { id: true },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Halaman tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const type =
      typeof body.type === "string"
        ? body.type.toUpperCase()
        : "";

    if (!allowedSections.includes(type)) {
      return NextResponse.json(
        { error: "Jenis section tidak didukung." },
        { status: 400 }
      );
    }

    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim().slice(0, 80)
        : type.replaceAll("_", " ");

    const settings =
      body.settings === undefined ? {} : body.settings;

    if (
      settings === null ||
      typeof settings !== "object" ||
      Array.isArray(settings)
    ) {
      return NextResponse.json(
        { error: "Pengaturan section harus berupa objek." },
        { status: 400 }
      );
    }

    const settingsJson = JSON.stringify(settings);

    if (settingsJson.length > 50000) {
      return NextResponse.json(
        { error: "Pengaturan section terlalu besar." },
        { status: 400 }
      );
    }

    const lastSection = await prisma.storeSection.findFirst({
      where: { pageId: page.id },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const section = await prisma.storeSection.create({
      data: {
        pageId: page.id,
        type,
        name,
        settings: settingsJson,
        sortOrder: (lastSection?.sortOrder ?? -1) + 1,
        isVisible: true,
      },
    });

    return NextResponse.json(
      {
        message: "Section berhasil ditambahkan.",
        section,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST STORE SECTION ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menambahkan section." },
      { status: 500 }
    );
  }
}
