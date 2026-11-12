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

export async function PATCH(
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

    const section = await prisma.storeSection.findFirst({
      where: {
        id: params.id,
        page: {
          website: {
            merchantId: merchant.id,
          },
        },
      },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json();

    const data: {
      name?: string;
      settings?: string;
      sortOrder?: number;
      isVisible?: boolean;
    } = {};

    if (body.name !== undefined) {
      if (
        typeof body.name !== "string" ||
        body.name.trim().length < 1 ||
        body.name.trim().length > 80
      ) {
        return NextResponse.json(
          { error: "Nama section harus 1–80 karakter." },
          { status: 400 }
        );
      }

      data.name = body.name.trim();
    }

    if (body.settings !== undefined) {
      if (
        body.settings === null ||
        typeof body.settings !== "object" ||
        Array.isArray(body.settings)
      ) {
        return NextResponse.json(
          { error: "Pengaturan section harus berupa objek." },
          { status: 400 }
        );
      }

      const settingsJson = JSON.stringify(body.settings);

      if (settingsJson.length > 50000) {
        return NextResponse.json(
          { error: "Pengaturan section terlalu besar." },
          { status: 400 }
        );
      }

      data.settings = settingsJson;
    }

    if (body.sortOrder !== undefined) {
      if (
        !Number.isInteger(body.sortOrder) ||
        body.sortOrder < 0 ||
        body.sortOrder > 10000
      ) {
        return NextResponse.json(
          { error: "Urutan section tidak valid." },
          { status: 400 }
        );
      }

      data.sortOrder = body.sortOrder;
    }

    if (body.isVisible !== undefined) {
      if (typeof body.isVisible !== "boolean") {
        return NextResponse.json(
          { error: "Status visibilitas tidak valid." },
          { status: 400 }
        );
      }

      data.isVisible = body.isVisible;
    }

    const updatedSection = await prisma.storeSection.update({
      where: { id: section.id },
      data,
    });

    return NextResponse.json({
      message: "Section berhasil diperbarui.",
      section: updatedSection,
    });
  } catch (error) {
    console.error("PATCH STORE SECTION ERROR:", error);

    return NextResponse.json(
      { error: "Gagal memperbarui section." },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const section = await prisma.storeSection.findFirst({
      where: {
        id: params.id,
        page: {
          website: {
            merchantId: merchant.id,
          },
        },
      },
      select: { id: true },
    });

    if (!section) {
      return NextResponse.json(
        { error: "Section tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.storeSection.delete({
      where: { id: section.id },
    });

    return NextResponse.json({
      message: "Section berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE STORE SECTION ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus section." },
      { status: 500 }
    );
  }
}
