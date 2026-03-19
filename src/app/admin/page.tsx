"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Site } from "@/lib/sites";
import SiteForm from "@/components/SiteForm";
import SiteCard from "@/components/SiteCard";
import PasswordChangeForm from "@/components/PasswordChangeForm";

export default function AdminPage() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const fetchSites = async () => {
    try {
      const res = await fetch("/api/sites");
      const data = await res.json();
      setSites(Array.isArray(data) ? data : []);
    } catch {
      setSites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await fetch(`/api/sites/${id}`, { method: "DELETE" });
      setSites((prev) => prev.filter((s) => s.id !== id));
      setEditingId(null);
    } catch (err) {
      alert("삭제에 실패했습니다");
    }
  };

  const editingSite = editingId
    ? sites.find((s) => s.id === editingId) ?? null
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            관리자
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPasswordForm(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              비밀번호 변경
            </button>
            <Link
              href="/"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              포털로 돌아가기
            </Link>
            <button
              type="button"
              onClick={async () => {
                await fetch("/api/auth/logout", { method: "POST" });
                router.push("/admin/login");
                router.refresh();
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {showPasswordForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              비밀번호 변경
            </h2>
            <PasswordChangeForm
              onSuccess={() => {
                setShowPasswordForm(false);
                alert("비밀번호가 변경되었습니다.");
              }}
              onCancel={() => setShowPasswordForm(false)}
            />
          </div>
        </div>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {editingSite ? "사이트 수정" : "사이트 추가"}
            </h2>
            {showForm || editingSite ? (
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-400"
              >
                닫기
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                + 사이트 추가
              </button>
            )}
          </div>

          {(showForm || editingSite) && (
            <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
              <SiteForm
                site={editingSite}
                onSuccess={() => {
                  fetchSites();
                  setShowForm(false);
                  setEditingId(null);
                }}
                onCancel={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              />
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            등록된 사이트
          </h2>

          {loading ? (
            <p className="text-zinc-500 dark:text-zinc-400">로딩 중...</p>
          ) : sites.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white/50 py-12 text-center dark:border-zinc-600 dark:bg-zinc-900/50">
              <p className="text-zinc-500 dark:text-zinc-400">
                등록된 사이트가 없습니다. 위에서 추가해보세요.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sites.map((site) => (
                <div key={site.id} className="relative group">
                  <SiteCard site={site} />
                  <div className="absolute right-2 top-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => setEditingId(site.id)}
                      className="rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-md hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(site.id)}
                      className="rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-medium text-white shadow-md hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
