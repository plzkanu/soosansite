import { promises as fs } from "fs";
import path from "path";
import {
  isReplit,
  replitDbGet,
  replitDbSet,
  resolvePublicUploadUrl,
} from "./replit-storage";

export interface Site {
  id: string;
  name: string;
  url: string;
  imageUrl: string;
  description?: string;
  order: number;
  createdAt: string;
}

const DATA_FILE = path.join(process.cwd(), "data", "sites.json");
const REPLIT_SITES_KEY = "sites";

async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  await fs.mkdir(dir, { recursive: true });
}

async function readSitesLocal(): Promise<Site[]> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeSitesLocal(sites: Site[]) {
  await ensureDataDir();
  sites.sort((a, b) => a.order - b.order);
  await fs.writeFile(DATA_FILE, JSON.stringify(sites, null, 2), "utf-8");
}

async function readSitesReplit(): Promise<Site[]> {
  const data = await replitDbGet<Site[]>(REPLIT_SITES_KEY);
  return data ?? [];
}

async function writeSitesReplit(sites: Site[]) {
  sites.sort((a, b) => a.order - b.order);
  await replitDbSet(REPLIT_SITES_KEY, sites);
}

async function readSites(): Promise<Site[]> {
  return isReplit ? readSitesReplit() : readSitesLocal();
}

async function writeSites(sites: Site[]) {
  if (isReplit) {
    await writeSitesReplit(sites);
  } else {
    await writeSitesLocal(sites);
  }
}

function normalizeSite(site: Site): Site {
  return { ...site, imageUrl: resolvePublicUploadUrl(site.imageUrl) };
}

export async function getAllSites(): Promise<Site[]> {
  const sites = await readSites();
  return sites.map(normalizeSite);
}

export async function getSiteById(id: string): Promise<Site | null> {
  const sites = await readSites();
  const site = sites.find((s) => s.id === id);
  return site ? normalizeSite(site) : null;
}

export async function createSite(
  data: Omit<Site, "id" | "createdAt">
): Promise<Site> {
  const sites = await readSites();
  const maxOrder = sites.length ? Math.max(...sites.map((s) => s.order)) : 0;
  const site: Site = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    order: data.order ?? maxOrder + 1,
  };
  sites.push(site);
  await writeSites(sites);
  return normalizeSite(site);
}

export async function updateSite(
  id: string,
  data: Partial<Omit<Site, "id" | "createdAt">>
): Promise<Site | null> {
  const sites = await readSites();
  const index = sites.findIndex((s) => s.id === id);
  if (index === -1) return null;
  sites[index] = { ...sites[index], ...data };
  await writeSites(sites);
  return normalizeSite(sites[index]);
}

export async function deleteSite(id: string): Promise<boolean> {
  const sites = await readSites();
  const filtered = sites.filter((s) => s.id !== id);
  if (filtered.length === sites.length) return false;
  await writeSites(filtered);
  return true;
}
