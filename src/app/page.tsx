import Link from "next/link";
import Image from "next/image";
import { getAllSites } from "@/lib/sites";
import SiteCard from "@/components/SiteCard";

// Replit DB / 로컬 파일에서 매 요청마다 목록을 읽도록 함 (빌드 시 빈 정적 HTML 방지)
export const dynamic = "force-dynamic";

export const metadata = {
  title: "수산그룹 업무 사이트",
  description: "수산그룹 업무 사이트 - 개발된 사이트 목록을 클릭하여 접속하세요",
};

export default async function PortalPage() {
  const sites = await getAllSites();

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-emerald-950/20">
      <header className="border-b border-zinc-200/80 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/soosan-logo.png"
              alt="SOOSAN"
              width={200}
              height={52}
              priority
              className="h-12 w-auto object-contain"
            />
            <span className="text-lg font-semibold text-zinc-700 dark:text-zinc-300">
              수산그룹 업무 사이트
            </span>
          </Link>
          <Link
            href="/admin"
            className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
          >
            관리자
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="mb-10 text-center text-zinc-600 dark:text-zinc-400">
          아래 사이트를 클릭하면 해당 시스템으로 이동합니다
        </p>

        {sites.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white/50 py-20 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
            <p className="text-zinc-500 dark:text-zinc-400">
              등록된 사이트가 없습니다.
            </p>
            <Link
              href="/admin"
              className="mt-4 inline-block text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
            >
              관리자 페이지에서 사이트를 추가하세요 →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sites.map((site) => (
              <SiteCard key={site.id} site={site} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
