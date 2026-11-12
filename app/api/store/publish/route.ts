import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const now = new Date();

    const websiteEntitlement = await prisma.planSubscription.findFirst({
      where: {
        merchantId: merchant.id,
        status: "ACTIVE",
        startsAt: { lte: now },
        endsAt: { gt: now },
        items: {
          some: {
            serviceKey: { in: ["website", "WEBSITE"] },
          },
        },
      },
    });

    if (!websiteEntitlement) {
      return NextResponse.json(
        { error: "Paket Website Store belum aktif. Silakan berlangganan terlebih dahulu." },
        { status: 403 }
      );
    }

    const website = await prisma.storeWebsite.findUnique({
      where: { merchantId: merchant.id },
      include: {
        pages: {
          orderBy: { sortOrder: "asc" },
          include: {
            sections: {
              where: { isVisible: true },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website toko belum dibuat." },
        { status: 404 }
      );
    }

    if (website.pages.length === 0) {
      return NextResponse.json(
        { error: "Website harus memiliki minimal satu halaman." },
        { status: 400 }
      );
    }

    const homePage = website.pages.find(
      (page) => page.isHome || page.path === "/"
    );

    if (!homePage) {
      return NextResponse.json(
        { error: "Halaman Home tidak ditemukan." },
        { status: 400 }
      );
    }

    let globalSettings: unknown;

    try {
      globalSettings = JSON.parse(website.globalSettings);
    } catch {
      return NextResponse.json(
        { error: "Pengaturan global website tidak valid." },
        { status: 400 }
      );
    }

    const snapshot = {
      website: {
        name: website.name,
        slug: website.slug,
        description: website.description,
        logoUrl: website.logoUrl,
        faviconUrl: website.faviconUrl,
        themeKey: website.themeKey,
        globalSettings,
      },
      pages: website.pages.map((page) => ({
        title: page.title,
        path: page.path,
        isHome: page.isHome,
        sortOrder: page.sortOrder,
        sections: page.sections.map((section) => {
          let settings: unknown;

          try {
            settings = JSON.parse(section.settings);
          } catch {
            settings = {};
          }

          return {
            id: section.id,
            type: section.type,
            name: section.name,
            settings,
            sortOrder: section.sortOrder,
          };
        }),
      })),
    };

    const publishedWebsite = await prisma.$transaction(
      async (tx) => {
        const currentWebsite = await tx.storeWebsite.findUnique({
          where: { id: website.id },
          select: { publishedVersion: true },
        });

        if (!currentWebsite) {
          throw new Error("WEBSITE_NOT_FOUND");
        }

        const nextVersion = currentWebsite.publishedVersion + 1;

        await tx.storeRevision.create({
          data: {
            websiteId: website.id,
            version: nextVersion,
            snapshot: JSON.stringify(snapshot),
          },
        });

        const updated = await tx.storeWebsite.update({
          where: { id: website.id },
          data: {
            status: "PUBLISHED",
            publishedVersion: nextVersion,
            publishedAt: new Date(),
          },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            publishedVersion: true,
            publishedAt: true,
          },
        });

        return updated;
      }
    );

    return NextResponse.json({
      message: "Website berhasil dipublikasikan.",
      website: publishedWebsite,
    });
  } catch (error) {
    console.error("PUBLISH STORE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal mempublikasikan website." },
      { status: 500 }
    );
  }
}
