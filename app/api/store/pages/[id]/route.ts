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

    const website = await prisma.storeWebsite.findUnique({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website tidak ditemukan." },
        { status: 404 }
      );
    }

    const page = await prisma.storePage.findFirst({
      where: {
        id: params.id,
        websiteId: website.id,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Halaman tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = await request.json();
    const data: {
      title?: string;
      path?: string;
      sortOrder?: number;
      status?: string;
    } = {};

    if (body.title !== undefined) {
      if (
        typeof body.title !== "string" ||
        body.title.trim().length < 2 ||
        body.title.trim().length > 60
      ) {
        return NextResponse.json(
          { error: "Judul harus terdiri dari 2–60 karakter." },
          { status: 400 }
        );
      }

      data.title = body.title.trim();
    }

    if (body.path !== undefined) {
      const path =
        typeof body.path === "string"
          ? body.path.trim().toLowerCase()
          : "";

      if (
        !/^\/[a-z0-9]+(?:-[a-z0-9]+)*$/.test(path) ||
        path.length > 80 ||
        path === "/"
      ) {
        return NextResponse.json(
          { error: "Format path halaman tidak valid." },
          { status: 400 }
        );
      }

      data.path = path;
    }

    if (body.sortOrder !== undefined) {
      if (
        !Number.isInteger(body.sortOrder) ||
        body.sortOrder < 0 ||
        body.sortOrder > 10000
      ) {
        return NextResponse.json(
          { error: "Urutan halaman tidak valid." },
          { status: 400 }
        );
      }

      data.sortOrder = body.sortOrder;
    }

    if (body.status !== undefined) {
      if (!["DRAFT", "PUBLISHED"].includes(body.status)) {
        return NextResponse.json(
          { error: "Status halaman tidak valid." },
          { status: 400 }
        );
      }

      data.status = body.status;
    }

    const updatedPage = await prisma.storePage.update({
      where: { id: page.id },
      data,
    });

    return NextResponse.json({
      message: "Halaman berhasil diperbarui.",
      page: updatedPage,
    });
  } catch (error) {
    console.error("PATCH STORE PAGE ERROR:", error);

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
      { error: "Gagal memperbarui halaman." },
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

    const website = await prisma.storeWebsite.findUnique({
      where: { merchantId: merchant.id },
      select: { id: true },
    });

    if (!website) {
      return NextResponse.json(
        { error: "Website tidak ditemukan." },
        { status: 404 }
      );
    }

    const page = await prisma.storePage.findFirst({
      where: {
        id: params.id,
        websiteId: website.id,
      },
    });

    if (!page) {
      return NextResponse.json(
        { error: "Halaman tidak ditemukan." },
        { status: 404 }
      );
    }

    if (page.isHome || page.path === "/") {
      return NextResponse.json(
        { error: "Halaman Home tidak boleh dihapus." },
        { status: 400 }
      );
    }

    await prisma.storePage.delete({
      where: { id: page.id },
    });

    return NextResponse.json({
      message: "Halaman berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE STORE PAGE ERROR:", error);

    return NextResponse.json(
      { error: "Gagal menghapus halaman." },
      { status: 500 }
    );
  }
}
