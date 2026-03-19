import { NextResponse } from "next/server";
import { getAllSites, createSite } from "@/lib/sites";

export async function GET() {
  try {
    const sites = await getAllSites();
    return NextResponse.json(sites);
  } catch (error) {
    console.error("GET /api/sites error:", error);
    return NextResponse.json(
      { error: "Failed to fetch sites" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, url, imageUrl, description, order } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "이름과 URL은 필수입니다" },
        { status: 400 }
      );
    }

    const sites = await getAllSites();
    const maxOrder = sites.length ? Math.max(...sites.map((s) => s.order)) : 0;

    const site = await createSite({
      name: String(name).trim(),
      url: String(url).trim(),
      imageUrl: imageUrl ? String(imageUrl).trim() : "",
      description: description ? String(description).trim() : undefined,
      order: typeof order === "number" ? order : maxOrder + 1,
    });

    return NextResponse.json(site);
  } catch (error) {
    console.error("POST /api/sites error:", error);
    return NextResponse.json(
      { error: "Failed to create site" },
      { status: 500 }
    );
  }
}
