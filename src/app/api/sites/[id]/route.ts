import { NextResponse } from "next/server";
import { getSiteById, updateSite, deleteSite } from "@/lib/sites";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const site = await getSiteById(id);
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch (error) {
    console.error("GET /api/sites/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch site" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, url, imageUrl, description, order } = body;

    const site = await updateSite(id, {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(url !== undefined && { url: String(url).trim() }),
      ...(imageUrl !== undefined && { imageUrl: String(imageUrl).trim() }),
      ...(description !== undefined && {
        description: description ? String(description).trim() : undefined,
      }),
      ...(typeof order === "number" && { order }),
    });

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
    return NextResponse.json(site);
  } catch (error) {
    console.error("PUT /api/sites/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to update site" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await deleteSite(id);
    if (!deleted) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/sites/[id] error:", error);
    return NextResponse.json(
      { error: "Failed to delete site" },
      { status: 500 }
    );
  }
}
