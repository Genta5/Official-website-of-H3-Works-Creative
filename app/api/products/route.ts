import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentMerchant } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function validInteger(value: unknown, minimum = 0): value is number {
  return (
    typeof value === "number" &&
    Number.isSafeInteger(value) &&
    value >= minimum
  );
}

function serializeProduct(product: {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category: string;
  status: string;
  source: string;
  providerCode: string | null;
  providerPrice: number | null;
  providerBrand: string | null;
  providerType: string | null;
  providerCategory: string | null;
  providerStatus: string | null;
  providerLastSyncedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...product,
    description: product.description ?? "",
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    providerLastSyncedAt:
      product.providerLastSyncedAt?.toISOString() ?? null,
  };
}

export async function GET() {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const products = await prisma.product.findMany({
      where: { merchantId: merchant.id },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      products: products.map(serializeProduct),
    });
  } catch (error) {
    console.error("GET /api/products:", error);

    return NextResponse.json(
      { error: "Gagal mengambil data produk." },
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

    const body = await request.json();

    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const category =
      typeof body.category === "string" && body.category.trim()
        ? body.category.trim()
        : "Lainnya";
    const status =
      body.status === "inactive" ? "inactive" : "active";

    if (!name || name.length > 200) {
      return NextResponse.json(
        { error: "Nama produk wajib diisi (maksimal 200 karakter)." },
        { status: 400 }
      );
    }

    if (
      !validInteger(body.price) ||
      !validInteger(body.stock)
    ) {
      return NextResponse.json(
        { error: "Harga dan stok harus berupa bilangan bulat nol atau lebih." },
        { status: 400 }
      );
    }

    if (description.length > 2000 || category.length > 100) {
      return NextResponse.json(
        { error: "Deskripsi atau kategori terlalu panjang." },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        merchantId: merchant.id,
        name,
        description,
        price: body.price,
        stock: body.stock,
        category,
        status,
        source: "MANUAL",
      },
    });

    return NextResponse.json(
      { product: serializeProduct(product) },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/products:", error);

    return NextResponse.json(
      { error: "Gagal menambahkan produk." },
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

    const body = await request.json();

    const id = typeof body.id === "string" ? body.id : "";
    const name =
      typeof body.name === "string" ? body.name.trim() : "";
    const description =
      typeof body.description === "string"
        ? body.description.trim()
        : "";
    const category =
      typeof body.category === "string" ? body.category.trim() : "";

    if (!id) {
      return NextResponse.json(
        { error: "ID produk tidak valid." },
        { status: 400 }
      );
    }

    if (!name || name.length > 200) {
      return NextResponse.json(
        { error: "Nama produk wajib diisi (maksimal 200 karakter)." },
        { status: 400 }
      );
    }

    if (
      !validInteger(body.price) ||
      !validInteger(body.stock)
    ) {
      return NextResponse.json(
        { error: "Harga dan stok harus berupa bilangan bulat nol atau lebih." },
        { status: 400 }
      );
    }

    if (
      description.length > 2000 ||
      !category ||
      category.length > 100 ||
      !["active", "inactive"].includes(body.status)
    ) {
      return NextResponse.json(
        { error: "Informasi produk tidak valid." },
        { status: 400 }
      );
    }

    const result = await prisma.product.updateMany({
      where: {
        id,
        merchantId: merchant.id,
      },
      data: {
        name,
        description,
        price: body.price,
        stock: body.stock,
        category,
        status: body.status,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        merchantId: merchant.id,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      product: serializeProduct(product),
    });
  } catch (error) {
    console.error("PATCH /api/products:", error);

    return NextResponse.json(
      { error: "Gagal memperbarui produk." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const merchant = await getCurrentMerchant();

    if (!merchant) {
      return NextResponse.json(
        { error: "Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";

    if (!id) {
      return NextResponse.json(
        { error: "ID produk tidak valid." },
        { status: 400 }
      );
    }

    const result = await prisma.product.deleteMany({
      where: {
        id,
        merchantId: merchant.id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json(
        { error: "Produk tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Produk berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE /api/products:", error);

    return NextResponse.json(
      { error: "Gagal menghapus produk." },
      { status: 500 }
    );
  }
}
