import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reservedSlugs = [
  "api",
  "admin",
  "dashboard",
  "login",
  "register",
  "www",
  "orderly",
  "support",
  "pricing",
  "docs",
  "assets",
  "terms",
  "privacy",
];

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
      include: {
        pages: {
          orderBy: { sortOrder: "asc" },
          include: {
            sections: {
              orderBy: { sortOrder: "asc" },
            },
          },
        },
        revisions: {
          orderBy: { version: "desc" },
          take: 5,
          select: {
            id: true,
            version: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      website,
    });
  } catch (error) {
    console.error("GET STORE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data website." },
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

    const existingWebsite = await prisma.storeWebsite.findUnique({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    if (existingWebsite) {
      return NextResponse.json(
        { error: "Kamu sudah memiliki website toko." },
        { status: 409 }
      );
    }

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";

    const slug =
      typeof body.slug === "string"
        ? body.slug.trim().toLowerCase()
        : "";

    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";

    const themeKey =
      typeof body.themeKey === "string"
        ? body.themeKey.trim()
        : "minimal";

    if (name.length < 2 || name.length > 60) {
      return NextResponse.json(
        { error: "Nama toko harus terdiri dari 2–60 karakter." },
        { status: 400 }
      );
    }

    if (
      slug.length < 3 ||
      slug.length > 30 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)
    ) {
      return NextResponse.json(
        {
          error:
            "Slug harus 3–30 karakter, menggunakan huruf kecil, angka, dan tanda hubung.",
        },
        { status: 400 }
      );
    }

    if (reservedSlugs.includes(slug)) {
      return NextResponse.json(
        { error: "Slug tersebut tidak dapat digunakan." },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: "Deskripsi maksimal 500 karakter." },
        { status: 400 }
      );
    }

    const allowedThemes = [
      "minimal",
      "streetwear",
      "premium",
      "digital",
    ];

    if (!allowedThemes.includes(themeKey)) {
      return NextResponse.json(
        { error: "Tema website tidak valid." },
        { status: 400 }
      );
    }

    const website = await prisma.storeWebsite.create({
      data: {
        merchantId: merchant.id,
        name,
        slug,
        description: description || null,
        themeKey,
        globalSettings: JSON.stringify({
          primaryColor: "#2563eb",
          secondaryColor: "#f8fafc",
          fontFamily: "Inter",
          currency: "IDR",
        }),
        status: "DRAFT",
        pages: {
          create: {
            title: "Home",
            path: "/",
            isHome: true,
            status: "DRAFT",
            sortOrder: 0,
          },
        },
      },
      include: {
        pages: true,
      },
    });

    return NextResponse.json(
      {
        message: "Website toko berhasil dibuat.",
        website,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST STORE ERROR:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug website sudah digunakan." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Gagal membuat website toko." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
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
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website toko belum dibuat." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data: {
      name?: string;
      slug?: string;
      description?: string | null;
      themeKey?: string;
      logoUrl?: string | null;
      faviconUrl?: string | null;
    } = {};

    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        body.name.trim().length < 2 ||
        body.name.trim().length > 60
      ) {
        return NextResponse.json(
          { error: "Nama toko harus terdiri dari 2–60 karakter." },
          { status: 400 }
        );
      }

      data.name = body.name.trim();
    }

    if (body.slug !== undefined) {
      if (
        typeof body.slug !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(body.slug.trim().toLowerCase()) ||
        body.slug.trim().length < 3 ||
        body.slug.trim().length > 30
      ) {
        return NextResponse.json(
          { error: "Format slug website tidak valid." },
          { status: 400 }
        );
      }

      const slug = body.slug.trim().toLowerCase();

      if (reservedSlugs.includes(slug)) {
        return NextResponse.json(
          { error: "Slug tersebut tidak dapat digunakan." },
          { status: 400 }
        );
      }

      data.slug = slug;
    }

    if (body.description !== undefined) {
      if (
        body.description !== null &&
        (typeof body.description !== "string" ||
          body.description.trim().length > 500)
      ) {
        return NextResponse.json(
          { error: "Deskripsi maksimal 500 karakter." },
          { status: 400 }
        );
      }

      data.description =
        typeof body.description === "string"
          ? body.description.trim() || null
          : null;
    }

    if (body.themeKey !== undefined) {
      const allowedThemes = [
        "minimal",
        "streetwear",
        "premium",
        "digital",
      ];

      if (
        typeof body.themeKey !== "string" ||
        !allowedThemes.includes(body.themeKey)
      ) {
        return NextResponse.json(
          { error: "Tema website tidak valid." },
          { status: 400 }
        );
      }

      data.themeKey = body.themeKey;
    }

    for (const field of ["logoUrl", "faviconUrl"] as const) {
      if (body[field] !== undefined) {
        const value = body[field];

        if (
          value !== null &&
          (typeof value !== "string" || value.length > 2048)
        ) {
          return NextResponse.json(
            { error: `Format ${field} tidak valid.` },
            { status: 400 }
          );
        }

        data[field] = value;
      }
    }

    const updatedWebsite = await prisma.storeWebsite.update({
      where: { id: website.id },
      data,
    });

    return NextResponse.json({
      message: "Pengaturan website berhasil diperbarui.",
      website: updatedWebsite,
    });
  } catch (error) {
    console.error("PATCH STORE ERROR:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Slug website sudah digunakan." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Gagal memperbarui website." },
      { status: 500 }
    );
  }
}
