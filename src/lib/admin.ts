import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import {
  isReplit,
  replitDbGet,
  replitDbSet,
} from "./replit-storage";

const ADMIN_FILE = path.join(process.cwd(), "data", "admin.json");
const REPLIT_ADMIN_KEY = "admin";

export interface AdminCredentials {
  username: string;
  passwordHash: string;
}

async function ensureDataDir() {
  const dir = path.dirname(ADMIN_FILE);
  await fs.mkdir(dir, { recursive: true });
}

async function getAdminLocal(): Promise<AdminCredentials | null> {
  try {
    await ensureDataDir();
    const data = await fs.readFile(ADMIN_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

async function getAdminReplit(): Promise<AdminCredentials | null> {
  return replitDbGet<AdminCredentials>(REPLIT_ADMIN_KEY);
}

async function setAdminReplit(admin: AdminCredentials): Promise<void> {
  await replitDbSet(REPLIT_ADMIN_KEY, admin);
}

export async function getAdmin(): Promise<AdminCredentials | null> {
  return isReplit ? getAdminReplit() : getAdminLocal();
}

export async function initDefaultAdmin(): Promise<AdminCredentials> {
  const existing = await getAdmin();
  if (existing) return existing;

  const passwordHash = await bcrypt.hash("admin!@#", 10);
  const admin: AdminCredentials = {
    username: "admin",
    passwordHash,
  };

  if (isReplit) {
    await setAdminReplit(admin);
  } else {
    await ensureDataDir();
    await fs.writeFile(ADMIN_FILE, JSON.stringify(admin, null, 2), "utf-8");
  }
  return admin;
}

export async function verifyAdmin(
  username: string,
  password: string
): Promise<boolean> {
  let admin = await getAdmin();
  if (!admin) {
    admin = await initDefaultAdmin();
  }
  if (admin.username !== username) return false;
  return bcrypt.compare(password, admin.passwordHash);
}

export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  let admin = await getAdmin();
  if (!admin) {
    admin = await initDefaultAdmin();
  }

  const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!valid) {
    return { success: false, error: "현재 비밀번호가 올바르지 않습니다" };
  }

  if (newPassword.length < 6) {
    return { success: false, error: "새 비밀번호는 6자 이상이어야 합니다" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  admin = { ...admin, passwordHash };

  if (isReplit) {
    await setAdminReplit(admin);
  } else {
    await fs.writeFile(ADMIN_FILE, JSON.stringify(admin, null, 2), "utf-8");
  }
  return { success: true };
}
