"use client";

import { useState, useRef } from "react";
import type { Site } from "@/lib/sites";

interface SiteFormProps {
  site?: Site | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function SiteForm({
  site,
  onSuccess,
  onCancel,
}: SiteFormProps) {
  const [name, setName] = useState(site?.name ?? "");
  const [url, setUrl] = useState(site?.url ?? "");
  const [imageUrl, setImageUrl] = useState(site?.imageUrl ?? "");
  const [description, setDescription] = useState(site?.description ?? "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "업로드 실패");
      setImageUrl(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이미지 업로드 실패");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = site
        ? await fetch(`/api/sites/${site.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              url,
              imageUrl: imageUrl || undefined,
              description: description || undefined,
            }),
          })
        : await fetch("/api/sites", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name,
              url,
              imageUrl: imageUrl || undefined,
              description: description || undefined,
            }),
          });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "요청 실패");

      setName("");
      setUrl("");
      setImageUrl("");
      setDescription("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}
      <div>
        <label
          htmlFor="name"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          사이트 이름 *
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="예: 고객 관리 시스템"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label
          htmlFor="url"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          접속 주소 (URL) *
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          placeholder="https://example.com"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
          이미지 (선택)
        </label>
        <div className="flex flex-col gap-2">
          {imageUrl ? (
            <div className="relative inline-flex w-fit">
              <img
                src={imageUrl}
                alt="미리보기"
                className="h-24 w-auto rounded-lg border border-zinc-200 object-cover dark:border-zinc-600"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          ) : null}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              id="imageFile"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              disabled={uploading}
              className="block w-full text-sm text-zinc-500 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-emerald-700 file:hover:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400"
            />
            {uploading && (
              <span className="text-sm text-zinc-500">업로드 중...</span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            jpg, png, gif, webp (최대 5MB)
          </p>
        </div>
      </div>
      <div>
        <label
          htmlFor="description"
          className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          설명 (선택)
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="사이트에 대한 간단한 설명"
          className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "처리 중..." : site ? "수정" : "추가"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-zinc-300 px-4 py-2 font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
