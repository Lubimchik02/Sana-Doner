// src/components/reviews/ReviewModal.tsx — «Оставить отзыв»: 5 критериев, комментарий, фото
"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, CheckCircle2, Loader2, Star, X } from "lucide-react";
import { DEMO_MODE, brand } from "@/config/brand";
import { useUI } from "@/store/ui";

const CRITERIA = [
  { id: "taste", label: "Вкус еды" },
  { id: "speed", label: "Скорость доставки" },
  { id: "package", label: "Упаковка" },
  { id: "courier", label: "Курьер" },
  { id: "service", label: "Сервис" },
] as const;

type CriterionId = (typeof CRITERIA)[number]["id"];
const MOOD = ["", "Плохо", "Так себе", "Нормально", "Хорошо", "Отлично!"];
const MAX_PHOTOS = 4;

function Stars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <motion.button key={n} type="button" aria-label={`${n} из 5`}
          whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}
          onMouseEnter={() => setHover(n)} onClick={() => onChange(n)}>
          <motion.span className="block" animate={value === n ? { rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.4 }}>
            <Star className={`h-7 w-7 transition-colors ${n <= shown ? "fill-amber-400 text-amber-400" : "fill-neutral-200 text-neutral-200"}`} />
          </motion.span>
        </motion.button>
      ))}
    </div>
  );
}

export default function ReviewModal() {
  const { reviewOpen, closeReview } = useUI();
  const [ratings, setRatings] = useState<Record<CriterionId, number>>({ taste: 0, speed: 0, package: 0, courier: 0, service: 0 });
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [photos, setPhotos] = useState<{ file: File; url: string }[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.body.style.overflow = reviewOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [reviewOpen]);

  const rated = Object.values(ratings).filter(Boolean);
  const avg = rated.length ? rated.reduce((a, b) => a + b, 0) / rated.length : 0;

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const tooBig = Array.from(files).some((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) setError("Фото больше 5 МБ пропущены");
    const next = Array.from(files)
      .filter((f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= 5 * 1024 * 1024)
      .slice(0, MAX_PHOTOS - photos.length)
      .map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPhotos((p) => [...p, ...next]);
  };

  const removePhoto = (i: number) =>
    setPhotos((p) => { URL.revokeObjectURL(p[i].url); return p.filter((_, j) => j !== i); });

  const reset = () => {
    photos.forEach((p) => URL.revokeObjectURL(p.url));
    setRatings({ taste: 0, speed: 0, package: 0, courier: 0, service: 0 });
    setComment(""); setName(""); setPhotos([]); setState("idle"); setError("");
  };

  const close = () => { closeReview(); setTimeout(reset, 350); };

  const submit = async () => {
    if (!rated.length) return setError("Поставьте хотя бы одну оценку");
    setError("");
    setState("sending");
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 900));
      } else {
        const fd = new FormData();
        fd.append("name", name);
        fd.append("comment", comment);
        fd.append("ratings", JSON.stringify(ratings));
        photos.forEach((p) => fd.append("photos", p.file));
        fd.append("website", ""); // honeypot (на сервере должен быть пустым)
        const res = await fetch("/api/review", { method: "POST", body: fd });
        if (!res.ok) {
          const data: unknown = await res.json().catch(() => ({}));
          const msg = (data as { error?: unknown }).error;
          throw new Error(typeof msg === "string" ? msg : "Не получилось отправить. Попробуйте ещё раз.");
        }
      }
      setState("done");
    } catch (e) {
      setState("idle");
      setError(e instanceof Error && e.message ? e.message : "Не получилось отправить. Попробуйте ещё раз.");
    }
  };

  return (
    <AnimatePresence>
      {reviewOpen && (
        <motion.div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />

          <motion.div role="dialog" aria-modal
            initial={{ y: 80, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 80, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 360, damping: 32 }}
            className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]">
            <div className="flex items-center justify-between px-6 pb-2 pt-5">
              <h2 className="text-2xl font-black">{state === "done" ? "Спасибо!" : "Оставить отзыв"}</h2>
              <button onClick={close} aria-label="Закрыть" className="rounded-full p-2 hover:bg-neutral-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            {state === "done" ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center px-6 pb-10 pt-6 text-center">
                <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 14 }}>
                  <CheckCircle2 className="h-20 w-20 text-emerald-500" />
                </motion.div>
                <p className="mt-4 text-lg font-bold">Отзыв отправлен</p>
                <p className="mt-1 max-w-xs text-sm text-neutral-500">
                  Мы читаем каждый отзыв и становимся лучше. До встречи в {brand.name}!
                </p>
                <button onClick={close} className="mt-6 rounded-full bg-[var(--accent)] px-8 py-3 font-bold text-[var(--on-accent)]">Готово</button>
              </motion.div>
            ) : (
              <>
                <div className="flex-1 space-y-5 overflow-y-auto px-6 pb-4">
                  {/* Средняя оценка */}
                  <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4">
                    <motion.span key={avg.toFixed(1)} initial={{ scale: 1.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className="text-3xl font-black tabular-nums text-amber-500">
                      {avg ? avg.toFixed(1) : "—"}
                    </motion.span>
                    <span className="text-sm font-semibold text-neutral-600">
                      {avg ? MOOD[Math.round(avg)] : "Оцените нас по 5 критериям"}
                    </span>
                  </div>

                  {/* Критерии */}
                  <div className="space-y-3">
                    {CRITERIA.map((c) => (
                      <div key={c.id} className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold">{c.label}</span>
                        <Stars value={ratings[c.id]} onChange={(v) => setRatings((r) => ({ ...r, [c.id]: v }))} />
                      </div>
                    ))}
                  </div>

                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя (необязательно)"
                    className="w-full rounded-2xl bg-neutral-100 px-4 py-3.5 text-[15px] outline-none ring-2 ring-transparent focus:bg-white focus:ring-[var(--accent)]" />
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Что понравилось, что улучшить?"
                    className="min-h-[96px] w-full resize-none rounded-2xl bg-neutral-100 px-4 py-3.5 text-[15px] outline-none ring-2 ring-transparent focus:bg-white focus:ring-[var(--accent)]" />

                  {/* Фото */}
                  <div className="grid grid-cols-4 gap-2">
                    <AnimatePresence>
                      {photos.map((p, i) => (
                        <motion.div key={p.url} layout initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                          className="relative aspect-square overflow-hidden rounded-xl">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.url} alt="" className="h-full w-full object-cover" />
                          <button onClick={() => removePhoto(i)} aria-label="Удалить фото"
                            className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {photos.length < MAX_PHOTOS && (
                      <motion.button layout type="button" whileTap={{ scale: 0.92 }} onClick={() => fileRef.current?.click()}
                        className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-neutral-300 text-neutral-400 transition hover:border-[var(--accent)] hover:text-[var(--brand)]">
                        <Camera className="h-6 w-6" />
                        <span className="text-[10px] font-semibold">Фото</span>
                      </motion.button>
                    )}
                    <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden
                      onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
                  </div>
                </div>

                <div className="border-t border-neutral-100 px-6 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">
                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="mb-2 text-center text-sm font-semibold text-red-500">{error}</motion.p>
                    )}
                  </AnimatePresence>
                  <motion.button whileTap={{ scale: 0.97 }} onClick={submit} disabled={state === "sending"}
                    className="flex w-full items-center justify-center rounded-full bg-[var(--accent)] py-4 font-extrabold text-[var(--on-accent)] shadow-lg shadow-[var(--accent)]/30 disabled:opacity-70">
                    {state === "sending" ? <Loader2 className="h-5 w-5 animate-spin" /> : "Отправить отзыв"}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
