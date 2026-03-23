/**
 * Replit 배포 환경용 스토리지 어댑터
 * - Replit Database: sites, admin JSON 데이터
 * - Replit Object Storage: 이미지 업로드
 *
 * REPL_ID 환경변수가 있으면 Replit 환경으로 판단
 */

export const isReplit = !!process.env.REPL_ID;

/** Replit에서는 파일이 Object Storage에 있고 /api/uploads 로만 제공됨. DB에 예전 /uploads/ 경로가 남아 있으면 여기서 고침 */
export function resolvePublicUploadUrl(storedUrl: string): string {
  if (!storedUrl || !isReplit) return storedUrl;
  if (storedUrl.startsWith("/uploads/")) {
    return `/api/uploads/${storedUrl.slice("/uploads/".length)}`;
  }
  return storedUrl;
}

// Replit Database - 키-값 저장소
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let dbClient: any = null;

async function getReplitDb() {
  if (!dbClient) {
    try {
      const Client = (await import("@replit/database")).default;
      dbClient = new Client();
    } catch (e) {
      console.error("Replit Database client init failed:", e);
      throw new Error("Replit Database를 사용할 수 없습니다");
    }
  }
  return dbClient;
}

export async function replitDbGet<T>(key: string): Promise<T | null> {
  const db = await getReplitDb();
  const result = await db.get(key);
  if (result && !result.ok) return null;
  return (result?.value ?? null) as T | null;
}

export async function replitDbSet(key: string, value: unknown): Promise<void> {
  const db = await getReplitDb();
  const result = await db.set(key, value);
  if (result && !result.ok) {
    throw new Error(result.error?.message ?? "Replit Database 저장 실패");
  }
}

// Replit Object Storage - 파일 업로드
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let objectStorageClient: any = null;

async function getObjectStorage() {
  if (!objectStorageClient) {
    try {
      const { Client } = await import("@replit/object-storage");
      const client = new Client();
      objectStorageClient = client;
    } catch (e) {
      console.error("Replit Object Storage client init failed:", e);
      throw new Error("Replit Object Storage를 사용할 수 없습니다");
    }
  }
  return objectStorageClient;
}

export async function replitUploadFromBytes(
  objectName: string,
  buffer: Buffer
): Promise<{ ok: boolean; error?: unknown }> {
  try {
    const client = await getObjectStorage();
    // getBucket() 실패 시 throw — Result로 통일해 API 라우트가 항상 JSON으로 응답할 수 있게 함
    const result = await client.uploadFromBytes(objectName, buffer);
    if (!result.ok) return { ok: false, error: result.error };
    return { ok: true };
  } catch (error) {
    return { ok: false, error };
  }
}

export async function replitDownloadAsBytes(
  objectName: string
): Promise<{ ok: boolean; value?: Buffer; error?: unknown }> {
  const client = await getObjectStorage();
  const result = await client.downloadAsBytes(objectName);
  if (!result.ok) return { ok: false, error: result.error };
  // downloadAsBytes returns Result<[Buffer]> - value is [Buffer]
  const buffer = Array.isArray(result.value) ? result.value[0] : result.value;
  return { ok: true, value: buffer };
}
