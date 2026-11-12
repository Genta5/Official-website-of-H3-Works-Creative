import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: {
    slug: string;
  };
};

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const slug = params.slug.trim().toLowerCase();

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return NextResponse.json(
        { error: "Website tidak ditemukan." },
        { status: 404 }
      );
    }

    const website = await prisma.storeWebsite.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
      },
      select: {
        id: true,
        publishedVersion: true,
      },
    });

    if (!website || website.publishedVersion < 1) {
      return NextResponse.json(
        { error: "Website tidak ditemukan atau belum dipublikasikan." },
        { status: 404 }
      );
    }

    const revision = await prisma.storeRevision.findUnique({
      where: {
        websiteId_version: {
          websiteId: website.id,
          version: website.publishedVersion,
        },
      },
      select: {
        snapshot: true,
        version: true,
        createdAt: true,
      },
    });

    if (!revision) {
      return NextResponse.json(
        { error: "Versi publikasi website tidak ditemukan." },
        { status: 404 }
      );
    }

    let snapshot: unknown;

    try {
      snapshot = JSON.parse(revision.snapshot);
    } catch {
      console.error("INVALID STORE SNAPSHOT:", website.id);

      return NextResponse.json(
        { error: "Data publikasi website tidak valid." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        website: snapshot,
        version: revision.version,
        publishedAt: revision.createdAt,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("PUBLIC STORE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal memuat website." },
      { status: 500 }
    );
  }
}
