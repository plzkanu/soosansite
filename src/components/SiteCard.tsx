"use client";

import type { Site } from "@/lib/sites";

interface SiteCardProps {
  site: Site;
}

export default function SiteCard({ site }: SiteCardProps) {
  const handleClick = () => {
    window.open(site.url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-zinc-200/80 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:ring-emerald-400/50 dark:bg-zinc-900 dark:ring-zinc-700 dark:hover:ring-emerald-500/40"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {site.imageUrl ? (
          <img
            src={site.imageUrl}
            alt={site.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl text-zinc-400 dark:text-zinc-500">
            🌐
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4 text-left">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
          {site.name}
        </h3>
        {site.description && (
          <p className="line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400">
            {site.description}
          </p>
        )}
        <span className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
          클릭하여 접속 →
        </span>
      </div>
    </button>
  );
}
